Write-Host "SAFE TASK 4: LIGHT TESTING ONLY" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host "⚠️  SAFE MODE: Minimal testing, no heavy load" -ForegroundColor Yellow
Write-Host ""

# Step 1: Basic connectivity test
Write-Host "1. Basic server connectivity test..." -ForegroundColor Yellow
$basicTest = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "timeout 5s curl -k -s https://13.48.248.180.nip.io/ 2>/dev/null | head -1 || echo 'NO_RESPONSE'"

if ($basicTest -match "NO_RESPONSE") {
    Write-Host "❌ Server not responding - skipping further tests" -ForegroundColor Red
    Write-Host "Manual check needed: https://13.48.248.180.nip.io" -ForegroundColor Cyan
    exit 1
} else {
    Write-Host "✅ Server is responding" -ForegroundColor Green
}

# Step 2: Light admin login test (single request)
Write-Host "2. Light admin login test..." -ForegroundColor Yellow
$loginTest = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "timeout 10s curl -k -s -X POST https://13.48.248.180.nip.io/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"admin@company.com\",\"password\":\"admin@123\"}' 2>/dev/null || echo 'LOGIN_TIMEOUT'"

if ($loginTest -match "LOGIN_TIMEOUT") {
    Write-Host "⚠️  Login test timed out - server may be busy" -ForegroundColor Yellow
} elseif ($loginTest -match '"success":true') {
    Write-Host "✅ Admin login working" -ForegroundColor Green
    
    # Step 3: Single notification API test (only if login worked)
    Write-Host "3. Single notification API test..." -ForegroundColor Yellow
    try {
        $loginData = $loginTest | ConvertFrom-Json
        $token = $loginData.token
        
        if ($token) {
            $notifTest = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "timeout 10s curl -k -s -H 'Authorization: Bearer $token' https://13.48.248.180.nip.io/api/notifications/stats?user_id=1 2>/dev/null || echo 'API_TIMEOUT'"
            
            if ($notifTest -match "API_TIMEOUT") {
                Write-Host "⚠️  Notification API test timed out" -ForegroundColor Yellow
            } elseif ($notifTest -match '"success":true') {
                Write-Host "✅ Notification API working" -ForegroundColor Green
            } else {
                Write-Host "⚠️  Notification API response unclear" -ForegroundColor Yellow
            }
        }
    } catch {
        Write-Host "⚠️  Could not parse login response for API test" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Admin login failed" -ForegroundColor Red
    Write-Host "Response: $($loginTest.Substring(0, [Math]::Min(100, $loginTest.Length)))" -ForegroundColor Gray
}

# Step 4: Light database check (single query)
Write-Host "4. Light database table check..." -ForegroundColor Yellow
$dbCheck = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "timeout 5s mysql -u inventory_user -pStrongPass@123 inventory_db -e 'SELECT COUNT(*) FROM notifications LIMIT 1;' 2>/dev/null || echo 'DB_TIMEOUT'"

if ($dbCheck -match "DB_TIMEOUT") {
    Write-Host "⚠️  Database check timed out" -ForegroundColor Yellow
} elseif ($dbCheck -match '\d+') {
    Write-Host "✅ Notification table accessible" -ForegroundColor Green
} else {
    Write-Host "⚠️  Database check unclear" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "SAFE TASK 4 COMPLETED - Light testing done" -ForegroundColor Green
Write-Host "No heavy testing performed to avoid server load" -ForegroundColor Cyan