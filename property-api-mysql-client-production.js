/**
 * Flint Property Portal - Production MySQL API Client
 * Production-ready JavaScript client for property data
 * Version: 2.0 (Production)
 * Author: Flint Group
 */

class PropertyAPIMySQLProduction {
    constructor() {
        this.baseURL = this.detectAPIURL();
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1 second
        
        // Environment detection
        this.isProduction = !['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
        
        // Initialize performance monitoring
        this.performanceMetrics = {
            requests: 0,
            errors: 0,
            totalResponseTime: 0
        };
        
        console.log(`PropertyAPI initialized in ${this.isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} mode`);
        console.log('API Base URL:', this.baseURL);
    }
    
    /**
     * Auto-detect API URL based on environment
     */
    detectAPIURL() {
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        const port = window.location.port;
        
        // Production URL detection
        if (hostname !== 'localhost' && hostname !== '127.0.0.1' && hostname !== '::1') {
            return `${protocol}//${hostname}/property-api-mysql-production.php`;
        }
        
        // Development URL
        const baseUrl = port ? `${protocol}//${hostname}:${port}` : `${protocol}//${hostname}`;
        return `${baseUrl}/flint-new/property-api-mysql-production.php`;
    }
    
    /**
     * Enhanced HTTP request with retry logic and caching
     */
    async makeRequest(endpoint, options = {}) {
        const startTime = performance.now();
        const cacheKey = `${endpoint}_${JSON.stringify(options)}`;
        
        // Check cache first
        if (options.useCache !== false && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                console.log('Returning cached data for:', endpoint);
                return cached.data;
            }
        }
        
        const url = `${this.baseURL}/${endpoint}`;
        
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Cache-Control': 'max-age=300'
                    },
                    ...options
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                
                // Update performance metrics
                const responseTime = performance.now() - startTime;
                this.updateMetrics(responseTime, false);
                
                // Cache successful responses
                if (options.useCache !== false && data.success) {
                    this.cache.set(cacheKey, {
                        data: data,
                        timestamp: Date.now()
                    });
                }
                
                if (!this.isProduction) {
                    console.log(`API Response [${responseTime.toFixed(2)}ms]:`, data);
                }
                
