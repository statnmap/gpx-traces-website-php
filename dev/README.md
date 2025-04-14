# README for development

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