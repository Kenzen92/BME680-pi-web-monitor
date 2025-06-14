#!/bin/bash

set -e  # Exit immediately if any command fails

VENV_DIR="python/venv"

echo "Stopping any running containers..."
docker compose down || true

echo "Building Docker containers..."
docker compose build

echo "Starting Docker containers in detached mode..."
docker compose up -d

# Ensure docker compose starts successfully before proceeding
if [ $? -eq 0 ]; then
  echo "Docker containers started successfully."
else
  echo "Failed to start Docker containers. Exiting..."
  exit 1
fi

echo "Starting Python script in the background..."
nohup python3 -u python/main.py > python/main.log 2>&1 &

echo "Python script started in the background. Output is redirected to main.log."
