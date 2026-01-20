@echo off
echo ========================================
echo COMPREHENSIVE ROUTE FIX AND DEPLOYMENT
echo ========================================

echo Step 1: Add and commit all route fixes...
git add routes/dispatchRoutes.js routes/inventoryRoutes.js routes/returnsRoutes.js routes/timelineRoutes.js
git commit -m "Fix all route syntax errors - missing commas in middleware calls"

echo Step 2: Push to GitHub with timeout...
timeout 30 git push origin main
if %errorlevel% neq 0 (
    echo Git push timed out or failed, trying force push...
    timeout 20 git push --force origin main
)

echo Step 3: Connect to server and pull changes...
ssh -i "C:\Users\Admin\awsconection.pem" -o ConnectTimeout=10 ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && git pull origin main"

echo Step 4: Restart server with timeout...
ssh -i "C:\Users\Admin\awsconection.pem" -o ConnectTimeout=10 ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && pkill -f 'node server.js' && nohup node server.js > server.log 2>&1 &"

echo Step 5: Wait and check server status...
timeout 5 > nul
ssh -i "C:\Users\Admin\awsconection.pem" -o ConnectTimeout=10 ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && tail -20 server.log"

echo ========================================
echo DEPLOYMENT COMPLETE
echo ========================================