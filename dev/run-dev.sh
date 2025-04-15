#!/bin/bash

# Script to run the development environment

# Make sure we're in the project root
cd "$(dirname "$0")/.."

# Check if docker and docker compose are installed
if ! command -v docker &> /dev/null || ! command -v docker compose &> /dev/null; then
    echo "Error: Docker and Docker Compose are required but not installed."
    exit 1
fi

# Default command is to start the containers
COMMAND=${1:-"up"}

case "$COMMAND" in
    up)
        echo "Starting development environment..."
        docker compose -f compose.dev.yaml up -d
        echo "Development environment is up!"
        echo ""
        echo "Access your application at: http://localhost:8080"
        echo "Database UI available at: http://localhost:8081"
        echo ""
        echo "To run Symfony console commands use: ./dev/run-dev.sh console [command]"
        echo "Example: ./dev/run-dev.sh console make:entity"
        ;;
    down)
        echo "Stopping development environment..."
        docker compose -f compose.dev.yaml down
        ;;
    rebuild)
        echo "Rebuilding development environment..."
        docker compose -f compose.dev.yaml build --no-cache
        docker compose -f compose.dev.yaml up -d
        ;;
    console)
        shift
        echo "Running Symfony console command: $@"
        docker compose -f compose.dev.yaml exec php-apache php /var/www/html/bin/console "$@"
        ;;
    composer)
        shift
        echo "Running Composer command: $@"
        docker compose -f compose.dev.yaml exec php-apache composer "$@"
        ;;
    bash)
        echo "Opening shell in the PHP container..."
        docker compose -f compose.dev.yaml exec php-apache bash
        ;;
    db)
        echo "Opening PostgreSQL shell..."
        docker compose -f compose.dev.yaml exec database psql -U app -d app
        ;;
    logs)
        docker compose -f compose.dev.yaml logs -f
        ;;
    *)
        echo "Usage: $0 {up|down|rebuild|console|composer|bash|db|logs}"
        echo ""
        echo "Commands:"
        echo "  up        Start the development environment (default)"
        echo "  down      Stop the development environment"
        echo "  rebuild   Rebuild the containers from scratch"
        echo "  console   Run a Symfony console command"
        echo "  composer  Run a Composer command"
        echo "  bash      Open a shell in the PHP container"
        echo "  db        Open a PostgreSQL shell"
        echo "  logs      View logs from all containers"
        exit 1
        ;;
esac