-- Grant ALL permissions to admin role (role_id = 1)
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions WHERE is_active = 1;

-- Verify the grant
SELECT COUNT(*) as total_permissions_after_grant
FROM role_permissions
WHERE role_id = 1;

-- Show that admin now has user management permissions
SELECT p.name, p.display_name
FROM role_permissions rp
JOIN permissions p ON rp.permission_id = p.id
WHERE rp.role_id = 1
AND p.name LIKE 'users.%'
ORDER BY p.name;
