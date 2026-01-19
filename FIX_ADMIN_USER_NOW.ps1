# FIX ADMIN USER - CREATE MISSING ADMIN
Write-Host "FIXING ADMIN USER ISSUE" -ForegroundColor Green
Write-Host "======================="

$SERVER_IP = "13.48.248.180"
$SSH_KEY = "C:\Users\Admin\awsconection.pem"

Write-Host "Creating admin user on server..." -ForegroundColor Yellow

try {
    # Create SQL to fix admin user
    $fixSQL = @"
USE inventory_db;

-- Check current users
SELECT 'Current users:' as info;
SELECT id, name, email, role_id FROM users;

-- Create admin user if not exists
INSERT IGNORE INTO users (name, email, password, role_id, is_active, created_at) 
VALUES ('System Administrator', 'admin@company.com', '\$2b\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 1, NOW());

-- Update existing admin user if exists
UPDATE users 
SET name = 'System Administrator', 
    password = '\$2b\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role_id = 1,
    is_active = 1
WHERE email = 'admin@company.com';

-- Verify admin user
SELECT 'Admin user after fix:' as info;
SELECT u.id, u.name, u.email, u.role_id, r.name as role_name
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
WHERE u.email = 'admin@company.com';

-- Check admin permissions
SELECT 'Admin permissions count:' as info;
SELECT COUNT(*) as count FROM role_permissions WHERE role_id = 1;

SELECT 'Fix complete!' as status;
"@

    Write-Host "Executing SQL fix on server..." -ForegroundColor Cyan
    
    # Execute the fix
    $result = ssh -i $SSH_KEY ubuntu@$SERVER_IP "mysql -u inventory_user -pStrongPass@123 inventory_db -e `"$fixSQL`""
    
    Write-Host ""
    Write-Host "FIX RESULT:" -ForegroundColor Green
    Write-Host "==========="
    $result | ForEach-Object { Write-Host $_ }
    
    Write-Host ""
    Write-Host "Verifying fix..." -ForegroundColor Cyan
    
    # Verify the fix worked
    $verify = ssh -i $SSH_KEY ubuntu@$SERVER_IP "mysql -u inventory_user -pStrongPass@123 inventory_db -e 'SELECT id, name, email, role_id FROM users WHERE email=\"admin@company.com\";'"
    
    if ($verify) {
        Write-Host "ADMIN USER CREATED SUCCESSFULLY!" -ForegroundColor Green
        Write-Host $verify
        
        Write-Host ""
        Write-Host "ADMIN LOGIN CREDENTIALS:" -ForegroundColor Yellow
        Write-Host "Email: admin@company.com"
        Write-Host "Password: password"
        Write-Host "API: https://13.48.248.180.nip.io/api/auth/login"
        
        Write-Host ""
        Write-Host "Starting Node.js server..." -ForegroundColor Cyan
        
        # Start the server
        $startServer = ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && nohup node server.js > server.log 2>&1 & echo 'Server started'"
        Write-Host $startServer -ForegroundColor Green
        
        # Wait a moment and check if server started
        Start-Sleep -Seconds 3
        $serverCheck = ssh -i $SSH_KEY ubuntu@$SERVER_IP "ps aux | grep node | grep -v grep | wc -l"
        
        if ($serverCheck -gt 0) {
            Write-Host "Node.js server is now RUNNING!" -ForegroundColor Green
        } else {
            Write-Host "Server start may have failed. Check server.log" -ForegroundColor Red
        }
        
    } else {
        Write-Host "ADMIN USER CREATION FAILED!" -ForegroundColor Red
    }
    
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Try logging in with: admin@company.com / password"
Write-Host "2. Check if you now have full dashboard access"
Write-Host "3. If still issues, check server logs"