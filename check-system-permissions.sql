-- Check for SYSTEM permissions
SELECT name, display_name, category 
FROM permissions 
WHERE name LIKE 'SYSTEM%' OR name LIKE '%MANAGEMENT%'
ORDER BY name;
