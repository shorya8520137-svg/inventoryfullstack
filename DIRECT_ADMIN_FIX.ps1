# DIRECT ADMIN FIX
Write-Host "DIRECT ADMIN USER FIX" -ForegroundColor Green
Write-Host "===================="

$SERVER_IP = "13.48.248.180"
$SSH_KEY = "C:\Users\Admin\awsconection.pem"

try {
    Write-Host "Creating admin user directly..." -ForegroundColor Yellow
    
    # Direct MySQL command to create admin user
    $result = ssh -i $SSH_KEY ubuntu@$SERVER_IP "mysql -u inventory_user -pStrongPass@123 inventory_db -e `"INSERT IGNORE INTO users (name, email, password, role_id, is_active, created_at) VALUES ('System Administrator', 'admin@company.com', '\\\$2b\\\$10\\\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 1, NOW());`" 2>/dev/null"
    
    Write-Host "Insert result: $result" -ForegroundColor Cyan
    
    Write-Host ""
    Write-Host "Checking if admin user exists..." -ForegroundColor Cyan
    
    # Check admin user
    $adminCheck = ssh -i $SSH_KEY ubuntu@$SERVER_IP "mysql -u inventory_user -pStrongPass@123 inventory_db -e `"SELECT id, name, email, role_id FROM users WHERE email='admin@company.com';`" 2>/dev/null"
    
    if ($adminCheck) {
        Write-Host "ADMIN USER FOUND!" -ForegroundColor Green
        Write-Host $adminCheck
        
        Write-Host ""
        Write-Host "Checking admin permissions..." -ForegroundColor Cyan
        
        # Check permissions count for admin role
        $permCount = ssh -i $SSH_KEY ubuntu@$SERVER_IP "mysql -u inventory_user -pStrongPass@123 inventory_db -e `"SELECT COUNT(*) as permissions FROM role_permissions WHERE role_id=1;`" -s -N 2>/dev/null"
        Write-Host "Admin has $permCount permissions" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "Starting server..." -ForegroundColor Cyan
        
        # Kill any existing node processes
        ssh -i $SSH_KEY ubuntu@$SERVER_IP "pkill -f 'node server.js'" 2>/dev/null
        
        # Start server
        ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && nohup node server.js > server.log 2>&1 &" 2>/dev/null
        
        Start-Sleep -Seconds 3
        
        # Check if server is running
        $serverRunning = ssh -i $SSH_KEY ubuntu@$SERVER_IP "ps aux | grep 'node server.js' | grep -v grep | wc -l"
        
        if ($serverRunning -gt 0) {
            Write-Host "Server is RUNNING!" -ForegroundColor Green
            
            Write-Host ""
            Write-Host "SUCCESS! ADMIN USER READY!" -ForegroundColor Green
            Write-Host "=========================="
            Write-Host "Email: admin@company.com"
            Write-Host "Password: password"
            Write-Host "Server: https://13.48.248.180.nip.io"
            Write-Host "Permissions: $permCount (should be 28)"
            
        } else {
            Write-Host "Server failed to start. Check logs:" -ForegroundColor Red
            $logs = ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && tail -5 server.log 2>/dev/null"
            Write-Host $logs
        }
        
    } else {
        Write-Host "ADMIN USER NOT FOUND!" -ForegroundColor Red
        
        # Try to see what users exist
        Write-Host "Existing users:" -ForegroundColor Yellow
        $existingUsers = ssh -i $SSH_KEY ubuntu@$SERVER_IP "mysql -u inventory_user -pStrongPass@123 inventory_db -e `"SELECT id, name, email, role_id FROM users;`" 2>/dev/null"
        Write-Host $existingUsers
    }
    
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "NEXT STEP:" -ForegroundColor Yellow
Write-Host "Try logging into your frontend now with admin@company.com / password"