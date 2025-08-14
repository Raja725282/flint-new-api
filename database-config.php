<?php
/**
 * Database Configuration for Live Server
 * Author: Flint Property Portal
 * Version: 1.0
 */

class DatabaseConfig {
    // Production Database Settings
    // ⚠️ IMPORTANT: Update these values with your hosting provider's details
    private static $host = 'localhost';
    private static $dbname = 'your_username_flint_properties'; // Replace with your actual database name
    private static $username = 'your_db_username'; // Replace with your database username  
    private static $password = 'your_secure_password'; // Replace with your database password
    private static $port = 3306;
    
    // Connection instance
    private static $connection = null;
    
    /**
     * Get database connection
     * @return PDO
     * @throws Exception
     */
    public static function getConnection() {
        if (self::$connection === null) {
            try {
                $dsn = "mysql:host=" . self::$host . ";port=" . self::$port . ";dbname=" . self::$dbname . ";charset=utf8mb4";
                self::$connection = new PDO($dsn, self::$username, self::$password);
                self::$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                self::$connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
                self::$connection->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
                
                // Set timezone
                self::$connection->exec("SET time_zone = '+00:00'");
                
            } catch(PDOException $e) {
                error_log("Database connection failed: " . $e->getMessage());
                throw new Exception("Database connection failed. Please check your configuration.");
            }
        }
        
        return self::$connection;
    }
    
    /**
     * Test database connection
     * @return array
     */
    public static function testConnection() {
        try {
            $pdo = self::getConnection();
            $stmt = $pdo->query("SELECT 1 as test");
            $result = $stmt->fetch();
            
            return [
                'status' => 'success',
                'message' => 'Database connected successfully!',
                'server_info' => $pdo->getAttribute(PDO::ATTR_SERVER_INFO),
                'test_result' => $result['test']
            ];
        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Check if running in production environment
     * @return bool
     */
    public static function isProduction() {
        $devHosts = ['localhost', '127.0.0.1', '::1', 'localhost:3000', 'localhost:8000'];
        return !in_array($_SERVER['HTTP_HOST'], $devHosts);
    }
    
    /**
     * Get environment-specific settings
     * @return array
     */
    public static function getEnvironmentConfig() {
        $isProduction = self::isProduction();
        
        return [
            'environment' => $isProduction ? 'production' : 'development',
            'debug' => !$isProduction,
            'error_reporting' => !$isProduction,
            'api_url' => $isProduction 
                ? 'https://' . $_SERVER['HTTP_HOST'] . '/property-api-mysql.php'
                : 'http://' . $_SERVER['HTTP_HOST'] . '/flint-new/property-api-mysql.php',
            'cache_enabled' => $isProduction,
            'log_errors' => true
        ];
    }
    
    /**
     * Close database connection
     */
    public static function closeConnection() {
        self::$connection = null;
    }
}

// Auto-configure error reporting based on environment
if (DatabaseConfig::isProduction()) {
    error_reporting(0);
    ini_set('display_errors', 0);
    ini_set('log_errors', 1);
} else {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
}
?>
