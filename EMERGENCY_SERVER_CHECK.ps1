Write-Host "🚨 EMERGENCY SERVER HEALTH CHECK" -ForegroundColor Red
Write-Host "=================================" -ForegroundColor Red
Write-Host "Quick server diagnostics for 13.48.248.180" -ForegroundColor Yellow
Write-Host ""

# 1. Basic connectivity
Write-Host "1. Testing basic connectivity..." -ForegroundColor Yellow
try {
    $ping = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "echo 'SERVER_ALIVE'"
    if ($ping -match "SERVER_ALIVE") {
        Write-Host "✅ Server is reachable" -ForegroundColor Green
    } else {
        Write-Host "❌ Server not responding" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ SSH connection failed" -ForegroundColor Red
    exit 1
}

# 2. System resources
Write-Host "2. Checking system resources..." -ForegroundColor Yellow
$resources = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "echo 'Load:' && uptime | awk '{print \$10}' && echo 'Memory:' && free -h | grep Mem && echo 'Disk:' && df -h / | tail -1"
Write-Host $resources -ForegroundColor Cyan

# 3. Critical processes
Write-Host "3. Checking critical processes..." -ForegroundColor Yellow
$processes = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "echo 'MySQL:' && systemctl is-active mysql && echo 'Node.js:' && (ps aux | grep 'node server.js' | grep -v grep || echo 'Not running')"
Write-Host $processes -ForegroundColor Cyan

# 4. Quick web server test
Write-Host "4. Testing web server..." -ForegroundColor Yellow
$webTest = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "timeout 5s curl -k -s -I https://13.48.248.180.nip.io/ | head -1 || echo 'Web server not responding'"
Write-Host $webTest -ForegroundColor Cyan

# 5. Recent errors
Write-Host "5. Checking for recent errors..." -ForegroundColor Yellow
$errors = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "tail -5 /home/ubuntu/inventoryfullstack/server.log 2>/dev/null || echo 'No server log found'"
Write-Host $errors -ForegroundColor Gray

Write-Host ""
Write-Host "🏥 EMERGENCY CHECK COMPLETE" -ForegroundColor Green
Write-Host "If server is unresponsive, wait 5-10 minutes before retry" -ForegroundColor Yellow