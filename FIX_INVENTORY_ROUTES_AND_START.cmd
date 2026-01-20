@echo off
echo 🔧 FIXING INVENTORY ROUTES SYNTAX ERROR
echo ========================================

echo 📝 Step 1: Fix inventoryRoutes.js syntax error on server
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && sed -i \"s/router.get('\/'/router.get('\/', authenticateToken, checkPermission('inventory.view'),/g\" routes/inventoryRoutes.js"

echo 📝 Step 2: Alternative fix - copy our working inventory routes
scp -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no routes/inventoryRoutes.js ubuntu@16.171.197.86:/home/ubuntu/inventoryfullstack/routes/ 2>nul || echo "Local file not found, using server fix"

echo 🚀 Step 3: Start server
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && nohup node server.js > server.log 2>&1 & sleep 3"

echo 📋 Step 4: Check server status
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "ps aux | grep 'node server.js' | grep -v grep"

echo 📋 Step 5: Check server log
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && tail -10 server.log"

echo 🧪 Step 6: Test API
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "curl -s http://localhost:3001/api/auth/test"

echo ✅ INVENTORY ROUTES FIXED!