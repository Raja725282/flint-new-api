# Live Server Deployment Guide - Flint Property Portal

## 🚀 Server पर Live करने के लिए Complete Setup

### 1. **Hosting Requirements**
- **Web Hosting**: PHP 7.4+ support (Hostinger, GoDaddy, Bluehost, etc.)
- **Database**: MySQL 5.7+ या MariaDB
- **SSL Certificate**: HTTPS के लिए (Free Let's Encrypt available)
- **File Upload**: कम से कम 100MB space

### 2. **Files Upload Structure**
```
public_html/
├── index.html
├── property-details.html
├── property-report.html
├── property-api-mysql.php
├── property-api-mysql-client.js
├── database-config.php (नई file बनाएंगे)
├── .htaccess (URL rewriting के लिए)
└── assets/
    ├── css/
    ├── js/
    └── images/
```

## 🗄️ Database Setup on Live Server

### Step 1: Database बनाना
1. **cPanel में जाएं** → MySQL Databases
2. **New Database बनाएं**: `username_flint_properties`
3. **Database User बनाएं** और password set करें
4. **User को Database में add करें** (All Privileges)

### Step 2: SQL Data Import करना
1. **phpMyAdmin खोलें**
2. अपना database select करें
3. **Import** tab में जाएं
4. `flint_properties.sql` file upload करें
5. **Go** button दबाएं

## 🔧 Configuration Files

### Database Configuration (`database-config.php`)
```php
<?php
// Live Server Database Configuration
class DatabaseConfig {
    // Production Database Settings
    private static $host = 'localhost'; // या hosting provider का server
    private static $dbname = 'username_flint_properties'; // आपका actual database name
    private static $username = 'username_dbuser'; // आपका database username
    private static $password = 'your_secure_password'; // आपका database password
    private static $port = 3306;
    
    public static function getConnection() {
        try {
            $dsn = "mysql:host=" . self::$host . ";port=" . self::$port . ";dbname=" . self::$dbname . ";charset=utf8mb4";
            $pdo = new PDO($dsn, self::$username, self::$password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            return $pdo;
        } catch(PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            throw new Exception("Database connection failed");
        }
    }
    
    // Environment detection
    public static function isProduction() {
        return !in_array($_SERVER['HTTP_HOST'], ['localhost', '127.0.0.1', '::1']);
    }
}
?>
```

### Environment Detection (`env-config.php`)
```php
<?php
// Environment Configuration
class EnvConfig {
    public static function getConfig() {
        $isProduction = !in_array($_SERVER['HTTP_HOST'], ['localhost', '127.0.0.1', '::1']);
        
        if ($isProduction) {
            // Production Settings
            return [
                'db_host' => 'localhost',
                'db_name' => 'username_flint_properties',
                'db_user' => 'username_dbuser',
                'db_pass' => 'your_secure_password',
                'api_url' => 'https://yourdomain.com/property-api-mysql.php',
                'debug' => false,
                'error_reporting' => false
            ];
        } else {
            // Development Settings
            return [
                'db_host' => 'localhost',
                'db_name' => 'flint_properties',
                'db_user' => 'root',
                'db_pass' => '',
                'api_url' => 'http://localhost/flint-new/property-api-mysql.php',
                'debug' => true,
                'error_reporting' => true
            ];
        }
    }
}
?>
```

## 🌐 API URL Configuration

### Frontend API Client Update
JavaScript में API URL को dynamic बनाना होगा:

```javascript
// property-api-mysql-client.js में changes
class PropertyAPIMySQL {
    constructor() {
        // Auto-detect API URL based on environment
        this.baseURL = this.getAPIBaseURL();
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }
    
    getAPIBaseURL() {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        
        // Production detection
        if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
            return `${protocol}//${hostname}/property-api-mysql.php`;
        } else {
            // Development
            return `${protocol}//${hostname}/flint-new/property-api-mysql.php`;
        }
    }
    
    // Rest of the class remains same...
}
```

## 🔒 Security Configuration

### .htaccess File for Security
```apache
# Security Headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"

# CORS Headers for API
<Files "property-api-mysql.php">
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
</Files>

# Prevent direct access to config files
<Files "database-config.php">
    Order Deny,Allow
    Deny from all
</Files>

<Files "env-config.php">
    Order Deny,Allow
    Deny from all
</Files>

# Pretty URLs (optional)
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^property/([0-9]+)/?$ property-details.html?id=$1 [QSA,L]
```

## 📝 Updated API File for Production

### Enhanced `property-api-mysql.php`
```php
<?php
// Include configuration
require_once 'database-config.php';

// Error reporting based on environment
if (DatabaseConfig::isProduction()) {
    error_reporting(0);
    ini_set('display_errors', 0);
} else {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
}

// Rest of the API code remains same...
```

## 🚀 Deployment Steps

### Step 1: Prepare Files
1. **Update database credentials** in `database-config.php`
2. **Update API URLs** in JavaScript files
3. **Create .htaccess** file for security
4. **Test locally** before uploading

### Step 2: Upload to Server
1. **FTP/File Manager** से सभी files upload करें
2. **Database import** करें via phpMyAdmin
3. **File permissions** check करें (755 for folders, 644 for files)
4. **Test API endpoints** directly

### Step 3: Testing
```bash
# Test API endpoints
https://yourdomain.com/property-api-mysql.php/properties
https://yourdomain.com/property-api-mysql.php/properties/1
https://yourdomain.com/property-api-mysql.php/search?query=Northcote
```

## 🔍 Troubleshooting Common Issues

### 1. Database Connection Error
```php
// Check in property-api-mysql.php
try {
    $pdo = DatabaseConfig::getConnection();
    echo "Database connected successfully!";
} catch (Exception $e) {
    echo "Connection failed: " . $e->getMessage();
}
```

### 2. CORS Issues
```php
// Add these headers at top of property-api-mysql.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
```

### 3. API Path Issues
```javascript
// Debug API URL in browser console
console.log('API Base URL:', new PropertyAPIMySQL().baseURL);
```

## 📊 Performance Optimization

### 1. Enable Gzip Compression
```apache
# Add to .htaccess
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
```

### 2. Browser Caching
```apache
# Add to .htaccess
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>
```

## 🎯 Final Checklist

- [ ] Database created और data imported
- [ ] Database credentials updated
- [ ] API URLs configured
- [ ] .htaccess file uploaded
- [ ] SSL certificate installed
- [ ] All pages testing properly
- [ ] Mobile responsiveness working
- [ ] Search functionality working
- [ ] Modal popups working
- [ ] API endpoints responding
- [ ] Error handling working

## 📞 Support & Maintenance

### Regular Maintenance Tasks
1. **Database backup** weekly
2. **Security updates** monthly
3. **Performance monitoring**
4. **Log file cleanup**
5. **SSL certificate renewal**

### Monitoring URLs
- Main site: `https://yourdomain.com`
- API health: `https://yourdomain.com/property-api-mysql.php/properties`
- Database status: Check via cPanel

अब आपका project live server पर perfectly काम करेगा! 🚀
