// Property API - Dummy data for property report
class PropertyAPI {
    constructor() {
        this.baseUrl = '';
        this.propertyData = {
            property: {
                id: "PROP_001",
                address: "24 Arthur Street Woody Point QLD 4019",
                coordinates: {
                    lat: -27.2619,
                    lng: 153.1093
                },
                type: "Unit",
                bedrooms: 2,
                bathrooms: 2,
                carSpaces: 1,
                floorArea: "102m²",
                councilArea: "Moreton Bay",
                landSize: "N/A (Unit)",
                yearBuilt: 1995,
                zoning: "Residential"
            },
            
            location: {
                suburb: "Woody Point",
                postcode: "4019",
                state: "QLD",
                distanceToCBD: "28 km",
                transport: "Bus, Train nearby",
                shopping: "Westfield Redcliffe 2.1km",
                schools: "5 schools within 2km",
                beaches: "Woody Point Beach 0.3km",
                parks: "Bicentennial Park 0.5km"
            },
            
            photos: [
                {
                    url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
                    title: "Property Front View",
                    type: "exterior"
                },
                {
                    url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
                    title: "Living Room",
                    type: "interior"
                },
                {
                    url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80",
                    title: "Modern Kitchen",
                    type: "interior"
                },
                {
                    url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
                    title: "Master Bedroom",
                    type: "interior"
                },
                {
                    url: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
                    title: "Modern Bathroom",
                    type: "interior"
                }
            ],
            
            estimatedValue: {
                current: 782000,
                low: 750000,
                high: 815000,
                confidence: "High",
                lastUpdated: "2025-08-13",
                pricePerSqm: 7667,
                estimatedRent: {
                    weekly: 580,
                    monthly: 2520,
                    annual: 30160
                },
                yieldEstimate: "3.9%"
            },
            
            priceHistory: [
                {
                    date: "2024-05-15",
                    price: 695000,
                    type: "sale",
                    source: "Contract of Sale"
                },
                {
                    date: "2020-09-10",
                    price: 520000,
                    type: "sale",
                    source: "Contract of Sale"
                },
                {
                    date: "2017-03-22",
                    price: 445000,
                    type: "sale",
                    source: "Contract of Sale"
                },
                {
                    date: "2014-11-08",
                    price: 385000,
                    type: "sale",
                    source: "Contract of Sale"
                }
            ],
            
            marketTrends: {
                medianValues: [
                    { period: "Aug 22", value: 720 },
                    { period: "Nov 22", value: 735 },
                    { period: "Feb 23", value: 750 },
                    { period: "May 23", value: 760 },
                    { period: "Aug 23", value: 770 },
                    { period: "Nov 23", value: 775 },
                    { period: "Feb 24", value: 778 },
                    { period: "May 24", value: 780 },
                    { period: "Aug 24", value: 782 }
                ],
                growth: {
                    oneYear: "2.1%",
                    threeYear: "8.7%",
                    fiveYear: "15.3%"
                }
            },
            
            insights: {
                demographics: {
                    medianAge: 42,
                    familyHouseholds: "68%",
                    averageIncome: 75200,
                    population: 5847
                },
                marketStats: {
                    daysOnMarket: 28,
                    saleVolume: 42,
                    rentalYield: "3.9%",
                    vacancyRate: "2.1%"
                },
                trends: {
                    demand: "High",
                    supplyLevel: "Moderate",
                    priceDirection: "Stable",
                    investmentGrade: "B+"
                }
            },
            
            comparables: [
                {
                    address: "18 Arthur Street Woody Point QLD 4019",
                    distance: "50m",
                    bedrooms: 2,
                    bathrooms: 2,
                    carSpaces: 1,
                    soldDate: "2024-07-15",
                    soldPrice: 750000,
                    landSize: "N/A",
                    similarity: "98%"
                },
                {
                    address: "32 Oxley Avenue Woody Point QLD 4019",
                    distance: "180m",
                    bedrooms: 2,
                    bathrooms: 2,
                    carSpaces: 1,
                    soldDate: "2024-06-20",
                    soldPrice: 735000,
                    landSize: "N/A",
                    similarity: "95%"
                },
                {
                    address: "7/15 Oxley Avenue Woody Point QLD 4019",
                    distance: "220m",
                    bedrooms: 2,
                    bathrooms: 1,
                    carSpaces: 1,
                    soldDate: "2024-05-10",
                    soldPrice: 695000,
                    landSize: "N/A",
                    similarity: "90%"
                },
                {
                    address: "45 Hornibrook Esplanade Clontarf QLD 4019",
                    distance: "450m",
                    bedrooms: 3,
                    bathrooms: 2,
                    carSpaces: 2,
                    soldDate: "2024-04-28",
                    soldPrice: 825000,
                    landSize: "N/A",
                    similarity: "85%"
                }
            ],
            
            schools: [
                {
                    name: "Woody Point State School",
                    type: "Primary",
                    distance: "0.8 km",
                    rating: 4.2,
                    students: 420,
                    sectors: ["Public"],
                    grades: "Prep-6"
                },
                {
                    name: "Redcliffe State High School",
                    type: "Secondary",
                    distance: "2.1 km",
                    rating: 4.0,
                    students: 1250,
                    sectors: ["Public"],
                    grades: "7-12"
                },
                {
                    name: "St Columban's College",
                    type: "Secondary",
                    distance: "3.2 km",
                    rating: 4.5,
                    students: 890,
                    sectors: ["Catholic"],
                    grades: "7-12"
                },
                {
                    name: "Peninsula School",
                    type: "Combined",
                    distance: "2.8 km",
                    rating: 4.1,
                    students: 650,
                    sectors: ["Independent"],
                    grades: "Prep-12"
                },
                {
                    name: "Redcliffe Special School",
                    type: "Special",
                    distance: "2.5 km",
                    rating: 4.3,
                    students: 120,
                    sectors: ["Public"],
                    grades: "Prep-12"
                }
            ],
            
            amenities: {
                shopping: [
                    { name: "Westfield Redcliffe", distance: "2.1 km", type: "Shopping Centre" },
                    { name: "IGA Woody Point", distance: "0.5 km", type: "Supermarket" },
                    { name: "Woody Point Shopping Village", distance: "0.3 km", type: "Local Shops" }
                ],
                recreation: [
                    { name: "Woody Point Beach", distance: "0.3 km", type: "Beach" },
                    { name: "Bicentennial Park", distance: "0.5 km", type: "Park" },
                    { name: "Redcliffe Golf Club", distance: "1.8 km", type: "Golf Course" },
                    { name: "Redcliffe Leagues Club", distance: "2.0 km", type: "Club" }
                ],
                transport: [
                    { name: "Woody Point Bus Stop", distance: "0.2 km", type: "Bus" },
                    { name: "Redcliffe Train Station", distance: "2.3 km", type: "Train" },
                    { name: "Brisbane Airport", distance: "28 km", type: "Airport" }
                ]
            },
            
            reportMetadata: {
                generatedDate: "2025-08-13",
                reportId: "RPT_WP_001_20250813",
                dataSource: "cotality Property Intelligence",
                confidence: "High",
                lastUpdated: "2025-08-13T10:30:00Z",
                version: "2.1"
            }
        };
    }
    
