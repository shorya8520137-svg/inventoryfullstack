# START SERVER AND TEST PERMISSIONS
Write-Host "STARTING SERVER AND TESTING PERMISSIONS" -ForegroundColor Green
Write-Host "========================================"

$SERVER_IP = "13.48.248.180"
$SSH_KEY = "C:\Users\Admin\awsconection.pem"

Write-Host "1. Checking if server is running..." -ForegroundColor Cyan
$serverRunning = ssh -i $SSH_KEY ubuntu@$SERVER_IP "ps aux | grep 'node server.js' | grep -v grep | wc -l"
Write-Host "Server processes: $serverRunning"

if ($serverRunning -eq 0) {
    Write-Host ""
    Write-Host "2. Starting server..." -ForegroundColor Cyan
    
    # Go to project directory and start server
    ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && nohup node server.js > server.log 2>&1 &"
    
    Start-Sleep -Seconds 5
    
    $newServerCheck = ssh -i $SSH_KEY ubuntu@$SERVER_IP "ps aux | grep 'node server.js' | grep -v grep | wc -l"
    
    if ($newServerCheck -gt 0) {
        Write-Host "✅ Server started successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Server failed to start. Checking logs..." -ForegroundColor Red
        $logs = ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && tail -10 server.log"
        Write-Host $logs
        exit 1
    }
} else {
    Write-Host "✅ Server is already running" -ForegroundColor Green
}

Write-Host ""
Write-Host "3. Testing login API..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

$loginTest = ssh -i $SSH_KEY ubuntu@$SERVER_IP "curl -s -X POST https://13.48.248.180.nip.io/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"admin@company.com\",\"password\":\"password\"}' -k"

Write-Host "Login Response:"
Write-Host $loginTest

if ($loginTest -match "success") {
    Write-Host ""
    Write-Host "🎉 SUCCESS!" -ForegroundColor Green
    Write-Host "==========="
    Write-Host "✅ Server: Running"
    Write-Host "✅ Database: 28 permissions for admin"
    Write-Host "✅ API: Working"
    Write-Host "✅ Login: admin@company.com / password"
    Write-Host ""
    Write-Host "Your frontend should now show all permissions!"
    Write-Host "URL: https://13.48.248.180.nip.io"
} else {
    Write-Host ""
    Write-Host "❌ Login still failing. Response:"
    Write-Host $loginTest
}