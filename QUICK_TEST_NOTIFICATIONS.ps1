Write-Host "🧪 QUICK NOTIFICATION SYSTEM TEST" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

# Test admin login
Write-Host "1. Testing admin login..." -ForegroundColor Yellow
$loginResult = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "curl -k -s -X POST https://13.48.248.180.nip.io/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"admin@company.com\",\"password\":\"admin@123\"}'"

if ($loginResult -match '"success":true') {
    Write-Host "✅ Admin login working" -ForegroundColor Green
} else {
    Write-Host "❌ Admin login failed" -ForegroundColor Red
    Write-Host $loginResult
    exit 1
}

# Test notification endpoint
Write-Host "2. Testing notification endpoint..." -ForegroundColor Yellow
$token = ($loginResult | ConvertFrom-Json).token
$notifTest = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "curl -k -s -H 'Authorization: Bearer $token' https://13.48.248.180.nip.io/api/notifications/stats?user_id=1"

if ($notifTest -match '"success":true') {
    Write-Host "✅ Notification API working" -ForegroundColor Green
} else {
    Write-Host "❌ Notification API failed" -ForegroundColor Red
    Write-Host $notifTest
    exit 1
}

# Test database tables
Write-Host "3. Testing database tables..." -ForegroundColor Yellow
$dbTest = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "mysql -u inventory_user -pStrongPass@123 inventory_db -e 'SELECT COUNT(*) FROM notifications;' 2>/dev/null"

if ($dbTest -match '\d+') {
    Write-Host "✅ Database tables working" -ForegroundColor Green
} else {
    Write-Host "❌ Database tables failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 ALL TESTS PASSED!" -ForegroundColor Green
Write-Host "Notification system is ready for Phase 1.5!" -ForegroundColor Cyan