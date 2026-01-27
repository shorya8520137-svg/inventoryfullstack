-- CREATE NOTIFICATION SYSTEM TABLES
-- Run this on the server: sudo mysql inventory_db < create-notification-tables.sql

USE inventory_db;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('LOGIN', 'DISPATCH', 'RETURN', 'DAMAGE', 'PRODUCT', 'INVENTORY', 'SYSTEM') NOT NULL,
    event_data JSON,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at),
    INDEX idx_is_read (is_read)
);

-- Create firebase_tokens table for push notifications
CREATE TABLE IF NOT EXISTS firebase_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(500) NOT NULL,
    device_type ENUM('web', 'android', 'ios') DEFAULT 'web',
    device_info JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_token (user_id, token),
    INDEX idx_user_id (user_id),
    INDEX idx_is_active (is_active)
);

-- Create notification_settings table for user preferences
CREATE TABLE IF NOT EXISTS notification_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    login_notifications BOOLEAN DEFAULT TRUE,
    dispatch_notifications BOOLEAN DEFAULT TRUE,
    return_notifications BOOLEAN DEFAULT TRUE,
    damage_notifications BOOLEAN DEFAULT TRUE,
    product_notifications BOOLEAN DEFAULT TRUE,
    inventory_notifications BOOLEAN DEFAULT TRUE,
    system_notifications BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    email_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_settings (user_id)
);

-- Show created tables
SHOW TABLES LIKE '%notification%';
SHOW TABLES LIKE '%firebase%';

-- Show table structures
DESCRIBE notifications;
DESCRIBE firebase_tokens;
DESCRIBE notification_settings;

SELECT 'Notification system tables created successfully!' as result;