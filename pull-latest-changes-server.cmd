@echo off
echo ========================================
echo Pull Latest Changes to Server
echo ========================================
echo Server: 54.179.63.233
echo Repository: inventoryfullstack
echo ========================================

echo.
echo Step 1: Connecting to server...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "
echo '=== Current server status ==='
cd ~/inventoryfullstack
pwd
git status

echo '=== Checking for running processes ==='
pm2 list

echo '=== Stashing local changes ==='
git stash push -m 'Local changes before pull - $(date)'

echo '=== Pulling latest changes ==='
git pull origin main

echo '=== Installing/updating dependencies ==='
npm install

echo '=== Checking if 2FA columns exist ==='
mysql -u inventory_user -pStrongPass@123 inventory_db -e \"DESCRIBE users;\" | grep two_factor || echo 'Need to add 2FA columns'

echo '=== Adding 2FA columns if needed ==='
mysql -u inventory_user -pStrongPass@123 inventory_db < add-2fa-columns.sql || echo '2FA columns may already exist'

echo '=== Restarting server ==='
pm2 restart all || pm2 start server.js --name 'inventory-backend'

echo '=== Checking server status ==='
pm2 list
pm2 logs --lines 10

echo '=== Testing server endpoint ==='
sleep 5
curl -f http://localhost:5000/api/health || echo 'Server may still be starting...'

echo '=== Latest changes pulled and server restarted! ==='
"

echo.
echo ========================================
echo Server Update Complete!
echo ========================================
echo.
echo The server should now have:
echo - Latest code changes
echo - 2FA implementation
echo - Updated notification system
echo - Location tracking features
echo ========================================

pause