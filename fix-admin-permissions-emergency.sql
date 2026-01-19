-- 🚨 EMERGENCY: Fix admin permissions showing 0
-- Grant ALL permissions to admin and super_admin roles

-- First, let's see what admin roles exist
SELECT id, name, display_name FROM roles WHERE name IN ('admin', 'super_admin');

-- Get all available permissions
SELECT COUNT(*) as total_permissions FROM permissions;

-- Check current admin permissions
SELECT 
    r.name as role_name,
    COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
WHERE r.name IN ('admin', 'super_admin')
GROUP BY r.id, r.name;

-- 🔥 EMERGENCY FIX: Grant ALL permissions to admin roles
-- Delete existing admin role permissions first
DELETE FROM role_permissions WHERE role_id IN (
    SELECT id FROM roles WHERE name IN ('admin', 'super_admin')
);

-- Grant ALL permissions to admin role (assuming role_id = 1)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions
WHERE NOT EXISTS (
    SELECT 1 FROM role_permissions 
    WHERE role_id = 1 AND permission_id = permissions.id
);

-- Grant ALL permissions to super_admin role if it exists (assuming role_id = 2)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, id FROM permissions
WHERE EXISTS (SELECT 1 FROM roles WHERE id = 2 AND name = 'super_admin')
AND NOT EXISTS (
    SELECT 1 FROM role_permissions 
    WHERE role_id = 2 AND permission_id = permissions.id
);

-- Verify admin now has permissions
SELECT 
    r.name as role_name,
    COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
WHERE r.name IN ('admin', 'super_admin')
GROUP BY r.id, r.name;

-- Show admin user details
SELECT 
    u.id,
    u.name,
    u.email,
    u.role_id,
    r.name as role_name
FROM users u
JOIN roles r ON u.role_id = r.id
WHERE u.email = 'admin@company.com';