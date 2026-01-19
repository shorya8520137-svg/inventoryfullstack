# AUTOMATED SERVER PERMISSIONS CHECK
# This script will SSH into your server and check the database permissions automatically

Write-Host "🚀 AUTOMATED SERVER PERMISSIONS CHECK" -ForegroundColor Green
Write-Host "=" * 50

# Server details
$SERVER_IP = "13.48.248.180"
$SSH_KEY = "C:\Users\Admin\awsconection.pem"
$DB_USER = "inventory_user"
$DB_PASS = "StrongPass@123"
$DB_NAME = "inventory_db"

Write-Host "📡 Connecting to server: $SERVER_IP" -ForegroundColor Yellow

# Create SQL diagnostic script content
$SQL_SCRIPT = @"
USE $DB_NAME;

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
LIMIT 15;

SELECT '=== TABLE STRUCTURES ===' as info;
DESCRIBE users;
DESCRIBE permissions;
DESCRIBE roles;
DESCRIBE role_permissions;

SELECT '=== DIAGNOSTIC COMPLETE ===' as info;
"@

# Create the SSH command to run on server
$SSH_COMMANDS = @"
echo '🔍 CHECKING DATABASE PERMISSIONS ON SERVER'
echo '============================================'

# Check if MySQL is running
echo '📊 MySQL Service Status:'
sudo systemctl status mysql --no-pager -l

# Check database connection
echo '🔗 Testing Database Connection:'
mysql -u $DB_USER -p$DB_PASS -e "SELECT 'Database connection OK' as status;"

# Create and run diagnostic SQL
echo '📋 Running Database Diagnostic:'
cat > /tmp/check_permissions.sql << 'EOF'
$SQL_SCRIPT
EOF

# Run the diagnostic
mysql -u $DB_USER -p$DB_PASS < /tmp/check_permissions.sql

# Check server process
echo '🖥️ Server Process Status:'
ps aux | grep node | grep -v grep

# Check server directory
echo '📁 Server Directory:'
cd ~/inventoryfullstack && ls -la | head -10

# Clean up
rm -f /tmp/check_permissions.sql

echo '✅ DIAGNOSTIC COMPLETE'
"@

try {
    Write-Host "🔧 Creating SSH command script..." -ForegroundColor Cyan
    
    # Save SSH commands to temp file
    $SSH_COMMANDS | Out-File -FilePath "temp_ssh_commands.sh" -Encoding UTF8
    
    Write-Host "📤 Executing SSH connection and database check..." -ForegroundColor Cyan
    
    # Execute SSH with the commands
    $result = ssh -i $SSH_KEY ubuntu@$SERVER_IP "bash -s" < temp_ssh_commands.sh
    
    Write-Host "📥 SERVER RESPONSE:" -ForegroundColor Green
    Write-Host "=" * 50
    Write-Output $result
    Write-Host "=" * 50
    
    # Clean up temp file
    Remove-Item "temp_ssh_commands.sh" -ErrorAction SilentlyContinue
    
    Write-Host "✅ AUTOMATED CHECK COMPLETE!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 ANALYSIS:" -ForegroundColor Yellow
    Write-Host "1. Check the admin user details above"
    Write-Host "2. Look at the permissions count"
    Write-Host "3. See if admin has permissions assigned"
    Write-Host "4. Check if server is running"
    
} catch {
    Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 TROUBLESHOOTING:" -ForegroundColor Yellow
    Write-Host "1. Make sure SSH key path is correct: $SSH_KEY"
    Write-Host "2. Check if server is accessible: $SERVER_IP"
    Write-Host "3. Verify database credentials are correct"
    
    # Clean up temp file
    Remove-Item "temp_ssh_commands.sh" -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "🎯 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "Based on the results above, I'll create the exact fix needed for your permissions system."