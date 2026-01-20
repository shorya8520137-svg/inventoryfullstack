# TEST ADMIN LOGIN WITH RUNNING SERVER
Write-Host "TESTING ADMIN LOGIN - SERVER RUNNING" -ForegroundColor Green
Write-Host "===================================="

$SERVER_IP = "13.48.248.180"
$SSH_KEY = "C:\Users\Admin\awsconection.pem"

Write-Host "1. Confirming server is running..." -ForegroundColor Cyan
$serverCheck = ssh -i $SSH_KEY ubuntu@$SERVER_IP "ps aux | grep 'node server.js' | grep -v grep"
if ($serverCheck) {
    Write-Host "✅ Server is running" -ForegroundColor Green
    Write-Host $serverCheck
} else {
    Write-Host "❌ Server not running" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "2. Testing login API..." -ForegroundColor Cyan
$loginTest = ssh -i $SSH_KEY ubuntu@$SERVER_IP "curl -s -X POST https://13.48.248.180.nip.io/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"admin@company.com\",\"password\":\"password\"}' -k"

Write-Host "API Response:"
Write-Host $loginTest

if ($loginTest -match '"success":true') {
    Write-Host ""
    Write-Host "✅ LOGIN SUCCESSFUL!" -ForegroundColor Green
    
    # Extract and count permissions
    if ($loginTest -match '"permissions":\[([^\]]*)\]') {
        $permsContent = $matches[1]
        if ($permsContent.Length -gt 10) {
            # Count permissions by counting commas + 1
            $permCount = ($permsContent -split ',').Count
            Write-Host "✅ Permissions found: $permCount" -ForegroundColor Green
            
            # Show first few permissions
            $firstPerms = ($permsContent -split ',')[0..4] -join ','
            Write-Host "Sample permissions: $firstPerms..." -ForegroundColor Yellow
        } else {
            Write-Host "❌ Empty permissions array" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ No permissions in response" -ForegroundColor Red
    }
    
    # Extract token
    if ($loginTest -match '"token":"([^"]*)"') {
        Write-Host "✅ JWT Token received" -ForegroundColor Green
    } else {
        Write-Host "❌ No JWT token in response" -ForegroundColor Red
    }
    
} else {
    Write-Host ""
    Write-Host "❌ LOGIN FAILED" -ForegroundColor Red
    
    if ($loginTest -match '"message":"([^"]*)"') {
        Write-Host "Error: $($matches[1])" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "3. Quick database verification..." -ForegroundColor Cyan
$adminPerms = ssh -i $SSH_KEY ubuntu@$SERVER_IP "mysql -u inventory_user -pStrongPass@123 inventory_db -e 'SELECT COUNT(*) FROM role_permissions WHERE role_id=1;' -s -N 2>/dev/null"
Write-Host "Admin role has $adminPerms permissions in database" -ForegroundColor Yellow

Write-Host ""
Write-Host "🎯 SUMMARY:" -ForegroundColor Green
Write-Host "==========="
if ($loginTest -match '"success":true') {
    Write-Host "✅ Server: Running"
    Write-Host "✅ Login: Working"
    Write-Host "✅ Admin: admin@company.com / password"
    Write-Host "✅ Database: $adminPerms permissions"
    Write-Host ""
    Write-Host "🎉 YOUR FRONTEND SHOULD NOW WORK!" -ForegroundColor Green
    Write-Host "Login URL: https://13.48.248.180.nip.io" -ForegroundColor Cyan
} else {
    Write-Host "❌ Login still failing - need to debug further"
}