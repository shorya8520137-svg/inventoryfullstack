-- RESET PERMISSIONS SYSTEM - START FROM SCRATCH
-- Run this on server: ssh to server, then sudo mysql

USE inventory_db;

-- 1. BACKUP ADMIN USER FIRST
CREATE TEMPORARY TABLE temp_admin AS 
SELECT * FROM users WHERE email = 'admin@company.com' LIMIT 1;

-- 2. CLEAN UP ALL TABLES
DELETE FROM audit_logs;
DELETE FROM role_permissions;
DELETE FROM users WHERE email != 'admin@company.com';
DELETE FROM roles;
DELETE FROM permissions;

-- 3. CREATE CLEAN PERMISSIONS (SIMPLE SET)
INSERT INTO permissions (id, name, display_name, category, description, is_active) VALUES
(1, 'products.view', 'View Products', 'products', 'View products list and details', 1),
(2, 'products.create', 'Create Products', 'products', 'Create new products', 1),
(3, 'products.edit', 'Edit Products', 'products', 'Edit existing products', 1),
(4, 'products.delete', 'Delete Products', 'products', 'Delete products', 1),

(5, 'inventory.view', 'View Inventory', 'inventory', 'View inventory data', 1),
(6, 'inventory.edit', 'Edit Inventory', 'inventory', 'Edit inventory quantities', 1),

(7, 'orders.view', 'View Orders', 'orders', 'View orders list', 1),
(8, 'orders.create', 'Create Orders', 'orders', 'Create new orders', 1),
(9, 'orders.edit', 'Edit Orders', 'orders', 'Edit existing orders', 1),

(10, 'operations.dispatch', 'Dispatch Operations', 'operations', 'Handle dispatch operations', 1),
(11, 'operations.damage', 'Damage Operations', 'operations', 'Handle damage operations', 1),
(12, 'operations.return', 'Return Operations', 'operations', 'Handle return operations', 1),
(13, 'operations.bulk', 'Bulk Operations', 'operations', 'Handle bulk upload operations', 1),
(14, 'operations.self_transfer', 'Self Transfer', 'operations', 'Handle self transfer operations', 1),

(15, 'system.user_management', 'User Management', 'system', 'Manage users', 1),
(16, 'system.role_management', 'Role Management', 'system', 'Manage roles and permissions', 1),
(17, 'system.audit_log', 'Audit Log', 'system', 'View audit logs', 1);

-- 4. CREATE CLEAN ROLES
INSERT INTO roles (id, name, display_name, description, color, priority, is_active) VALUES
(1, 'super_admin', 'Super Admin', 'Full system access', '#dc2626', 1, 1),
(2, 'admin', 'Admin', 'Administrative access', '#ea580c', 2, 1),
(3, 'manager', 'Manager', 'Management access', '#2563eb', 3, 1),
(4, 'staff', 'Staff', 'Basic staff access', '#7c3aed', 4, 1),
(5, 'viewer', 'Viewer', 'Read-only access', '#64748b', 5, 1);

-- 5. ASSIGN PERMISSIONS TO ROLES

-- Super Admin - ALL permissions
INSERT INTO role_permissions (role_id, permission_id) 
SELECT 1, id FROM permissions WHERE is_active = 1;

-- Admin - All except user/role management
INSERT INTO role_permissions (role_id, permission_id) VALUES
(2, 1), (2, 2), (2, 3), (2, 4),  -- products
(2, 5), (2, 6),                   -- inventory  
(2, 7), (2, 8), (2, 9),          -- orders
(2, 10), (2, 11), (2, 12), (2, 13), (2, 14), -- operations
(2, 17);                          -- audit log only

-- Manager - View/Create/Edit only
INSERT INTO role_permissions (role_id, permission_id) VALUES
(3, 1), (3, 2), (3, 3),          -- products view/create/edit
(3, 5), (3, 6),                  -- inventory
(3, 7), (3, 8), (3, 9),          -- orders
(3, 10), (3, 11), (3, 12);       -- some operations

-- Staff - Basic operations
INSERT INTO role_permissions (role_id, permission_id) VALUES
(4, 1),                           -- products view only
(4, 5), (4, 6),                  -- inventory
(4, 7), (4, 8),                  -- orders view/create
(4, 10);                         -- dispatch only

-- Viewer - Read only
INSERT INTO role_permissions (role_id, permission_id) VALUES
(5, 1),                           -- products view
(5, 5),                           -- inventory view
(5, 7);                           -- orders view

-- 6. FIX ADMIN USER
UPDATE users SET 
    role_id = 1,
    role = 'super_admin',
    password_hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
    is_active = 1
WHERE email = 'admin@company.com';

-- 7. VERIFY SETUP
SELECT 'ROLES CREATED:' as info;
SELECT id, name, display_name, priority FROM roles ORDER BY priority;

SELECT 'PERMISSIONS CREATED:' as info;
SELECT id, name, display_name, category FROM permissions ORDER BY category, id;

SELECT 'ADMIN USER:' as info;
SELECT id, name, email, role_id, role FROM users WHERE email = 'admin@company.com';

SELECT 'ADMIN PERMISSIONS:' as info;
SELECT p.name, p.display_name 
FROM permissions p 
JOIN role_permissions rp ON p.id = rp.permission_id 
WHERE rp.role_id = 1 
ORDER BY p.category, p.name;

SELECT 'SETUP COMPLETE!' as status;