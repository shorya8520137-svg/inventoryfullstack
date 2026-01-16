#!/bin/bash

# =====================================================
# DEPLOY PERMISSIONS SYSTEM
# =====================================================
# This script:
# 1. Creates permissions tables
# 2. Sets up roles and permissions
# 3. Creates admin user
# 4. Verifies setup
# =====================================================

echo "🚀 Deploying Permissions System..."
echo ""

# Step 1: Create tables and insert data
echo "📊 Step 1: Creating tables and inserting default data..."
sudo mysql inventory_db < setup-permissions-system.sql

if [ $? -eq 0 ]; then
    echo "✅ Tables created successfully"
else
    echo "❌ Failed to create tables"
    exit 1
fi

echo ""

# Step 2: Verify tables
echo "🔍 Step 2: Verifying tables..."
sudo mysql inventory_db -e "SHOW TABLES LIKE '%role%'; SHOW TABLES LIKE '%permission%'; SHOW TABLES LIKE 'users';"

echo ""

# Step 3: Check roles
echo "📋 Step 3: Checking roles..."
sudo mysql inventory_db -e "SELECT * FROM roles;"

echo ""

# Step 4: Check permissions count
echo "📊 Step 4: Checking permissions..."
sudo mysql inventory_db -e "SELECT module, COUNT(*) as count FROM permissions GROUP BY module ORDER BY module;"

echo ""

# Step 5: Check admin user
echo "👤 Step 5: Checking admin user..."
sudo mysql inventory_db -e "
SELECT 
    u.id,
    u.username,
    u.email,
    u.full_name,
    r.role_name,
    u.is_active
FROM users u
JOIN roles r ON u.role_id = r.id
WHERE u.username = 'admin';
"

echo ""

# Step 6: Check admin permissions
echo "🔐 Step 6: Checking admin permissions..."
sudo mysql inventory_db -e "
SELECT 
    r.role_name,
    COUNT(rp.permission_id) as total_permissions
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
WHERE r.role_name = 'admin'
GROUP BY r.role_name;
"

echo ""
echo "✅ Permissions system deployed successfully!"
echo ""
echo "📝 Next steps:"
echo "   1. Update backend to use JWT authentication"
echo "   2. Create login API endpoint"
echo "   3. Add authentication middleware"
echo "   4. Update frontend to use JWT tokens"
echo "   5. Change admin password after first login"
echo ""
echo "🔑 Default Admin Credentials:"
echo "   Username: admin"
echo "   Email: admin@inventory.com"
echo "   Password: Admin@123 (CHANGE THIS!)"
echo ""
