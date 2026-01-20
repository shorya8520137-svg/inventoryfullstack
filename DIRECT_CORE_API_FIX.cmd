@echo off
echo ========================================
echo DIRECT CORE API FIX - NO HANGING
echo ========================================

echo Step 1: Commit permission fixes...
git add routes/timelineRoutes.js routes/selfTransferRoutes.js routes/returnsRoutes.js routes/inventoryRoutes.js routes/dispatchRoutes.js routes/orderTrackingRoutes.js server.js
git commit -m "Fix core API permission formats - UPPERCASE"

echo Step 2: Push to GitHub...
git push origin main

echo Step 3: Pull on server and restart (separate commands)...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && git pull origin main"

echo Step 4: Kill existing server process...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "pkill -f 'node server.js'"

echo Step 5: Start server in background...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && nohup node server.js > server.log 2>&1 &"

echo Step 6: Wait 3 seconds...
timeout 3 > nul

echo ========================================
echo CORE API FIX DEPLOYED - TEST MANUALLY
echo Run: node test-core-apis.js
echo ========================================