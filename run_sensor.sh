#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$SCRIPT_DIR/python/venv"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "========================================"
log "run_sensor.sh starting"
log "========================================"

# Start containers without rebuilding (fast on power cycle)
log "Starting Docker containers..."
docker compose -f "$SCRIPT_DIR/docker-compose.yml" up -d
if [ $? -ne 0 ]; then
    log "ERROR: docker compose up failed. Exiting."
    exit 1
fi

# Wait for PostgreSQL to accept connections
log "Waiting for PostgreSQL..."
for i in $(seq 1 30); do
    if docker exec postgres_db pg_isready -U postgres > /dev/null 2>&1; then
        log "PostgreSQL is ready."
        break
    fi
    if [ "$i" -eq 30 ]; then
        log "ERROR: PostgreSQL did not become ready in time. Exiting."
        exit 1
    fi
    log "  PostgreSQL not ready yet ($i/30), retrying in 5 s..."
    sleep 5
done

# Wait for Redis to accept connections
log "Waiting for Redis..."
for i in $(seq 1 20); do
    if docker exec redis_instance redis-cli ping > /dev/null 2>&1; then
        log "Redis is ready."
        break
    fi
    if [ "$i" -eq 20 ]; then
        log "ERROR: Redis did not become ready in time. Exiting."
        exit 1
    fi
    log "  Redis not ready yet ($i/20), retrying in 3 s..."
    sleep 3
done

log "Activating Python virtual environment..."
source "$VENV_DIR/bin/activate"

# Run Python in the foreground so systemd can track and restart it
log "Starting Python sensor script (foreground)..."
exec python3 -u "$SCRIPT_DIR/python/main.py"
