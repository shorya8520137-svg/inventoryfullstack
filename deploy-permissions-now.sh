#!/bin/bash

# =====================================================
# ONE-CLICK PERMISSIONS DEPLOYMENT
# Run this on your local machine
# =====================================================

SSH_KEY="C:\\Users\\Admin\\awsconection.pem"
SERVER="ubuntu@16.171.161.150"

echo "🚀 Starting Permissions System Deployment..."
echo ""

# Step 1: Copy SQL file to server
echo "📤 Step 1: Copying SQL file to server..."
scp -i "$SSH_KEY" setup-permissions-system.sql "$SERVER:~/inventoryfullstack/"

if [ $? -eq 0 ]; then
    echo "✅ SQL file copied"
else
    echo "❌ Failed to copy SQL file"
    exit 1
fi

echo ""

# Step 2: Execute deployment on server
echo "🔧 Step 2: Executing deployment on server..."
ssh -i "$SSH_KEY" "$SERVER" << 'ENDSSH'

cd inventoryfullstack

echo "📊 Creating tables and inserting data..."
sudo mysql inventory_db < setup-permissions-system.sql

if [ $? -eq 0 ]; then
    echo "✅ Database setup completed"
else
    echo "❌ Database setup failed"
    exit 1
fi

echo ""
echo "🔍 Verifying setup..."
echo ""

echo "Tables created:"
sudo mysql inventory_db -e "SHOW TABLES LIKE '%role%'; SHOW TABLES LIKE '%permission%'; SHOW TABLES LIKE 'users';"

echo ""
echo "Roles:"
sudo mysql inventory_db -e "SELECT id, role_name, description FROM roles;"

echo ""
echo "Permissions by module:"
sudo mysql inventory_db -e "SELECT module, COUNT(*) as count FROM permissions GROUP BY module ORDER BY module;"

echo ""
echo "Admin user:"
sudo mysql inventory_db -e "
SELECT 
    u.id,
    u.username,
    u.email,
    u.full_name,
    r.role_name,
    u.is_active,
    u.created_at
FROM users u
JOIN roles r ON u.role_id = r.id
WHERE u.username = 'admin';
"

echo ""
echo "Admin permissions count:"
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

ENDSSH

echo ""
echo "========================================="
echo "🎉 DEPLOYMENT COMPLETED!"
echo "========================================="
echo ""
echo "📝 What was created:"
echo "   ✅ 5 database tables (roles, permissions, users, role_permissions, user_permissions)"
echo "   ✅ 4 default roles (admin, manager, warehouse_staff, viewer)"
echo "   ✅ 30+ permissions across all modules"
echo "   ✅ Admin user with full access"
echo ""
echo "🔑 Default Admin Credentials:"
echo "   Username: admin"
echo "   Email: admin@inventory.com"
echo "   Password: Admin@123"
echo "   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!"
echo ""
echo "📋 Next Steps:"
echo "   1. Implement JWT authentication in backend"
echo "   2. Create login page in frontend"
echo "   3. Add auth middleware to routes"
echo "   4. Update frontend to use JWT tokens"
echo "   5. Test login with admin credentials"
echo ""
echo "📖 See PERMISSIONS_IMPLEMENTATION_PLAN.md for detailed steps"
echo ""
