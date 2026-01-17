Write-Host "SAFE TASK 3: GENTLE SERVER UPDATE" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host "⚠️  SAFE MODE: Gentle operations, no forced restarts" -ForegroundColor Yellow
Write-Host ""

# Step 1: Check server load first
Write-Host "1. Checking server load and resources..." -ForegroundColor Yellow
$serverLoad = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "uptime | awk '{print \$10}' | cut -d',' -f1"
$memoryUsage = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "free | grep Mem | awk '{printf \"%.1f\", \$3/\$2 * 100.0}'"

Write-Host "Server Load: $serverLoad" -ForegroundColor Cyan
Write-Host "Memory Usage: $memoryUsage%" -ForegroundColor Cyan

if ([float]$serverLoad -gt 2.0) {
    Write-Host "⚠️  Server load is high ($serverLoad) - postponing deployment" -ForegroundColor Yellow
    Write-Host "Wait for lower server load before continuing" -ForegroundColor Cyan
    exit 1
}

# Step 2: Check if Node.js server is running
Write-Host "2. Checking current server status..." -ForegroundColor Yellow
$nodeProcess = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "ps aux | grep 'node server.js' | grep -v grep || echo 'NO_NODE_PROCESS'"

if ($nodeProcess -match "NO_NODE_PROCESS") {
    Write-Host "ℹ️  No Node.js server running - safe to deploy" -ForegroundColor Cyan
    $serverRunning = $false
} else {
    Write-Host "⚠️  Node.js server is running - will update carefully" -ForegroundColor Yellow
    $serverRunning = $true
}

# Step 3: Pull code gently (no forced operations)
Write-Host "3. Pulling latest code from GitHub..." -ForegroundColor Yellow
$gitPull = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "cd /home/ubuntu/inventoryfullstack; git pull origin main 2>&1"

if ($gitPull -match "Already up to date") {
    Write-Host "ℹ️  Code already up to date" -ForegroundColor Cyan
} elseif ($gitPull -match "Fast-forward") {
    Write-Host "✅ Code updated successfully" -ForegroundColor Green
} else {
    Write-Host "⚠️  Git pull had issues:" -ForegroundColor Yellow
    Write-Host $gitPull -ForegroundColor Gray
}

# Step 4: Install dependencies only if needed
Write-Host "4. Checking if Firebase Admin SDK is installed..." -ForegroundColor Yellow
$firebaseCheck = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "cd /home/ubuntu/inventoryfullstack; npm list firebase-admin 2>/dev/null || echo 'NOT_INSTALLED'"

if ($firebaseCheck -match "NOT_INSTALLED") {
    Write-Host "Installing Firebase Admin SDK..." -ForegroundColor Yellow
    ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "cd /home/ubuntu/inventoryfullstack; npm install firebase-admin --save --no-audit --no-fund"
} else {
    Write-Host "✅ Firebase Admin SDK already installed" -ForegroundColor Green
}

# Step 5: Gentle server restart (only if server was running)
if ($serverRunning) {
    Write-Host "5. Gently restarting server..." -ForegroundColor Yellow
    Write-Host "Stopping current server..." -ForegroundColor Gray
    ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "pkill -TERM -f 'node server.js' || true"
    
    Write-Host "Waiting 3 seconds for graceful shutdown..." -ForegroundColor Gray
    Start-Sleep -Seconds 3
    
    Write-Host "Starting server with notification system..." -ForegroundColor Gray
    ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "cd /home/ubuntu/inventoryfullstack; nohup node server.js > server.log 2>&1 &"
    
    Write-Host "Waiting 5 seconds for server to initialize..." -ForegroundColor Gray
    Start-Sleep -Seconds 5
} else {
    Write-Host "5. Starting server (was not running)..." -ForegroundColor Yellow
    ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "cd /home/ubuntu/inventoryfullstack; nohup node server.js > server.log 2>&1 &"
    Start-Sleep -Seconds 5
}

# Step 6: Gentle verification
Write-Host "6. Gentle server verification..." -ForegroundColor Yellow
$serverCheck = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "timeout 10s curl -k -s https://13.48.248.180.nip.io/ 2>/dev/null | head -1 || echo 'SERVER_NOT_READY'"

if ($serverCheck -match "SERVER_NOT_READY") {
    Write-Host "⚠️  Server not ready yet - may need more time" -ForegroundColor Yellow
    Write-Host "Check manually: https://13.48.248.180.nip.io" -ForegroundColor Cyan
} else {
    Write-Host "✅ Server is responding" -ForegroundColor Green
}

Write-Host ""
Write-Host "SAFE TASK 3 COMPLETED - Server updated gently" -ForegroundColor Green
Write-Host "No aggressive operations performed" -ForegroundColor Cyan