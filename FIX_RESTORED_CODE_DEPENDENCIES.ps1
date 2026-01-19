# FIX RESTORED CODE DEPENDENCIES
Write-Host "FIXING DEPENDENCIES FOR RESTORED CODE" -ForegroundColor Green
Write-Host "====================================="

$SERVER_IP = "13.48.248.180"
$SSH_KEY = "C:\Users\Admin\awsconection.pem"

Write-Host "1. Checking what modules are missing..." -ForegroundColor Cyan
$serverLogs = ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && tail -20 server.log"
Write-Host "Server logs:"
Write-Host $serverLogs

Write-Host ""
Write-Host "2. Installing missing dependencies..." -ForegroundColor Cyan

# Install common missing packages
ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && npm install bcryptjs jsonwebtoken mysql2 express cors morgan dotenv" 2>$null

Write-Host ""
Write-Host "3. Checking package.json..." -ForegroundColor Cyan
$packageJson = ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && cat package.json | head -30"
Write-Host $packageJson

Write-Host ""
Write-Host "4. Running npm install again..." -ForegroundColor Cyan
ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && npm install" 2>$null

Write-Host ""
Write-Host "5. Starting server..." -ForegroundColor Cyan
ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && pkill -f 'node server.js'" 2>$null
Start-Sleep -Seconds 2
ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && nohup node server.js > server.log 2>&1 &" 2>$null
Start-Sleep -Seconds 5

$serverCheck = ssh -i $SSH_KEY ubuntu@$SERVER_IP "ps aux | grep 'node server.js' | grep -v grep"

if ($serverCheck) {
    Write-Host "✅ Server started successfully!" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "6. Testing login API..." -ForegroundColor Cyan
    Start-Sleep -Seconds 3
    
    $loginTest = ssh -i $SSH_KEY ubuntu@$SERVER_IP "timeout 10 curl -s -X POST https://13.48.248.180.nip.io/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"admin@company.com\",\"password\":\"password\"}' -k"
    
    if ($loginTest -match '"success":true') {
        Write-Host ""
        Write-Host "🎉 SUCCESS! SATURDAY CODE RESTORED AND WORKING!" -ForegroundColor Green
        Write-Host "===============================================" -ForegroundColor Green
        Write-Host "✅ Restored to Saturday commit: c83c1e5" -ForegroundColor Yellow
        Write-Host "✅ Dependencies: Fixed" -ForegroundColor Yellow
        Write-Host "✅ Server: Running" -ForegroundColor Yellow
        Write-Host "✅ Login: Working" -ForegroundColor Yellow
        Write-Host "✅ Admin: admin@company.com / password" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Your system is now restored to Saturday's working state!" -ForegroundColor Cyan
        Write-Host "Frontend URL: https://13.48.248.180.nip.io" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Login test failed. Response: $loginTest" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Server still failed to start" -ForegroundColor Red
    $newLogs = ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && tail -10 server.log"
    Write-Host "Latest logs:"
    Write-Host $newLogs
}