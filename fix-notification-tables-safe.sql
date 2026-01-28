-- =====================================================
-- SAFE NOTIFICATION TABLES FIX SCRIPT
-- =====================================================
-- This script safely checks and fixes notification tables
-- WITHOUT destroying existing data
-- Run with: sudo mysql inventory_db < fix-notification-tables-safe.sql

USE inventory_db;

-- Show current status
SELECT 'STARTING NOTIFICATION TABLES CHECK AND FIX...' as status;

-- =====================================================
-- CHECK AND CREATE NOTIFICATIONS TABLE
-- =====================================================
SELECT 'Checking notifications table...' as step;

-- Check if notifications table exists
SET @table_exists = (
    SELECT COUNT(*) 
    FROM information_schema.tables 
    WHERE table_schema = 'inventory_db' 
    AND table_name = 'notifications'
);

-- Create notifications table if it doesn't exist
SET @sql = IF(@table_exists = 0,
    'CREATE TABLE notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        priority ENUM(''low'', ''medium'', ''high'') NOT NULL DEFAULT ''medium'',
        user_id INT NULL,
        related_entity_type VARCHAR(50) NULL,
        related_entity_id INT NULL,
        data JSON NULL,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        read_at TIMESTAMP NULL,
        expires_at TIMESTAMP NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_type (type),
        INDEX idx_created_at (created_at),
        INDEX idx_is_read (is_read)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
    'SELECT "notifications table already exists" as info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add missing columns to notifications table if they don't exist
SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='inventory_db' AND table_name='notifications' AND column_name='priority') = 0,
    'ALTER TABLE notifications ADD COLUMN priority ENUM(''low'', ''medium'', ''high'') NOT NULL DEFAULT ''medium'' AFTER type',
    'SELECT "priority column already exists" as info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='inventory_db' AND table_name='notifications' AND column_name='related_entity_type') = 0,
    'ALTER TABLE notifications ADD COLUMN related_entity_type VARCHAR(50) NULL AFTER user_id',
    'SELECT "related_entity_type column already exists" as info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='inventory_db' AND table_name='notifications' AND column_name='related_entity_id') = 0,
    'ALTER TABLE notifications ADD COLUMN related_entity_id INT NULL AFTER related_entity_type',
    'SELECT "related_entity_id column already exists" as info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='inventory_db' AND table_name='notifications' AND column_name='data') = 0,
    'ALTER TABLE notifications ADD COLUMN data JSON NULL AFTER related_entity_id',
    'SELECT "data column already exists" as info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='inventory_db' AND table_name='notifications' AND column_name='read_at') = 0,
    'ALTER TABLE notifications ADD COLUMN read_at TIMESTAMP NULL AFTER is_read',
    'SELECT "read_at column already exists" as info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='inventory_db' AND table_name='notifications' AND column_name='expires_at') = 0,
    'ALTER TABLE notifications ADD COLUMN expires_at TIMESTAMP NULL AFTER read_at',
    'SELECT "expires_at column already exists" as info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- CHECK AND CREATE FIREBASE_TOKENS TABLE
-- =====================================================
SELECT 'Checking firebase_tokens table...' as step;

SET @table_exists = (
    SELECT COUNT(*) 
    FROM information_schema.tables 
    WHERE table_schema = 'inventory_db' 
    AND table_name = 'firebase_tokens'
);

SET @sql = IF(@table_exists = 0,
    'CREATE TABLE firebase_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(500) NOT NULL,
        device_type VARCHAR(20) NOT NULL DEFAULT ''web'',
        device_info JSON NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        last_used_at TIMESTAMP NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_token (user_id, token),
        INDEX idx_user_id (user_id),
        INDEX idx_is_active (is_active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
    'SELECT "firebase_tokens table already exists" as info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- CHECK AND CREATE NOTIFICATION_SETTINGS TABLE
-- =====================================================
SELECT 'Checking notification_settings table...' as step;

SET @table_exists = (
    SELECT COUNT(*) 
    FROM information_schema.tables 
    WHERE table_schema = 'inventory_db' 
    AND table_name = 'notification_settings'
);

SET @sql = IF(@table_exists = 0,
    'CREATE TABLE notification_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        login_notifications BOOLEAN NOT NULL DEFAULT TRUE,
        dispatch_notifications BOOLEAN NOT NULL DEFAULT TRUE,
        return_notifications BOOLEAN NOT NULL DEFAULT TRUE,
        damage_notifications BOOLEAN NOT NULL DEFAULT TRUE,
        product_notifications BOOLEAN NOT NULL DEFAULT TRUE,
        inventory_notifications BOOLEAN NOT NULL DEFAULT TRUE,
        system_notifications BOOLEAN NOT NULL DEFAULT TRUE,
        push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        email_enabled BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
    'SELECT "notification_settings table already exists" as info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- CHECK AND CREATE NOTIFICATION_PREFERENCES TABLE
-- =====================================================
SELECT 'Checking notification_preferences table...' as step;

SET @table_exists = (
    SELECT COUNT(*) 
    FROM information_schema.tables 
    WHERE table_schema = 'inventory_db' 
    AND table_name = 'notification_preferences'
);

SET @sql = IF(@table_exists = 0,
    'CREATE TABLE notification_preferences (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        notification_type VARCHAR(50) NOT NULL,
        enabled BOOLEAN NOT NULL DEFAULT TRUE,
        push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        email_enabled BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_type (user_id, notification_type),
        INDEX idx_user_id (user_id),
        INDEX idx_notification_type (notification_type)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
    'SELECT "notification_preferences table already exists" as info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- ADD MISSING INDEXES SAFELY
-- =====================================================
SELECT 'Adding missing indexes...' as step;

-- Add indexes only if they don't exist
SET @index_exists = (
    SELECT COUNT(*) 
    FROM information_schema.statistics 
    WHERE table_schema = 'inventory_db' 
    AND table_name = 'notifications' 
    AND index_name = 'idx_user_unread'
);

SET @sql = IF(@index_exists = 0,
    'ALTER TABLE notifications ADD INDEX idx_user_unread (user_id, is_read, created_at)',
    'SELECT "idx_user_unread index already exists" as info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- SHOW FINAL STATUS
-- =====================================================
SELECT 'NOTIFICATION TABLES CHECK COMPLETE!' as status;

-- Show table structures
SELECT 'notifications table structure:' as info;
DESCRIBE notifications;

SELECT 'firebase_tokens table structure:' as info;
DESCRIBE firebase_tokens;

SELECT 'notification_settings table structure:' as info;
DESCRIBE notification_settings;

SELECT 'notification_preferences table structure:' as info;
DESCRIBE notification_preferences;

-- Show counts
SELECT 
    'notifications' as table_name,
    COUNT(*) as record_count
FROM notifications
UNION ALL
SELECT 
    'firebase_tokens' as table_name,
    COUNT(*) as record_count
FROM firebase_tokens
UNION ALL
SELECT 
    'notification_settings' as table_name,
    COUNT(*) as record_count
FROM notification_settings
UNION ALL
SELECT 
    'notification_preferences' as table_name,
    COUNT(*) as record_count
FROM notification_preferences;

SELECT 'ALL NOTIFICATION TABLES ARE NOW PROPERLY CONFIGURED!' as final_status;