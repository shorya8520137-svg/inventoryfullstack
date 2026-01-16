-- Check admin user's current permissions
SELECT u.id, u.email, u.role_id, r.role_name, 
       GROUP_CONCAT(p.permission_name) as permissions
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
WHERE u.email = 'admin@company.com'
GROUP BY u.id, u.email, u.role_id, r.role_name;

-- Grant all permissions to admin role (role_id = 1)
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;

-- Verify permissions were granted
SELECT r.role_name, COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
WHERE r.id = 1
GROUP BY r.role_name;
