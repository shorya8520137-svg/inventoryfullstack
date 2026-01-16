-- Find permissions that admin role is missing
SELECT p.id, p.name, p.display_name, p.category
FROM permissions p
LEFT JOIN role_permissions rp ON p.id = rp.permission_id AND rp.role_id = 1
WHERE rp.permission_id IS NULL
AND p.is_active = 1
ORDER BY p.category, p.name;
