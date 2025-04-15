# Use the official PHP image with Apache
FROM php:8.3-apache

# Install necessary system dependencies
RUN apt-get update && apt-get install -y \
    libsqlite3-dev \
    libpq-dev \
    libzip-dev \
    unzip \
    curl

# Install PHP extensions and enable Apache mod_rewrite
RUN docker-php-ext-install pdo pdo_pgsql zip \
    && a2enmod rewrite

# Configure Apache for Symfony
RUN echo '<Directory /var/www/html/public>\n\
    AllowOverride All\n\
    Require all granted\n\
    DirectoryIndex index.php\n\
    FallbackResource /index.php\n\
</Directory>' > /etc/apache2/conf-available/symfony.conf \
    && a2enconf symfony

RUN rm -rf /var/lib/apt/lists/*

# Set the DocumentRoot to the public directory
RUN sed -i 's|DocumentRoot /var/www/html|DocumentRoot /var/www/html/public|' /etc/apache2/sites-available/000-default.conf

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy application files
COPY . /var/www/html

# Install dev tools
RUN composer require symfony/orm-pack
RUN composer require --dev symfony/maker-bundle

# Install DoctrineFixturesBundle
RUN composer require doctrine/doctrine-fixtures-bundle --dev

# Install Composer dependencies
RUN composer install --optimize-autoloader

# Set permissions for the web server
RUN chown -R www-data:www-data /var/www/html

# Add a health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Ensure the public directory exists and is used as the working directory
WORKDIR /var/www/html/public

# Switch to non-root user for better security
USER www-data

# Expose port 80
EXPOSE 80
