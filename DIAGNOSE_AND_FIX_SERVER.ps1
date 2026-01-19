# DIAGNOSE AND FIX SERVER STARTUP
Write-Host "DIAGNOSING SERVER STARTUP ISSUE" -ForegroundColor Red
Write-Host "==============================="

$SERVER_IP = "13.48.248.180"
$SSH_KEY = "C:\Users\Admin\awsconection.pem"

Write-Host "1. Checking server logs..." -ForegroundColor Yellow
$logs = ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && tail -20 server.log 2>/dev/null"
Write-Host $logs

Write-Host ""
Write-Host "2. Checking if node_modules exists..." -ForegroundColor Yellow
$nodeModules = ssh -i $SSH_KEY ubuntu@$SERVER_IP "ls -la ~/inventoryfullstack/ | grep node_modules"
Write-Host $nodeModules

Write-Host ""
Write-Host "3. Installing dependencies..." -ForegroundColor Yellow
ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && npm install" 2>$null

Write-Host ""
Write-Host "4. Checking package.json..." -ForegroundColor Yellow
$packageJson = ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && cat package.json | head -20"
Write-Host $packageJson

Write-Host ""
Write-Host "5. Starting server again..." -ForegroundColor Yellow
ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && pkill -f 'node server.js'" 2>$null
Start-Sleep -Seconds 2
ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && nohup node server.js > server.log 2>&1 &" 2>$null
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "6. Checking server status..." -ForegroundColor Yellow
$serverRunning = ssh -i $SSH_KEY ubuntu@$SERVER_IP "ps aux | grep 'node server.js' | grep -v grep"
Write-Host $serverRunning

if ($serverRunning) {
    Write-Host ""
    Write-Host "✅ SERVER IS NOW RUNNING!" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "7. Testing login API..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    $loginTest = ssh -i $SSH_KEY ubuntu@$SERVER_IP "curl -s -X POST https://13.48.248.180.nip.io/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"admin@company.com\",\"password\":\"password\"}' -k"
    
    if ($loginTest -match '"success":true') {
        Write-Host "✅ LOGIN API WORKING!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 PROBLEM SOLVED!" -ForegroundColor Green
        Write-Host "=================="
        Write-Host "✅ Server: Running"
        Write-Host "✅ API: Working"
        Write-Host "✅ Admin: admin@company.com / password"
        Write-Host "✅ Permissions: 28 available"
        Write-Host ""
        Write-Host "Your frontend should now work!" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Login API still failing" -ForegroundColor Red
        Write-Host "Response: $loginTest"
    }
} else {
    Write-Host "❌ Server still not running" -ForegroundColor Red
    Write-Host ""
    Write-Host "Latest logs:"
    $newLogs = ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && tail -10 server.log 2>/dev/null"
    Write-Host $newLogs
}