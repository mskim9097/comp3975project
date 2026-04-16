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

# Find all php.ini files and update them
echo "Searching for php.ini files..."
for php_ini in $(find /etc -name "php.ini" 2>/dev/null); do
    echo "Found and updating: $php_ini"
    sed -i 's/^upload_max_filesize\s*=.*/upload_max_filesize = 15M/' "$php_ini"
    sed -i 's/^post_max_size\s*=.*/post_max_size = 16M/' "$php_ini"
    sed -i 's/^memory_limit\s*=.*/memory_limit = 256M/' "$php_ini"
    echo "✓ Updated upload_max_filesize and post_max_size in $php_ini"
done

# Also try to find and update via php -i
php_config_file=$(php -i | grep "Loaded Configuration File" | cut -d' ' -f4)
if [ -n "$php_config_file" ] && [ -f "$php_config_file" ]; then
    echo "Found active php.ini: $php_config_file"
    sed -i 's/^upload_max_filesize\s*=.*/upload_max_filesize = 15M/' "$php_config_file"
    sed -i 's/^post_max_size\s*=.*/post_max_size = 16M/' "$php_config_file"
    sed -i 's/^memory_limit\s*=.*/memory_limit = 256M/' "$php_config_file"
    echo "✓ Updated $php_config_file"
fi

echo "=== PHP Configuration Complete ==="

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