package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/go-redis/redis"
	"github.com/gorilla/websocket"

	_ "github.com/lib/pq" // PostgreSQL driver
)

type Reading struct {
	ID          int      `json:"id,omitempty"`
	Temperature *float64 `json:"temperature,omitempty"`
	Humidity    *float64 `json:"humidity,omitempty"`
	Pressure    *float64 `json:"pressure,omitempty"`
	Gas         *float64 `json:"gas,omitempty"`
	Timestamp   string   `json:"timestamp"`
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

var clients = make(map[*websocket.Conn]bool)
var broadcast = make(chan string)

func handleConnections(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling connection")

	// Attempting to upgrade the connection
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("Failed to upgrade connection: ", err)
		return
	}
	fmt.Println("Connection upgraded to WebSocket")

	defer func() {
		fmt.Println("Closing WebSocket connection")
		ws.Close()
		delete(clients, ws)
	}()

	// Adding client to the clients map
	clients[ws] = true
	fmt.Println("Client added. Total clients: ", len(clients))

	for {
		select {
		case message := <-broadcast:
			fmt.Println("Broadcast received: ", message) // Add this fmt
			for client := range clients {
				fmt.Println("Sending message to client: ", client.RemoteAddr())
				err := client.WriteMessage(websocket.TextMessage, []byte(message))
				if err != nil {
					fmt.Println("Error sending message to client: ", err)
					client.Close()
					delete(clients, client)
					fmt.Println("Client removed. Total clients: ", len(clients))
				}
			}
		default:
			time.Sleep(100 * time.Millisecond) // Prevent blocking
		}
	}
}

func main() {
	staticDir := "/app/dist"

	// File server to serve static files
	fs := http.FileServer(http.Dir(staticDir))

	// Retrieve the connection string from the environment variable
	connStr := os.Getenv("POSTGRES_URL")
	if connStr == "" {
		log.Fatal("POSTGRES_URL environment variable not set")
	}

	// Connect to PostgreSQL database
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}
	defer db.Close()

	// Optional: Check if the connection is successful
	if err = db.Ping(); err != nil {
		log.Fatalf("Could not ping the database: %v", err)
	}

	fmt.Println("Successfully connected to the database")
	redisURL := os.Getenv("REDIS_URL")
	client := redis.NewClient(&redis.Options{
		Addr: redisURL,
	})

	fmt.Println("Successfully connected to the redis client")

	pubsub := client.Subscribe("sensor-data")
	_, err = pubsub.Receive()
	if err != nil {
		log.Fatalf("Failed to subscribe to channel: %v", err)
	}

	go func() {
		for msg := range pubsub.Channel() {
			fmt.Println("Received message from Redis: ", msg.Payload)
			broadcast <- msg.Payload
		}
	}()

	http.HandleFunc("/ws", handleConnections)

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Check if the file exists in the directory
		path := filepath.Join(staticDir, r.URL.Path)
		if strings.HasSuffix(r.URL.Path, "/") {
			path = filepath.Join(path, "index.html")
		}

		if _, err := filepath.Glob(path); err != nil {
			// If file doesn't exist, serve index.html for SPA routing
			http.ServeFile(w, r, filepath.Join(staticDir, "index.html"))
		} else {
			// Serve the requested file
			fs.ServeHTTP(w, r)
		}
	})

	// HTTP handler to retrieve and serve readings as JSON
	http.HandleFunc("/readings", func(w http.ResponseWriter, r *http.Request) {
		// Get query parameters
		query := r.URL.Query()

		// Extract the 'days' parameter (as string)
		daysParam := query.Get("days")

		// Default to 7 days if not provided
		numberOfDays := 7

		if daysParam != "" {
			// Convert the 'days' parameter to an integer
			days, err := strconv.Atoi(daysParam)
			if err != nil {
				http.Error(w, "Invalid 'days' query parameter", http.StatusBadRequest)
				return
			}
			numberOfDays = days
		}

		// Set CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		// Handle preflight requests
		if r.Method == http.MethodOptions {
			return
		}

		// Get the current date and time
		currentTime := time.Now().UTC()
		endTime := time.Now().UTC()
		startTime := currentTime
		offset := query.Get("offset") // offset determines pagination of graphs by scrolling back further

		if offset != "" {
			multiplier, err := strconv.Atoi(offset)
			if err != nil {
				http.Error(w, "Invalid 'offset' query parameter", http.StatusBadRequest)
				return
			}
			// multiply start time back by the offset
			// Calculate start time based on the number of days
			startDay := numberOfDays * multiplier
			startTime = currentTime.AddDate(0, 0, -startDay).Truncate(time.Hour)
			endDay := numberOfDays * (multiplier - 1)
			// set the endtime to one unit beyond the start time
			endTime = currentTime.AddDate(0, 0, -endDay).Truncate(time.Hour) // Default endtime to current time, this is used if there's no offset

		} else {
			startTime = currentTime.AddDate(0, 0, -numberOfDays).Truncate(time.Hour)
		}

		// Prepare hourly intervals
		intervals := []time.Time{}
		for t := startTime; t.Before(endTime); t = t.Add(time.Hour) {
			intervals = append(intervals, t)
		}

		// Query the database to get readings within the timeframe
		rows, err := db.Query(`
			SELECT 
				DATE_TRUNC('hour', timestamp) AS hour_slot,
				AVG(temperature) AS avg_temperature,
				AVG(humidity) AS avg_humidity,
				AVG(pressure) AS avg_pressure,
				AVG(gas) AS avg_gas
			FROM environmental_readings
			WHERE timestamp >= $1 AND timestamp < $2
			GROUP BY hour_slot
			ORDER BY hour_slot`,
			startTime, endTime)
		if err != nil {
			fmt.Println(err)
			http.Error(w, "Failed to query database", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		// Map results by hour for easier processing
		dataByHour := map[string]Reading{}
		for rows.Next() {
			var hourSlot time.Time
			var temp, humidity, pressure, gas sql.NullFloat64
			err := rows.Scan(&hourSlot, &temp, &humidity, &pressure, &gas)
			if err != nil {
				http.Error(w, "Failed to scan row", http.StatusInternalServerError)
				return
			}
			dataByHour[hourSlot.Format(time.RFC3339)] = Reading{
				Timestamp:   hourSlot.Format(time.RFC3339),
				Temperature: nullableFloatToPointer(temp),
				Humidity:    nullableFloatToPointer(humidity),
				Pressure:    nullableFloatToPointer(pressure),
				Gas:         nullableFloatToPointer(gas),
			}
		}

		// Generate the final results for each hour slot
		var results []Reading
		for _, t := range intervals {
			timestamp := t.Format(time.RFC3339)
			if reading, exists := dataByHour[timestamp]; exists {
				results = append(results, reading)
			} else {
				results = append(results, Reading{
					Timestamp:   timestamp,
					Temperature: nil,
					Humidity:    nil,
					Pressure:    nil,
					Gas:         nil,
				})
			}
		}

		// Convert readings to JSON
		w.Header().Set("Content-Type", "application/json")
		err = json.NewEncoder(w).Encode(results)
		if err != nil {
			http.Error(w, "Failed to encode readings as JSON", http.StatusInternalServerError)
			return
		}
	})

	// Start the HTTP server
	fmt.Println("Starting server on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

// Helper function to convert sql.NullFloat64 to *float64
func nullableFloatToPointer(n sql.NullFloat64) *float64 {
	if n.Valid {
		return &n.Float64
	}
	return nil
}
