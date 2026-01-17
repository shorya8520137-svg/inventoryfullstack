-- ===============================================
-- NOTIFICATION SYSTEM DATABASE SCHEMA
-- ===============================================

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('dispatch', 'return', 'status_change', 'data_insert', 'user_login', 'user_logout', 'inventory', 'order', 'product', 'system') NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    user_id INT NULL, -- NULL means notification for all users
    related_entity_type VARCHAR(50) NULL, -- 'order', 'product', 'dispatch', etc.
    related_entity_id INT NULL, -- ID of the related entity
    data JSON NULL, -- Additional data for the notification
    is_read BOOLEAN DEFAULT FALSE,
    is_sent BOOLEAN DEFAULT FALSE, -- For Firebase push notifications
    firebase_message_id VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at),
    INDEX idx_is_read (is_read),
    INDEX idx_related_entity (related_entity_type, related_entity_id)
);

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    email_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_type (user_id, notification_type),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create firebase tokens table for push notifications
CREATE TABLE IF NOT EXISTS firebase_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(500) NOT NULL,
    device_type ENUM('web', 'android', 'ios') DEFAULT 'web',
    device_info JSON NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_token (user_id, token),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_active (is_active)
);

-- Insert default notification preferences for admin user
INSERT IGNORE INTO notification_preferences (user_id, notification_type, enabled, push_enabled) VALUES
(1, 'dispatch', TRUE, TRUE),
(1, 'return', TRUE, TRUE),
(1, 'status_change', TRUE, TRUE),
(1, 'data_insert', TRUE, TRUE),
(1, 'user_login', TRUE, TRUE),
(1, 'user_logout', TRUE, TRUE),
(1, 'inventory', TRUE, TRUE),
(1, 'order', TRUE, TRUE),
(1, 'product', TRUE, TRUE),
(1, 'system', TRUE, TRUE);

-- Create sample notifications for testing
INSERT INTO notifications (title, message, type, priority, user_id, related_entity_type, related_entity_id, data) VALUES
('System Started', 'Notification system has been initialized successfully', 'system', 'medium', NULL, 'system', 1, '{"event": "system_init"}'),
('Welcome Admin', 'Admin user logged in successfully', 'user_login', 'low', 1, 'user', 1, '{"user_email": "admin@company.com"}');

-- Show created tables
SELECT 'NOTIFICATIONS SYSTEM CREATED SUCCESSFULLY' as status;
SELECT COUNT(*) as notification_count FROM notifications;
SELECT COUNT(*) as preference_count FROM notification_preferences;
SELECT COUNT(*) as token_count FROM firebase_tokens;