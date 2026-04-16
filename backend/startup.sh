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

# The actual php.ini file that Azure uses
PHP_INI="/usr/local/etc/php/conf.d/php.ini"

echo "Updating: $PHP_INI"

# Update the actual php.ini being used
if [ -f "$PHP_INI" ]; then
    sed -i.bak \
        -e 's/^upload_max_filesize.*/upload_max_filesize = 15M/' \
        -e 's/^post_max_size.*/post_max_size = 16M/' \
        -e 's/^memory_limit.*/memory_limit = 256M/' \
        "$PHP_INI"
    echo "✓ Updated $PHP_INI"
    echo "Current settings:"
    grep -E "upload_max_filesize|post_max_size|memory_limit" "$PHP_INI" | head -3
else
    echo "Warning: $PHP_INI not found, will create it"
    mkdir -p "$(dirname $PHP_INI)" 2>/dev/null || true
    cat > "$PHP_INI" << 'EOF'
[PHP]
upload_max_filesize = 15M
post_max_size = 16M
memory_limit = 256M
max_execution_time = 300
max_input_time = 300
EOF
    echo "✓ Created $PHP_INI"
fi

# Also update main php.ini if it exists in /usr/local/etc/php/
if [ -f "/usr/local/etc/php/php.ini" ]; then
    echo "Also updating: /usr/local/etc/php/php.ini"
    sed -i.bak \
        -e 's/^upload_max_filesize.*/upload_max_filesize = 15M/' \
        -e 's/^post_max_size.*/post_max_size = 16M/' \
        -e 's/^memory_limit.*/memory_limit = 256M/' \
        "/usr/local/etc/php/php.ini"
    echo "✓ Updated /usr/local/etc/php/php.ini"
fi

echo "=== PHP Configuration Complete ==="

# Verify current settings after update
echo "Verifying PHP settings:"
php -r 'echo "upload_max_filesize: " . ini_get("upload_max_filesize") . "\n"; echo "post_max_size: " . ini_get("post_max_size") . "\n"; echo "memory_limit: " . ini_get("memory_limit") . "\n";' 2>/dev/null || echo "Unable to verify"

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