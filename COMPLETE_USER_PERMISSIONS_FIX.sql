-- COMPLETE USER PERMISSIONS FIX
-- This ensures thems@company.com has all necessary permissions for products API

USE inventory_db;

-- 1. First, let's see what's in the database currently
SELECT 'CURRENT DATABASE STATE:' as info;

SELECT 'Users table:' as table_name;
SELECT id, name, email, role_id, role FROM users LIMIT 5;

SELECT 'Roles table:' as table_name;
SELECT * FROM roles;

SELECT 'Permissions table:' as table_name;
SELECT COUNT(*) as permission_count FROM permissions;

SELECT 'Role_permissions table:' as table_name;
SELECT COUNT(*) as mapping_count FROM role_permissions;

-- 2. Ensure permissions table exists and has basic permissions
CREATE TABLE IF NOT EXISTS permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Ensure roles table exists
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    color VARCHAR(20) DEFAULT '#6b7280',
    priority INT DEFAULT 999,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Ensure role_permissions table exists
CREATE TABLE IF NOT EXISTS role_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_role_permission (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- 5. Insert basic permissions (safe with ON DUPLICATE KEY UPDATE)
INSERT INTO permissions (name, display_name, category) VALUES
('products.view', 'View Products', 'PRODUCTS'),
('products.create', 'Create Products', 'PRODUCTS'),
('products.edit', 'Edit Products', 'PRODUCTS'),
('products.delete', 'Delete Products', 'PRODUCTS'),
('inventory.view', 'View Inventory', 'INVENTORY'),
('inventory.transfer', 'Transfer Inventory', 'INVENTORY'),
('operations.basic', 'Basic Operations', 'OPERATIONS')
ON DUPLICATE KEY UPDATE 
display_name = VALUES(display_name),
category = VALUES(category);

-- 6. Insert basic roles (safe with ON DUPLICATE KEY UPDATE)
INSERT INTO roles (id, name, display_name, color, priority) VALUES
(1, 'super_admin', 'Super Administrator', '#dc2626', 1),
(2, 'admin', 'Administrator', '#ea580c', 2),
(3, 'user', 'Regular User', '#16a34a', 3),
(4, 'viewer', 'Viewer', '#6b7280', 4)
ON DUPLICATE KEY UPDATE 
display_name = VALUES(display_name),
color = VALUES(color),
priority = VALUES(priority);

-- 7. Give admin user super_admin role
UPDATE users 
SET role_id = 1, role = 'super_admin'
WHERE email = 'admin@company.com';

-- 8. Give thems user regular user role with good permissions
UPDATE users 
SET role_id = 3, role = 'user'
WHERE email = 'thems@company.com';

-- 9. Clear and set role permissions
DELETE FROM role_permissions WHERE role_id IN (1, 2, 3, 4);

-- Super admin gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;

-- Admin gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, id FROM permissions;

-- Regular user gets basic permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions WHERE 
name IN ('products.view', 'products.create', 'products.edit', 'inventory.view', 'inventory.transfer', 'operations.basic');

-- Viewer gets only view permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 4, id FROM permissions WHERE 
name IN ('products.view', 'inventory.view');

-- 10. Verify the fix
SELECT 'VERIFICATION - THEMS USER:' as info;
SELECT u.id, u.name, u.email, u.role_id, u.role, r.display_name as role_display_name
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
WHERE u.email = 'thems@company.com';

SELECT 'VERIFICATION - THEMS PERMISSIONS:' as info;
SELECT p.name, p.display_name, p.category
FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
JOIN roles r ON rp.role_id = r.id
JOIN users u ON u.role_id = r.id
WHERE u.email = 'thems@company.com'
ORDER BY p.category, p.name;

SELECT 'VERIFICATION - ADMIN USER:' as info;
SELECT u.id, u.name, u.email, u.role_id, u.role, r.display_name as role_display_name
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
WHERE u.email = 'admin@company.com';

-- 11. Test the permission check query that middleware uses
SELECT 'PERMISSION CHECK TEST FOR THEMS:' as info;
SELECT 
    'thems@company.com' as user_email,
    u.role_id,
    'products.view' as checking_permission,
    CASE 
        WHEN COUNT(p.id) > 0 THEN 'PERMISSION GRANTED' 
        ELSE 'PERMISSION DENIED' 
    END as result
FROM users u
JOIN role_permissions rp ON u.role_id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.email = 'thems@company.com' 
AND p.name = 'products.view';

SELECT 'DONE - PERMISSIONS FIXED!' as status;