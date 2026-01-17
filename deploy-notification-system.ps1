Write-Host "DEPLOYING NOTIFICATION SYSTEM - PHASE 1.5" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green

# Copy SQL script to server
Write-Host "1. Creating notification database schema..." -ForegroundColor Yellow
scp -i "C:\Users\Admin\awsconection.pem" create-notifications-system.sql ubuntu@13.48.248.180:/home/ubuntu/inventoryfullstack/
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "cd /home/ubuntu/inventoryfullstack; mysql -u inventory_user -pStrongPass@123 inventory_db < create-notifications-system.sql"

# Step 2: Push code to GitHub
Write-Host "2. Pushing notification system code to GitHub..." -ForegroundColor Yellow
git add controllers/notificationController.js routes/notificationRoutes.js server.js .env .env.local test-notification-system.js
git commit -m "Update API base URL to new server 13.48.248.180 and deploy notification system

- Updated .env and .env.local with new server IP
- Complete notification system with Firebase support
- Database schema for notifications, preferences, and Firebase tokens
- REST API endpoints for notification management
- Integration with existing login/logout flows
- Support for dispatch, return, status change, data insert notifications"

git push origin main

# Step 3: Deploy to server
Write-Host "3. Pulling latest code on server..." -ForegroundColor Yellow
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "cd /home/ubuntu/inventoryfullstack; git pull origin main"

# Step 4: Install Firebase Admin SDK (if not already installed)
Write-Host "4. Installing Firebase Admin SDK..." -ForegroundColor Yellow
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "cd /home/ubuntu/inventoryfullstack; npm install firebase-admin --save"

# Step 5: Restart server
Write-Host "5. Restarting server..." -ForegroundColor Yellow
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "pkill -f 'node server.js' || true; cd /home/ubuntu/inventoryfullstack; nohup node server.js > server.log 2>&1 &"

# Step 6: Wait for server to start
Write-Host "6. Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Step 7: Copy and run test script
Write-Host "7. Testing notification system..." -ForegroundColor Yellow
scp -i "C:\Users\Admin\awsconection.pem" test-notification-system.js ubuntu@13.48.248.180:/home/ubuntu/inventoryfullstack/
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "cd /home/ubuntu/inventoryfullstack; node test-notification-system.js"

Write-Host "NOTIFICATION SYSTEM DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host "Features deployed:" -ForegroundColor Cyan
Write-Host "- Database tables: notifications, notification_preferences, firebase_tokens" -ForegroundColor White
Write-Host "- API endpoints: /api/notifications/* (CRUD, stats, Firebase tokens)" -ForegroundColor White
Write-Host "- Notification triggers: dispatch, return, status change, data insert, login, logout" -ForegroundColor White
Write-Host "- Firebase push notification infrastructure" -ForegroundColor White
Write-Host "- Test endpoints for all notification types" -ForegroundColor White