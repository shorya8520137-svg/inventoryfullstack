# AUTOMATED SERVER PERMISSIONS CHECK - FIXED VERSION
Write-Host "AUTOMATED SERVER PERMISSIONS CHECK" -ForegroundColor Green
Write-Host "=================================================="

# Server details
$SERVER_IP = "13.48.248.180"
$SSH_KEY = "C:\Users\Admin\awsconection.pem"

Write-Host "Connecting to server: $SERVER_IP" -ForegroundColor Yellow

# Create a simple bash script to run on the server
$bashScript = @'
#!/bin/bash
echo "=== CHECKING DATABASE PERMISSIONS ON SERVER ==="
echo "================================================"

# Check MySQL service
echo "MySQL Service Status:"
sudo systemctl status mysql --no-pager -l | head -5

# Test database connection
echo ""
echo "Testing Database Connection:"
mysql -u inventory_user -pStrongPass@123 -e "SELECT 'Database connection OK' as status;" 2>/dev/null

# Create diagnostic SQL
echo ""
echo "Running Database Diagnostic:"
mysql -u inventory_user -pStrongPass@123 inventory_db << 'SQLEOF'
SELECT '=== ADMIN USER CHECK ===' as info;
SELECT u.id, u.name, u.email, u.role_id, u.role, 
       r.name as role_name, r.display_name as role_display_name
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
WHERE u.email = 'admin@company.com';

SELECT '=== SYSTEM COUNTS ===' as info;
SELECT 'Permissions' as table_name, COUNT(*) as count FROM permissions
UNION ALL
SELECT 'Roles' as table_name, COUNT(*) as count FROM roles
UNION ALL
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Role-Permissions' as table_name, COUNT(*) as count FROM role_permissions;

SELECT '=== ADMIN PERMISSIONS COUNT ===' as info;
SELECT COUNT(*) as admin_permissions_count 
FROM role_permissions rp 
WHERE rp.role_id = 1;

SELECT '=== ADMIN PERMISSIONS SAMPLE ===' as info;
SELECT p.name, p.display_name, p.category
FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
WHERE rp.role_id = 1
ORDER BY p.category, p.name
LIMIT 10;
SQLEOF

# Check server process
echo ""
echo "Server Process Status:"
ps aux | grep node | grep -v grep

echo ""
echo "=== DIAGNOSTIC COMPLETE ==="
'@

try {
    Write-Host "Creating SSH script..." -ForegroundColor Cyan
    
    # Save bash script to temp file
    $bashScript | Out-File -FilePath "temp_check.sh" -Encoding UTF8
    
    Write-Host "Executing SSH connection..." -ForegroundColor Cyan
    
    # Execute SSH with the script
    $sshCommand = "ssh -i `"$SSH_KEY`" ubuntu@$SERVER_IP 'bash -s'"
    $result = Get-Content "temp_check.sh" | & cmd /c $sshCommand
    
    Write-Host ""
    Write-Host "SERVER RESPONSE:" -ForegroundColor Green
    Write-Host "=================================================="
    $result | ForEach-Object { Write-Host $_ }
    Write-Host "=================================================="
    
    # Clean up
    Remove-Item "temp_check.sh" -ErrorAction SilentlyContinue
    
    Write-Host ""
    Write-Host "AUTOMATED CHECK COMPLETE!" -ForegroundColor Green
    
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    
    # Try alternative method
    Write-Host ""
    Write-Host "Trying alternative SSH method..." -ForegroundColor Yellow
    
    try {
        # Direct SSH command
        $directCommand = "ssh -i `"$SSH_KEY`" ubuntu@$SERVER_IP `"mysql -u inventory_user -pStrongPass@123 inventory_db -e 'SELECT COUNT(*) as total_permissions FROM permissions; SELECT COUNT(*) as admin_permissions FROM role_permissions WHERE role_id=1;'`""
        $result2 = Invoke-Expression $directCommand
        
        Write-Host "QUICK CHECK RESULT:" -ForegroundColor Green
        $result2 | ForEach-Object { Write-Host $_ }
        
    } catch {
        Write-Host "Alternative method also failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Clean up
    Remove-Item "temp_check.sh" -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "ANALYSIS NEEDED:" -ForegroundColor Yellow
Write-Host "1. Check admin user details"
Write-Host "2. Look at permissions count (should be ~28, not 77)"
Write-Host "3. Check if admin has permissions assigned"
Write-Host "4. Verify server is running"