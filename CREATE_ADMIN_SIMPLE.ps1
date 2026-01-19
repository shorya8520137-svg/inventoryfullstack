# CREATE ADMIN USER - SIMPLE VERSION
Write-Host "CREATING ADMIN USER" -ForegroundColor Green
Write-Host "==================="

$SERVER_IP = "13.48.248.180"
$SSH_KEY = "C:\Users\Admin\awsconection.pem"

try {
    Write-Host "Creating admin user on server..." -ForegroundColor Yellow
    
    # Create a simple SQL file on the server and execute it
    $createAdmin = ssh -i $SSH_KEY ubuntu@$SERVER_IP @"
cat > /tmp/create_admin.sql << 'EOF'
USE inventory_db;
INSERT IGNORE INTO users (name, email, password, role_id, is_active, created_at) 
VALUES ('System Administrator', 'admin@company.com', '\$2b\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 1, NOW());
EOF

mysql -u inventory_user -pStrongPass@123 < /tmp/create_admin.sql
rm /tmp/create_admin.sql
"@
    
    Write-Host $createAdmin
    
    Write-Host ""
    Write-Host "Verifying admin user creation..." -ForegroundColor Cyan
    
    # Check if admin user was created
    $checkAdmin = ssh -i $SSH_KEY ubuntu@$SERVER_IP "mysql -u inventory_user -pStrongPass@123 inventory_db -e 'SELECT id, name, email, role_id FROM users WHERE email=\"admin@company.com\";' 2>/dev/null"
    
    if ($checkAdmin -and $checkAdmin -notlike "*ERROR*") {
        Write-Host "ADMIN USER CREATED SUCCESSFULLY!" -ForegroundColor Green
        Write-Host $checkAdmin
        
        Write-Host ""
        Write-Host "ADMIN LOGIN CREDENTIALS:" -ForegroundColor Yellow
        Write-Host "========================"
        Write-Host "Email: admin@company.com"
        Write-Host "Password: password"
        Write-Host "API URL: https://13.48.248.180.nip.io/api/auth/login"
        
        Write-Host ""
        Write-Host "Starting server..." -ForegroundColor Cyan
        
        # Start the Node.js server
        $startServer = ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && nohup node server.js > /dev/null 2>&1 & echo 'Server start command sent'"
        Write-Host $startServer
        
        # Wait and check server status
        Start-Sleep -Seconds 2
        $serverStatus = ssh -i $SSH_KEY ubuntu@$SERVER_IP "ps aux | grep 'node server.js' | grep -v grep | wc -l"
        
        if ($serverStatus -gt 0) {
            Write-Host "Node.js server is RUNNING!" -ForegroundColor Green
        } else {
            Write-Host "Server may not have started. Try manually: cd ~/inventoryfullstack && node server.js" -ForegroundColor Yellow
        }
        
        Write-Host ""
        Write-Host "TESTING LOGIN API..." -ForegroundColor Cyan
        
        # Test the login API
        $testLogin = ssh -i $SSH_KEY ubuntu@$SERVER_IP "curl -s -X POST https://13.48.248.180.nip.io/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"admin@company.com\",\"password\":\"password\"}' -k | head -5"
        
        if ($testLogin) {
            Write-Host "API Response:" -ForegroundColor Green
            Write-Host $testLogin
        }
        
    } else {
        Write-Host "ADMIN USER CREATION FAILED!" -ForegroundColor Red
        Write-Host "Error: $checkAdmin"
    }
    
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "SUMMARY:" -ForegroundColor Yellow
Write-Host "========"
Write-Host "1. Admin user should now exist in database"
Write-Host "2. Server should be running on port 5000"
Write-Host "3. Try logging in to your frontend with:"
Write-Host "   Email: admin@company.com"
Write-Host "   Password: password"
Write-Host "4. You should now have full dashboard access!"