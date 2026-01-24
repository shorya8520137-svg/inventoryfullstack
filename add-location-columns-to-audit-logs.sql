-- ADD LOCATION TRACKING COLUMNS TO AUDIT_LOGS TABLE
-- This migration adds geolocation columns for IP-based location tracking

USE inventory_db;

-- Add location columns to audit_logs table
ALTER TABLE audit_logs 
ADD COLUMN location_country VARCHAR(100) DEFAULT NULL COMMENT 'Country name from IP geolocation',
ADD COLUMN location_city VARCHAR(100) DEFAULT NULL COMMENT 'City name from IP geolocation',
ADD COLUMN location_region VARCHAR(100) DEFAULT NULL COMMENT 'Region/State from IP geolocation',
ADD COLUMN location_coordinates VARCHAR(50) DEFAULT NULL COMMENT 'Latitude,Longitude coordinates';

-- Add indexes for better query performance
CREATE INDEX idx_audit_logs_location_country ON audit_logs(location_country);
CREATE INDEX idx_audit_logs_location_city ON audit_logs(location_city);
CREATE INDEX idx_audit_logs_ip_location ON audit_logs(ip_address, location_country);

-- Show the updated table structure
DESCRIBE audit_logs;