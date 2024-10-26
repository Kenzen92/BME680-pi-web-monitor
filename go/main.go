package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"
	_ "github.com/lib/pq" // PostgreSQL driver
)

type Reading struct {
	ID          int     `json:"id"`
	Temperature float64 `json:"temperature"`
	Humidity    float64 `json:"humidity"`
	Pressure    float64 `json:"pressure"`
	Timestamp   string  `json:"timestamp"`
}

func main() {
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

	// HTTP handler to retrieve and serve readings as JSON
	http.HandleFunc("/readings", func(w http.ResponseWriter, r *http.Request) {
		// Get query parameters
		query := r.URL.Query()

		// Extract the 'days' parameter (as string)
		daysParam := query.Get("days")
		
		// Default to 7 days if not provided
		number_of_days := 7

		if daysParam != "" {
			// Convert the 'days' parameter to an integer
			days, err := strconv.Atoi(daysParam)
			if err != nil {
				http.Error(w, "Invalid 'days' query parameter", http.StatusBadRequest)
				return
			}
			number_of_days = days
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
		currentTime := time.Now()

		// Subtract 'number_of_days' days using AddDate (negative value for days to subtract)
		pastTime := currentTime.AddDate(0, 0, -number_of_days)

		// Query the database using a parameterized query
		rows, err := db.Query(`SELECT 
								id, 
								ROUND(temperature::numeric, 2) AS rounded_temperature, 
								ROUND(humidity::numeric, 2) AS rounded_humidity, 
								ROUND(pressure::numeric, 2) AS rounded_pressure, 
								timestamp 
								FROM environmental_readings 
								WHERE timestamp > $1`, pastTime)
		if err != nil {
			fmt.Println(err)
			http.Error(w, "Failed to query database", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var readings []Reading

		for rows.Next() {
			var reading Reading
			err := rows.Scan(&reading.ID, &reading.Temperature, &reading.Humidity, &reading.Pressure, &reading.Timestamp)
			if err != nil {
				http.Error(w, "Failed to scan row", http.StatusInternalServerError)
				return
			}
			readings = append(readings, reading)
		}

		// Convert readings to JSON
		w.Header().Set("Content-Type", "application/json")
		err = json.NewEncoder(w).Encode(readings)
		if err != nil {
			http.Error(w, "Failed to encode readings as JSON", http.StatusInternalServerError)
			return
		}
	})

	// Start the HTTP server
	fmt.Println("Starting server on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
