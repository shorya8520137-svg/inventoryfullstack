# FIX ADMIN ZERO PERMISSIONS ISSUE
Write-Host "FIXING ADMIN ZERO PERMISSIONS ISSUE" -ForegroundColor Green
Write-Host "===================================="

$SERVER_IP = "13.48.248.180"
$SSH_KEY = "C:\Users\Admin\awsconection.pem"

Write-Host "1. Checking admin user in database..." -ForegroundColor Cyan
$adminUser = ssh -i $SSH_KEY ubuntu@$SERVER_IP "mysql -u inventory_user -pStrongPass@123 inventory_db -e 'SELECT id, name, email, role_id FROM users WHERE email=\"admin@company.com\";' 2>/dev/null"
Write-Host $adminUser

Write-Host ""
Write-Host "2. Checking admin role permissions..." -ForegroundColor Cyan
$rolePerms = ssh -i $SSH_KEY ubuntu@$SERVER_IP "mysql -u inventory_user -pStrongPass@123 inventory_db -e 'SELECT COUNT(*) as count FROM role_permissions WHERE role_id=1;' -s -N 2>/dev/null"
Write-Host "Admin role (role_id=1) has $rolePerms permissions"

Write-Host ""
Write-Host "3. Checking total permissions available..." -ForegroundColor Cyan
$totalPerms = ssh -i $SSH_KEY ubuntu@$SERVER_IP "mysql -u inventory_user -pStrongPass@123 inventory_db -e 'SELECT COUNT(*) as count FROM permissions WHERE is_active=1;' -s -N 2>/dev/null"
Write-Host "Total active permissions: $totalPerms"

if ($rolePerms -eq 0 -or $rolePerms -lt $totalPerms) {
    Write-Host ""
    Write-Host "🔧 FIXING: Admin role missing permissions!" -ForegroundColor Yellow
    
    # Grant all permissions to admin role
    ssh -i $SSH_KEY ubuntu@$SERVER_IP "mysql -u inventory_user -pStrongPass@123 inventory_db -e 'DELETE FROM role_permissions WHERE role_id=1; INSERT INTO role_permissions (role_id, permission_id) SELECT 1, id FROM permissions WHERE is_active=1;' 2>/dev/null"
    
    $newRolePerms = ssh -i $SSH_KEY ubuntu@$SERVER_IP "mysql -u inventory_user -pStrongPass@123 inventory_db -e 'SELECT COUNT(*) as count FROM role_permissions WHERE role_id=1;' -s -N 2>/dev/null"
    Write-Host "✅ Admin role now has $newRolePerms permissions" -ForegroundColor Green
}

Write-Host ""
Write-Host "4. Testing login API to check permissions in response..." -ForegroundColor Cyan

# Test login API and check response
$loginTest = ssh -i $SSH_KEY ubuntu@$SERVER_IP "curl -s -X POST https://13.48.248.180.nip.io/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"admin@company.com\",\"password\":\"password\"}' -k"

Write-Host "Login API Response:"
Write-Host $loginTest

if ($loginTest -match '"success":true') {
    Write-Host ""
    Write-Host "✅ Login successful!" -ForegroundColor Green
    
    # Check if permissions are in the response
    if ($loginTest -match '"permissions":\[([^\]]*)\]') {
        $permsInResponse = $matches[1]
        if ($permsInResponse.Length -gt 10) {
            # Count permissions by counting commas + 1
            $permCount = ($permsInResponse -split '","').Count
            Write-Host "✅ Permissions in API response: $permCount" -ForegroundColor Green
            Write-Host "✅ Sample permissions: $($permsInResponse.Substring(0, [Math]::Min(100, $permsInResponse.Length)))..." -ForegroundColor Yellow
        } else {
            Write-Host "❌ Empty permissions array in response" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ No permissions field in response" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Login failed" -ForegroundColor Red
    if ($loginTest -match '"message":"([^"]*)"') {
        Write-Host "Error: $($matches[1])" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "5. Checking what permissions should be returned..." -ForegroundColor Cyan
$samplePerms = ssh -i $SSH_KEY ubuntu@$SERVER_IP "mysql -u inventory_user -pStrongPass@123 inventory_db -e 'SELECT p.name FROM permissions p JOIN role_permissions rp ON p.id = rp.permission_id WHERE rp.role_id = 1 AND p.is_active = 1 LIMIT 5;' 2>/dev/null"
Write-Host "Sample permissions that should be returned:"
Write-Host $samplePerms

Write-Host ""
Write-Host "🎯 DIAGNOSIS COMPLETE:" -ForegroundColor Green
Write-Host "======================"
if ($loginTest -match '"success":true' -and $loginTest -match '"permissions":\[[^\]]+\]') {
    Write-Host "✅ Backend: Working - returns permissions"
    Write-Host "✅ Database: Fixed - admin has $newRolePerms permissions"
    Write-Host "✅ API: Returns permission array"
    Write-Host ""
    Write-Host "🎉 ISSUE SHOULD BE FIXED!" -ForegroundColor Green
    Write-Host "Try logging into your frontend now:"
    Write-Host "Email: admin@company.com"
    Write-Host "Password: password"
    Write-Host "URL: https://13.48.248.180.nip.io"
} else {
    Write-Host "❌ Issue still exists - API not returning permissions properly"
    Write-Host "Check server logs and ensure server is running correctly"
}