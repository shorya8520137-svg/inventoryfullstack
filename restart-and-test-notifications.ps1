Write-Host "🔄 RESTARTING SERVER AND TESTING NOTIFICATIONS" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Step 1: Push fixes to GitHub
Write-Host "1. Pushing fixes to GitHub..." -ForegroundColor Yellow
git add .
git commit -m "Fix notification routes authentication conflicts"
git push origin main

# Step 2: Kill existing server process
Write-Host "2. Stopping existing server..." -ForegroundColor Yellow
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "pkill -f 'node server.js' || true"

Start-Sleep -Seconds 2

# Step 3: Pull latest code on server
Write-Host "3. Pulling latest code on server..." -ForegroundColor Yellow
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "cd /home/ubuntu/inventoryfullstack && git pull origin main"

# Step 4: Start server
Write-Host "4. Starting server..." -ForegroundColor Yellow
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "cd /home/ubuntu/inventoryfullstack && nohup node server.js > server.log 2>&1 & echo 'Server started'"

Start-Sleep -Seconds 3

# Step 5: Check server status
Write-Host "5. Checking server status..." -ForegroundColor Yellow
$serverCheck = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "ps aux | grep 'node server.js' | grep -v grep"

if ($serverCheck) {
    Write-Host "✅ Server is running" -ForegroundColor Green
} else {
    Write-Host "❌ Server not running" -ForegroundColor Red
    exit 1
}

# Step 6: Test notification endpoints
Write-Host "6. Testing notification endpoints..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
node test-notification-endpoints.js

Write-Host "🎉 RESTART AND TEST COMPLETED!" -ForegroundColor Green