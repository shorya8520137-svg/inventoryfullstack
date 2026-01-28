-- =====================================================
-- NOTIFICATION SYSTEM - COMPLETE TABLE CREATION SCRIPT
-- =====================================================
-- This script creates all tables needed for the notification system
-- Run this on your inventory_db database

USE inventory_db;

-- =====================================================
-- TABLE 1: NOTIFICATIONS (Main notification storage)
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL COMMENT 'Notification title',
    message TEXT NOT NULL COMMENT 'Notification message content',
    type VARCHAR(50) NOT NULL COMMENT 'Notification type (LOGIN, DISPATCH, RETURN, etc.)',
    priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium' COMMENT 'Notification priority level',
    user_id INT NULL COMMENT 'Target user ID (NULL for broadcast notifications)',
    related_entity_type VARCHAR(50) NULL COMMENT 'Related entity type (dispatch, return, etc.)',
    related_entity_id INT NULL COMMENT 'Related entity ID',
    data JSON NULL COMMENT 'Additional notification data in JSON format',
    is_read BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Read status',
    read_at TIMESTAMP NULL COMMENT 'When notification was read',
    expires_at TIMESTAMP NULL COMMENT 'Expiration time for notification',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update time',
    
    -- Indexes for performance
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at),
    INDEX idx_is_read (is_read),
    INDEX idx_priority (priority),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Main notification storage table';

