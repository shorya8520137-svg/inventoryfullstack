-- Check if admin has SYSTEM permissions
SELECT p.name, p.display_name,
       CASE WHEN rp.permission_id IS NOT NULL THEN 'YES' ELSE 'NO' END as has_permission
FROM permissions p
LEFT JOIN role_permissions rp ON p.id = rp.permission_id AND rp.role_id = 1
WHERE p.name LIKE 'SYSTEM%'
ORDER BY p.name;
