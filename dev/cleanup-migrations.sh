#!/bin/bash

# Script to clean up migrations in the Symfony application
# This will consolidate all executed migrations into a single migration

# Change to project root directory
cd "$(dirname "$0")/.."

# Check if docker is running
if ! docker ps > /dev/null 2>&1; then
  echo "Error: Docker is not running. Please start Docker and try again."
  exit 1
fi

echo "=== Migration Cleanup Process ==="
echo "This script will:"
echo "1. Reset the migration version table"
echo "2. Mark only the consolidated migration as executed"
echo "3. Remove all old migration files"
echo ""
echo "WARNING: This should only be done in a development environment."
echo "Make sure you have a backup of your database before proceeding."
echo ""

# Ask for confirmation
read -p "Are you sure you want to continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Operation cancelled."
  exit 0
fi

CONTAINER_NAME="gpx-traces-website-php-php-apache-1"
CONSOLIDATED_MIGRATION="Version20250415143710"

echo "=== Removing old migration records from the database ==="
docker exec -it $CONTAINER_NAME php /var/www/html/bin/console doctrine:migrations:version --delete --all --no-interaction

echo "=== Marking the consolidated migration as executed ==="
docker exec -it $CONTAINER_NAME php /var/www/html/bin/console doctrine:migrations:version --add --version="DoctrineMigrations\\$CONSOLIDATED_MIGRATION" --no-interaction

echo "=== Backing up and removing old migration files ==="
mkdir -p migrations/archive
for file in migrations/Version*.php; do
  if [[ "$file" != "migrations/$CONSOLIDATED_MIGRATION.php" ]]; then
    echo "Moving $file to migrations/archive/"
    mv "$file" migrations/archive/
  fi
done

echo ""
echo "=== Migration cleanup complete ==="
echo "Your database schema is now managed by a single consolidated migration."
echo "Run 'php bin/console doctrine:migrations:status' to confirm."
echo ""
echo "The old migration files have been moved to migrations/archive/ for reference."
echo "You can delete them if they are no longer needed."