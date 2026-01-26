-- ADD LOCATION COLUMNS TO AUDIT_LOGS TABLE
-- This adds the missing location columns that the updated code expects

USE inventory_db;

-- Add location columns to audit_logs table
ALTER TABLE audit_logs 
ADD COLUMN location_country VARCHAR(100) NULL AFTER ip_address,
ADD COLUMN location_city VARCHAR(100) NULL AFTER location_country,
ADD COLUMN location_region VARCHAR(100) NULL AFTER location_city,
ADD COLUMN location_coordinates VARCHAR(50) NULL AFTER location_region;

-- Show the updated table structure
DESCRIBE audit_logs;

-- Show sample data to verify columns were added
SELECT id, ip_address, location_country, location_city, location_region, location_coordinates, created_at 
FROM audit_logs 
ORDER BY created_at DESC 
LIMIT 5;