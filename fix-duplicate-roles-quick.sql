-- QUICK FIX FOR DUPLICATE ROLES ISSUE
-- Remove duplicate roles and clean up the roles table

-- Step 1: Check current roles
SELECT 'Current roles in database:' as status;
SELECT id, name, display_name, description FROM roles;

-- Step 2: Delete duplicate/test roles (keep only the essential ones)
DELETE FROM role_permissions WHERE role_id IN (
    SELECT id FROM roles WHERE name LIKE '%customer support%' OR name LIKE '%test%' OR name LIKE '%Hunyhuny%'
);

DELETE FROM roles WHERE name LIKE '%customer support%' OR name LIKE '%test%' OR name LIKE '%Hunyhuny%';

-- Step 3: Clean up any roles with trailing spaces or weird names
UPDATE roles SET name = TRIM(name), display_name = TRIM(display_name) WHERE name != TRIM(name) OR display_name != TRIM(display_name);

-- Step 4: Verify clean roles table
SELECT 'Cleaned roles table:' as status;
SELECT id, name, display_name, description FROM roles ORDER BY id;

-- Step 5: Make sure admin role has all permissions
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions WHERE is_active = true;

SELECT 'Admin role permissions count:' as status;
SELECT COUNT(*) as permission_count FROM role_permissions WHERE role_id = 1;