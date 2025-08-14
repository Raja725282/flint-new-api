<?php
/**
 * Flint Property Portal - Production MySQL API
 * Production-Ready RESTful API for Property Management
 * Version: 2.0 (Production)
 * Author: Flint Group
 */

// Include database configuration
require_once 'database-config.php';

// Set timezone
date_default_timezone_set('Australia/Brisbane');

// Enhanced CORS headers for production
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");
header("Cache-Control: public, max-age=300"); // 5 minutes cache

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/**
 * Production Property API Class
 */
class PropertyAPIProduction {
    private $db;
    private $isProduction;
    private $startTime;
    
    public function __construct() {
        $this->startTime = microtime(true);
        
        try {
            $this->db = DatabaseConfig::getConnection();
            $this->isProduction = DatabaseConfig::isProduction();
        } catch (Exception $e) {
            $this->sendErrorResponse(500, "Database connection failed", $e->getMessage());
        }
    }
    
    /**
     * Send JSON response with metadata
     */
    private function sendResponse($data, $statusCode = 200, $message = null) {
        http_response_code($statusCode);
        
        $response = [
            'success' => $statusCode < 400,
            'timestamp' => date('c'),
            'data' => $data,
            'meta' => [
                'response_time' => round((microtime(true) - $this->startTime) * 1000, 2) . 'ms',
                'version' => '2.0',
                'environment' => $this->isProduction ? 'production' : 'development'
            ]
        ];
        
        if ($message) {
            $response['message'] = $message;
        }
        
        if (!$this->isProduction) {
            $response['debug'] = [
                'server' => $_SERVER['HTTP_HOST'],
                'method' => $_SERVER['REQUEST_METHOD'],
                'uri' => $_SERVER['REQUEST_URI'] ?? '',
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown'
            ];
        }
        
        echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit();
    }
    
    /**
     * Send error response with proper logging
     */
    private function sendErrorResponse($statusCode, $message, $details = null) {
        // Log error for debugging
        if ($this->isProduction) {
            error_log("API Error [{$statusCode}]: {$message}");
        }
        
        $error = [
            'error' => true,
            'message' => $message,
            'code' => $statusCode
        ];
        
        if (!$this->isProduction && $details) {
            $error['details'] = $details;
        }
        
        $this->sendResponse($error, $statusCode);
    }
    
