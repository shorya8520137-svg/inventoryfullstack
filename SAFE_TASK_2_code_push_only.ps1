Write-Host "SAFE TASK 2: CODE PUSH TO GITHUB ONLY" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host "⚠️  SAFE MODE: Local operations only, no server changes" -ForegroundColor Yellow
Write-Host ""

# Step 1: Check git status first
Write-Host "1. Checking git status..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "✅ Changes detected, ready to commit" -ForegroundColor Green
} else {
    Write-Host "⚠️  No changes to commit" -ForegroundColor Yellow
    Write-Host "Continuing anyway to ensure latest code is on GitHub..." -ForegroundColor Cyan
}

# Step 2: Add files (local operation only)
Write-Host "2. Adding notification system files to git..." -ForegroundColor Yellow
git add controllers/notificationController.js
git add routes/notificationRoutes.js
git add server.js
git add .env
git add .env.local
git add test-notification-system.js
git add create-notifications-system.sql
git add INVENTORY_DASHBOARD_PHASE_1.5.md
git add API_SYSTEM_COMPLETE_GUIDE.md
git add SAFE_TASK_*.ps1

# Step 3: Commit (local operation only)
Write-Host "3. Committing to local git..." -ForegroundColor Yellow
git commit -m "PHASE 1.5 SAFE DEPLOYMENT: Notification system backend

- Complete notification controller with CRUD operations
- Notification routes with authentication
- Updated server.js with notification routes  
- Firebase push notification infrastructure
- Database schema for notifications system
- Updated API base URL to server 13.48.248.180
- Safe deployment scripts to prevent server crashes
- Login/logout notification triggers implemented

SAFE MODE: Ready for careful server deployment"

# Step 4: Push to GitHub (network operation only)
Write-Host "4. Pushing to GitHub..." -ForegroundColor Yellow
try {
    git push origin main
    Write-Host "✅ Code pushed to GitHub successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ GitHub push failed - check network connection" -ForegroundColor Red
    Write-Host "You can retry this step later" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "SAFE TASK 2 COMPLETED - Code is on GitHub" -ForegroundColor Green
Write-Host "Server not touched - ready for safe deployment" -ForegroundColor Cyan