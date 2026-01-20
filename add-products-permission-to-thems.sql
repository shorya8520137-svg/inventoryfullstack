-- ADD PRODUCTS.VIEW PERMISSION TO THEMS USER (ROLE 36)
USE inventory_db;

-- 1. Show current problem
SELECT 'CURRENT ISSUE:' as info;
SELECT 'Thems user has role 36 but NO products.view permission' as problem;

-- 2. Find the products.view permission ID
SELECT 'PRODUCTS.VIEW PERMISSION:' as info;
SELECT id, name, display_name FROM permissions WHERE name = 'products.view';

-- 3. Add products.view permission to role 36
INSERT INTO role_permissions (role_id, permission_id)
SELECT 36, id FROM permissions WHERE name = 'products.view'
AND NOT EXISTS (
    SELECT 1 FROM role_permissions 
    WHERE role_id = 36 AND permission_id = (SELECT id FROM permissions WHERE name = 'products.view')
);

-- 4. Also add products.categories permission (for categories API)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 36, id FROM permissions WHERE name = 'products.categories'
AND NOT EXISTS (
    SELECT 1 FROM role_permissions 
    WHERE role_id = 36 AND permission_id = (SELECT id FROM permissions WHERE name = 'products.categories')
);

-- 5. Verify the fix
SELECT 'AFTER FIX - THEMS PERMISSIONS:' as info;
SELECT p.name, p.display_name, p.category
FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
WHERE rp.role_id = 36
ORDER BY p.category, p.name;

-- 6. Test the permission check that was failing
SELECT 'PERMISSION CHECK TEST:' as info;
SELECT 
    'products.view' as checking_permission,
    COUNT(*) as permission_count,
    CASE 
        WHEN COUNT(*) > 0 THEN 'SUCCESS - 403 ERROR SHOULD BE FIXED!' 
        ELSE 'STILL FAILING' 
    END as result
FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
WHERE rp.role_id = 36 AND p.name = 'products.view';

-- 7. Test categories permission too
SELECT 'CATEGORIES PERMISSION CHECK:' as info;
SELECT 
    'products.categories' as checking_permission,
    COUNT(*) as permission_count,
    CASE 
        WHEN COUNT(*) > 0 THEN 'SUCCESS - Categories API will work!' 
        ELSE 'Categories API will still fail' 
    END as result
FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
WHERE rp.role_id = 36 AND p.name = 'products.categories';

SELECT 'FIX COMPLETED - RESTART SERVER AND TEST!' as status;