    /**
     * Get all properties with caching support
     */
    public function getAllProperties() {
        try {
            $cacheKey = 'all_properties';
            
            // Set cache headers
            $lastModified = $this->getLastModifiedTime('properties');
            header("Last-Modified: " . gmdate('D, d M Y H:i:s', $lastModified) . ' GMT');
            header("ETag: \"" . md5($cacheKey . $lastModified) . "\"");
            
            $stmt = $this->db->prepare("
                SELECT 
                    p.*,
                    COUNT(ph.id) as history_count,
                    MAX(ph.date) as last_sold_date,
                    MAX(ph.price) as last_sold_price
                FROM properties p 
                LEFT JOIN property_history ph ON p.id = ph.property_id 
                GROUP BY p.id 
                ORDER BY p.created_at DESC
            ");
            
            $stmt->execute();
            $properties = $stmt->fetchAll();
            
            // Process JSON fields
            foreach ($properties as &$property) {
                $property['features'] = json_decode($property['features'] ?? '[]', true);
                $property['images'] = json_decode($property['images'] ?? '[]', true);
                $property['coordinates'] = json_decode($property['coordinates'] ?? '{}', true);
                
                // Add computed fields
                $property['full_address'] = "{$property['address']}, {$property['suburb']} {$property['state']} {$property['postcode']}";
                $property['price_formatted'] = $property['price'] ? '$' . number_format($property['price']) : 'Contact for price';
                $property['has_history'] = $property['history_count'] > 0;
            }
            
            $this->sendResponse($properties, 200, "Retrieved " . count($properties) . " properties");
            
        } catch (Exception $e) {
            $this->sendErrorResponse(500, "Failed to retrieve properties", $e->getMessage());
        }
    }
    
    /**
     * Get property by ID with related data
     */
    public function getPropertyById($id) {
        try {
            if (!is_numeric($id)) {
                $this->sendErrorResponse(400, "Invalid property ID");
                return;
            }
            
            // Get property details
            $stmt = $this->db->prepare("
                SELECT p.*, 
                       COUNT(ph.id) as history_count,
                       AVG(ph.price) as avg_price,
                       MAX(ph.date) as last_activity
                FROM properties p 
                LEFT JOIN property_history ph ON p.id = ph.property_id 
                WHERE p.id = ? 
                GROUP BY p.id
            ");
            
            $stmt->execute([$id]);
            $property = $stmt->fetch();
            
            if (!$property) {
                $this->sendErrorResponse(404, "Property not found");
                return;
            }
            
            // Process JSON fields
            $property['features'] = json_decode($property['features'] ?? '[]', true);
            $property['images'] = json_decode($property['images'] ?? '[]', true);
            $property['coordinates'] = json_decode($property['coordinates'] ?? '{}', true);
            
            // Add computed fields
            $property['full_address'] = "{$property['address']}, {$property['suburb']} {$property['state']} {$property['postcode']}";
            $property['price_formatted'] = $property['price'] ? '$' . number_format($property['price']) : 'Contact for price';
            
            // Get property history
            $historyStmt = $this->db->prepare("
                SELECT * FROM property_history 
                WHERE property_id = ? 
                ORDER BY date DESC 
                LIMIT 10
            ");
            $historyStmt->execute([$id]);
            $property['history'] = $historyStmt->fetchAll();
            
            // Get nearby schools
            $schoolsStmt = $this->db->prepare("
                SELECT * FROM schools 
                WHERE suburb = ? OR postcode = ?
                ORDER BY rating DESC 
                LIMIT 5
            ");
            $schoolsStmt->execute([$property['suburb'], $property['postcode']]);
            $property['nearby_schools'] = $schoolsStmt->fetchAll();
            
            $this->sendResponse($property, 200, "Property details retrieved successfully");
            
        } catch (Exception $e) {
            $this->sendErrorResponse(500, "Failed to retrieve property", $e->getMessage());
        }
    }
    
    /**
     * Search properties with advanced filters
     */
    public function searchProperties($query, $filters = []) {
        try {
            $searchTerms = explode(' ', trim($query));
            $conditions = [];
            $params = [];
            
            // Build search conditions
            foreach ($searchTerms as $term) {
                if (strlen($term) >= 2) {
                    $conditions[] = "(p.address LIKE ? OR p.suburb LIKE ? OR p.state LIKE ? OR p.postcode LIKE ?)";
                    $searchTerm = "%{$term}%";
                    $params = array_merge($params, [$searchTerm, $searchTerm, $searchTerm, $searchTerm]);
                }
            }
            
            // Add filters
            if (isset($filters['type']) && $filters['type']) {
                $conditions[] = "p.type = ?";
                $params[] = $filters['type'];
            }
            
            if (isset($filters['min_price']) && is_numeric($filters['min_price'])) {
                $conditions[] = "p.price >= ?";
                $params[] = $filters['min_price'];
            }
            
            if (isset($filters['max_price']) && is_numeric($filters['max_price'])) {
                $conditions[] = "p.price <= ?";
                $params[] = $filters['max_price'];
            }
            
            if (isset($filters['bedrooms']) && is_numeric($filters['bedrooms'])) {
                $conditions[] = "p.bedrooms >= ?";
                $params[] = $filters['bedrooms'];
            }
            
            if (isset($filters['bathrooms']) && is_numeric($filters['bathrooms'])) {
                $conditions[] = "p.bathrooms >= ?";
                $params[] = $filters['bathrooms'];
            }
            
            $whereClause = $conditions ? 'WHERE ' . implode(' AND ', $conditions) : '';
            
            $sql = "
                SELECT p.*, 
                       COUNT(ph.id) as history_count,
                       MAX(ph.date) as last_activity
                FROM properties p 
                LEFT JOIN property_history ph ON p.id = ph.property_id 
                {$whereClause}
                GROUP BY p.id 
                ORDER BY p.created_at DESC 
                LIMIT 50
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            $properties = $stmt->fetchAll();
            
            // Process results
            foreach ($properties as &$property) {
                $property['features'] = json_decode($property['features'] ?? '[]', true);
                $property['images'] = json_decode($property['images'] ?? '[]', true);
                $property['coordinates'] = json_decode($property['coordinates'] ?? '{}', true);
                $property['full_address'] = "{$property['address']}, {$property['suburb']} {$property['state']} {$property['postcode']}";
                $property['price_formatted'] = $property['price'] ? '$' . number_format($property['price']) : 'Contact for price';
            }
            
            $this->sendResponse($properties, 200, "Found " . count($properties) . " properties matching search criteria");
            
        } catch (Exception $e) {
            $this->sendErrorResponse(500, "Search failed", $e->getMessage());
        }
    }
    
    /**
     * Get property history
     */
    public function getPropertyHistory($propertyId) {
        try {
            if (!is_numeric($propertyId)) {
                $this->sendErrorResponse(400, "Invalid property ID");
                return;
            }
            
            $stmt = $this->db->prepare("
                SELECT ph.*, p.address, p.suburb, p.state, p.postcode
                FROM property_history ph
                JOIN properties p ON ph.property_id = p.id
                WHERE ph.property_id = ?
                ORDER BY ph.date DESC
            ");
            
            $stmt->execute([$propertyId]);
            $history = $stmt->fetchAll();
            
            // Add formatted prices
            foreach ($history as &$record) {
                $record['price_formatted'] = '$' . number_format($record['price']);
                $record['date_formatted'] = date('d M Y', strtotime($record['date']));
            }
            
            $this->sendResponse($history, 200, "Retrieved " . count($history) . " history records");
            
        } catch (Exception $e) {
            $this->sendErrorResponse(500, "Failed to retrieve property history", $e->getMessage());
        }
    }
    
    /**
     * Get market insights
     */
    public function getMarketInsights($suburb = null) {
        try {
            $whereClause = $suburb ? "WHERE suburb = ?" : "";
            $params = $suburb ? [$suburb] : [];
            
            $stmt = $this->db->prepare("
                SELECT * FROM market_insights 
                {$whereClause}
                ORDER BY created_at DESC 
                LIMIT 10
            ");
            
            $stmt->execute($params);
            $insights = $stmt->fetchAll();
            
            $this->sendResponse($insights, 200, "Retrieved market insights");
            
        } catch (Exception $e) {
            $this->sendErrorResponse(500, "Failed to retrieve market insights", $e->getMessage());
        }
    }
    
    /**
     * Get schools information
     */
    public function getSchools($suburb = null, $postcode = null) {
        try {
            $conditions = [];
            $params = [];
            
            if ($suburb) {
                $conditions[] = "suburb = ?";
                $params[] = $suburb;
            }
            
            if ($postcode) {
                $conditions[] = "postcode = ?";
                $params[] = $postcode;
            }
            
            $whereClause = $conditions ? 'WHERE ' . implode(' AND ', $conditions) : '';
            
            $stmt = $this->db->prepare("
                SELECT * FROM schools 
                {$whereClause}
                ORDER BY rating DESC, name ASC
            ");
            
            $stmt->execute($params);
            $schools = $stmt->fetchAll();
            
            $this->sendResponse($schools, 200, "Retrieved " . count($schools) . " schools");
            
        } catch (Exception $e) {
            $this->sendErrorResponse(500, "Failed to retrieve schools", $e->getMessage());
        }
    }
    
    /**
     * API Health check
     */
    public function healthCheck() {
        try {
            $dbTest = DatabaseConfig::testConnection();
            
            $health = [
                'status' => 'healthy',
                'database' => $dbTest,
                'timestamp' => date('c'),
                'version' => '2.0',
                'environment' => $this->isProduction ? 'production' : 'development'
            ];
            
            $this->sendResponse($health, 200, "API is healthy");
            
        } catch (Exception $e) {
            $this->sendErrorResponse(500, "Health check failed", $e->getMessage());
        }
    }
    
    /**
     * Get last modified time for caching
     */
    private function getLastModifiedTime($table) {
        try {
            $stmt = $this->db->prepare("
                SELECT UNIX_TIMESTAMP(MAX(updated_at)) as last_modified 
                FROM {$table}
            ");
            $stmt->execute();
            $result = $stmt->fetch();
            return $result['last_modified'] ?? time();
        } catch (Exception $e) {
            return time();
        }
    }
}

/**
 * API Router
 */
class APIRouter {
    private $api;
    
    public function __construct() {
        $this->api = new PropertyAPIProduction();
    }
    
    public function route() {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = $_SERVER['PATH_INFO'] ?? $_SERVER['REQUEST_URI'] ?? '';
        $path = parse_url($path, PHP_URL_PATH);
        $path = trim($path, '/');
        
        // Remove script name if present
        $path = preg_replace('/^property-api-mysql\.php\//', '', $path);
        
        $segments = array_filter(explode('/', $path));
        
        switch ($method) {
            case 'GET':
                $this->handleGetRequest($segments);
                break;
            default:
                $this->api->sendErrorResponse(405, "Method not allowed");
        }
    }
    
    private function handleGetRequest($segments) {
        if (empty($segments)) {
            $this->api->healthCheck();
            return;
        }
        
        switch ($segments[0]) {
            case 'properties':
                if (isset($segments[1]) && is_numeric($segments[1])) {
                    $this->api->getPropertyById($segments[1]);
                } else {
                    $this->api->getAllProperties();
                }
                break;
                
            case 'search':
                $query = $_GET['query'] ?? $_GET['q'] ?? '';
                $filters = [
                    'type' => $_GET['type'] ?? null,
                    'min_price' => $_GET['min_price'] ?? null,
                    'max_price' => $_GET['max_price'] ?? null,
                    'bedrooms' => $_GET['bedrooms'] ?? null,
                    'bathrooms' => $_GET['bathrooms'] ?? null
                ];
                $this->api->searchProperties($query, $filters);
                break;
                
            case 'property-history':
                if (isset($segments[1]) && is_numeric($segments[1])) {
                    $this->api->getPropertyHistory($segments[1]);
                } else {
                    $this->api->sendErrorResponse(400, "Property ID required");
                }
                break;
                
            case 'market-insights':
                $suburb = $_GET['suburb'] ?? null;
                $this->api->getMarketInsights($suburb);
                break;
                
            case 'schools':
                $suburb = $_GET['suburb'] ?? null;
                $postcode = $_GET['postcode'] ?? null;
                $this->api->getSchools($suburb, $postcode);
                break;
                
            case 'health':
                $this->api->healthCheck();
                break;
                
            default:
                $this->api->sendErrorResponse(404, "Endpoint not found");
        }
    }
}

// Start the API
try {
    $router = new APIRouter();
    $router->route();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => 'Internal server error',
        'timestamp' => date('c')
    ]);
}
?>
