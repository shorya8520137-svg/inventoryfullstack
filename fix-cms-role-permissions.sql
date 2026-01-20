-- Fix cms-hunyhunyprmession role permissions
-- The role exists but has 0 permissions, so we need to assign them

-- First, get the role ID
SELECT id, name, display_name FROM roles WHERE name = 'cms-hunyhunyprmession';

-- Delete any existing permissions for this role (in case there are conflicts)
DELETE FROM role_permissions WHERE role_id = (SELECT id FROM roles WHERE name = 'cms-hunyhunyprmession');

-- Add the correct permissions to cms-hunyhunyprmession role
-- Based on our analysis, these are the correct permission IDs:
INSERT INTO role_permissions (role_id, permission_id, created_at)
SELECT 
    (SELECT id FROM roles WHERE name = 'cms-hunyhunyprmession') as role_id,
    p.id as permission_id,
    NOW() as created_at
FROM permissions p 
WHERE p.name IN (
    'inventory.view',      -- ID: 190
    'orders.view',         -- ID: 196
    'operations.dispatch', -- ID: 202
    'orders.status_update',-- ID: 200
    'products.view'        -- ID: 182
);

-- Verify the permissions were added
SELECT 
    r.name as role_name,
    r.display_name as role_display_name,
    p.name as permission_name,
    p.display_name as permission_display_name,
    p.category,
    rp.created_at
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'cms-hunyhunyprmession'
ORDER BY p.category, p.name;

-- Show role summary
SELECT 
    r.id,
    r.name,
    r.display_name,
    r.description,
    COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
WHERE r.name = 'cms-hunyhunyprmession'
GROUP BY r.id, r.name, r.display_name, r.description;