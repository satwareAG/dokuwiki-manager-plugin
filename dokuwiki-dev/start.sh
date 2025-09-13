#!/bin/bash
echo "Starting DokuWiki development environment..."

# Get user and group IDs for correct permissions
USER_ID=$(id -u)
GROUP_ID=$(id -g)

# Update Docker Compose file with current user/group IDs
sed -i "s/PUID=1000/PUID=$USER_ID/" docker-compose.yml
sed -i "s/PGID=1000/PGID=$GROUP_ID/" docker-compose.yml

# Create data directory if it doesn't exist
mkdir -p data

docker-compose up -d
echo "DokuWiki is starting at http://localhost:8080"
echo "For first-time setup, go to http://localhost:8080/install.php"
echo "To stop the environment, run: ./stop.sh"
