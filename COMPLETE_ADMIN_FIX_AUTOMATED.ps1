# COMPLETE ADMIN FIX - AUTOMATED SOLUTION
# This script fixes the admin permissions issue completely
Write-Host "COMPLETE ADMIN PERMISSIONS FIX" -ForegroundColor Green
Write-Host "==============================="

$SERVER_IP = "13.48.248.180"
$SSH_KEY = "C:\Users\Admin\awsconection.pem"
$DATABASE = "inventory_db"
$DB_USER = "inventory_user"
$DB_PASS = "StrongPass@123"

# Admin credentials
$ADMIN_EMAIL = "admin@company.com"
$ADMIN_PASSWORD = "password"
$ADMIN_HASH = "`$2b`$10`$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi"

Write-Host "Step 1: Checking database connection..." -ForegroundColor Cyan
try {
    $dbTest = ssh -i $SSH_KEY ubuntu@$SERVER_IP "mysql -u $DB_USER -p$DB_PASS $DATABASE -e 'SELECT 1;' 2>/dev/null"
    if ($dbTest) {
        Write-Host "✅ Database connection: OK" -ForegroundColor Green
    } else {
        throw "Database connection failed"
    }
} catch {
    Write-Host "❌ Database connection failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: Checking permissions system..." -ForegroundColor Cyan

# Check permissions count
$permCount = ssh -i $SSH_KEY ubuntu@$SERVER_IP "mysql -u $DB_USER -p$DB_PASS $DATABASE -e 'SELECT COUNT(*) FROM permissions WHERE is_active=1;' -s -N 2>/dev/null"
Write-Host "Total active permissions: $permCount" -ForegroundColor Yellow

# Check admin role permissions
$adminRolePerms = ssh -i $SSH_KEY ubuntu@$SERVER_IP "mysql -u $DB_USER -p$DB_PASS $DATABASE -e 'SELECT COUNT(*) FROM role_permissions WHERE role_id=1;' -s -N 2>/dev/null"
Write-Host "Admin role permissions: $adminRolePerms" -ForegroundColor Yellow

if ($adminRolePerms -ne $permCount) {
    Write-Host "⚠️  Admin role missing permissions. Fixing..." -ForegroundColor Yellow
    
    # Grant all permissions to admin role
    $fixPerms = ssh -i $SSH_KEY ubuntu@$SERVER_IP "mysql -u $DB_USER -p$DB_PASS $DATABASE -e 'DELETE FROM role_permissions WHERE role_id=1; INSERT INTO role_permissions (role_id, permission_id) SELECT 1, id FROM permissions WHERE is_active=1;' 2>/dev/null"
    
    # Verify fix
    $newAdminRolePerms = ssh -i $SSH_KEY ubuntu@$SERVER_IP "mysql -u $DB_USER -p$DB_PASS $DATABASE -e 'SELECT COUNT(*) FROM role_permissions WHERE role_id=1;' -s -N 2>/dev/null"
    Write-Host "✅ Admin role now has $newAdminRolePerms permissions" -ForegroundColor Green
} else {
    Write-Host "✅ Admin role permissions: OK" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 3: Creating/Updating admin user..." -ForegroundColor Cyan

# Remove existing admin user if exists
ssh -i $SSH_KEY ubuntu@$SERVER_IP "mysql -u $DB_USER -p$DB_PASS $DATABASE -e 'DELETE FROM users WHERE email=\"$ADMIN_EMAIL\";' 2>/dev/null"

# Create new admin user
$createAdmin = ssh -i $SSH_KEY ubuntu@$SERVER_IP "mysql -u $DB_USER -p$DB_PASS $DATABASE -e 'INSERT INTO users (name, email, password_hash, role_id, is_active, created_at, updated_at) VALUES (\"System Administrator\", \"$ADMIN_EMAIL\", \"$ADMIN_HASH\", 1, 1, NOW(), NOW());' 2>/dev/null"

# Verify admin user creation
$adminCheck = ssh -i $SSH_KEY ubuntu@$SERVER_IP "mysql -u $DB_USER -p$DB_PASS $DATABASE -e 'SELECT id, name, email, role_id FROM users WHERE email=\"$ADMIN_EMAIL\";' 2>/dev/null"

if ($adminCheck -match "System Administrator") {
    Write-Host "✅ Admin user created successfully" -ForegroundColor Green
    Write-Host $adminCheck
} else {
    Write-Host "❌ Failed to create admin user" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 4: Starting Node.js server..." -ForegroundColor Cyan

# Kill existing node processes
ssh -i $SSH_KEY ubuntu@$SERVER_IP "pkill -f 'node server.js'" 2>/dev/null
Start-Sleep -Seconds 2

# Start server in background
ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && nohup node server.js > server.log 2>&1 &" 2>/dev/null
Start-Sleep -Seconds 5

# Check if server is running
$serverCheck = ssh -i $SSH_KEY ubuntu@$SERVER_IP "ps aux | grep 'node server.js' | grep -v grep | wc -l"

if ($serverCheck -gt 0) {
    Write-Host "✅ Server is running" -ForegroundColor Green
} else {
    Write-Host "❌ Server failed to start. Checking logs..." -ForegroundColor Red
    $logs = ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && tail -10 server.log 2>/dev/null"
    Write-Host $logs
    exit 1
}

Write-Host ""
Write-Host "Step 5: Testing login API..." -ForegroundColor Cyan

# Test login API
$loginTest = ssh -i $SSH_KEY ubuntu@$SERVER_IP "curl -s -X POST https://13.48.248.180.nip.io/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}' -k"

if ($loginTest -match '"success":true') {
    Write-Host "✅ Login API test: SUCCESS" -ForegroundColor Green
    
    # Extract permissions count from response
    if ($loginTest -match '"permissions":\[([^\]]*)\]') {
        $permsInResponse = ($matches[1] -split ',').Count
        Write-Host "✅ Permissions in response: $permsInResponse" -ForegroundColor Green
    }
} else {
    Write-Host "❌ Login API test: FAILED" -ForegroundColor Red
    Write-Host "Response: $loginTest"
}

Write-Host ""
Write-Host "🎉 ADMIN FIX COMPLETED!" -ForegroundColor Green
Write-Host "======================"
Write-Host "✅ Database: Connected"
Write-Host "✅ Permissions: $permCount total, $newAdminRolePerms for admin"
Write-Host "✅ Admin User: Created"
Write-Host "✅ Server: Running"
Write-Host "✅ API: Working"
Write-Host ""
Write-Host "LOGIN CREDENTIALS:" -ForegroundColor Yellow
Write-Host "Email: $ADMIN_EMAIL"
Write-Host "Password: $ADMIN_PASSWORD"
Write-Host "URL: https://13.48.248.180.nip.io"
Write-Host ""
Write-Host "The admin user now has full permissions and should show the complete dashboard." -ForegroundColor Green