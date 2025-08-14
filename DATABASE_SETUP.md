# Flint Properties Database Configuration
# Created: August 13, 2025

## Database Setup Instructions

### 1. Prerequisites
- XAMPP, WAMP, or similar local server with PHP and MySQL
- MySQL/MariaDB server running
- PHP 7.4 or higher

### 2. Database Setup
1. Start your MySQL server (through XAMPP/WAMP control panel)
2. Open phpMyAdmin or MySQL command line
3. Import the database:
   ```sql
   SOURCE /path/to/flint_properties.sql
   ```
   OR
   - Open phpMyAdmin
   - Create new database named 'flint_properties'
   - Import flint_properties.sql file

### 3. PHP Configuration
1. Place property-api-mysql.php in your web server directory (htdocs/www)
2. Update database credentials in property-api-mysql.php if needed:
   ```php
   private static $host = 'localhost';
   private static $dbname = 'flint_properties';
   private static $username = 'root';
   private static $password = '';
   ```

### 4. Frontend Integration
1. Replace property-api.js with property-api-mysql-client.js in your HTML files
2. Update script tags:
   ```html
   <!-- OLD -->
   <script src="property-api.js"></script>
   
   <!-- NEW -->
   <script src="property-api-mysql-client.js"></script>
   ```

### 5. API Endpoints

#### Available Endpoints:
- GET `property-api-mysql.php?path=properties` - Get all properties
- GET `property-api-mysql.php?path=property&id=1` - Get specific property
- GET `property-api-mysql.php?path=property/history&id=1` - Get property history
- GET `property-api-mysql.php?path=property/schools&id=1` - Get nearby schools
- GET `property-api-mysql.php?path=market/insights&suburb=Woody Point&state=QLD` - Market data
- GET `property-api-mysql.php?path=search&suburb=Redcliffe&property_type=House` - Search properties
- GET `property-api-mysql.php?path=stats` - Get statistics

#### Search Parameters:
- suburb
- state
- property_type
- min_price
- max_price
- bedrooms
- bathrooms

### 6. Testing the API
Test in browser or with curl:
```bash
# Get all properties
curl "http://localhost/property-api-mysql.php?path=properties"

# Get specific property
curl "http://localhost/property-api-mysql.php?path=property&id=1"

# Search properties
curl "http://localhost/property-api-mysql.php?path=search&suburb=Woody Point"
```

### 7. Frontend Usage
```javascript
// Initialize API
const api = new PropertyAPIMySQL();

// Get all properties
const properties = await api.getAllProperties();

// Get specific property
const property = await api.getPropertyById(1);

// Search properties
const results = await api.searchProperties({
    suburb: 'Redcliffe',
    property_type: 'House',
    min_price: 500000
});
```

### 8. Error Handling
The API includes comprehensive error handling:
- Database connection errors
- Invalid parameters
- Missing data
- Fallback to dummy data if API fails

### 9. Performance Features
- Response caching (5 minutes)
- Prepared statements for security
- Efficient database indexes
- CORS support for frontend

### 10. Database Schema Overview

#### Tables:
- **properties** - Main property data
- **property_history** - Sale history
- **market_insights** - Suburb statistics
- **schools** - Nearby schools

#### Views:
- **property_details_view** - Properties with market data
- **property_with_schools** - Properties with school info

### 11. Troubleshooting

#### Common Issues:
1. **Database connection failed**
   - Check MySQL server is running
   - Verify credentials in property-api-mysql.php

2. **CORS errors**
   - Make sure you're accessing via localhost, not file://
   - Check browser console for specific errors

3. **Empty results**
   - Verify database import was successful
   - Check if data exists in tables

4. **API not found**
   - Ensure property-api-mysql.php is in web server directory
   - Check file permissions

### 12. Security Notes
- Update default MySQL credentials
- Use environment variables for production
- Implement proper authentication for production use
- Validate all input parameters

### 13. Production Deployment
For production deployment:
1. Use environment variables for database credentials
2. Enable proper error logging
3. Implement rate limiting
4. Add authentication/authorization
5. Use HTTPS
6. Optimize database indexes
