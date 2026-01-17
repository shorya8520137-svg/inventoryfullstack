Write-Host "SIMPLE SERVER RESTART" -ForegroundColor Green
Write-Host "=====================" -ForegroundColor Green

# Kill any existing node processes
Write-Host "1. Killing existing node processes..." -ForegroundColor Yellow
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "pkill -f 'node server.js' || true"

Start-Sleep -Seconds 2

# Start server in background
Write-Host "2. Starting server in background..." -ForegroundColor Yellow
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "cd /home/ubuntu/inventoryfullstack && node server.js > server.log 2>&1 &"

Start-Sleep -Seconds 3

# Check if server is running
Write-Host "3. Checking server status..." -ForegroundColor Yellow
$serverCheck = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "ps aux | grep 'node server.js' | grep -v grep"

if ($serverCheck) {
    Write-Host "✅ Server is running" -ForegroundColor Green
    Write-Host "Process: $serverCheck" -ForegroundColor Cyan
} else {
    Write-Host "❌ Server not found in processes" -ForegroundColor Red
}

# Quick API test
Write-Host "4. Testing API endpoint..." -ForegroundColor Yellow
try {
    $apiTest = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "timeout 10s curl -k -s https://13.48.248.180.nip.io/api/health 2>/dev/null || echo 'API_TEST_FAILED'"
    
    if ($apiTest -match "API_TEST_FAILED" -or $apiTest -match "502 Bad Gateway") {
        Write-Host "⚠️ API not responding yet, checking server log..." -ForegroundColor Yellow
        $serverLog = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "tail -5 /home/ubuntu/inventoryfullstack/server.log 2>/dev/null || echo 'No log found'"
        Write-Host "Server log: $serverLog" -ForegroundColor Cyan
    } else {
        Write-Host "✅ API is responding" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ API test had issues" -ForegroundColor Yellow
}

Write-Host "SERVER RESTART COMPLETED" -ForegroundColor Green