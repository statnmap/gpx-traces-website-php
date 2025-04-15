# README for Development

## Development Environment

This project includes a dedicated development environment using Docker. The development setup is separate from production to provide better debugging tools, faster development cycles, and direct access to the database.

### Setup and Usage

1. **Starting the Development Environment**

   Use the included helper script to start the development environment:

```bash
./dev/run-dev.sh up
```

   This will start all necessary containers using the development-specific configuration in `compose.dev.yaml`.

   After starting, you can access:
   - Application: http://localhost:8080
   - Database UI (Adminer): http://localhost:8081

2. **Running Symfony Console Commands**

   Instead of entering the container manually, use the helper script:

```bash
./dev/run-dev.sh console make:entity
./dev/run-dev.sh console make:migration
./dev/run-dev.sh console doctrine:migrations:migrate
./dev/run-dev.sh console make:controller ArticleController
```

3. **Composer Operations**

   To install or update packages:

```bash
./dev/run-dev.sh composer require some/package
./dev/run-dev.sh composer update
```

4. **Accessing the Container Shell**

   To get a shell inside the container:

```bash
./dev/run-dev.sh bash
```

5. **Database Access**

   To directly access the PostgreSQL database shell:

```bash
./dev/run-dev.sh db
# Check that the database exists
docker exec -it gpx-traces-website-php-database-1 psql -U app -d app -c "\dt"
```

   Or use the Adminer interface at http://localhost:8081

6. **Viewing Logs**

   To see logs from all containers:

```bash
./dev/run-dev.sh logs
```

7. **Stopping the Environment**

```bash
./dev/run-dev.sh down
```

8. **Rebuilding from Scratch**

   If you need to completely rebuild the containers:

```bash
./dev/run-dev.sh rebuild
```

## Development Features

The development environment includes:

- **Live Code Changes**: Source code is mounted as a volume, so changes are reflected immediately
- **Xdebug**: Configured for debugging with VS Code or other IDEs
- **Development Tools**: symfony/maker-bundle and other dev tools are pre-installed
- **Database Access**: PostgreSQL port exposed and Adminer included for easy database management
- **Symfony CLI**: Available in the container for Symfony-specific commands

## Create an Entity

https://symfony.com/doc/current/doctrine.html

- The database needs to be up and ready
- The container needs to be up and running
- Go inside

```bash
docker exec -it gpx-traces-website-php-php-apache-1 bash
```

- Create an entity from inside the container

```bash
# If needed
php /var/www/html/bin/console doctrine:database:create
# Make entity
php /var/www/html/bin/console make:entity
# Migration
php /var/www/html/bin/console make:migration
php /var/www/html/bin/console doctrine:migrations:migrate
```

- Create one article
```bash
php /var/www/html/bin/console make:controller ArticleController
```

## Troubleshooting

If you encounter issues with the development environment:

1. Check container status with `docker compose -f compose.dev.yaml ps`
2. View logs with `./dev/run-dev.sh logs`
3. Ensure all volumes are properly mounted
4. Try rebuilding with `./dev/run-dev.sh rebuild`