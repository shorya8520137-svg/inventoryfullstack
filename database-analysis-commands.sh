#!/bin/bash

# Database Analysis Commands for SSH Connection
# Run these commands after connecting via SSH: ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.5.50

echo "🔍 Starting Database Analysis..."
echo "================================"

# Check MySQL status
echo "📊 Checking MySQL Status:"
sudo systemctl status mysql --no-pager

echo -e "\n📋 Available Databases:"
mysql -u root -e "SHOW DATABASES;"

echo -e "\n🔍 Checking for inventory database:"
mysql -u root -e "USE inventory_system; SELECT 'Database exists' as status;" 2>/dev/null || echo "inventory_system database not found"

echo -e "\n📊 All Tables in inventory_system:"
mysql -u root -e "USE inventory_system; SHOW TABLES;"

echo -e "\n📈 Table Row Counts:"
mysql -u root -e "
USE inventory_system; 
SELECT 
    table_name as 'Table Name', 
    table_rows as 'Row Count',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) as 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = 'inventory_system' 
ORDER BY table_rows DESC;"

echo -e "\n👥 User Management Tables:"
mysql -u root -e "
USE inventory_system; 
SHOW TABLES LIKE '%user%';
SHOW TABLES LIKE '%role%';
SHOW TABLES LIKE '%permission%';"

echo -e "\n📦 Business Operation Tables:"
mysql -u root -e "
USE inventory_system; 
SHOW TABLES LIKE '%dispatch%';
SHOW TABLES LIKE '%return%';
SHOW TABLES LIKE '%damage%';
SHOW TABLES LIKE '%product%';
SHOW TABLES LIKE '%inventory%';
SHOW TABLES LIKE '%order%';
SHOW TABLES LIKE '%transfer%';
SHOW TABLES LIKE '%bulk%';"

echo -e "\n🔍 Looking for existing audit/log tables:"
mysql -u root -e "
USE inventory_system; 
SHOW TABLES LIKE '%audit%';
SHOW TABLES LIKE '%log%';
SHOW TABLES LIKE '%activity%';
SHOW TABLES LIKE '%history%';"

echo -e "\n📋 Users Table Structure (if exists):"
mysql -u root -e "USE inventory_system; DESCRIBE users;" 2>/dev/null || echo "users table not found"

echo -e "\n📋 Sample Users Data:"
mysql -u root -e "USE inventory_system; SELECT id, name, email, role_name, created_at FROM users LIMIT 5;" 2>/dev/null || echo "Could not fetch users data"

echo -e "\n📋 Products Table Structure (if exists):"
mysql -u root -e "USE inventory_system; DESCRIBE products;" 2>/dev/null || echo "products table not found"

echo -e "\n📋 Sample Products Data:"
mysql -u root -e "USE inventory_system; SELECT id, name, sku, category, created_at FROM products LIMIT 5;" 2>/dev/null || echo "Could not fetch products data"

echo -e "\n📋 Dispatch Table Structure (if exists):"
mysql -u root -e "USE inventory_system; DESCRIBE dispatches;" 2>/dev/null || echo "dispatches table not found"

echo -e "\n📋 Sample Dispatch Data:"
mysql -u root -e "USE inventory_system; SELECT id, product_id, quantity, status, created_by, created_at FROM dispatches LIMIT 5;" 2>/dev/null || echo "Could not fetch dispatch data"

echo -e "\n📋 Returns Table Structure (if exists):"
mysql -u root -e "USE inventory_system; DESCRIBE returns_main;" 2>/dev/null || echo "returns_main table not found"

echo -e "\n📋 Sample Returns Data:"
mysql -u root -e "USE inventory_system; SELECT id, product_id, quantity, reason, created_by, created_at FROM returns_main LIMIT 5;" 2>/dev/null || echo "Could not fetch returns data"

echo -e "\n✅ Database Analysis Complete!"
echo "================================"

echo -e "\n💡 Next Steps:"
echo "1. Review the table structures above"
echo "2. Identify which tables need audit logging"
echo "3. Create audit_logs table if it doesn't exist"
echo "4. Implement triggers or application-level logging"