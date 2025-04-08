# Use the official PHP image with Apache
FROM php:8.3-apache

# Install necessary system dependencies for sqlite3
RUN apt-get update && apt-get install -y libsqlite3-dev && rm -rf /var/lib/apt/lists/*

# Install necessary PHP extensions
RUN docker-php-ext-install pdo pdo_mysql pdo_sqlite

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

# Expose port 80
EXPOSE 80
