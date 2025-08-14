@echo off
REM Flint Property Portal - Windows Production Deployment Script
REM Version: 1.0
REM Author: Flint Group

echo =====================================================
echo 🚀 Flint Property Portal - Production Deployment
echo =====================================================
echo.

REM Colors for Windows (using echo with color codes)
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "NC=[0m"

echo %GREEN%[INFO]%NC% Starting deployment preparation...
echo.

REM Check if we're in the right directory
if not exist "index.html" (
    echo %RED%[ERROR]%NC% index.html not found. Please run this script from the project root directory.
    pause
    exit /b 1
)

if not exist "property-details.html" (
    echo %RED%[ERROR]%NC% property-details.html not found. Please run this script from the project root directory.
    pause
    exit /b 1
)

echo %GREEN%[INFO]%NC% Creating backup folder...
set "BACKUP_DIR=backup\%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "BACKUP_DIR=%BACKUP_DIR: =0%"
mkdir "%BACKUP_DIR%" 2>nul

echo %GREEN%[INFO]%NC% Backing up existing files...
copy *.html "%BACKUP_DIR%\" >nul 2>&1
copy *.php "%BACKUP_DIR%\" >nul 2>&1
copy *.js "%BACKUP_DIR%\" >nul 2>&1

echo %GREEN%[INFO]%NC% Preparing production files...

REM Check if production files exist
if exist "property-api-mysql-production.php" (
    copy "property-api-mysql-production.php" "property-api-mysql.php" >nul
    echo %GREEN%[INFO]%NC% ✅ Production API file activated
) else (
    echo %YELLOW%[WARNING]%NC% Production API file not found
)

if exist "property-api-mysql-client-production.js" (
    copy "property-api-mysql-client-production.js" "property-api-mysql-client.js" >nul
    echo %GREEN%[INFO]%NC% ✅ Production client file activated
) else (
    echo %YELLOW%[WARNING]%NC% Production client file not found
)

echo.
echo %GREEN%[INFO]%NC% Creating deployment instructions...

REM Create deployment instructions file
(
echo # 🚀 Production Deployment Instructions
echo.
echo ## Step 1: Server Requirements
echo - Web hosting with PHP 7.4+ support
echo - MySQL 5.7+ database
echo - SSL certificate ^(recommended^)
echo - File upload capability
echo.
echo ## Step 2: Database Setup
echo 1. Login to your hosting cPanel
echo 2. Go to MySQL Databases
echo 3. Create new database: `username_flint_properties`
echo 4. Create database user with strong password
echo 5. Add user to database with ALL PRIVILEGES
echo 6. Note down: hostname, database name, username, password
echo.
echo ## Step 3: File Upload
echo Upload these files to your public_html folder:
echo - index.html
echo - property-details.html  
echo - property-report.html
echo - property-api-mysql.php
echo - property-api-mysql-client.js
echo - database-config.php
echo - .htaccess
echo.
echo ## Step 4: Database Import
echo 1. Open phpMyAdmin from cPanel
echo 2. Select your database
echo 3. Click Import tab
echo 4. Upload flint_properties.sql file
echo 5. Click Go to import
echo.
echo ## Step 5: Configuration
echo 1. Edit database-config.php with your database details:
echo    - Host: usually 'localhost'
echo    - Database name: your_username_flint_properties
echo    - Username: your database username
echo    - Password: your database password
echo.
echo ## Step 6: Testing
echo Test these URLs:
echo - https://yourdomain.com
echo - https://yourdomain.com/property-api-mysql.php/health
echo - https://yourdomain.com/property-api-mysql.php/properties
echo.
echo ## Troubleshooting
echo - Database error: Check credentials in database-config.php
echo - 404 errors: Check file upload and .htaccess
echo - CORS errors: Verify .htaccess CORS headers
echo.
) > DEPLOYMENT_INSTRUCTIONS.txt

echo %GREEN%[INFO]%NC% Creating database configuration template...

