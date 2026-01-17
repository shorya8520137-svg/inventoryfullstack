-- Verify Clean Database State
USE inventory_db;

SELECT '=== DATABASE CLEANUP VERIFICATION ===' as status;

-- Check users
SELECT 'USERS CHECK' as section;
SELECT COUNT(*) as total_users FROM users;
SELECT id, name, email, role_name, role_id FROM users;

-- Check permissions
SELECT 'PERMISSIONS CHECK' as section;
SELECT COUNT(*) as total_permissions FROM permissions WHERE is_active = 1;

-- Permissions by category
SELECT 'PERMISSIONS BY CATEGORY' as section;
SELECT 
    category,
    COUNT(*) as count,
    GROUP_CONCAT(name ORDER BY name) as permission_names
FROM permissions 
WHERE is_active = 1 
GROUP BY category 
ORDER BY category;

-- Check roles
SELECT 'ROLES CHECK' as section;
SELECT id, name, display_name, description FROM roles ORDER BY priority;

-- Check role permissions
SELECT 'ROLE PERMISSIONS CHECK' as section;
SELECT 
    r.name as role_name,
    COUNT(rp.permission_id) as assigned_permissions
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.id, r.name
ORDER BY r.priority;

-- Admin user permissions (through role)
SELECT 'ADMIN USER PERMISSIONS' as section;
SELECT 
    u.email,
    u.role_name,
    COUNT(rp.permission_id) as total_permissions
FROM users u
JOIN roles r ON u.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
WHERE u.email = 'admin@company.com'
GROUP BY u.id, u.email, u.role_name;

-- List all permissions available for admin
SELECT 'ADMIN AVAILABLE PERMISSIONS' as section;
SELECT 
    p.category,
    p.name,
    p.display_name
FROM users u
JOIN roles r ON u.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.email = 'admin@company.com'
ORDER BY p.category, p.name;

SELECT '=== VERIFICATION COMPLETE ===' as status;