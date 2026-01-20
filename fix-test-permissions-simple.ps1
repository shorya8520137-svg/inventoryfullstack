Write-Host "🔧 FIXING TEST USER PERMISSIONS" -ForegroundColor Cyan

# Step 1: Copy SQL file to server
Write-Host "📤 Copying SQL file..." -ForegroundColor Yellow
scp -i "C:\Users\Admin\awsconection.pem" "fix-test-user-permissions.sql" ubuntu@13.48.248.180:/tmp/fix_test_permissions.sql

# Step 2: Execute SQL
Write-Host "🗄️ Executing SQL..." -ForegroundColor Yellow
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 'mysql -u root -p"gfx998sd" inventory_system < /tmp/fix_test_permissions.sql'

Write-Host "✅ SQL executed. Test manually now." -ForegroundColor Green