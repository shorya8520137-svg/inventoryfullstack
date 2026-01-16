-- Check permissions database structure

-- 1. Check admin user
SELECT '=== ADMIN USER ===' as info;
SELECT id, email, role_id, is_active FROM users WHERE email = 'admin@company.com';

-- 2. Check roles table
SELECT '=== ROLES TABLE ===' as info;
SELECT * FROM roles;

-- 3. Check permissions table
SELECT '=== PERMISSIONS TABLE ===' as info;
SELECT id, permission_name, category FROM permissions LIMIT 10;

-- 4. Check role_permissions (what permissions does admin role have)
SELECT '=== ADMIN ROLE PERMISSIONS ===' as info;
SELECT rp.role_id, COUNT(rp.permission_id) as permission_count
FROM role_permissions rp
WHERE rp.role_id = (SELECT role_id FROM users WHERE email = 'admin@company.com' LIMIT 1)
GROUP BY rp.role_id;

-- 5. Check if admin has SYSTEM_USER_MANAGEMENT permission
SELECT '=== CHECK SPECIFIC PERMISSIONS ===' as info;
SELECT p.permission_name, 
       CASE WHEN rp.permission_id IS NOT NULL THEN 'YES' ELSE 'NO' END as has_permission
FROM permissions p
LEFT JOIN role_permissions rp ON p.id = rp.permission_id 
    AND rp.role_id = (SELECT role_id FROM users WHERE email = 'admin@company.com' LIMIT 1)
WHERE p.permission_name IN ('SYSTEM_USER_MANAGEMENT', 'SYSTEM_ROLE_MANAGEMENT', 'SYSTEM_AUDIT_LOG')
ORDER BY p.permission_name;
