-- Grant ALL permissions to admin role (role_id = 1)
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;

-- Verify
SELECT COUNT(*) as total_permissions_granted FROM role_permissions WHERE role_id = 1;
