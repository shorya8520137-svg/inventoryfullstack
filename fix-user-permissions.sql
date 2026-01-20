-- COMPLETE FIX FOR USER PERMISSIONS ISSUE
-- Admin works, regular users get 403 - this fixes the permissions system

USE inventory_db;

-- 1. Create permissions table with EXACT route permission names
CREATE TABLE IF NOT EXISTS permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    color VARCHAR(20) DEFAULT '#6b7280',
    priority INT DEFAULT 999,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create role_permissions table
CREATE TABLE IF NOT EXISTS role_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_role_permission (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- 4. Insert permissions that EXACTLY match your route checkPermission() calls
INSERT INTO permissions (name, display_name, category) VALUES
-- Products permissions (from productRoutes.js)
('products.view', 'View Products', 'PRODUCTS'),
('products.create', 'Create Products', 'PRODUCTS'),
('products.edit', 'Edit Products', 'PRODUCTS'),
('products.delete', 'Delete Products', 'PRODUCTS'),
('products.categories', 'Manage Categories', 'PRODUCTS'),
('products.bulk_import', 'Bulk Import Products', 'PRODUCTS'),

-- Inventory permissions (from productRoutes.js)
('inventory.view', 'View Inventory', 'INVENTORY'),
('inventory.export', 'Export Inventory', 'INVENTORY'),
('inventory.transfer', 'Transfer Inventory', 'INVENTORY'),
('inventory.timeline', 'View Timeline', 'INVENTORY'),

-- Operations permissions (from various routes)
('operations.return', 'Manage Returns', 'OPERATIONS'),
('operations.bulk', 'Bulk Operations', 'OPERATIONS'),
('operations.self_transfer', 'Self Transfer', 'OPERATIONS'),

-- System permissions (from permissionsRoutes.js)
('SYSTEM_USER_MANAGEMENT', 'User Management', 'SYSTEM'),
('SYSTEM_ROLE_MANAGEMENT', 'Role Management', 'SYSTEM'),
('SYSTEM_AUDIT_LOG', 'Audit Logs', 'SYSTEM'),
('SYSTEM_MONITORING', 'System Monitoring', 'SYSTEM')
ON DUPLICATE KEY UPDATE 
display_name = VALUES(display_name),
category = VALUES(category);

-- 5. Insert roles
INSERT INTO roles (id, name, display_name, color, priority) VALUES
(1, 'super_admin', 'Super Administrator', '#dc2626', 1),
(2, 'admin', 'Administrator', '#ea580c', 2),
(3, 'manager', 'Manager', '#ca8a04', 3),
(4, 'operator', 'Operator', '#16a34a', 4),
(5, 'warehouse', 'Warehouse Staff', '#2563eb', 5),
(6, 'viewer', 'Viewer', '#6b7280', 6)
ON DUPLICATE KEY UPDATE 
display_name = VALUES(display_name),
color = VALUES(color),
priority = VALUES(priority);

-- 6. Clear existing role_permissions mappings
DELETE FROM role_permissions;

-- 7. Super Admin (role_id = 1) - ALL permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;

-- 8. Admin (role_id = 2) - All except system management
INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, id FROM permissions WHERE category != 'SYSTEM';

-- 9. Manager (role_id = 3) - View and basic operations
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions WHERE 
name IN ('products.view', 'inventory.view', 'inventory.export', 'inventory.timeline', 'operations.return', 'inventory.transfer');

-- 10. Operator (role_id = 4) - Basic operational permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 4, id FROM permissions WHERE 
name IN ('products.view', 'inventory.view', 'inventory.transfer', 'operations.return');

-- 11. Warehouse (role_id = 5) - Inventory focused
INSERT INTO role_permissions (role_id, permission_id)
SELECT 5, id FROM permissions WHERE 
category = 'INVENTORY' OR name = 'products.view' OR name = 'operations.self_transfer';

-- 12. Viewer (role_id = 6) - Only view permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 6, id FROM permissions WHERE 
name IN ('products.view', 'inventory.view');

-- 13. Fix user role assignments
-- Set admin user to super_admin role (role_id = 1)
UPDATE users 
SET role_id = 1, role = 'super_admin'
WHERE email = 'admin@company.com' OR name = 'System Administrator';

-- Set test users to manager role (role_id = 3) for testing
UPDATE users 
SET role_id = 3, role = 'manager'
WHERE email LIKE '%test%' AND email != 'admin@company.com';

-- Set any remaining users without valid role_id to viewer
UPDATE users u
LEFT JOIN roles r ON u.role_id = r.id
SET u.role_id = 6, u.role = 'viewer'
WHERE r.id IS NULL OR u.role_id IS NULL;

-- 14. Show results
SELECT 'PERMISSIONS CREATED:' as status;
SELECT COUNT(*) as permission_count FROM permissions;

SELECT 'ROLES CREATED:' as status;
SELECT COUNT(*) as role_count FROM roles;

SELECT 'ROLE-PERMISSION MAPPINGS:' as status;
SELECT r.name as role_name, COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.id, r.name
ORDER BY r.priority;

SELECT 'USER ROLE ASSIGNMENTS:' as status;
SELECT u.name, u.email, r.name as role_name, COUNT(rp.permission_id) as permission_count
FROM users u
JOIN roles r ON u.role_id = r.id
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY u.id, u.name, u.email, r.name
ORDER BY r.priority
LIMIT 10;