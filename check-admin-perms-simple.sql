-- Check how many permissions admin role has
SELECT COUNT(*) as admin_permissions_count 
FROM role_permissions 
WHERE role_id = 1;

-- Check total permissions available
SELECT COUNT(*) as total_permissions 
FROM permissions;

-- Show first 5 permissions admin has
SELECT p.name, p.display_name, p.category
FROM role_permissions rp
JOIN permissions p ON rp.permission_id = p.id
WHERE rp.role_id = 1
LIMIT 5;
