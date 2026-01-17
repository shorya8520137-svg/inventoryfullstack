Write-Host "TASK 2: DEPLOYING NOTIFICATION BACKEND CODE" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Step 1: Add files to git
Write-Host "1. Adding notification system files to git..." -ForegroundColor Yellow
git add controllers/notificationController.js
git add routes/notificationRoutes.js
git add server.js
git add .env
git add .env.local
git add test-notification-system.js
git add create-notifications-system.sql
git add INVENTORY_DASHBOARD_PHASE_1.5.md
git add API_SYSTEM_COMPLETE_GUIDE.md

# Step 2: Commit changes
Write-Host "2. Committing notification system to git..." -ForegroundColor Yellow
git commit -m "PHASE 1.5: Complete notification system backend implementation

- Added comprehensive notification controller with CRUD operations
- Created notification routes with authentication and permissions
- Updated server.js with notification routes
- Added Firebase push notification infrastructure
- Created database schema for notifications, preferences, tokens
- Updated API base URL to new server 13.48.248.180
- Added test scripts for notification system
- Login/logout notification triggers implemented
- Ready for dispatch, return, status change triggers"

# Step 3: Push to GitHub
Write-Host "3. Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

# Step 4: Pull code on server
Write-Host "4. Pulling latest code on server..." -ForegroundColor Yellow
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "cd /home/ubuntu/inventoryfullstack; git pull origin main"

# Step 5: Install dependencies
Write-Host "5. Installing Firebase Admin SDK..." -ForegroundColor Yellow
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "cd /home/ubuntu/inventoryfullstack; npm install firebase-admin --save"

Write-Host "TASK 2 COMPLETED: Backend code deployed!" -ForegroundColor Green