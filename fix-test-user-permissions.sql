-- Fix test user permissions - Grant inventory access to test role
-- The test user has roleId: 37, userRole: 'test'

-- First, let's check what permissions exist
SELECT id, name, description FROM permissions WHERE name LIKE '%inventory%' OR name LIKE '%view%';

-- Check current role permissions for test role (roleId: 37)
SELECT rp.*, p.name as permission_name, p.description 
FROM role_permissions rp 
JOIN permissions p ON rp.permission_id = p.id 
WHERE rp.role_id = 37;

-- Grant inventory.view permission to test role (roleId: 37)
INSERT IGNORE INTO role_permissions (role_id, permission_id) 
SELECT 37, id FROM permissions WHERE name = 'inventory.view';

-- Grant products.view permission to test role (roleId: 37)
INSERT IGNORE INTO role_permissions (role_id, permission_id) 
SELECT 37, id FROM permissions WHERE name = 'products.view';

-- Grant basic view permissions to test role
INSERT IGNORE INTO role_permissions (role_id, permission_id) 
SELECT 37, id FROM permissions WHERE name IN (
    'inventory.view',
    'products.view',
    'orders.view',
    'dispatch.view',
    'returns.view'
);

-- Verify the permissions were added
SELECT rp.*, p.name as permission_name, p.description 
FROM role_permissions rp 
JOIN permissions p ON rp.permission_id = p.id 
WHERE rp.role_id = 37
ORDER BY p.name;