#!/bin/bash

# SQLite
if [ ! -f /home/site/wwwroot/database/database.sqlite ]; then
    mkdir -p /home/site/wwwroot/database
    touch /home/site/wwwroot/database/database.sqlite
    chmod 666 /home/site/wwwroot/database/database.sqlite
fi

# storage
mkdir -p /home/site/wwwroot/storage/framework/{views,cache,sessions}
mkdir -p /home/site/wwwroot/storage/logs
mkdir -p /home/site/wwwroot/bootstrap/cache

chmod -R 775 /home/site/wwwroot/storage
chmod -R 775 /home/site/wwwroot/bootstrap/cache
chown -R www-data:www-data /home/site/wwwroot/storage
chown -R www-data:www-data /home/site/wwwroot/bootstrap/cache

# Laravel
php /home/site/wwwroot/artisan migrate --force
php /home/site/wwwroot/artisan db:seed --force

php /home/site/wwwroot/artisan config:clear
php /home/site/wwwroot/artisan config:cache
php /home/site/wwwroot/artisan route:cache
php /home/site/wwwroot/artisan view:cache

# nginx config
cp /home/site/wwwroot/default /etc/nginx/sites-available/default
ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

# nginx start
service nginx start