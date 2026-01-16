-- =====================================================
-- PERMISSIONS SYSTEM SETUP
-- =====================================================
-- This script creates:
-- 1. Users table with JWT support
-- 2. Roles table
-- 3. Permissions table
-- 4. Role-Permission mapping
-- 5. Admin user with full access
-- =====================================================

-- Drop existing tables if they exist (careful!)
-- DROP TABLE IF EXISTS user_permissions;
-- DROP TABLE IF EXISTS role_permissions;
-- DROP TABLE IF EXISTS permissions;
-- DROP TABLE IF EXISTS users;
-- DROP TABLE IF EXISTS roles;

-- 1. Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role_name (role_name),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2. Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    permission_name VARCHAR(100) NOT NULL UNIQUE,
    module VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_permission_name (permission_name),
    INDEX idx_module (module)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 3. Users table already exists, update it carefully
-- Add full_name column if it doesn't exist
SET @dbname = 'inventory_db';
SET @tablename = 'users';
SET @columnname = 'full_name';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(255) AFTER password')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add updated_at column if it doesn't exist
SET @columnname = 'updated_at';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER last_login')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 4. Create role_permissions mapping table
CREATE TABLE IF NOT EXISTS role_permissions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role_id INT UNSIGNED NOT NULL,
    permission_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_permission (role_id, permission_id),
    INDEX idx_role_id (role_id),
    INDEX idx_permission_id (permission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 5. Skip user_permissions table for now (can add later if needed)
-- CREATE TABLE IF NOT EXISTS user_permissions ...

-- =====================================================
-- INSERT DEFAULT DATA
-- =====================================================

-- Insert default roles
INSERT INTO roles (name, display_name, description) VALUES
('admin', 'Administrator', 'Full system access - can do everything'),
('manager', 'Manager', 'Manager access - can view and manage inventory'),
('warehouse_staff', 'Warehouse Staff', 'Warehouse staff - can manage inventory and dispatches'),
('viewer', 'Viewer', 'Read-only access - can only view data')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Insert permissions for all modules
INSERT INTO permissions (permission_name, module, action, description) VALUES
-- Dashboard
('dashboard.view', 'dashboard', 'view', 'View dashboard'),

-- Products
('products.view', 'products', 'view', 'View products'),
('products.create', 'products', 'create', 'Create new products'),
('products.edit', 'products', 'edit', 'Edit existing products'),
('products.delete', 'products', 'delete', 'Delete products'),

-- Inventory
('inventory.view', 'inventory', 'view', 'View inventory'),
('inventory.add', 'inventory', 'add', 'Add inventory stock'),
('inventory.adjust', 'inventory', 'adjust', 'Adjust inventory quantities'),
('inventory.bulk_upload', 'inventory', 'bulk_upload', 'Bulk upload inventory'),

-- Dispatch
('dispatch.view', 'dispatch', 'view', 'View dispatches'),
('dispatch.create', 'dispatch', 'create', 'Create new dispatch'),
('dispatch.edit', 'dispatch', 'edit', 'Edit dispatch details'),
('dispatch.delete', 'dispatch', 'delete', 'Delete dispatch'),
('dispatch.status_update', 'dispatch', 'status_update', 'Update dispatch status'),

-- Order Tracking
('orders.view', 'orders', 'view', 'View order tracking'),
('orders.timeline', 'orders', 'timeline', 'View order timeline'),
('orders.export', 'orders', 'export', 'Export order data'),

-- Self Transfer
('self_transfer.view', 'self_transfer', 'view', 'View self transfers'),
('self_transfer.create', 'self_transfer', 'create', 'Create self transfer'),

-- Damage Recovery
('damage.view', 'damage', 'view', 'View damage records'),
('damage.report', 'damage', 'report', 'Report damage'),
('damage.recover', 'damage', 'recover', 'Recover from damage'),

-- Returns
('returns.view', 'returns', 'view', 'View returns'),
('returns.process', 'returns', 'process', 'Process returns'),

-- Users & Permissions
('users.view', 'users', 'view', 'View users'),
('users.create', 'users', 'create', 'Create new users'),
('users.edit', 'users', 'edit', 'Edit user details'),
('users.delete', 'users', 'delete', 'Delete users'),
('permissions.manage', 'permissions', 'manage', 'Manage permissions')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Assign ALL permissions to admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE role_name = 'admin'),
    id
FROM permissions
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

-- Assign limited permissions to manager role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE role_name = 'manager'),
    id
FROM permissions
WHERE permission_name IN (
    'dashboard.view',
    'products.view', 'products.create', 'products.edit',
    'inventory.view', 'inventory.add', 'inventory.adjust', 'inventory.bulk_upload',
    'dispatch.view', 'dispatch.create', 'dispatch.edit', 'dispatch.status_update',
    'orders.view', 'orders.timeline', 'orders.export',
    'self_transfer.view', 'self_transfer.create',
    'damage.view', 'damage.report', 'damage.recover',
    'returns.view', 'returns.process'
)
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

-- Assign warehouse staff permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE role_name = 'warehouse_staff'),
    id
FROM permissions
WHERE permission_name IN (
    'dashboard.view',
    'products.view',
    'inventory.view', 'inventory.add', 'inventory.bulk_upload',
    'dispatch.view', 'dispatch.create', 'dispatch.status_update',
    'orders.view',
    'self_transfer.view', 'self_transfer.create',
    'damage.view', 'damage.report',
    'returns.view', 'returns.process'
)
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

-- Assign viewer permissions (read-only)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE role_name = 'viewer'),
    id
FROM permissions
WHERE permission_name IN (
    'dashboard.view',
    'products.view',
    'inventory.view',
    'dispatch.view',
    'orders.view', 'orders.timeline',
    'self_transfer.view',
    'damage.view',
    'returns.view'
)
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

-- =====================================================
-- CREATE ADMIN USER (Update existing or create new)
-- =====================================================
-- Password: Admin@123 (hashed with bcrypt)
-- You should change this password after first login!

INSERT INTO users (name, email, password, full_name, role_id, is_active)
VALUES (
    'admin',
    'admin@inventory.com',
    '$2b$10$rQZ5YJ5YJ5YJ5YJ5YJ5YJOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', -- This is placeholder, will be generated by backend
    'System Administrator',
    (SELECT id FROM roles WHERE role_name = 'admin'),
    TRUE
)
ON DUPLICATE KEY UPDATE 
    full_name = VALUES(full_name),
    role_id = VALUES(role_id),
    is_active = VALUES(is_active);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check roles
SELECT * FROM roles;

-- Check permissions count
SELECT module, COUNT(*) as permission_count 
FROM permissions 
GROUP BY module 
ORDER BY module;

-- Check admin permissions
SELECT 
    r.role_name,
    COUNT(rp.permission_id) as total_permissions
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
WHERE r.role_name = 'admin'
GROUP BY r.role_name;

-- Check admin user
SELECT 
    u.id,
    u.name as username,
    u.email,
    u.full_name,
    r.role_name,
    u.is_active,
    u.created_at
FROM users u
JOIN roles r ON u.role_id = r.id
WHERE u.name = 'admin' OR u.email = 'admin@inventory.com';

-- =====================================================
-- DONE!
-- =====================================================
