# SIMPLE ADMIN PERMISSIONS FIX
Write-Host "SIMPLE ADMIN PERMISSIONS FIX" -ForegroundColor Green
Write-Host "============================="

$SERVER_IP = "13.48.248.180"
$SSH_KEY = "C:\Users\Admin\awsconection.pem"

Write-Host "1. Checking admin user..." -ForegroundColor Cyan
$adminCheck = ssh -i $SSH_KEY ubuntu@$SERVER_IP "mysql -u inventory_user -pStrongPass@123 inventory_db -e 'SELECT id, email, role_id FROM users WHERE email=\"admin@company.com\";'"
Write-Host $adminCheck

Write-Host ""
Write-Host "2. Checking admin permissions..." -ForegroundColor Cyan
$permCount = ssh -i $SSH_KEY ubuntu@$SERVER_IP "mysql -u inventory_user -pStrongPass@123 inventory_db -e 'SELECT COUNT(*) FROM role_permissions WHERE role_id=1;' -s -N"
Write-Host "Admin role has $permCount permissions"

Write-Host ""
Write-Host "3. Fixing admin permissions..." -ForegroundColor Cyan
ssh -i $SSH_KEY ubuntu@$SERVER_IP "mysql -u inventory_user -pStrongPass@123 inventory_db -e 'DELETE FROM role_permissions WHERE role_id=1; INSERT INTO role_permissions (role_id, permission_id) SELECT 1, id FROM permissions WHERE is_active=1;'"

$newPermCount = ssh -i $SSH_KEY ubuntu@$SERVER_IP "mysql -u inventory_user -pStrongPass@123 inventory_db -e 'SELECT COUNT(*) FROM role_permissions WHERE role_id=1;' -s -N"
Write-Host "Admin role now has $newPermCount permissions"

Write-Host ""
Write-Host "4. Testing login API..." -ForegroundColor Cyan
$loginResponse = ssh -i $SSH_KEY ubuntu@$SERVER_IP "curl -s -X POST https://13.48.248.180.nip.io/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"admin@company.com\",\"password\":\"password\"}' -k"

Write-Host "API Response:"
Write-Host $loginResponse

Write-Host ""
Write-Host "SUMMARY:" -ForegroundColor Yellow
Write-Host "Admin permissions fixed: $newPermCount"
Write-Host "Login credentials: admin@company.com / password"
Write-Host "Frontend URL: https://13.48.248.180.nip.io"