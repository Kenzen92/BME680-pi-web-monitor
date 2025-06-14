#!/bin/bash

set -e  # Exit immediately if any command fails

VENV_DIR="python/venv"

echo "Stopping any running containers..."
docker compose down || true

echo "Setting up Python virtual environment..."
# Check if venv exists, create it if it doesn't
if [ ! -d "$VENV_DIR" ]; then
  echo "Virtual environment not found. Creating one..."
  python3 -m venv $VENV_DIR
  echo "Virtual environment created at $VENV_DIR."
else
  echo "Using existing virtual environment at $VENV_DIR."
fi

# Activate the virtual environment
source $VENV_DIR/bin/activate

echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r python/requirements.txt

echo "Building Vite project..."
cd graph
npm install  # Ensure dependencies are installed
npm run build

cd ../

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