    // Simulate API delay
    async delay(ms = 500) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Get complete property data
    async getPropertyData(propertyId = "PROP_001") {
        await this.delay(300);
        return {
            success: true,
            data: this.propertyData,
            timestamp: new Date().toISOString()
        };
    }
    
    // Get property basic info
    async getPropertyInfo(propertyId = "PROP_001") {
        await this.delay(200);
        return {
            success: true,
            data: {
                property: this.propertyData.property,
                location: this.propertyData.location
            },
            timestamp: new Date().toISOString()
        };
    }
    
    // Get property photos
    async getPropertyPhotos(propertyId = "PROP_001") {
        await this.delay(250);
        return {
            success: true,
            data: this.propertyData.photos,
            timestamp: new Date().toISOString()
        };
    }
    
    // Get estimated value
    async getEstimatedValue(propertyId = "PROP_001") {
        await this.delay(200);
        return {
            success: true,
            data: this.propertyData.estimatedValue,
            timestamp: new Date().toISOString()
        };
    }
    
    // Get price history
    async getPriceHistory(propertyId = "PROP_001") {
        await this.delay(300);
        return {
            success: true,
            data: this.propertyData.priceHistory,
            timestamp: new Date().toISOString()
        };
    }
    
    // Get market insights
    async getMarketInsights(propertyId = "PROP_001") {
        await this.delay(400);
        return {
            success: true,
            data: {
                insights: this.propertyData.insights,
                marketTrends: this.propertyData.marketTrends
            },
            timestamp: new Date().toISOString()
        };
    }
    
    // Get comparable properties
    async getComparables(propertyId = "PROP_001") {
        await this.delay(350);
        return {
            success: true,
            data: this.propertyData.comparables,
            timestamp: new Date().toISOString()
        };
    }
    
    // Get local schools
    async getLocalSchools(propertyId = "PROP_001") {
        await this.delay(300);
        return {
            success: true,
            data: this.propertyData.schools,
            timestamp: new Date().toISOString()
        };
    }
    
    // Get amenities
    async getAmenities(propertyId = "PROP_001") {
        await this.delay(250);
        return {
            success: true,
            data: this.propertyData.amenities,
            timestamp: new Date().toISOString()
        };
    }
    
    // Search properties (for future use)
    async searchProperties(query) {
        await this.delay(400);
        return {
            success: true,
            data: [this.propertyData],
            count: 1,
            timestamp: new Date().toISOString()
        };
    }
    
    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-AU', {
            style: 'currency',
            currency: 'AUD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }
    
    // Format percentage
    formatPercentage(value) {
        return `${value}%`;
    }
    
    // Format distance
    formatDistance(distance) {
        return distance;
    }
}

// Create global instance
window.PropertyAPI = new PropertyAPI();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PropertyAPI;
}
