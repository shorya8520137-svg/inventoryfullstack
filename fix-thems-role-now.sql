-- FIX THEMS USER ROLE - GIVE PROPER PERMISSIONS
USE inventory_db;

-- 1. Show current problem
SELECT 'CURRENT PROBLEM:' as info;
SELECT u.email, u.role_id, u.role, 
       CASE WHEN r.id IS NULL THEN 'ROLE DOES NOT EXIST' ELSE 'ROLE EXISTS' END as role_status
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
WHERE u.email = 'thems@company.com';

-- 2. Check what roles are available
SELECT 'AVAILABLE ROLES:' as info;
SELECT id, name, display_name FROM roles ORDER BY id;

-- 3. Create a proper role if needed (role_id = 2 for regular users)
INSERT INTO roles (id, name, display_name, color, priority) VALUES
(2, 'user', 'Regular User', '#16a34a', 2)
ON DUPLICATE KEY UPDATE 
display_name = VALUES(display_name);

-- 4. Give thems user the proper role (role_id = 2)
UPDATE users 
SET role_id = 2, role = 'user'
WHERE email = 'thems@company.com';

-- 5. Make sure role_id = 2 has the necessary permissions
-- Clear existing permissions for role 2
DELETE FROM role_permissions WHERE role_id = 2;

-- Give role 2 all the basic permissions needed
INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, id FROM permissions WHERE name IN (
    'products.view',
    'products.create', 
    'products.edit',
    'products.categories',
    'inventory.view',
    'inventory.transfer',
    'orders.view',
    'orders.create',
    'operations.dispatch'
);

-- 6. Verify the fix
SELECT 'AFTER FIX - THEMS USER:' as info;
SELECT u.id, u.name, u.email, u.role_id, u.role, r.display_name as role_display_name
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
WHERE u.email = 'thems@company.com';

-- 7. Show thems permissions now
SELECT 'THEMS PERMISSIONS NOW:' as info;
SELECT p.name, p.display_name, p.category
FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
JOIN users u ON u.role_id = rp.role_id
WHERE u.email = 'thems@company.com'
ORDER BY p.category, p.name;

-- 8. Test the permission check
SELECT 'PERMISSION CHECK TEST:' as info;
SELECT 
    'products.view' as checking_permission,
    COUNT(*) as permission_count,
    CASE 
        WHEN COUNT(*) > 0 THEN 'SUCCESS - 403 ERROR SHOULD BE FIXED' 
        ELSE 'STILL FAILING' 
    END as result
FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
JOIN users u ON u.role_id = rp.role_id
WHERE u.email = 'thems@company.com' AND p.name = 'products.view';

SELECT 'FIX COMPLETED!' as status;