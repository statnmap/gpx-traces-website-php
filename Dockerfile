# Use the official PHP image with Apache
FROM php:8.3-apache

# Install necessary system dependencies for sqlite3
RUN apt-get update && apt-get install -y libsqlite3-dev && rm -rf /var/lib/apt/lists/*

# Removed unnecessary PHP extensions for MySQL and SQLite
RUN docker-php-ext-install pdo

# Install PostgreSQL development libraries
RUN apt-get update && apt-get install -y libpq-dev && rm -rf /var/lib/apt/lists/*

# Install PostgreSQL PDO extension
RUN docker-php-ext-install pdo_pgsql

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Set the DocumentRoot to the public directory
RUN sed -i 's|DocumentRoot /var/www/html|DocumentRoot /var/www/html/public|' /etc/apache2/sites-available/000-default.conf

# Copy application files to the container
COPY . /var/www/html

# Ensure the public directory exists and is used as the working directory
WORKDIR /var/www/html/public

# Set permissions for the web server
RUN chown -R www-data:www-data /var/www/html

# Copy the SQL initialization script into the container
COPY init.sql /docker-entrypoint-initdb.d/

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Expose port 80
EXPOSE 80
