-- Flint Properties Database
-- Created: August 13, 2025
-- Database for Property Search Application

-- Create database
CREATE DATABASE IF NOT EXISTS flint_properties;
USE flint_properties;

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
    id INT PRIMARY KEY AUTO_INCREMENT,
    address VARCHAR(255) NOT NULL,
    suburb VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    postcode VARCHAR(10) NOT NULL,
    property_type VARCHAR(50) NOT NULL,
    bedrooms INT,
    bathrooms INT,
    parking_spaces INT,
    floor_area DECIMAL(10,2),
    land_area DECIMAL(10,2),
    year_built INT,
    price DECIMAL(15,2),
    estimated_rent DECIMAL(10,2),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    description TEXT,
    features JSON,
    images JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create property_history table
CREATE TABLE IF NOT EXISTS property_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    property_id INT,
    sale_date DATE,
    sale_price DECIMAL(15,2),
    sale_type VARCHAR(50),
    agent_name VARCHAR(100),
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- Create market_insights table
CREATE TABLE IF NOT EXISTS market_insights (
    id INT PRIMARY KEY AUTO_INCREMENT,
    suburb VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    median_price DECIMAL(15,2),
    price_growth DECIMAL(5,2),
    rental_yield DECIMAL(5,2),
    population INT,
    unemployment_rate DECIMAL(5,2),
    crime_index DECIMAL(5,2),
    school_rating DECIMAL(3,1),
    transport_score INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create schools table
CREATE TABLE IF NOT EXISTS schools (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50),
    rating DECIMAL(3,1),
    distance_km DECIMAL(5,2),
    suburb VARCHAR(100),
    state VARCHAR(50),
    property_id INT,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- Insert sample properties data
INSERT INTO properties (
    address, suburb, state, postcode, property_type, bedrooms, bathrooms, 
    parking_spaces, floor_area, land_area, year_built, price, estimated_rent,
    latitude, longitude, description, features, images
) VALUES 
(
    '24 Arthur Street',
    'Woody Point',
    'QLD',
    '4019',
    'Unit',
    2,
    2,
    1,
    102.00,
    NULL,
    2018,
    850000.00,
    650.00,
    -27.2631,
    153.1097,
    'Modern waterfront unit with stunning bay views and premium finishes throughout.',
    '["Ocean Views", "Air Conditioning", "Balcony", "Security", "Pool", "Gym"]',
    '["https://images.unsplash.com/photo-1570129477492-45c003edd2be", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2", "https://images.unsplash.com/photo-1564013799919-ab600027ffc6"]'
),
(
    '15 Marine Parade',
    'Redcliffe',
    'QLD',
    '4020',
    'House',
    3,
    2,
    2,
    180.00,
    650.00,
    2015,
    920000.00,
    750.00,
    -27.2308,
    153.1106,
    'Family home with modern kitchen, large backyard and close to schools.',
    '["Modern Kitchen", "Large Backyard", "Air Conditioning", "Double Garage", "Solar Panels"]',
    '["https://images.unsplash.com/photo-1568605114967-8130f3a36994", "https://images.unsplash.com/photo-1484154218962-a197022b5858", "https://images.unsplash.com/photo-1513584684374-8bab748fbf90"]'
),
(
    '42 Bayview Terrace',
    'Clontarf',
    'QLD',
    '4019',
    'Apartment',
    1,
    1,
    1,
    75.00,
    NULL,
    2020,
    550000.00,
    450.00,
    -27.2445,
    153.0732,
    'Contemporary apartment with bay views and resort-style amenities.',
    '["Bay Views", "Pool", "Gym", "Security", "Air Conditioning", "Balcony"]',
    '["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267", "https://images.unsplash.com/photo-1484154218962-a197022b5858"]'
),
(
    '8 Ocean Street',
    'Redcliffe',
    'QLD',
    '4020',
    'Townhouse',
    3,
    2,
    2,
    145.00,
    220.00,
    2019,
    780000.00,
    580.00,
    -27.2284,
    153.1089,
    'Modern townhouse with private courtyard and premium finishes.',
    '["Private Courtyard", "Modern Kitchen", "Air Conditioning", "Double Garage", "Security"]',
    '["https://images.unsplash.com/photo-1512917774080-9991f1c4c750", "https://images.unsplash.com/photo-1493809842364-78817add7ffb", "https://images.unsplash.com/photo-1505873242700-f289a29e1e0f"]'
),
(
    '33 Scarborough Road',
    'Scarborough',
    'QLD',
    '4020',
    'House',
    4,
    3,
    2,
    220.00,
    800.00,
    2010,
    1150000.00,
    850.00,
    -27.2044,
    153.1053,
    'Spacious family home with pool, entertainer\'s deck and ocean glimpses.',
    '["Pool", "Ocean Glimpses", "Entertainer\'s Deck", "Air Conditioning", "Double Garage", "Solar Panels"]',
    '["https://images.unsplash.com/photo-1564013799919-ab600027ffc6", "https://images.unsplash.com/photo-1510627498534-cf7e9002facc", "https://images.unsplash.com/photo-1523217582562-09d0def993a6"]'
),
(
    '101 Main Street',
    'Brisbane',
    'QLD',
    '4000',
    'Apartment',
    2,
    2,
    1,
    95.00,
    NULL,
    2021,
    650000.00,
    520.00,
    -27.4705,
    153.0260,
    'City apartment with river views and premium amenities.',
    '["River Views", "Pool", "Gym", "Concierge", "Air Conditioning", "Balcony"]',
    '["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267", "https://images.unsplash.com/photo-1484154218962-a197022b5858"]'
),
(
    '25 Queen Street',
    'Melbourne',
    'VIC',
    '3000',
    'Office',
    0,
    2,
    0,
    350.00,
    NULL,
    2017,
    2500000.00,
    8500.00,
    -37.8136,
    144.9631,
    'Premium office space in the heart of Melbourne CBD.',
    '["CBD Location", "Modern Fitout", "Air Conditioning", "Security", "Lift Access"]',
    '["https://images.unsplash.com/photo-1497366216548-37526070297c", "https://images.unsplash.com/photo-1560472354-b33ff0c44a43", "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab"]'
),
(
    '12 King Street',
    'Sydney',
    'NSW',
    '2000',
    'Apartment',
    1,
    1,
    0,
    65.00,
    NULL,
    2022,
    750000.00,
    600.00,
    -33.8688,
    151.2093,
    'Luxury studio apartment in Sydney CBD with harbour glimpses.',
    '["Harbour Glimpses", "Luxury Finishes", "Concierge", "Gym", "Pool", "Air Conditioning"]',
    '["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"]'
),
(
    '45 Beach Road',
    'Gold Coast',
    'QLD',
    '4217',
    'House',
    5,
    4,
    3,
    280.00,
    600.00,
    2012,
    1850000.00,
    1200.00,
    -28.0167,
    153.4000,
    'Beachfront house with direct beach access and panoramic ocean views.',
    '["Beachfront", "Ocean Views", "Pool", "Direct Beach Access", "Air Conditioning", "Triple Garage"]',
    '["https://images.unsplash.com/photo-1564013799919-ab600027ffc6", "https://images.unsplash.com/photo-1510627498534-cf7e9002facc", "https://images.unsplash.com/photo-1523217582562-09d0def993a6"]'
),
(
    '18 Park Avenue',
    'Perth',
    'WA',
    '6000',
    'Unit',
    2,
    1,
    1,
    85.00,
    NULL,
    2016,
    480000.00,
    400.00,
    -31.9505,
    115.8605,
    'Modern unit close to Perth CBD with park views.',
    '["Park Views", "Air Conditioning", "Security", "Balcony", "Modern Kitchen"]',
    '["https://images.unsplash.com/photo-1570129477492-45c003edd2be", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2", "https://images.unsplash.com/photo-1484154218962-a197022b5858"]'
);

-- Insert property history data
INSERT INTO property_history (property_id, sale_date, sale_price, sale_type, agent_name) VALUES
(1, '2023-03-15', 820000.00, 'Sale', 'John Smith - Ray White'),
(1, '2021-07-22', 750000.00, 'Sale', 'Sarah Johnson - LJ Hooker'),
(2, '2023-01-10', 890000.00, 'Sale', 'Mike Wilson - Century 21'),
(3, '2022-11-05', 520000.00, 'Sale', 'Lisa Brown - Harcourts'),
(4, '2023-02-28', 750000.00, 'Sale', 'David Lee - RE/MAX'),
(5, '2022-08-12', 1100000.00, 'Sale', 'Emma Davis - First National');

-- Insert market insights data
INSERT INTO market_insights (suburb, state, median_price, price_growth, rental_yield, population, unemployment_rate, crime_index, school_rating, transport_score) VALUES
('Woody Point', 'QLD', 720000.00, 8.5, 4.2, 5200, 4.1, 2.8, 8.5, 85),
('Redcliffe', 'QLD', 650000.00, 12.3, 4.8, 15800, 3.9, 2.5, 8.2, 90),
('Clontarf', 'QLD', 850000.00, 6.7, 3.9, 8900, 3.2, 1.8, 9.1, 80),
('Scarborough', 'QLD', 950000.00, 10.1, 4.1, 12500, 3.5, 2.1, 8.8, 88),
('Brisbane', 'QLD', 580000.00, 15.2, 5.1, 2600000, 4.2, 3.2, 8.0, 95),
('Melbourne', 'VIC', 680000.00, 3.8, 3.5, 5200000, 4.8, 3.8, 8.3, 92),
('Sydney', 'NSW', 1200000.00, 2.1, 2.8, 5400000, 3.9, 4.1, 8.6, 88),
('Gold Coast', 'QLD', 750000.00, 18.5, 4.5, 679000, 4.5, 3.0, 7.9, 82),
('Perth', 'WA', 450000.00, 9.2, 4.6, 2200000, 5.1, 2.9, 8.1, 86);

-- Insert schools data
INSERT INTO schools (name, type, rating, distance_km, suburb, state, property_id) VALUES
('Woody Point State School', 'Primary', 8.5, 0.8, 'Woody Point', 'QLD', 1),
('Redcliffe State High School', 'Secondary', 8.2, 1.2, 'Redcliffe', 'QLD', 1),
('Peninsula State School', 'Primary', 8.8, 0.5, 'Redcliffe', 'QLD', 2),
('Redcliffe State High School', 'Secondary', 8.2, 0.9, 'Redcliffe', 'QLD', 2),
('Clontarf Beach State School', 'Primary', 9.1, 0.6, 'Clontarf', 'QLD', 3),
('Redcliffe State High School', 'Secondary', 8.2, 2.1, 'Redcliffe', 'QLD', 3),
('Peninsula State School', 'Primary', 8.8, 0.7, 'Redcliffe', 'QLD', 4),
('Redcliffe State High School', 'Secondary', 8.2, 0.8, 'Redcliffe', 'QLD', 4),
('Scarborough State School', 'Primary', 8.9, 0.5, 'Scarborough', 'QLD', 5),
('Redcliffe State High School', 'Secondary', 8.2, 1.5, 'Redcliffe', 'QLD', 5);

-- Create indexes for better performance
CREATE INDEX idx_properties_suburb ON properties(suburb);
CREATE INDEX idx_properties_state ON properties(state);
CREATE INDEX idx_properties_postcode ON properties(postcode);
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_property_history_property_id ON property_history(property_id);
CREATE INDEX idx_market_insights_suburb ON market_insights(suburb, state);
CREATE INDEX idx_schools_property_id ON schools(property_id);

-- Create views for common queries
CREATE VIEW property_details_view AS
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
LEFT JOIN market_insights mi ON p.suburb = mi.suburb AND p.state = mi.state;

CREATE VIEW property_with_schools AS
SELECT 
    p.id,
    p.address,
    p.suburb,
    p.state,
    p.postcode,
    GROUP_CONCAT(
        CONCAT(s.name, ' (', s.type, ') - Rating: ', s.rating, ', Distance: ', s.distance_km, 'km')
        SEPARATOR '; '
    ) as nearby_schools
FROM properties p
LEFT JOIN schools s ON p.id = s.property_id
GROUP BY p.id;

-- Sample queries for testing
-- SELECT * FROM property_details_view WHERE id = 1;
-- SELECT * FROM properties WHERE suburb = 'Woody Point';
-- SELECT * FROM property_history WHERE property_id = 1;
-- SELECT * FROM schools WHERE property_id = 1;
-- SELECT * FROM market_insights WHERE suburb = 'Woody Point';
