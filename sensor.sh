#!/bin/bash

# Stop any running containers
docker-compose down

pip install -r python/requirements.txt

docker-compose build

# Start containers in detached mode
docker-compose up -d

# Ensure docker-compose starts successfully before proceeding
if [ $? -eq 0 ]; then
  echo "Docker containers started successfully."
else
  echo "Failed to start Docker containers. Exiting..."
  exit 1
fi

# Start the Python script in the background with nohup and redirect output to a log file
nohup python3 -u python/main.py > python/main.log 2>&1 &

# python3 python/main.py
echo "Python script started in the background. Output is redirected to main.log."