                return data;
                
            } catch (error) {
                console.warn(`API request attempt ${attempt} failed:`, error.message);
                
                if (attempt === this.retryAttempts) {
                    this.updateMetrics(performance.now() - startTime, true);
                    throw new Error(`API request failed after ${this.retryAttempts} attempts: ${error.message}`);
                }
                
                // Exponential backoff
                await this.delay(this.retryDelay * Math.pow(2, attempt - 1));
            }
        }
    }
    
    /**
     * Update performance metrics
     */
    updateMetrics(responseTime, isError) {
        this.performanceMetrics.requests++;
        this.performanceMetrics.totalResponseTime += responseTime;
        
        if (isError) {
            this.performanceMetrics.errors++;
        }
    }
    
    /**
     * Get performance statistics
     */
    getPerformanceStats() {
        const { requests, errors, totalResponseTime } = this.performanceMetrics;
        
        return {
            totalRequests: requests,
            totalErrors: errors,
            errorRate: requests > 0 ? (errors / requests * 100).toFixed(2) + '%' : '0%',
            averageResponseTime: requests > 0 ? (totalResponseTime / requests).toFixed(2) + 'ms' : '0ms',
            cacheSize: this.cache.size
        };
    }
    
    /**
     * Delay utility for retry logic
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Get all properties with enhanced error handling
     */
    async getAllProperties() {
        try {
            const response = await this.makeRequest('properties');
            
            if (response.success && response.data) {
                return response.data.map(property => this.enhancePropertyData(property));
            }
            
            throw new Error(response.message || 'Failed to fetch properties');
            
        } catch (error) {
            console.error('Error fetching properties:', error);
            return this.getFallbackProperties();
        }
    }
    
    /**
     * Get property by ID with caching
     */
    async getPropertyById(id) {
        try {
            if (!id || isNaN(id)) {
                throw new Error('Invalid property ID provided');
            }
            
            const response = await this.makeRequest(`properties/${id}`);
            
            if (response.success && response.data) {
                return this.enhancePropertyData(response.data);
            }
            
            throw new Error(response.message || 'Property not found');
            
        } catch (error) {
            console.error(`Error fetching property ${id}:`, error);
            return this.getFallbackProperty(id);
        }
    }
    
    /**
     * Search properties with advanced filtering
     */
    async searchProperties(query, filters = {}) {
        try {
            if (!query || query.trim().length < 2) {
                return [];
            }
            
            const searchParams = new URLSearchParams({
                query: query.trim(),
                ...filters
            });
            
            const response = await this.makeRequest(`search?${searchParams}`);
            
            if (response.success && response.data) {
                return response.data.map(property => this.enhancePropertyData(property));
            }
            
            return [];
            
        } catch (error) {
            console.error('Error searching properties:', error);
            return this.getFallbackSearchResults(query);
        }
    }
    
    /**
     * Get property history
     */
    async getPropertyHistory(propertyId) {
        try {
            const response = await this.makeRequest(`property-history/${propertyId}`);
            
            if (response.success && response.data) {
                return response.data;
            }
            
            return [];
            
        } catch (error) {
            console.error(`Error fetching property history for ${propertyId}:`, error);
            return [];
        }
    }
    
    /**
     * Get market insights
     */
    async getMarketInsights(suburb = null) {
        try {
            const endpoint = suburb ? `market-insights?suburb=${encodeURIComponent(suburb)}` : 'market-insights';
            const response = await this.makeRequest(endpoint);
            
            if (response.success && response.data) {
                return response.data;
            }
            
            return [];
            
        } catch (error) {
            console.error('Error fetching market insights:', error);
            return [];
        }
    }
    
    /**
     * Get schools information
     */
    async getSchools(suburb = null, postcode = null) {
        try {
            const params = new URLSearchParams();
            if (suburb) params.append('suburb', suburb);
            if (postcode) params.append('postcode', postcode);
            
            const endpoint = `schools${params.toString() ? '?' + params : ''}`;
            const response = await this.makeRequest(endpoint);
            
            if (response.success && response.data) {
                return response.data;
            }
            
            return [];
            
        } catch (error) {
            console.error('Error fetching schools:', error);
            return [];
        }
    }
    
    /**
     * API Health check
     */
    async healthCheck() {
        try {
            const response = await this.makeRequest('health', { useCache: false });
            return response;
        } catch (error) {
            console.error('API health check failed:', error);
            return { success: false, message: error.message };
        }
    }
    
    /**
     * Enhance property data with computed fields
     */
    enhancePropertyData(property) {
        return {
            ...property,
            fullAddress: property.full_address || `${property.address}, ${property.suburb} ${property.state} ${property.postcode}`,
            priceFormatted: property.price_formatted || (property.price ? `$${property.price.toLocaleString()}` : 'Contact for price'),
            bedroomsBathrooms: `${property.bedrooms || 0} bed, ${property.bathrooms || 0} bath`,
            hasImages: property.images && property.images.length > 0,
            primaryImage: property.images && property.images.length > 0 ? property.images[0] : '/assets/images/default-property.jpg',
            slug: this.createSlug(property.address, property.suburb),
            distance: property.coordinates ? this.calculateDistance(property.coordinates) : null
        };
    }
    
    /**
     * Create URL-friendly slug
     */
    createSlug(address, suburb) {
        return `${address}-${suburb}`
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }
    
    /**
     * Calculate distance from user location (if available)
     */
    calculateDistance(propertyCoords) {
        if (!navigator.geolocation || !propertyCoords.lat || !propertyCoords.lng) {
            return null;
        }
        
        // This would require user's current location
        // Placeholder for distance calculation
        return null;
    }
    
    /**
     * Fallback properties for offline/error scenarios
     */
    getFallbackProperties() {
        return [
            {
                id: 1,
                address: "24 Arthur Street",
                suburb: "Woody Point",
                state: "QLD",
                postcode: "4019",
                price: 850000,
                bedrooms: 4,
                bathrooms: 2,
                type: "House",
                features: ["Air Conditioning", "Built-in Wardrobes", "Garden"],
                images: ["/assets/images/sample-property-1.jpg"],
                coordinates: { lat: -27.2631, lng: 153.1097 },
                fullAddress: "24 Arthur Street, Woody Point QLD 4019",
                priceFormatted: "$850,000",
                bedroomsBathrooms: "4 bed, 2 bath"
            }
        ];
    }
    
    /**
     * Fallback property data
     */
    getFallbackProperty(id) {
        const fallbackProperties = this.getFallbackProperties();
        return fallbackProperties.find(p => p.id == id) || fallbackProperties[0];
    }
    
    /**
     * Fallback search results
     */
    getFallbackSearchResults(query) {
        const fallbackProperties = this.getFallbackProperties();
        return fallbackProperties.filter(property => 
            property.address.toLowerCase().includes(query.toLowerCase()) ||
            property.suburb.toLowerCase().includes(query.toLowerCase())
        );
    }
    
    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        console.log('API cache cleared');
    }
    
    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            timeout: this.cacheTimeout / 1000 + ' seconds',
            keys: Array.from(this.cache.keys())
        };
    }
}

// Backward compatibility
class PropertyAPIMySQL extends PropertyAPIMySQLProduction {}

// Global instance for immediate use
window.PropertyAPI = PropertyAPIMySQLProduction;
window.PropertyAPIMySQL = PropertyAPIMySQLProduction;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PropertyAPIMySQLProduction;
}
