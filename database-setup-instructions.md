# MySQL Database Setup Instructions

## Prerequisites
- XAMPP (includes Apache & MySQL) or WAMP or any local MySQL server
- Web browser for testing

## Setup Steps

### 1. Install XAMPP (if not already installed)
- Download XAMPP from https://www.apachefriends.org/
- Install with default settings
- Start Apache and MySQL services from XAMPP Control Panel

### 2. Create Database
1. Open phpMyAdmin (usually at http://localhost/phpmyadmin)
2. Click "New" to create a new database
3. Name it `flint_properties`
4. Click "Create"

### 3. Import Database Schema
1. Select the `flint_properties` database
2. Click "Import" tab
3. Choose the `flint_properties.sql` file
4. Click "Go" to import all tables and sample data

### 4. Configure Database Connection
The database connection is already configured in `property-api-mysql.php`:
```php
private $host = 'localhost';
private $dbname = 'flint_properties';
private $username = 'root';
private $password = '';  // Default XAMPP MySQL password is empty
```

### 5. Test the Setup
1. Place all project files in XAMPP's `htdocs` folder (usually `C:\xampp\htdocs\flint-new\`)
2. Start Apache and MySQL from XAMPP Control Panel
3. Open http://localhost/flint-new/ in your browser
4. Test property search and details pages

## Database Features

### Tables Created:
- **properties**: Main property information with JSON features and images
- **property_history**: Price and sale history
- **market_insights**: Market trends and statistics
- **schools**: Nearby schools information

### Sample Data Included:
- 10 sample properties with complete details
- Property history records
- Market insights for different suburbs
- School information

### API Endpoints Available:
- `GET /properties` - Get all properties
- `GET /properties/{id}` - Get specific property
- `GET /search?query=...` - Search properties
- `GET /property-history/{id}` - Get property price history
- `GET /market-insights?suburb=...` - Get market insights
- `GET /schools?suburb=...` - Get nearby schools

## Troubleshooting

### Common Issues:
1. **Database connection error**: Check if MySQL service is running in XAMPP
2. **CORS errors**: Ensure all files are served from the same domain (localhost)
3. **Permission denied**: Check file permissions in htdocs folder
4. **API not found**: Verify the correct path to property-api-mysql.php

### Testing the API Directly:
- http://localhost/flint-new/property-api-mysql.php/properties
- http://localhost/flint-new/property-api-mysql.php/properties/1
- http://localhost/flint-new/property-api-mysql.php/search?query=Northcote

## Migration from Hardcoded Data

The system now uses:
- `property-api-mysql-client.js` instead of `property-api.js`
- `PropertyAPIMySQL` class instead of `PropertyAPI`
- MySQL database instead of hardcoded arrays
- Comprehensive error handling and fallback data

All existing functionality is preserved with enhanced search capabilities and real data persistence.
