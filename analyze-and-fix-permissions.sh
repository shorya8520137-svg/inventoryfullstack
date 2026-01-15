#!/bin/bash

echo "🔍 STEP 1: Analyzing Database Structure"
echo "========================================"
echo ""

# Connect to MySQL and analyze tables
mysql -u inventory_user -pStrongPass@123 inventory_db << 'EOF'

-- Show all tables
SELECT '📋 ALL TABLES:' as '';
SHOW TABLES;

-- Describe users table
SELECT '' as '';
SELECT '👤 USERS TABLE:' as '';
DESCRIBE users;
SELECT 'Sample data:' as '';
SELECT * FROM users LIMIT 3;

-- Describe roles table
SELECT '' as '';
SELECT '🎭 ROLES TABLE:' as '';
DESCRIBE roles;
SELECT 'Sample data:' as '';
SELECT * FROM roles LIMIT 5;

-- Describe permissions table
SELECT '' as '';
SELECT '🔐 PERMISSIONS TABLE:' as '';
DESCRIBE permissions;
SELECT 'Sample data:' as '';
SELECT * FROM permissions LIMIT 10;

-- Describe role_permissions table
SELECT '' as '';
SELECT '🔗 ROLE_PERMISSIONS TABLE:' as '';
DESCRIBE role_permissions;
SELECT 'Sample data:' as '';
SELECT * FROM role_permissions LIMIT 10;

-- Describe user_permissions table (if exists)
SELECT '' as '';
SELECT '👥 USER_PERMISSIONS TABLE (if exists):' as '';
SHOW TABLES LIKE 'user_permissions';
DESCRIBE user_permissions;
SELECT 'Sample data:' as '';
SELECT * FROM user_permissions LIMIT 10;

-- Show relationships
SELECT '' as '';
SELECT '🔗 PERMISSION RELATIONSHIPS:' as '';
SELECT 
    r.name as role_name,
    p.name as permission_name,
    p.resource,
    p.action
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
ORDER BY r.name, p.resource, p.action
LIMIT 20;

EOF

echo ""
echo "✅ Database analysis complete!"
echo ""
echo "📝 Analysis saved. Now checking frontend components..."
