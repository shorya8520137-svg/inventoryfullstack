-- =====================================================
-- SIMPLE PERMISSIONS SETUP (Works with existing tables)
-- =====================================================

-- 1. Create permissions table
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

-- 2. Create role_permissions mapping table
CREATE TABLE IF NOT EXISTS role_permissions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    permission_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_permission (role_id, permission_id),
    INDEX idx_role_id (role_id),
    INDEX idx_permission_id (permission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 3. Insert permissions
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

-- 4. Get admin role ID
SET @admin_role_id = (SELECT id FROM roles WHERE name = 'admin' LIMIT 1);

-- 5. Assign ALL permissions to admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT @admin_role_id, id FROM permissions
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

-- 6. Verification
SELECT 'Permissions created:' as status, COUNT(*) as count FROM permissions;
SELECT 'Admin permissions:' as status, COUNT(*) as count FROM role_permissions WHERE role_id = @admin_role_id;
SELECT 'Admin role ID:' as status, @admin_role_id as value;

SELECT '✅ Setup completed!' as status;
