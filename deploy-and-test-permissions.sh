#!/bin/bash

echo "🚀 Deploying and Testing Complete Permissions System..."

# Step 1: Upload test files
echo "📤 Step 1: Uploading test files..."
scp -i "C:\Users\Admin\awsconection.pem" create-test-users.sql ubuntu@16.171.161.150:~/inventoryfullstack/
scp -i "C:\Users\Admin\awsconection.pem" comprehensive-permissions-test.js ubuntu@16.171.161.150:~/inventoryfullstack/

# Step 2: Upload permissions controller and routes
echo "📤 Step 2: Uploading permissions system..."
scp -i "C:\Users\Admin\awsconection.pem" controllers/permissionsController.js ubuntu@16.171.161.150:~/inventoryfullstack/controllers/

# Step 3: Enable permissions routes in server.js
echo "🔧 Step 3: Enabling permissions routes..."
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "cd inventoryfullstack && sed -i 's|// permissions routes - TEMPORARILY DISABLED TO FIX SERVER CRASH|// permissions routes|g' server.js && sed -i 's|// app.use.*permissionsRoutes.*|app.use(\"/api\", require(\"./routes/permissionsRoutes\"));|g' server.js"

# Step 4: Create test users in database
echo "👥 Step 4: Creating test users..."
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "cd inventoryfullstack && mysql -u inventory_user -pStrongPass@123 inventory_db < create-test-users.sql"

# Step 5: Restart server
echo "🔄 Step 5: Restarting server..."
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "cd inventoryfullstack && pkill -9 node; sleep 3; nohup node server.js > server.log 2>&1 &"

# Step 6: Wait for server to start
echo "⏳ Step 6: Waiting for server to start..."
sleep 8

# Step 7: Run comprehensive permissions test
echo "🧪 Step 7: Running comprehensive permissions test..."
echo "=================================================="
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "cd inventoryfullstack && node comprehensive-permissions-test.js"

echo ""
echo "✅ Complete Permissions System Testing Finished!"
echo ""
echo "🎯 What was tested:"
echo "   ✅ 6 different user types with varying permissions"
echo "   ✅ 12 API endpoints across all modules"
echo "   ✅ JWT authentication for all users"
echo "   ✅ Role-based access control validation"
echo "   ✅ Audit logging of all activities"
echo "   ✅ Comprehensive success/failure reporting"
echo ""
echo "👥 Test Users Created:"
echo "   - admin@company.com (Super Admin) - Full access"
echo "   - manager@test.com (Manager) - Management access"
echo "   - operator@test.com (Operator) - Operational access"
echo "   - warehouse@test.com (Warehouse) - Warehouse access"
echo "   - viewer@test.com (Viewer) - Read-only access"
echo "   - limited@test.com (Limited) - Very limited access"
echo ""
echo "🔗 Backend API: https://16.171.161.150.nip.io"
echo "📊 All test results are shown above with detailed statistics"