-- DEBUG FRONTEND PERMISSIONS ISSUE
USE inventory_db;

-- 1. Check what the frontend should be getting for thems user
SELECT 'THEMS USER ROLE AND PERMISSIONS:' as info;

-- Get thems user details
SELECT u.id, u.name, u.email, u.role_id, u.role, r.name as role_name, r.display_name
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
WHERE u.email = 'thems@company.com';

-- Get all permissions for thems user's role
SELECT 'THEMS USER PERMISSIONS (what frontend should get):' as info;
SELECT p.name, p.display_name, p.category
FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
WHERE rp.role_id = 36
ORDER BY p.category, p.name;

-- 2. Check if products.view permission exists and if thems has it
SELECT 'PRODUCTS.VIEW PERMISSION CHECK:' as info;
SELECT 
    p.name as permission_name,
    CASE 
        WHEN rp.role_id IS NOT NULL THEN 'THEMS HAS THIS PERMISSION' 
        ELSE 'THEMS DOES NOT HAVE THIS PERMISSION' 
    END as thems_access
FROM permissions p
LEFT JOIN role_permissions rp ON p.id = rp.permission_id AND rp.role_id = 36
WHERE p.name = 'products.view';

-- 3. Check what the API endpoint /api/users/14 should return
SELECT 'API RESPONSE FOR THEMS USER:' as info;
SELECT 
    u.id,
    u.name,
    u.email,
    u.role_id,
    u.role,
    r.name as role_name,
    r.display_name as role_display_name,
    GROUP_CONCAT(p.name ORDER BY p.name) as permissions_list
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
WHERE u.email = 'thems@company.com'
GROUP BY u.id, u.name, u.email, u.role_id, u.role, r.name, r.display_name;

-- 4. Compare with admin user
SELECT 'ADMIN USER FOR COMPARISON:' as info;
SELECT 
    u.id,
    u.name,
    u.email,
    u.role_id,
    u.role,
    r.name as role_name,
    COUNT(p.id) as permission_count,
    GROUP_CONCAT(p.name ORDER BY p.name LIMIT 10) as first_10_permissions
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
WHERE u.email = 'admin@company.com'
GROUP BY u.id, u.name, u.email, u.role_id, u.role, r.name;

-- 5. Show the exact permission check that should happen
SELECT 'FRONTEND PERMISSION CHECK SIMULATION:' as info;
SELECT 
    'hasPermission("products.view")' as frontend_call,
    CASE 
        WHEN COUNT(p.id) > 0 THEN 'true - SHOW PRODUCTS TAB' 
        ELSE 'false - HIDE PRODUCTS TAB' 
    END as should_return
FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
WHERE rp.role_id = 36 AND p.name = 'products.view';