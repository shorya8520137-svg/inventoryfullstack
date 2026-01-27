-- ADD LOCATION COLUMNS TO AUDIT_LOGS TABLE
-- Run this with: sudo mysql inventory_db < add-location-columns-manual.sql

USE inventory_db;

-- Show current table structure
SELECT 'Current audit_logs table structure:' as info;
DESCRIBE audit_logs;

-- Add location columns (using IF NOT EXISTS to avoid errors if columns already exist)
SELECT 'Adding location columns...' as info;

-- For MySQL versions that support IF NOT EXISTS
SET @sql1 = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='inventory_db' AND TABLE_NAME='audit_logs' AND COLUMN_NAME='location_country') = 0,
    'ALTER TABLE audit_logs ADD COLUMN location_country VARCHAR(100) NULL AFTER ip_address',
    'SELECT "location_country column already exists" as info');
PREPARE stmt1 FROM @sql1;
EXECUTE stmt1;
DEALLOCATE PREPARE stmt1;

SET @sql2 = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='inventory_db' AND TABLE_NAME='audit_logs' AND COLUMN_NAME='location_city') = 0,
    'ALTER TABLE audit_logs ADD COLUMN location_city VARCHAR(100) NULL AFTER location_country',
    'SELECT "location_city column already exists" as info');
PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

SET @sql3 = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='inventory_db' AND TABLE_NAME='audit_logs' AND COLUMN_NAME='location_region') = 0,
    'ALTER TABLE audit_logs ADD COLUMN location_region VARCHAR(100) NULL AFTER location_city',
    'SELECT "location_region column already exists" as info');
PREPARE stmt3 FROM @sql3;
EXECUTE stmt3;
DEALLOCATE PREPARE stmt3;

SET @sql4 = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='inventory_db' AND TABLE_NAME='audit_logs' AND COLUMN_NAME='location_coordinates') = 0,
    'ALTER TABLE audit_logs ADD COLUMN location_coordinates VARCHAR(50) NULL AFTER location_region',
    'SELECT "location_coordinates column already exists" as info');
PREPARE stmt4 FROM @sql4;
EXECUTE stmt4;
DEALLOCATE PREPARE stmt4;

-- Show updated table structure
SELECT 'Updated audit_logs table structure:' as info;
DESCRIBE audit_logs;

-- Show sample data with new columns
SELECT 'Sample audit logs with location columns:' as info;
SELECT id, ip_address, location_country, location_city, location_region, location_coordinates, created_at 
FROM audit_logs 
ORDER BY created_at DESC 
LIMIT 5;

SELECT 'SUCCESS: Location columns have been added to audit_logs table!' as result;