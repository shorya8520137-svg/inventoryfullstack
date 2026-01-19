-- Create cms-hunyhunyprmession role with correct permissions
-- This script adds the role and assigns the required permissions

-- Step 1: Create the role
INSERT INTO roles (name, display_name, description, color, priority, is_active, created_at)
VALUES (
    'cms-hunyhunyprmession',
    'CMS Huny Huny Permission', 
    'Custom CMS role with inventory view, orders view, dispatch operations, and status update permissions',
    '#6b7280',
    50,
    1,
    NOW()
);

-- Get the role ID (will be the last inserted ID)
SET @role_id = LAST_INSERT_ID();

-- Step 2: Assign permissions to the role
-- Based on the analysis, these are the correct permission IDs:
-- inventory.view (ID: 190)
-- orders.view (ID: 196) 
-- operations.dispatch (ID: 202)
-- orders.status_update (ID: 200)
-- products.view (ID: 182)

INSERT INTO role_permissions (role_id, permission_id, created_at)
VALUES 
    (@role_id, 190, NOW()), -- inventory.view
    (@role_id, 196, NOW()), -- orders.view
    (@role_id, 202, NOW()), -- operations.dispatch
    (@role_id, 200, NOW()), -- orders.status_update
    (@role_id, 182, NOW()); -- products.view

-- Step 3: Verify the role was created
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

-- Step 4: Show the permissions assigned to this role
SELECT 
    r.name as role_name,
    p.name as permission_name,
    p.display_name as permission_display_name,
    p.category
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'cms-hunyhunyprmession'
ORDER BY p.category, p.name;