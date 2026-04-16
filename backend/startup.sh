#!/bin/bash

# Ensure SQLite file exists
if [ ! -f /home/site/wwwroot/database/database.sqlite ]; then
    mkdir -p /home/site/wwwroot/database
    touch /home/site/wwwroot/database/database.sqlite
    chmod 666 /home/site/wwwroot/database/database.sqlite
fi

# Ensure storage directories exist
mkdir -p /home/site/wwwroot/storage/framework/views
mkdir -p /home/site/wwwroot/storage/framework/cache
mkdir -p /home/site/wwwroot/storage/framework/sessions
mkdir -p /home/site/wwwroot/storage/logs
mkdir -p /home/site/wwwroot/bootstrap/cache

# Set permissions
chmod -R 775 /home/site/wwwroot/storage
chmod -R 775 /home/site/wwwroot/bootstrap/cache
chown -R www-data:www-data /home/site/wwwroot/storage
chown -R www-data:www-data /home/site/wwwroot/bootstrap/cache

# Update PHP configuration files directly to ensure upload limits are applied
echo "=== Updating PHP Configuration ==="

# Update main php.ini
if [ -f "/etc/php/8.5/fpm/php.ini" ]; then
    echo "Updating /etc/php/8.5/fpm/php.ini"
    sed -i 's/^upload_max_filesize\s*=.*/upload_max_filesize = 15M/' /etc/php/8.5/fpm/php.ini
    sed -i 's/^post_max_size\s*=.*/post_max_size = 16M/' /etc/php/8.5/fpm/php.ini
    sed -i 's/^memory_limit\s*=.*/memory_limit = 256M/' /etc/php/8.5/fpm/php.ini
    grep -E "upload_max_filesize|post_max_size|memory_limit" /etc/php/8.5/fpm/php.ini
fi

# Update PHP-FPM pool configuration
if [ -f "/etc/php/8.5/fpm/pool.d/www.conf" ]; then
    echo "Updating /etc/php/8.5/fpm/pool.d/www.conf"
    sed -i 's/^;*\s*php_admin_value\[upload_max_filesize\].*/php_admin_value[upload_max_filesize] = 15M/' /etc/php/8.5/fpm/pool.d/www.conf
    sed -i 's/^;*\s*php_admin_value\[post_max_size\].*/php_admin_value[post_max_size] = 16M/' /etc/php/8.5/fpm/pool.d/www.conf
    if ! grep -q "php_admin_value\[upload_max_filesize\]" /etc/php/8.5/fpm/pool.d/www.conf; then
        echo "php_admin_value[upload_max_filesize] = 15M" >> /etc/php/8.5/fpm/pool.d/www.conf
        echo "php_admin_value[post_max_size] = 16M" >> /etc/php/8.5/fpm/pool.d/www.conf
    fi
    echo "Updated PHP-FPM pool configuration"
fi

# Restart PHP-FPM to apply changes
echo "Restarting PHP-FPM..."
service php8.5-fpm restart || service php-fpm restart || true
sleep 2

echo "=== PHP Configuration Updated ==="

# Verify Cloudinary credentials are loaded
echo "=== Cloudinary Configuration Check ==="
echo "CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME:-NOT SET}"
echo "CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY:-NOT SET}"
echo "CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET:-NOT SET}"
echo "====================================="

# Laravel setup
php /home/site/wwwroot/artisan migrate --force
php /home/site/wwwroot/artisan db:seed --force

php /home/site/wwwroot/artisan cache:clear
php /home/site/wwwroot/artisan config:clear
php /home/site/wwwroot/artisan config:cache
php /home/site/wwwroot/artisan route:clear
php /home/site/wwwroot/artisan view:clear
php /home/site/wwwroot/artisan view:cache

# Apply nginx config
cp /home/site/wwwroot/default /etc/nginx/sites-available/default
ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

# Reload nginx
service nginx reload || service nginx start