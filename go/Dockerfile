# Use the official Golang image as a base
FROM golang:1.23-alpine

# Install build dependencies and PostgreSQL client libraries
RUN apk add --no-cache gcc musl-dev postgresql-dev

# Enable CGO
ENV CGO_ENABLED=1

# Set the working directory inside the container
WORKDIR /app

# Copy Go module files to download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the Go source code to the working directory
COPY . .

# Build the Go application
RUN go build -o server .

# Expose port 8080 for the HTTP server
EXPOSE 8080

# Command to run the Go app
CMD ["go", "run", "main.go"]
