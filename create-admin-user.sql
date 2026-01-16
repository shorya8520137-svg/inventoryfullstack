-- Create Admin User for JWT Authentication
-- This script creates an admin user with full permissions

USE inventory_db;

-- Insert admin user (if not exists)
INSERT IGNORE INTO users (name, email, password, role_id, is_active, created_at, updated_at)
VALUES (
    'System Administrator',
    'admin@company.com',
    'admin@123',  -- Plain text password for demo (should be hashed in production)
    1,  -- Admin role ID
    1,  -- Active
    NOW(),
    NOW()
);

-- Verify user was created
SELECT 
    u.id,
    u.name,
    u.email,
    u.is_active,
    r.name as role_name,
    r.display_name as role_display_name
FROM users u
JOIN roles r ON u.role_id = r.id
WHERE u.email = 'admin@company.com';

-- Show admin permissions count
SELECT 
    r.name as role_name,
    COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
WHERE r.name = 'admin'
GROUP BY r.id;

-- Show all permissions for admin role
SELECT 
    p.category,
    p.name,
    p.display_name
FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
JOIN roles r ON rp.role_id = r.id
WHERE r.name = 'admin'
ORDER BY p.category, p.name;

SELECT 'Admin user created successfully!' as status;