-- =====================================================
-- TABLE 2: FIREBASE_TOKENS (Push notification tokens)
-- =====================================================
CREATE TABLE IF NOT EXISTS firebase_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT 'User ID who owns this token',
    token VARCHAR(500) NOT NULL COMMENT 'Firebase FCM token',
    device_type VARCHAR(20) NOT NULL DEFAULT 'web' COMMENT 'Device type (web, android, ios)',
    device_info JSON NULL COMMENT 'Device information (browser, OS, etc.)',
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Token active status',
    last_used_at TIMESTAMP NULL COMMENT 'Last time token was used for push notification',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update time',
    
    -- Unique constraint to prevent duplicate tokens per user
    UNIQUE KEY unique_user_token (user_id, token),
    INDEX idx_user_id (user_id),
    INDEX idx_is_active (is_active),
    INDEX idx_device_type (device_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Firebase push notification tokens';

-- =====================================================
-- TABLE 3: NOTIFICATION_SETTINGS (User notification preferences)
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT 'User ID',
    login_notifications BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Enable login notifications',
    dispatch_notifications BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Enable dispatch notifications',
    return_notifications BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Enable return notifications',
    damage_notifications BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Enable damage notifications',
    product_notifications BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Enable product notifications',
    inventory_notifications BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Enable inventory notifications',
    system_notifications BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Enable system notifications',
    push_enabled BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Enable push notifications',
    email_enabled BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Enable email notifications',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update time',
    
    -- One settings record per user
    UNIQUE KEY unique_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User notification preferences';

-- =====================================================
-- TABLE 4: NOTIFICATION_PREFERENCES (Detailed user preferences)
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT 'User ID',
    notification_type VARCHAR(50) NOT NULL COMMENT 'Notification type (LOGIN, DISPATCH, etc.)',
    enabled BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Preference enabled',
    push_enabled BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Push notifications enabled for this type',
    email_enabled BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Email notifications enabled for this type',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update time',
    
    -- One preference record per user per notification type
    UNIQUE KEY unique_user_type (user_id, notification_type),
    INDEX idx_user_id (user_id),
    INDEX idx_notification_type (notification_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Detailed user notification preferences';

-- =====================================================
-- FOREIGN KEY CONSTRAINTS
-- =====================================================
-- Add foreign key constraints (assuming users table exists)
ALTER TABLE notifications 
ADD CONSTRAINT fk_notifications_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE firebase_tokens 
ADD CONSTRAINT fk_firebase_tokens_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE notification_settings 
ADD CONSTRAINT fk_notification_settings_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE notification_preferences 
ADD CONSTRAINT fk_notification_preferences_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- =====================================================
-- INSERT DEFAULT NOTIFICATION TYPES
-- =====================================================
-- Insert default notification preferences for existing users
INSERT IGNORE INTO notification_preferences (user_id, notification_type, enabled, push_enabled, email_enabled)
SELECT u.id, 'LOGIN', TRUE, TRUE, FALSE FROM users u;

INSERT IGNORE INTO notification_preferences (user_id, notification_type, enabled, push_enabled, email_enabled)
SELECT u.id, 'DISPATCH', TRUE, TRUE, FALSE FROM users u;

INSERT IGNORE INTO notification_preferences (user_id, notification_type, enabled, push_enabled, email_enabled)
SELECT u.id, 'RETURN', TRUE, TRUE, FALSE FROM users u;

INSERT IGNORE INTO notification_preferences (user_id, notification_type, enabled, push_enabled, email_enabled)
SELECT u.id, 'DAMAGE', TRUE, TRUE, FALSE FROM users u;

INSERT IGNORE INTO notification_preferences (user_id, notification_type, enabled, push_enabled, email_enabled)
SELECT u.id, 'RECOVERY', TRUE, TRUE, FALSE FROM users u;

INSERT IGNORE INTO notification_preferences (user_id, notification_type, enabled, push_enabled, email_enabled)
SELECT u.id, 'INVENTORY', TRUE, TRUE, FALSE FROM users u;

INSERT IGNORE INTO notification_preferences (user_id, notification_type, enabled, push_enabled, email_enabled)
SELECT u.id, 'SYSTEM', TRUE, TRUE, FALSE FROM users u;

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================
-- Insert sample notifications for testing
INSERT INTO notifications (title, message, type, priority, user_id, data) VALUES
('🎉 Welcome to the System', 'Welcome to the inventory management system!', 'SYSTEM', 'low', NULL, '{"welcome": true}'),
('📦 Sample Dispatch', 'This is a sample dispatch notification', 'DISPATCH', 'medium', 1, '{"product": "Sample Product", "quantity": 5}'),
('↩️ Sample Return', 'This is a sample return notification', 'RETURN', 'medium', 1, '{"product": "Sample Product", "quantity": 2}');

-- =====================================================
-- USEFUL VIEWS FOR NOTIFICATION SYSTEM
-- =====================================================
-- View for user notifications with sender info
CREATE OR REPLACE VIEW user_notifications_view AS
SELECT 
    n.id,
    n.title,
    n.message,
    n.type,
    n.priority,
    n.user_id,
    n.related_entity_type,
    n.related_entity_id,
    n.data,
    n.is_read,
    n.read_at,
    n.expires_at,
    n.created_at,
    n.updated_at,
    u.name as user_name,
    u.email as user_email,
    CASE 
        WHEN JSON_EXTRACT(n.data, '$.user_name') IS NOT NULL 
        THEN JSON_UNQUOTE(JSON_EXTRACT(n.data, '$.user_name'))
        ELSE 'System'
    END as sender_name
FROM notifications n
LEFT JOIN users u ON n.user_id = u.id;

-- View for notification statistics
CREATE OR REPLACE VIEW notification_stats_view AS
SELECT 
    type,
    priority,
    COUNT(*) as total_count,
    SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread_count,
    SUM(CASE WHEN is_read = 1 THEN 1 ELSE 0 END) as read_count,
    AVG(CASE WHEN read_at IS NOT NULL THEN TIMESTAMPDIFF(MINUTE, created_at, read_at) END) as avg_read_time_minutes
FROM notifications
GROUP BY type, priority;

-- =====================================================
-- STORED PROCEDURES FOR COMMON OPERATIONS
-- =====================================================
DELIMITER //

-- Procedure to get user notifications with pagination
CREATE PROCEDURE GetUserNotifications(
    IN p_user_id INT,
    IN p_limit INT DEFAULT 20,
    IN p_offset INT DEFAULT 0
)
BEGIN
    SELECT 
        n.*,
        CASE 
            WHEN JSON_EXTRACT(n.data, '$.user_name') IS NOT NULL 
            THEN JSON_UNQUOTE(JSON_EXTRACT(n.data, '$.user_name'))
            ELSE 'System'
        END as sender_name
    FROM notifications n
    WHERE n.user_id = p_user_id OR n.user_id IS NULL
    ORDER BY n.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END //

-- Procedure to mark notification as read
CREATE PROCEDURE MarkNotificationAsRead(
    IN p_notification_id INT,
    IN p_user_id INT
)
BEGIN
    UPDATE notifications 
    SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
    WHERE id = p_notification_id AND (user_id = p_user_id OR user_id IS NULL);
    
    SELECT ROW_COUNT() as affected_rows;
END //

-- Procedure to clean up old notifications
CREATE PROCEDURE CleanupOldNotifications(
    IN p_days_old INT DEFAULT 30
)
BEGIN
    DELETE FROM notifications 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL p_days_old DAY)
    AND is_read = TRUE;
    
    SELECT ROW_COUNT() as deleted_count;
END //

DELIMITER ;

-- =====================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =====================================================
-- Additional composite indexes for common queries
CREATE INDEX idx_user_unread ON notifications (user_id, is_read, created_at);
CREATE INDEX idx_type_created ON notifications (type, created_at);
CREATE INDEX idx_priority_unread ON notifications (priority, is_read);

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
SELECT 'NOTIFICATION SYSTEM TABLES CREATED SUCCESSFULLY!' as status,
       'Tables: notifications, firebase_tokens, notification_settings, notification_preferences' as tables_created,
       'Views: user_notifications_view, notification_stats_view' as views_created,
       'Procedures: GetUserNotifications, MarkNotificationAsRead, CleanupOldNotifications' as procedures_created;