-- Check current permissions in database
SELECT 
    id,
    name,
    display_name,
    category,
    is_active,
    created_at
FROM permissions 
WHERE is_active = true
ORDER BY category, name;

-- Count permissions by category
SELECT 
    category,
    COUNT(*) as permission_count
FROM permissions 
WHERE is_active = true
GROUP BY category
ORDER BY category;

-- Check for duplicate permission names
SELECT 
    name,
    COUNT(*) as count
FROM permissions 
WHERE is_active = true
GROUP BY name
HAVING COUNT(*) > 1
ORDER BY count DESC, name;

-- Check total permission count
SELECT COUNT(*) as total_permissions FROM permissions WHERE is_active = true;