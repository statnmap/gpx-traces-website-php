# Use the official PHP image with Apache
FROM php:8.3-apache

# Install necessary system dependencies
RUN apt-get update && apt-get install -y \
    libsqlite3-dev \
    libpq-dev \
    libzip-dev \
    unzip

# Install PHP extensions and enable Apache mod_rewrite
RUN docker-php-ext-install pdo pdo_pgsql zip \
    && a2enmod rewrite

RUN rm -rf /var/lib/apt/lists/*

# Set the DocumentRoot to the public directory
RUN sed -i 's|DocumentRoot /var/www/html|DocumentRoot /var/www/html/public|' /etc/apache2/sites-available/000-default.conf

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy application files
COPY . /var/www/html

# Install DoctrineFixturesBundle
RUN composer require doctrine/doctrine-fixtures-bundle --dev

# Install Composer dependencies
RUN composer install --optimize-autoloader

# Set permissions for the web server
RUN chown -R www-data:www-data /var/www/html

# Ensure the public directory exists and is used as the working directory
WORKDIR /var/www/html/public

# Expose port 80
EXPOSE 80
