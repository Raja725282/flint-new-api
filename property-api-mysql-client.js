/**
 * Flint Property API Client - MySQL Version
 * Created: August 13, 2025
 * 
 * JavaScript client for connecting to PHP MySQL API
 * This replaces the previous hardcoded property-api.js
 */

class PropertyAPIMySQL {
    constructor(baseURL = 'property-api-mysql.php') {
        this.baseURL = baseURL;
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Make HTTP request to API
     */
    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseURL}?path=${endpoint}`;
        
        try {
            const response = await fetch(url, {
                method: options.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                body: options.body ? JSON.stringify(options.body) : null
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }

            return data.data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw new Error(`Failed to fetch data: ${error.message}`);
        }
    }

    /**
     * Cache management
     */
    getCached(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    /**
     * Get all properties
     */
    async getAllProperties() {
        const cacheKey = 'all_properties';
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            const properties = await this.makeRequest('properties');
            
            // Transform data to match frontend expectations
            const transformedProperties = properties.map(this.transformProperty);
            
            this.setCache(cacheKey, transformedProperties);
            return transformedProperties;
        } catch (error) {
            console.error('Failed to get all properties:', error);
            // Return fallback data if API fails
            return this.getFallbackProperties();
        }
    }

    /**
     * Get property by ID
     */
    async getPropertyById(id) {
        const cacheKey = `property_${id}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            const property = await this.makeRequest(`property&id=${id}`);
            const transformedProperty = this.transformProperty(property);
            
            this.setCache(cacheKey, transformedProperty);
            return transformedProperty;
        } catch (error) {
            console.error(`Failed to get property ${id}:`, error);
            // Return fallback data if API fails
            return this.getFallbackProperty(id);
        }
    }

    /**
     * Get property history
     */
    async getPropertyHistory(propertyId) {
        const cacheKey = `history_${propertyId}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            const history = await this.makeRequest(`property/history&id=${propertyId}`);
            this.setCache(cacheKey, history);
            return history;
        } catch (error) {
            console.error(`Failed to get property history for ${propertyId}:`, error);
            return [];
        }
    }

    /**
     * Get market insights
     */
    async getMarketInsights(suburb, state) {
        const cacheKey = `insights_${suburb}_${state}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            const insights = await this.makeRequest(`market/insights&suburb=${encodeURIComponent(suburb)}&state=${encodeURIComponent(state)}`);
            this.setCache(cacheKey, insights);
            return insights;
        } catch (error) {
            console.error(`Failed to get market insights for ${suburb}, ${state}:`, error);
            return this.getFallbackInsights();
        }
    }

    /**
     * Get schools near property
     */
    async getSchoolsNearProperty(propertyId) {
        const cacheKey = `schools_${propertyId}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            const schools = await this.makeRequest(`property/schools&id=${propertyId}`);
            this.setCache(cacheKey, schools);
            return schools;
        } catch (error) {
            console.error(`Failed to get schools for property ${propertyId}:`, error);
            return [];
        }
    }

    /**
     * Search properties
     */
    async searchProperties(filters = {}) {
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const properties = await this.makeRequest(`search&${queryParams}`);
            
            return properties.map(this.transformProperty);
        } catch (error) {
            console.error('Failed to search properties:', error);
            return [];
        }
    }

    /**
     * Get property statistics
     */
    async getPropertyStats() {
        const cacheKey = 'property_stats';
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            const stats = await this.makeRequest('stats');
            this.setCache(cacheKey, stats);
            return stats;
        } catch (error) {
            console.error('Failed to get property stats:', error);
            return {
                total_properties: 0,
                average_price: 0,
                min_price: 0,
                max_price: 0
            };
        }
    }

    /**
     * Transform property data from API to frontend format
     */
    transformProperty(property) {
        return {
            id: property.id,
            address: property.address,
            suburb: property.suburb,
            state: property.state,
            postcode: property.postcode,
            type: property.property_type,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            parkingSpaces: property.parking_spaces,
            floorArea: property.floor_area,
            landArea: property.land_area,
            yearBuilt: property.year_built,
            price: property.price,
            estimatedRent: property.estimated_rent,
            coordinates: {
                lat: parseFloat(property.latitude),
                lng: parseFloat(property.longitude)
            },
            description: property.description,
            features: Array.isArray(property.features) ? property.features : JSON.parse(property.features || '[]'),
            images: Array.isArray(property.images) ? property.images : JSON.parse(property.images || '[]'),
            marketData: {
                medianPrice: property.median_price,
                priceGrowth: property.price_growth,
                rentalYield: property.rental_yield,
                population: property.population,
                unemploymentRate: property.unemployment_rate,
                crimeIndex: property.crime_index,
                schoolRating: property.area_school_rating,
                transportScore: property.transport_score
            }
        };
    }

    /**
     * Fallback data when API is unavailable
     */
    getFallbackProperties() {
        return [
            {
                id: '1',
                address: '24 Arthur Street',
                suburb: 'Woody Point',
                state: 'QLD',
                postcode: '4019',
                type: 'Unit',
                bedrooms: 2,
                bathrooms: 2,
                parkingSpaces: 1,
                coordinates: { lat: -27.2631, lng: 153.1097 },
                price: 850000,
                estimatedRent: 650,
                features: ['Ocean Views', 'Air Conditioning', 'Balcony'],
                images: ['https://images.unsplash.com/photo-1570129477492-45c003edd2be']
            },
            {
                id: '2',
                address: '15 Marine Parade',
                suburb: 'Redcliffe',
                state: 'QLD',
                postcode: '4020',
                type: 'House',
                bedrooms: 3,
                bathrooms: 2,
                parkingSpaces: 2,
                coordinates: { lat: -27.2308, lng: 153.1106 },
                price: 920000,
                estimatedRent: 750,
                features: ['Modern Kitchen', 'Large Backyard', 'Double Garage'],
                images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994']
            }
        ];
    }

    getFallbackProperty(id) {
        const properties = this.getFallbackProperties();
        return properties.find(p => p.id === id) || properties[0];
    }

    getFallbackInsights() {
        return {
            median_price: 720000,
            price_growth: 8.5,
            rental_yield: 4.2,
            population: 5200,
            unemployment_rate: 4.1,
            crime_index: 2.8,
            school_rating: 8.5,
            transport_score: 85
        };
    }

    /**
     * Utility method to format currency
     */
    static formatCurrency(amount, currency = 'AUD') {
        if (!amount) return 'Price on application';
        
        return new Intl.NumberFormat('en-AU', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    /**
     * Utility method to format percentage
     */
    static formatPercentage(value, decimals = 1) {
        if (!value && value !== 0) return 'N/A';
        return `${parseFloat(value).toFixed(decimals)}%`;
    }

    /**
     * Utility method to calculate distance between coordinates
     */
    static calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
}

// Create global instance
window.PropertyAPI = PropertyAPIMySQL;

// For backward compatibility, create instance with old name
if (typeof window !== 'undefined') {
    window.propertyAPI = new PropertyAPIMySQL();
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PropertyAPIMySQL;
}
