Write-Host "SAFE TASK 1: DATABASE SCHEMA DEPLOYMENT ONLY" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host "⚠️  SAFE MODE: Minimal server load, no heavy operations" -ForegroundColor Yellow
Write-Host ""

# Step 1: Check server connectivity first
Write-Host "1. Checking server connectivity..." -ForegroundColor Yellow
try {
    $serverCheck = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "echo 'Server OK'"
    if ($serverCheck -match "Server OK") {
        Write-Host "✅ Server is responsive" -ForegroundColor Green
    } else {
        Write-Host "❌ Server not responding" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Cannot connect to server" -ForegroundColor Red
    exit 1
}

# Step 2: Copy SQL file only (lightweight operation)
Write-Host "2. Copying database schema file..." -ForegroundColor Yellow
scp -i "C:\Users\Admin\awsconection.pem" create-notifications-system.sql ubuntu@13.48.248.180:/home/ubuntu/inventoryfullstack/

# Step 3: Check if MySQL is running (don't start if not running)
Write-Host "3. Checking MySQL status..." -ForegroundColor Yellow
$mysqlStatus = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "systemctl is-active mysql || echo 'inactive'"
if ($mysqlStatus -match "active") {
    Write-Host "✅ MySQL is running" -ForegroundColor Green
} else {
    Write-Host "⚠️  MySQL is not active - skipping database operations" -ForegroundColor Yellow
    Write-Host "Manual action needed: Start MySQL and run the SQL file" -ForegroundColor Cyan
    exit 0
}

# Step 4: Execute SQL with timeout (prevent hanging)
Write-Host "4. Creating notification tables (with timeout)..." -ForegroundColor Yellow
$sqlResult = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "timeout 30s mysql -u inventory_user -pStrongPass@123 inventory_db < /home/ubuntu/inventoryfullstack/create-notifications-system.sql 2>&1 || echo 'SQL_TIMEOUT'"

if ($sqlResult -match "SQL_TIMEOUT") {
    Write-Host "⚠️  SQL execution timed out - database may be busy" -ForegroundColor Yellow
    Write-Host "Try again later when server load is lower" -ForegroundColor Cyan
} else {
    Write-Host "✅ Database schema created successfully" -ForegroundColor Green
}

# Step 5: Quick verification (lightweight)
Write-Host "5. Quick table verification..." -ForegroundColor Yellow
$tableCheck = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "timeout 10s mysql -u inventory_user -pStrongPass@123 inventory_db -e 'SHOW TABLES LIKE \"%notification%\";' 2>/dev/null || echo 'CHECK_FAILED'"

if ($tableCheck -match "notifications") {
    Write-Host "✅ Notification tables verified" -ForegroundColor Green
} else {
    Write-Host "⚠️  Table verification failed or timed out" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "SAFE TASK 1 COMPLETED - Database schema deployment" -ForegroundColor Green
Write-Host "No heavy server operations performed" -ForegroundColor Cyan