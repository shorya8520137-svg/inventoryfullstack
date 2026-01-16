-- Create Test Users with Different Permission Levels
-- This script creates various users to test the permissions system

USE inventory_db;

-- Insert test users with different roles
INSERT IGNORE INTO users (name, email, password, role_id, is_active, created_at, updated_at) VALUES
-- Manager User (role_id = 3)
('John Manager', 'manager@test.com', 'manager@123', 3, 1, NOW(), NOW()),

-- Operator User (role_id = 4) 
('Sarah Operator', 'operator@test.com', 'operator@123', 4, 1, NOW(), NOW()),

-- Warehouse Staff (role_id = 5)
('Mike Warehouse', 'warehouse@test.com', 'warehouse@123', 5, 1, NOW(), NOW()),

-- Viewer User (role_id = 6)
('Lisa Viewer', 'viewer@test.com', 'viewer@123', 6, 1, NOW(), NOW()),

-- Custom Limited User (create new role)
('Tom Limited', 'limited@test.com', 'limited@123', 6, 1, NOW(), NOW());

-- Create a custom limited role for testing
INSERT IGNORE INTO roles (name, display_name, description, color, priority, is_active, created_at, updated_at) VALUES
('limited_user', 'Limited User', 'User with very limited permissions for testing', '#9ca3af', 7, 1, NOW(), NOW());

-- Get the limited role ID and assign limited permissions
SET @limited_role_id = (SELECT id FROM roles WHERE name = 'limited_user' LIMIT 1);

-- Assign only basic permissions to limited user
INSERT IGNORE INTO role_permissions (role_id, permission_id) 
SELECT @limited_role_id, id FROM permissions WHERE name IN (
    'DASHBOARD_VIEW',
    'PRODUCTS_VIEW',
    'INVENTORY_VIEW'
);

-- Update Tom Limited to use the limited role
UPDATE users SET role_id = @limited_role_id WHERE email = 'limited@test.com';

-- Show created users
SELECT 
    u.id,
    u.name,
    u.email,
    r.name as role_name,
    r.display_name as role_display_name,
    COUNT(rp.permission_id) as permission_count
FROM users u
JOIN roles r ON u.role_id = r.id
LEFT JOIN role_permissions rp ON r.id = rp.role_id
WHERE u.email LIKE '%@test.com' OR u.email = 'admin@company.com'
GROUP BY u.id, u.name, u.email, r.name, r.display_name
ORDER BY permission_count DESC;

SELECT 'Test users created successfully!' as status;