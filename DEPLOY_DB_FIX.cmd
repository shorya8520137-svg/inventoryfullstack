@echo off
echo ========================================
echo DEPLOYING DATABASE QUERY FIX
echo ========================================

echo Step 1: Commit and push the database fix...
git add routes/permissionsRoutes.js db/connection.js
git commit -m "Fix database query syntax in permissionsRoutes.js"
git push origin main

echo Step 2: Deploy to server...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && git pull origin main"

echo Step 3: Restart server...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && pkill -f 'node server.js' && nohup node server.js > server.log 2>&1 &"

echo Step 4: Wait and test...
timeout 5 > nul
node test-login-direct.js

echo ========================================
echo DATABASE FIX DEPLOYMENT COMPLETE
echo ========================================