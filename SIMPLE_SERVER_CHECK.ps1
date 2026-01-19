# SIMPLE SERVER DATABASE CHECK
Write-Host "SIMPLE SERVER DATABASE CHECK" -ForegroundColor Green
Write-Host "============================="

$SERVER_IP = "13.48.248.180"
$SSH_KEY = "C:\Users\Admin\awsconection.pem"

Write-Host "Connecting to: $SERVER_IP" -ForegroundColor Yellow

try {
    Write-Host ""
    Write-Host "1. Testing SSH connection..." -ForegroundColor Cyan
    $test = ssh -i $SSH_KEY ubuntu@$SERVER_IP "echo 'SSH connection OK'"
    Write-Host $test -ForegroundColor Green
    
    Write-Host ""
    Write-Host "2. Checking MySQL service..." -ForegroundColor Cyan
    $mysql_status = ssh -i $SSH_KEY ubuntu@$SERVER_IP "sudo systemctl is-active mysql"
    Write-Host "MySQL Status: $mysql_status" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "3. Testing database connection..." -ForegroundColor Cyan
    $db_test = ssh -i $SSH_KEY ubuntu@$SERVER_IP "mysql -u inventory_user -pStrongPass@123 -e 'SELECT 1 as test;' 2>/dev/null"
    if ($db_test) {
        Write-Host "Database connection: OK" -ForegroundColor Green
    } else {
        Write-Host "Database connection: FAILED" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "4. Checking permissions count..." -ForegroundColor Cyan
    $perm_count = ssh -i $SSH_KEY ubuntu@$SERVER_IP "mysql -u inventory_user -pStrongPass@123 inventory_db -e 'SELECT COUNT(*) FROM permissions;' -s -N 2>/dev/null"
    Write-Host "Total permissions in database: $perm_count" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "5. Checking admin user..." -ForegroundColor Cyan
    $admin_check = ssh -i $SSH_KEY ubuntu@$SERVER_IP "mysql -u inventory_user -pStrongPass@123 inventory_db -e 'SELECT id, name, email, role_id FROM users WHERE email=\"admin@company.com\";' -s -N 2>/dev/null"
    if ($admin_check) {
        Write-Host "Admin user found: $admin_check" -ForegroundColor Green
    } else {
        Write-Host "Admin user: NOT FOUND" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "6. Checking admin permissions..." -ForegroundColor Cyan
    $admin_perms = ssh -i $SSH_KEY ubuntu@$SERVER_IP "mysql -u inventory_user -pStrongPass@123 inventory_db -e 'SELECT COUNT(*) FROM role_permissions WHERE role_id=1;' -s -N 2>/dev/null"
    Write-Host "Admin permissions count: $admin_perms" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "7. Checking Node.js server..." -ForegroundColor Cyan
    $node_process = ssh -i $SSH_KEY ubuntu@$SERVER_IP "ps aux | grep node | grep -v grep | wc -l"
    if ($node_process -gt 0) {
        Write-Host "Node.js server: RUNNING ($node_process processes)" -ForegroundColor Green
    } else {
        Write-Host "Node.js server: NOT RUNNING" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "SUMMARY:" -ForegroundColor Yellow
    Write-Host "========="
    Write-Host "Permissions in DB: $perm_count (should be ~28)"
    Write-Host "Admin permissions: $admin_perms (should be ~28)"
    Write-Host "Server status: $(if($node_process -gt 0){'RUNNING'}else{'STOPPED'})"
    
    if ($perm_count -gt 50) {
        Write-Host ""
        Write-Host "ISSUE FOUND: Too many permissions ($perm_count)" -ForegroundColor Red
        Write-Host "Need to clean up permissions system" -ForegroundColor Red
    }
    
    if ($admin_perms -eq 0) {
        Write-Host ""
        Write-Host "ISSUE FOUND: Admin has ZERO permissions" -ForegroundColor Red
        Write-Host "Need to assign permissions to admin role" -ForegroundColor Red
    }
    
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "TROUBLESHOOTING:" -ForegroundColor Yellow
    Write-Host "1. Check SSH key path: $SSH_KEY"
    Write-Host "2. Verify server IP: $SERVER_IP"
    Write-Host "3. Make sure you can SSH manually first"
}

Write-Host ""
Write-Host "CHECK COMPLETE!" -ForegroundColor Green