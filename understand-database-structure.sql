-- 🔍 UNDERSTANDING DATABASE STRUCTURE
-- Let's analyze the current state without making changes

-- 1. Check all users and their roles
SELECT 
    u.id as user_id,
    u.name as username,
    u.email,
    u.role_id,
    r.name as role_name,
    r.display_name as role_display_name,
    u.is_active
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
ORDER BY u.id;

-- 2. Check all roles that exist
SELECT 
    id,
    name,
    display_name,
    description,
    created_at
FROM roles
ORDER BY id;

-- 3. Check all permissions that exist
SELECT 
    id,
    name,
    display_name,
    category,
    description
FROM permissions
ORDER BY category, name;

-- 4. Check role_permissions mapping
SELECT 
    rp.role_id,
    r.name as role_name,
    COUNT(rp.permission_id) as permission_count
FROM role_permissions rp
LEFT JOIN roles r ON rp.role_id = r.id
GROUP BY rp.role_id, r.name
ORDER BY rp.role_id;

-- 5. Check specific admin user permissions
SELECT 
    u.email,
    u.role_id,
    r.name as role_name,
    p.name as permission_name,
    p.display_name as permission_display_name,
    p.category
FROM users u
JOIN roles r ON u.role_id = r.id
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
WHERE u.email = 'admin@company.com'
ORDER BY p.category, p.name;

-- 6. Check CMS user permissions
SELECT 
    u.email,
    u.role_id,
    r.name as role_name,
    p.name as permission_name,
    p.display_name as permission_display_name,
    p.category
FROM users u
JOIN roles r ON u.role_id = r.id
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
WHERE u.email = 'nope@comp.com'
ORDER BY p.category, p.name;

-- 7. Check test user permissions
SELECT 
    u.email,
    u.role_id,
    r.name as role_name,
    p.name as permission_name,
    p.display_name as permission_display_name,
    p.category
FROM users u
JOIN roles r ON u.role_id = r.id
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
WHERE u.email = 'tetstetstestdt@company.com'
ORDER BY p.category, p.name;

-- 8. Summary: Count permissions per role
SELECT 
    r.id as role_id,
    r.name as role_name,
    r.display_name,
    COUNT(rp.permission_id) as total_permissions,
    GROUP_CONCAT(DISTINCT p.category) as categories
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
GROUP BY r.id, r.name, r.display_name
ORDER BY r.id;