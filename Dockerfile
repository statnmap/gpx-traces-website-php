# Production Dockerfile
FROM php:8.3-apache AS builder

# Install necessary system dependencies for build only
RUN apt-get update && apt-get install -y \
    libsqlite3-dev \
    libpq-dev \
    libzip-dev \
    unzip

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_pgsql zip

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set up the working directory
WORKDIR /app

# Copy composer files
COPY composer.json composer.lock symfony.lock ./

# Install dependencies without dev packages
RUN composer install --no-dev --no-scripts --no-autoloader --no-progress

# Copy the rest of the application
COPY . .

# Run Composer scripts and generate optimized autoloader
RUN composer dump-autoload --no-dev --optimize --classmap-authoritative \
    && composer run-script post-install-cmd

# Production image
FROM php:8.3-apache

# Install minimal production dependencies
RUN apt-get update && apt-get install -y \
    libsqlite3-dev \
    libpq-dev \
    libzip-dev \
    && docker-php-ext-install pdo pdo_pgsql zip \
    && a2enmod rewrite \
    && rm -rf /var/lib/apt/lists/*

# Set the DocumentRoot to the public directory
RUN sed -i 's|DocumentRoot /var/www/html|DocumentRoot /var/www/html/public|' /etc/apache2/sites-available/000-default.conf

# Copy application files from builder
COPY --from=builder /app /var/www/html

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html

# Switch to non-root user for better security
USER www-data

# Set production environment
ENV APP_ENV=prod
ENV APP_DEBUG=0

# Apache runs on port 80
EXPOSE 80

# Configure PHP for production
RUN echo "memory_limit=256M" > /usr/local/etc/php/conf.d/production-memory.ini \
    && echo "opcache.enable=1" > /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.memory_consumption=256" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.max_accelerated_files=20000" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.validate_timestamps=0" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "realpath_cache_size=4096K" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "realpath_cache_ttl=600" >> /usr/local/etc/php/conf.d/opcache.ini

# Set the workdir to the public directory
WORKDIR /var/www/html/public