REM Create production database config
(
echo ^<?php
echo /**
echo  * Production Database Configuration
echo  * Update with your hosting provider's database details
echo  */
echo.
echo class DatabaseConfig {
echo     // 🔴 UPDATE THESE VALUES WITH YOUR HOSTING DETAILS
echo     private static $host = 'localhost';                    // Database host
echo     private static $dbname = 'your_username_flint_properties'; // Database name
echo     private static $username = 'your_db_username';         // Database username  
echo     private static $password = 'your_secure_password';     // Database password
echo     private static $port = 3306;
echo     
echo     private static $connection = null;
echo     
echo     public static function getConnection^(^) {
echo         if ^(self::$connection === null^) {
echo             try {
echo                 $dsn = "mysql:host=" . self::$host . ";port=" . self::$port . ";dbname=" . self::$dbname . ";charset=utf8mb4";
echo                 self::$connection = new PDO^($dsn, self::$username, self::$password^);
echo                 self::$connection-^>setAttribute^(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION^);
echo                 self::$connection-^>setAttribute^(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC^);
echo                 self::$connection-^>setAttribute^(PDO::ATTR_EMULATE_PREPARES, false^);
echo                 self::$connection-^>exec^("SET time_zone = '+00:00'"^);
echo             } catch^(PDOException $e^) {
echo                 error_log^("Database connection failed: " . $e-^>getMessage^(^)^);
echo                 throw new Exception^("Database connection failed"^);
echo             }
echo         }
echo         return self::$connection;
echo     }
echo     
echo     public static function isProduction^(^) {
echo         $devHosts = ['localhost', '127.0.0.1', '::1'];
echo         return !in_array^($_SERVER['HTTP_HOST'], $devHosts^);
echo     }
echo     
echo     public static function testConnection^(^) {
echo         try {
echo             $pdo = self::getConnection^(^);
echo             $stmt = $pdo-^>query^("SELECT 1 as test"^);
echo             $result = $stmt-^>fetch^(^);
echo             return [
echo                 'status' =^> 'success',
echo                 'message' =^> 'Database connected successfully!',
echo                 'test_result' =^> $result['test']
echo             ];
echo         } catch ^(Exception $e^) {
echo             return [
echo                 'status' =^> 'error',
echo                 'message' =^> $e-^>getMessage^(^)
echo             ];
echo         }
echo     }
echo }
echo.
echo // Production error handling
echo if ^(DatabaseConfig::isProduction^(^)^) {
echo     error_reporting^(0^);
echo     ini_set^('display_errors', 0^);
echo     ini_set^('log_errors', 1^);
echo } else {
echo     error_reporting^(E_ALL^);
echo     ini_set^('display_errors', 1^);
echo }
echo ?^>
) > database-config-production.php

echo %GREEN%[INFO]%NC% Creating upload checklist...

REM Create upload checklist
(
echo ✅ Files Ready for Upload:
echo.
echo 📁 HTML Files:
echo    ✓ index.html
echo    ✓ property-details.html
echo    ✓ property-report.html
echo.
echo 📁 PHP Files:
echo    ✓ property-api-mysql.php
echo    ✓ database-config.php
echo.
echo 📁 JavaScript Files:
echo    ✓ property-api-mysql-client.js
echo.
echo 📁 Database Files:
echo    ✓ flint_properties.sql
echo.
echo 📁 Configuration Files:
echo    ✓ .htaccess
echo.
echo 🔧 Post-Upload Tasks:
echo    1. Import flint_properties.sql via phpMyAdmin
echo    2. Update database credentials in database-config.php
echo    3. Test API: yourdomain.com/property-api-mysql.php/health
echo    4. Test website: yourdomain.com
echo    5. Test search functionality
echo    6. Test responsive design on mobile
echo.
echo 🌐 Test URLs:
echo    - Main Site: https://yourdomain.com
echo    - API Health: https://yourdomain.com/property-api-mysql.php/health  
echo    - Properties: https://yourdomain.com/property-api-mysql.php/properties
echo    - Search: https://yourdomain.com/property-api-mysql.php/search?query=northcote
echo.
) > UPLOAD_CHECKLIST.txt

echo.
echo =====================================================
echo 🎉 Production Deployment Preparation Complete!
echo =====================================================
echo.
echo 📋 Files Created:
echo   - DEPLOYMENT_INSTRUCTIONS.txt
echo   - database-config-production.php  
echo   - UPLOAD_CHECKLIST.txt
echo   - Backup folder: %BACKUP_DIR%
echo.
echo 📤 Next Steps:
echo   1. Read DEPLOYMENT_INSTRUCTIONS.txt
echo   2. Update database-config.php with your hosting details
echo   3. Upload all files to your server
echo   4. Import flint_properties.sql via phpMyAdmin
echo   5. Test using URLs in UPLOAD_CHECKLIST.txt
echo.
echo %GREEN%[SUCCESS]%NC% Your Flint Property Portal is ready for production! 🚀
echo.
pause
