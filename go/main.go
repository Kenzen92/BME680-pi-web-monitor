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
		// Set CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		// Handle preflight requests
		if r.Method == http.MethodOptions {
			return
		}

		// Get query parameters
		query := r.URL.Query()

		// Extract parameters
		startParam := query.Get("start")
		endParam := query.Get("end")
		latestParam := query.Get("latest")
		granularity := query.Get("granularity")
		limitParam := query.Get("limit")
		offsetParam := query.Get("offset")

		// Default granularity to hour
		if granularity == "" {
			granularity = "hour"
		}

		// Validate granularity
		validGranularities := map[string]bool{
			"5min":  true,
			"20min": true,
			"hour":  true,
			"day":   true,
		}
		if !validGranularities[granularity] {
			http.Error(w, "Invalid granularity. Must be one of: 5min, 20min, hour, day", http.StatusBadRequest)
			return
		}

		var startTime, endTime time.Time
		var err error
		var useTimeFilter bool = true

		// Determine time range
		if startParam != "" && endParam != "" {
			// Explicit date range
			startTime, err = time.Parse(time.RFC3339, startParam)
			if err != nil {
				http.Error(w, "Invalid 'start' parameter. Use RFC3339 format (e.g., 2024-01-01T00:00:00Z)", http.StatusBadRequest)
				return
			}
			endTime, err = time.Parse(time.RFC3339, endParam)
			if err != nil {
				http.Error(w, "Invalid 'end' parameter. Use RFC3339 format (e.g., 2024-01-01T23:59:59Z)", http.StatusBadRequest)
				return
			}
		} else if latestParam != "" {
			// Latest N hours
			hours, err := strconv.Atoi(latestParam)
			if err != nil || hours <= 0 {
				http.Error(w, "Invalid 'latest' parameter. Must be a positive integer (hours)", http.StatusBadRequest)
				return
			}
			endTime = time.Now().UTC()
			startTime = endTime.Add(-time.Duration(hours) * time.Hour)
		} else {
			// No time filter - return all data
			useTimeFilter = false
		}

		// Get granularity interval for query
		var truncateExpression string
		var intervalDuration time.Duration

		switch granularity {
		case "5min":
			// For 5-minute intervals, truncate to 5-minute buckets
			truncateExpression = "to_timestamp(floor(extract(epoch from timestamp) / 300) * 300)"
			intervalDuration = 5 * time.Minute
		case "20min":
			// For 20-minute intervals, truncate to 20-minute buckets
			truncateExpression = "to_timestamp(floor(extract(epoch from timestamp) / 1200) * 1200)"
			intervalDuration = 20 * time.Minute
		case "hour":
			truncateExpression = "DATE_TRUNC('hour', timestamp)"
			intervalDuration = time.Hour
		case "day":
			truncateExpression = "DATE_TRUNC('day', timestamp)"
			intervalDuration = 24 * time.Hour
		}

		// Build SQL query based on parameters
		var sqlQuery string
		var queryArgs []interface{}

		if useTimeFilter {
			sqlQuery = fmt.Sprintf(`
				SELECT
					%s AS time_slot,
					AVG(temperature) AS avg_temperature,
					AVG(humidity) AS avg_humidity,
					AVG(pressure) AS avg_pressure,
					AVG(gas) AS avg_gas
				FROM environmental_readings
				WHERE timestamp >= $1 AND timestamp < $2
				GROUP BY time_slot
				ORDER BY time_slot`, truncateExpression)
			queryArgs = []interface{}{startTime, endTime}
		} else {
			// No time filter - get all data
			sqlQuery = fmt.Sprintf(`
				SELECT
					%s AS time_slot,
					AVG(temperature) AS avg_temperature,
					AVG(humidity) AS avg_humidity,
					AVG(pressure) AS avg_pressure,
					AVG(gas) AS avg_gas
				FROM environmental_readings
				GROUP BY time_slot
				ORDER BY time_slot`, truncateExpression)
			queryArgs = []interface{}{}
		}

		// Query the database
		rows, err := db.Query(sqlQuery, queryArgs...)
		if err != nil {
			fmt.Println(err)
			http.Error(w, "Failed to query database", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		// Collect results
		var results []Reading
		dataBySlot := map[string]Reading{}

		for rows.Next() {
			var timeSlot time.Time
			var temp, humidity, pressure, gas sql.NullFloat64
			err := rows.Scan(&timeSlot, &temp, &humidity, &pressure, &gas)
			if err != nil {
				http.Error(w, "Failed to scan row", http.StatusInternalServerError)
				return
			}

			reading := Reading{
				Timestamp:   timeSlot.Format(time.RFC3339),
				Temperature: nullableFloatToPointer(temp),
				Humidity:    nullableFloatToPointer(humidity),
				Pressure:    nullableFloatToPointer(pressure),
				Gas:         nullableFloatToPointer(gas),
			}

			if useTimeFilter {
				// Store in map for filling gaps
				dataBySlot[timeSlot.Format(time.RFC3339)] = reading
			} else {
				// No gaps to fill for all data
				results = append(results, reading)
			}
		}

		// Fill gaps for time-filtered queries
		if useTimeFilter {
			// Helper function to truncate time to the appropriate granularity
			truncateTime := func(t time.Time) time.Time {
				switch granularity {
				case "5min":
					return time.Unix((t.Unix()/300)*300, 0).UTC()
				case "20min":
					return time.Unix((t.Unix()/1200)*1200, 0).UTC()
				case "hour":
					return time.Date(t.Year(), t.Month(), t.Day(), t.Hour(), 0, 0, 0, time.UTC)
				case "day":
					return time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, time.UTC)
				default:
					return t
				}
			}

			// Truncate start time to align with database buckets
			currentTime := truncateTime(startTime)
			truncatedEnd := truncateTime(endTime)

			intervals := []time.Time{}
			for currentTime.Before(truncatedEnd) || currentTime.Equal(truncatedEnd) {
				intervals = append(intervals, currentTime)
				currentTime = currentTime.Add(intervalDuration)
			}

			for _, t := range intervals {
				timestamp := t.Format(time.RFC3339)
				if reading, exists := dataBySlot[timestamp]; exists {
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
		}

		// Apply limit and offset for pagination
		if limitParam != "" {
			limit, err := strconv.Atoi(limitParam)
			if err != nil || limit <= 0 {
				http.Error(w, "Invalid 'limit' parameter. Must be a positive integer", http.StatusBadRequest)
				return
			}

			offset := 0
			if offsetParam != "" {
				offset, err = strconv.Atoi(offsetParam)
				if err != nil || offset < 0 {
					http.Error(w, "Invalid 'offset' parameter. Must be a non-negative integer", http.StatusBadRequest)
					return
				}
			}

			// Apply pagination
			start := offset
			end := offset + limit
			if start > len(results) {
				results = []Reading{}
			} else {
				if end > len(results) {
					end = len(results)
				}
				results = results[start:end]
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
