@echo off
echo ========================================
echo DEPLOYING CORE API PERMISSION FIXES
echo ========================================

echo Step 1: Commit and push all permission fixes...
git add routes/timelineRoutes.js routes/selfTransferRoutes.js routes/returnsRoutes.js routes/inventoryRoutes.js routes/dispatchRoutes.js routes/orderTrackingRoutes.js server.js
git commit -m "Fix all route permission formats - use UPPERCASE to match database"
git push origin main

echo Step 2: Deploy to server...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && git pull origin main"

echo Step 3: Restart server...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && pkill -f 'node server.js' && nohup node server.js > server.log 2>&1 &"

echo Step 4: Wait and test core APIs...
timeout 5 > nul
node test-core-apis.js

echo ========================================
echo CORE API FIXES DEPLOYED
echo ========================================