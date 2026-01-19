# DEBUG ADMIN USER CREATION
Write-Host "DEBUGGING ADMIN USER CREATION" -ForegroundColor Yellow
Write-Host "============================="

$SERVER_IP = "13.48.248.180"
$SSH_KEY = "C:\Users\Admin\awsconection.pem"
$DATABASE = "inventory_db"
$DB_USER = "inventory_user"
$DB_PASS = "StrongPass@123"
$ADMIN_EMAIL = "admin@company.com"

Write-Host "1. Checking current users..." -ForegroundColor Cyan
$currentUsers = ssh -i $SSH_KEY ubuntu@$SERVER_IP "mysql -u $DB_USER -p$DB_PASS $DATABASE -e 'SELECT id, name, email, role_id FROM users;' 2>/dev/null"
Write-Host $currentUsers

Write-Host ""
Write-Host "2. Checking users table structure..." -ForegroundColor Cyan
$tableStructure = ssh -i $SSH_KEY ubuntu@$SERVER_IP "mysql -u $DB_USER -p$DB_PASS $DATABASE -e 'DESCRIBE users;' 2>/dev/null"
Write-Host $tableStructure

Write-Host ""
Write-Host "3. Trying simple admin creation..." -ForegroundColor Cyan
$simpleCreate = ssh -i $SSH_KEY ubuntu@$SERVER_IP "mysql -u $DB_USER -p$DB_PASS $DATABASE -e 'INSERT INTO users (name, email, password, role_id) VALUES (\"Admin User\", \"$ADMIN_EMAIL\", \"password\", 1);' 2>&1"
Write-Host "Result: $simpleCreate"

Write-Host ""
Write-Host "4. Checking if admin was created..." -ForegroundColor Cyan
$adminCheck = ssh -i $SSH_KEY ubuntu@$SERVER_IP "mysql -u $DB_USER -p$DB_PASS $DATABASE -e 'SELECT * FROM users WHERE email=\"$ADMIN_EMAIL\";' 2>/dev/null"
Write-Host $adminCheck