#!/bin/bash

# Flint Property Portal - Production Deployment Script
# Version: 1.0
# Author: Flint Group

echo "🚀 Starting Flint Property Portal Deployment..."

# Configuration
PROD_API_FILE="property-api-mysql-production.php"
PROD_CLIENT_FILE="property-api-mysql-client-production.js"
DEV_API_FILE="property-api-mysql.php"
DEV_CLIENT_FILE="property-api-mysql-client.js"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "index.html" ] || [ ! -f "property-details.html" ]; then
    log_error "Please run this script from the project root directory"
    exit 1
fi

log_info "Preparing files for production deployment..."

# Step 1: Backup existing files
log_info "Creating backup of existing files..."
mkdir -p backup/$(date +%Y%m%d_%H%M%S)
cp *.html *.php *.js backup/$(date +%Y%m%d_%H%M%S)/ 2>/dev/null || true

# Step 2: Replace API files with production versions
log_info "Switching to production API files..."

if [ -f "$PROD_API_FILE" ]; then
    cp "$PROD_API_FILE" "$DEV_API_FILE"
    log_info "✅ Production API file activated"
else
    log_error "Production API file not found: $PROD_API_FILE"
fi

if [ -f "$PROD_CLIENT_FILE" ]; then
    cp "$PROD_CLIENT_FILE" "$DEV_CLIENT_FILE"
    log_info "✅ Production client file activated"
else
    log_error "Production client file not found: $PROD_CLIENT_FILE"
fi

# Step 3: Update HTML files to use production client
log_info "Updating HTML files for production..."

# Update script references in HTML files
sed -i 's/property-api-mysql-client\.js/property-api-mysql-client-production.js/g' *.html 2>/dev/null || {
    log_warning "Could not update HTML files automatically. Please update manually."
}

# Step 4: Create production configuration
log_info "Creating production configuration template..."

cat > database-config-production.php << 'EOL'
<?php
/**
 * Production Database Configuration
 * Update these values with your hosting provider's details
 */

class DatabaseConfig {
    // 🔴 IMPORTANT: Update these values before deployment
    private static $host = 'localhost';                    // Your database host
    private static $dbname = 'your_cpanel_username_flint_properties'; // Your database name
    private static $username = 'your_database_username';   // Your database username
    private static $password = 'your_secure_password';     // Your database password
    private static $port = 3306;
    
    // Connection instance
    private static $connection = null;
    
    public static function getConnection() {
        if (self::$connection === null) {
            try {
                $dsn = "mysql:host=" . self::$host . ";port=" . self::$port . ";dbname=" . self::$dbname . ";charset=utf8mb4";
                self::$connection = new PDO($dsn, self::$username, self::$password);
                self::$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                self::$connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
                self::$connection->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
                self::$connection->exec("SET time_zone = '+00:00'");
            } catch(PDOException $e) {
                error_log("Database connection failed: " . $e->getMessage());
                throw new Exception("Database connection failed");
            }
        }
        return self::$connection;
    }
    
    public static function isProduction() {
        $devHosts = ['localhost', '127.0.0.1', '::1'];
        return !in_array($_SERVER['HTTP_HOST'], $devHosts);
    }
    
    public static function testConnection() {
        try {
            $pdo = self::getConnection();
            $stmt = $pdo->query("SELECT 1 as test");
            $result = $stmt->fetch();
            return [
                'status' => 'success',
                'message' => 'Database connected successfully!',
                'test_result' => $result['test']
            ];
        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }
    }
}

// Production error handling
if (DatabaseConfig::isProduction()) {
    error_reporting(0);
    ini_set('display_errors', 0);
    ini_set('log_errors', 1);
} else {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
}
?>
EOL

log_info "✅ Production configuration template created"

# Step 5: Create deployment checklist
log_info "Creating deployment checklist..."

cat > DEPLOYMENT_CHECKLIST.md << 'EOL'
# 🚀 Production Deployment Checklist

## Before Upload

### 1. Database Configuration
- [ ] Update `database-config.php` with production database credentials
- [ ] Test database connection locally with production settings
- [ ] Backup existing database (if any)

### 2. File Preparation
- [ ] Verify all HTML files are using production API clients
- [ ] Check that .htaccess file is properly configured
- [ ] Ensure all image assets are optimized

