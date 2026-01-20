-- CHECK THEMS USER PERMISSIONS
USE inventory_db;

-- 1. Check thems user details
SELECT 'THEMS USER DETAILS:' as info;
SELECT id, name, email, role_id, role FROM users WHERE email = 'thems@company.com';

-- 2. Check if role_id 36 exists in roles table
SELECT 'ROLE ID 36 EXISTS?' as info;
SELECT * FROM roles WHERE id = 36;

-- 3. Check what permissions role_id 36 has
SELECT 'PERMISSIONS FOR ROLE ID 36:' as info;
SELECT p.name, p.display_name, p.category
FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
WHERE rp.role_id = 36;

-- 4. Check all available roles
SELECT 'ALL AVAILABLE ROLES:' as info;
SELECT * FROM roles ORDER BY id;

-- 5. Check role_permissions table for role_id 36
SELECT 'ROLE_PERMISSIONS FOR ROLE 36:' as info;
SELECT * FROM role_permissions WHERE role_id = 36;

-- 6. Test the exact permission check that middleware uses
SELECT 'PERMISSION CHECK TEST:' as info;
SELECT 
    COUNT(*) as permission_count,
    CASE 
        WHEN COUNT(*) > 0 THEN 'PERMISSION GRANTED' 
        ELSE 'PERMISSION DENIED - THIS IS WHY 403 ERROR' 
    END as result
FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
WHERE rp.role_id = 36 AND p.name = 'products.view';