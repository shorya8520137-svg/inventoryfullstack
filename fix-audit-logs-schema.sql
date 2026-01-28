-- FIX AUDIT_LOGS TABLE SCHEMA
-- This script adds all missing columns to match the complete audit_logs schema
-- Run this with: sudo mysql inventory_db < fix-audit-logs-schema.sql

USE inventory_db;

-- Show current table structure
SELECT 'Current audit_logs table structure:' as info;
DESCRIBE audit_logs;

-- Add missing columns one by one (using IF NOT EXISTS to avoid errors)
SELECT 'Adding missing columns to audit_logs table...' as info;

-- Add user information columns
SET @sql1 = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='inventory_db' AND TABLE_NAME='audit_logs' AND COLUMN_NAME='user_name') = 0,
    'ALTER TABLE audit_logs ADD COLUMN user_name VARCHAR(255) NULL AFTER user_id',
    'SELECT "user_name column already exists" as info');
PREPARE stmt1 FROM @sql1;
EXECUTE stmt1;
DEALLOCATE PREPARE stmt1;

SET @sql2 = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='inventory_db' AND TABLE_NAME='audit_logs' AND COLUMN_NAME='user_email') = 0,
    'ALTER TABLE audit_logs ADD COLUMN user_email VARCHAR(255) NULL AFTER user_name',
    'SELECT "user_email column already exists" as info');
PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

SET @sql3 = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='inventory_db' AND TABLE_NAME='audit_logs' AND COLUMN_NAME='user_role') = 0,
    'ALTER TABLE audit_logs ADD COLUMN user_role VARCHAR(100) NULL AFTER user_email',
    'SELECT "user_role column already exists" as info');
PREPARE stmt3 FROM @sql3;
EXECUTE stmt3;
DEALLOCATE PREPARE stmt3;

-- Fix resource column name (change 'resource' to 'resource_type')
SET @sql4 = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='inventory_db' AND TABLE_NAME='audit_logs' AND COLUMN_NAME='resource_type') = 0,
    'ALTER TABLE audit_logs CHANGE COLUMN resource resource_type VARCHAR(50) NOT NULL',
    'SELECT "resource_type column already exists" as info');
PREPARE stmt4 FROM @sql4;
EXECUTE stmt4;
DEALLOCATE PREPARE stmt4;

-- Add resource_name column
SET @sql5 = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='inventory_db' AND TABLE_NAME='audit_logs' AND COLUMN_NAME='resource_name') = 0,
    'ALTER TABLE audit_logs ADD COLUMN resource_name VARCHAR(255) NULL AFTER resource_id',
    'SELECT "resource_name column already exists" as info');
PREPARE stmt5 FROM @sql5;
EXECUTE stmt5;
DEALLOCATE PREPARE stmt5;

-- Add description column
SET @sql6 = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='inventory_db' AND TABLE_NAME='audit_logs' AND COLUMN_NAME='description') = 0,
    'ALTER TABLE audit_logs ADD COLUMN description TEXT NOT NULL AFTER resource_name',
    'SELECT "description column already exists" as info');
PREPARE stmt6 FROM @sql6;
EXECUTE stmt6;
DEALLOCATE PREPARE stmt6;

-- Add request information columns
SET @sql7 = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='inventory_db' AND TABLE_NAME='audit_logs' AND COLUMN_NAME='request_method') = 0,
    'ALTER TABLE audit_logs ADD COLUMN request_method VARCHAR(10) NULL AFTER user_agent',
    'SELECT "request_method column already exists" as info');
PREPARE stmt7 FROM @sql7;
EXECUTE stmt7;
DEALLOCATE PREPARE stmt7;

SET @sql8 = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='inventory_db' AND TABLE_NAME='audit_logs' AND COLUMN_NAME='request_url') = 0,
    'ALTER TABLE audit_logs ADD COLUMN request_url VARCHAR(500) NULL AFTER request_method',
    'SELECT "request_url column already exists" as info');
PREPARE stmt8 FROM @sql8;
EXECUTE stmt8;
DEALLOCATE PREPARE stmt8;

-- Add location tracking columns
SET @sql9 = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='inventory_db' AND TABLE_NAME='audit_logs' AND COLUMN_NAME='location_country') = 0,
    'ALTER TABLE audit_logs ADD COLUMN location_country VARCHAR(100) NULL AFTER ip_address',
    'SELECT "location_country column already exists" as info');
PREPARE stmt9 FROM @sql9;
EXECUTE stmt9;
DEALLOCATE PREPARE stmt9;

SET @sql10 = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='inventory_db' AND TABLE_NAME='audit_logs' AND COLUMN_NAME='location_city') = 0,
    'ALTER TABLE audit_logs ADD COLUMN location_city VARCHAR(100) NULL AFTER location_country',
    'SELECT "location_city column already exists" as info');
PREPARE stmt10 FROM @sql10;
EXECUTE stmt10;
DEALLOCATE PREPARE stmt10;

SET @sql11 = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='inventory_db' AND TABLE_NAME='audit_logs' AND COLUMN_NAME='location_region') = 0,
    'ALTER TABLE audit_logs ADD COLUMN location_region VARCHAR(100) NULL AFTER location_city',
    'SELECT "location_region column already exists" as info');
PREPARE stmt11 FROM @sql11;
EXECUTE stmt11;
DEALLOCATE PREPARE stmt11;

SET @sql12 = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='inventory_db' AND TABLE_NAME='audit_logs' AND COLUMN_NAME='location_coordinates') = 0,
    'ALTER TABLE audit_logs ADD COLUMN location_coordinates VARCHAR(50) NULL AFTER location_region',
    'SELECT "location_coordinates column already exists" as info');
PREPARE stmt12 FROM @sql12;
EXECUTE stmt12;
DEALLOCATE PREPARE stmt12;

-- Add missing indexes for performance
SELECT 'Adding missing indexes...' as info;

-- Check and add indexes
SET @sql13 = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA='inventory_db' AND TABLE_NAME='audit_logs' AND INDEX_NAME='idx_resource') = 0,
    'ALTER TABLE audit_logs ADD INDEX idx_resource (resource_type, resource_id)',
    'SELECT "idx_resource index already exists" as info');
PREPARE stmt13 FROM @sql13;
EXECUTE stmt13;
DEALLOCATE PREPARE stmt13;

SET @sql14 = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA='inventory_db' AND TABLE_NAME='audit_logs' AND INDEX_NAME='idx_user_action') = 0,
    'ALTER TABLE audit_logs ADD INDEX idx_user_action (user_id, action)',
    'SELECT "idx_user_action index already exists" as info');
PREPARE stmt14 FROM @sql14;
EXECUTE stmt14;
DEALLOCATE PREPARE stmt14;

-- Show updated table structure
SELECT 'Updated audit_logs table structure:' as info;
DESCRIBE audit_logs;

-- Show existing data count
SELECT 'Current audit logs count:' as info;
SELECT COUNT(*) as existing_entries FROM audit_logs;

SELECT 'SUCCESS: audit_logs table has been updated with complete schema!' as result;
SELECT 'Your existing audit log data is preserved. New columns are ready for use.' as note;