### 3. Security
- [ ] Review .htaccess security headers
- [ ] Ensure sensitive files are protected
- [ ] Set proper file permissions (755 for directories, 644 for files)

## Upload to Server

### 1. File Upload
- [ ] Upload all HTML files to public_html/
- [ ] Upload PHP files (property-api-mysql.php, database-config.php)
- [ ] Upload JavaScript files
- [ ] Upload .htaccess file
- [ ] Upload CSS and image assets

### 2. Database Setup
- [ ] Create database via cPanel
- [ ] Create database user and set permissions
- [ ] Import flint_properties.sql via phpMyAdmin
- [ ] Verify tables and data are imported correctly

### 3. Configuration
- [ ] Update database credentials in database-config.php
- [ ] Test database connection: yoursite.com/property-api-mysql.php/health
- [ ] Verify API endpoints work: yoursite.com/property-api-mysql.php/properties

## Post-Deployment Testing

### 1. Functionality Testing
- [ ] Test homepage loads correctly
- [ ] Test property search functionality
- [ ] Test property details pages
- [ ] Test "Get Free Report" popup
- [ ] Test all responsive breakpoints

### 2. Performance Testing
- [ ] Check page load speeds
- [ ] Verify API response times
- [ ] Test caching headers
- [ ] Verify SSL certificate (if applicable)

### 3. SEO & Analytics
- [ ] Submit sitemap to search engines
- [ ] Set up Google Analytics (if required)
- [ ] Test social media sharing (if applicable)

## URLs to Test

- Main site: https://yourdomain.com
- API health: https://yourdomain.com/property-api-mysql.php/health
- Properties: https://yourdomain.com/property-api-mysql.php/properties
- Search: https://yourdomain.com/property-api-mysql.php/search?query=northcote

## Troubleshooting

### Common Issues:
1. **Database Connection Error**: Check credentials and database name
2. **CORS Errors**: Verify .htaccess CORS headers
3. **404 Errors**: Check file paths and .htaccess rewrite rules
4. **Permission Errors**: Set correct file permissions via cPanel

### Support Contacts:
- Hosting Provider Support
- Database Administrator
- Development Team
EOL

log_info "✅ Deployment checklist created"

# Step 6: Create upload script
log_info "Creating FTP upload script template..."

cat > upload-to-server.sh << 'EOL'
#!/bin/bash

# FTP Upload Script for Flint Property Portal
# Update FTP credentials below

FTP_HOST="your-ftp-host.com"
FTP_USER="your-ftp-username"
FTP_PASS="your-ftp-password"
REMOTE_DIR="/public_html/"

echo "Uploading files to production server..."

# Upload main files
lftp -c "
set ftp:ssl-force true
set ftp:ssl-protect-data true
open ftp://$FTP_USER:$FTP_PASS@$FTP_HOST
lcd .
cd $REMOTE_DIR
put index.html
put property-details.html
put property-report.html
put property-api-mysql.php
put property-api-mysql-client.js
put database-config.php
put .htaccess
put flint_properties.sql
quit
"

echo "✅ Files uploaded successfully!"
echo "Don't forget to:"
echo "1. Import flint_properties.sql via phpMyAdmin"
echo "2. Update database credentials in database-config.php"
echo "3. Test the API endpoints"
EOL

chmod +x upload-to-server.sh
log_info "✅ FTP upload script created"

# Step 7: Final summary
echo ""
echo "🎉 Production deployment preparation complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Update database credentials in database-config.php"
echo "2. Review and customize .htaccess as needed"
echo "3. Upload files to your server (use upload-to-server.sh or FTP client)"
echo "4. Import flint_properties.sql via phpMyAdmin"
echo "5. Test all functionality using DEPLOYMENT_CHECKLIST.md"
echo ""
echo "📁 Files ready for upload:"
echo "- index.html"
echo "- property-details.html"
echo "- property-report.html"
echo "- property-api-mysql.php (production version)"
echo "- property-api-mysql-client.js (production version)"
echo "- database-config.php"
echo "- flint_properties.sql"
echo "- .htaccess"
echo ""
echo "🔗 Test URLs after deployment:"
echo "- https://yourdomain.com"
echo "- https://yourdomain.com/property-api-mysql.php/health"
echo "- https://yourdomain.com/property-api-mysql.php/properties"
echo ""
log_info "Deployment guide complete! 🚀"
EOL
