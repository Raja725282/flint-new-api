<?php
/**
 * Flint Property API with MySQL Database
 * Created: August 13, 2025
 * 
 * This API handles property data retrieval from MySQL database
 * Supports CORS for frontend JavaScript access
 */

// Enable CORS for frontend access
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database configuration
class DatabaseConfig {
    private static $host = 'localhost';
    private static $dbname = 'flint_properties';
    private static $username = 'root'; // Change as needed
    private static $password = '';     // Change as needed
    private static $connection = null;
    
    public static function getConnection() {
        if (self::$connection === null) {
            try {
                self::$connection = new PDO(
                    "mysql:host=" . self::$host . ";dbname=" . self::$dbname . ";charset=utf8mb4",
                    self::$username,
                    self::$password,
                    [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES => false
                    ]
                );
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode([
                    'error' => 'Database connection failed',
                    'message' => $e->getMessage()
                ]);
                exit();
            }
        }
        return self::$connection;
    }
}

// Property API Class
class PropertyAPI {
    private $db;
    
    public function __construct() {
        $this->db = DatabaseConfig::getConnection();
    }
    
    /**
     * Get all properties
     */
    public function getAllProperties() {
        try {
            $stmt = $this->db->prepare("
                SELECT 
                    p.*,
                    mi.median_price,
                    mi.price_growth,
                    mi.rental_yield,
                    mi.population,
                    mi.unemployment_rate,
                    mi.crime_index,
                    mi.school_rating as area_school_rating,
                    mi.transport_score
                FROM properties p
                LEFT JOIN market_insights mi ON p.suburb = mi.suburb AND p.state = mi.state
                ORDER BY p.id
            ");
            $stmt->execute();
            $properties = $stmt->fetchAll();
            
            // Process JSON fields
            foreach ($properties as &$property) {
                $property['features'] = json_decode($property['features'] ?? '[]');
                $property['images'] = json_decode($property['images'] ?? '[]');
                $property['coordinates'] = [
                    'lat' => (float)$property['latitude'],
                    'lng' => (float)$property['longitude']
                ];
            }
            
            return $properties;
        } catch (PDOException $e) {
            throw new Exception('Failed to fetch properties: ' . $e->getMessage());
        }
    }
    
    /**
     * Get property by ID
     */
    public function getPropertyById($id) {
        try {
            $stmt = $this->db->prepare("
                SELECT 
                    p.*,
                    mi.median_price,
                    mi.price_growth,
                    mi.rental_yield,
                    mi.population,
                    mi.unemployment_rate,
                    mi.crime_index,
                    mi.school_rating as area_school_rating,
                    mi.transport_score
                FROM properties p
                LEFT JOIN market_insights mi ON p.suburb = mi.suburb AND p.state = mi.state
                WHERE p.id = :id
            ");
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            $property = $stmt->fetch();
            
            if (!$property) {
                throw new Exception('Property not found');
            }
            
            // Process JSON fields
            $property['features'] = json_decode($property['features'] ?? '[]');
            $property['images'] = json_decode($property['images'] ?? '[]');
            $property['coordinates'] = [
                'lat' => (float)$property['latitude'],
                'lng' => (float)$property['longitude']
            ];
            
            return $property;
        } catch (PDOException $e) {
            throw new Exception('Failed to fetch property: ' . $e->getMessage());
        }
    }
    
    /**
     * Get property history
     */
    public function getPropertyHistory($propertyId) {
        try {
            $stmt = $this->db->prepare("
                SELECT * FROM property_history 
                WHERE property_id = :property_id 
                ORDER BY sale_date DESC
            ");
            $stmt->bindParam(':property_id', $propertyId, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            throw new Exception('Failed to fetch property history: ' . $e->getMessage());
        }
    }
    
    /**
     * Get market insights for a suburb
     */
    public function getMarketInsights($suburb, $state) {
        try {
            $stmt = $this->db->prepare("
                SELECT * FROM market_insights 
                WHERE suburb = :suburb AND state = :state
            ");
            $stmt->bindParam(':suburb', $suburb);
            $stmt->bindParam(':state', $state);
            $stmt->execute();
            return $stmt->fetch();
        } catch (PDOException $e) {
            throw new Exception('Failed to fetch market insights: ' . $e->getMessage());
        }
    }
    
    /**
     * Get schools near a property
     */
    public function getSchoolsNearProperty($propertyId) {
        try {
            $stmt = $this->db->prepare("
                SELECT * FROM schools 
                WHERE property_id = :property_id 
                ORDER BY distance_km ASC
            ");
            $stmt->bindParam(':property_id', $propertyId, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            throw new Exception('Failed to fetch schools: ' . $e->getMessage());
        }
    }
    
    /**
     * Search properties
     */
    public function searchProperties($filters = []) {
        try {
            $sql = "
                SELECT 
                    p.*,
                    mi.median_price,
                    mi.price_growth,
                    mi.rental_yield
                FROM properties p
                LEFT JOIN market_insights mi ON p.suburb = mi.suburb AND p.state = mi.state
                WHERE 1=1
            ";
            $params = [];
            
            if (!empty($filters['suburb'])) {
                $sql .= " AND p.suburb LIKE :suburb";
                $params[':suburb'] = '%' . $filters['suburb'] . '%';
            }
            
            if (!empty($filters['state'])) {
                $sql .= " AND p.state = :state";
                $params[':state'] = $filters['state'];
            }
            
            if (!empty($filters['property_type'])) {
                $sql .= " AND p.property_type = :property_type";
                $params[':property_type'] = $filters['property_type'];
            }
            
            if (!empty($filters['min_price'])) {
                $sql .= " AND p.price >= :min_price";
                $params[':min_price'] = $filters['min_price'];
            }
            
            if (!empty($filters['max_price'])) {
                $sql .= " AND p.price <= :max_price";
                $params[':max_price'] = $filters['max_price'];
            }
            
            if (!empty($filters['bedrooms'])) {
                $sql .= " AND p.bedrooms >= :bedrooms";
                $params[':bedrooms'] = $filters['bedrooms'];
            }
            
            if (!empty($filters['bathrooms'])) {
                $sql .= " AND p.bathrooms >= :bathrooms";
                $params[':bathrooms'] = $filters['bathrooms'];
            }
            
            $sql .= " ORDER BY p.id";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            $properties = $stmt->fetchAll();
            
            // Process JSON fields
            foreach ($properties as &$property) {
                $property['features'] = json_decode($property['features'] ?? '[]');
                $property['images'] = json_decode($property['images'] ?? '[]');
                $property['coordinates'] = [
                    'lat' => (float)$property['latitude'],
                    'lng' => (float)$property['longitude']
                ];
            }
            
            return $properties;
        } catch (PDOException $e) {
            throw new Exception('Failed to search properties: ' . $e->getMessage());
        }
    }
    
    /**
     * Get property statistics
     */
    public function getPropertyStats() {
        try {
            $stmt = $this->db->prepare("
                SELECT 
                    COUNT(*) as total_properties,
                    AVG(price) as average_price,
                    MIN(price) as min_price,
                    MAX(price) as max_price,
                    COUNT(DISTINCT suburb) as total_suburbs,
                    COUNT(DISTINCT state) as total_states
                FROM properties
            ");
            $stmt->execute();
            return $stmt->fetch();
        } catch (PDOException $e) {
            throw new Exception('Failed to fetch property stats: ' . $e->getMessage());
        }
    }
}

// API Router
class APIRouter {
    private $api;
    
    public function __construct() {
        $this->api = new PropertyAPI();
    }
    
    public function handleRequest() {
        try {
            $method = $_SERVER['REQUEST_METHOD'];
            $path = $_GET['path'] ?? '';
            
            switch ($method) {
                case 'GET':
                    $this->handleGetRequest($path);
                    break;
                case 'POST':
                    $this->handlePostRequest($path);
                    break;
                default:
                    $this->sendResponse(['error' => 'Method not allowed'], 405);
            }
        } catch (Exception $e) {
            $this->sendResponse(['error' => $e->getMessage()], 500);
        }
    }
    
    private function handleGetRequest($path) {
        switch ($path) {
            case 'properties':
                $properties = $this->api->getAllProperties();
                $this->sendResponse(['data' => $properties]);
                break;
                
            case 'property':
                $id = $_GET['id'] ?? null;
                if (!$id) {
                    $this->sendResponse(['error' => 'Property ID required'], 400);
                    return;
                }
                $property = $this->api->getPropertyById($id);
                $this->sendResponse(['data' => $property]);
                break;
                
            case 'property/history':
                $id = $_GET['id'] ?? null;
                if (!$id) {
                    $this->sendResponse(['error' => 'Property ID required'], 400);
                    return;
                }
                $history = $this->api->getPropertyHistory($id);
                $this->sendResponse(['data' => $history]);
                break;
                
            case 'property/schools':
                $id = $_GET['id'] ?? null;
                if (!$id) {
                    $this->sendResponse(['error' => 'Property ID required'], 400);
                    return;
                }
                $schools = $this->api->getSchoolsNearProperty($id);
                $this->sendResponse(['data' => $schools]);
                break;
                
            case 'market/insights':
                $suburb = $_GET['suburb'] ?? null;
                $state = $_GET['state'] ?? null;
                if (!$suburb || !$state) {
                    $this->sendResponse(['error' => 'Suburb and state required'], 400);
                    return;
                }
                $insights = $this->api->getMarketInsights($suburb, $state);
                $this->sendResponse(['data' => $insights]);
                break;
                
            case 'search':
                $filters = $_GET;
                unset($filters['path']);
                $properties = $this->api->searchProperties($filters);
                $this->sendResponse(['data' => $properties]);
                break;
                
            case 'stats':
                $stats = $this->api->getPropertyStats();
                $this->sendResponse(['data' => $stats]);
                break;
                
            default:
                $this->sendResponse(['error' => 'Endpoint not found'], 404);
        }
    }
    
    private function handlePostRequest($path) {
        $input = json_decode(file_get_contents('php://input'), true);
        
        switch ($path) {
            case 'search':
                $properties = $this->api->searchProperties($input);
                $this->sendResponse(['data' => $properties]);
                break;
                
            default:
                $this->sendResponse(['error' => 'Endpoint not found'], 404);
        }
    }
    
    private function sendResponse($data, $statusCode = 200) {
        http_response_code($statusCode);
        echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    }
}

// Initialize and handle request
$router = new APIRouter();
$router->handleRequest();
?>
