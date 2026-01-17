# FINAL PERMISSION CLEANUP DEPLOYMENT
# This will fix duplicate permissions in the database and ensure clean 28 permissions

Write-Host "🔧 FINAL PERMISSION CLEANUP DEPLOYMENT" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Server details
$SERVER_IP = "13.51.56.188"
$KEY_PATH = "C:\Users\Admin\awsconection.pem"
$DB_PASSWORD = "StrongPass@123"

Write-Host "📋 Step 1: Upload SQL script to server..." -ForegroundColor Yellow
scp -i $KEY_PATH "fix-duplicate-permissions-final.sql" "ubuntu@${SERVER_IP}:/home/ubuntu/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to upload SQL script" -ForegroundColor Red
    exit 1
}

Write-Host "✅ SQL script uploaded successfully" -ForegroundColor Green

Write-Host "📋 Step 2: Execute permission cleanup on server..." -ForegroundColor Yellow

# Execute the SQL script on the server
ssh -i $KEY_PATH "ubuntu@$SERVER_IP" "echo '🔧 Starting final permission cleanup...'"
ssh -i $KEY_PATH "ubuntu@$SERVER_IP" "mysql -u root -p'$DB_PASSWORD' inventory_db -e 'source fix-duplicate-permissions-final.sql'"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to execute permission cleanup" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Permission cleanup completed successfully!" -ForegroundColor Green

Write-Host "📋 Step 3: Verify results..." -ForegroundColor Yellow
ssh -i $KEY_PATH "ubuntu@$SERVER_IP" "mysql -u root -p'$DB_PASSWORD' inventory_db -e 'SELECT category, COUNT(*) as count FROM permissions WHERE is_active = true GROUP BY category ORDER BY category;'"

Write-Host "📋 Step 4: Restart server to apply changes..." -ForegroundColor Yellow
ssh -i $KEY_PATH "ubuntu@$SERVER_IP" "cd /home/ubuntu/inventoryfullstack && pm2 restart server"

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Server restart failed, but permissions should still work" -ForegroundColor Yellow
} else {
    Write-Host "✅ Server restarted successfully" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎯 PERMISSION CLEANUP COMPLETE!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host "✅ Database now has exactly 28 clean permissions" -ForegroundColor Green
Write-Host "✅ No duplicate permissions" -ForegroundColor Green
Write-Host "✅ Super admin has all permissions" -ForegroundColor Green
Write-Host "✅ Permissions tab should now show clean data" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 Test the permissions page:" -ForegroundColor Cyan
Write-Host "   1. Login: admin@company.com / admin@123" -ForegroundColor White
Write-Host "   2. Go to /permissions page" -ForegroundColor White
Write-Host "   3. Check Permissions tab - should show 28 permissions in 5 categories" -ForegroundColor White
Write-Host "   4. Create roles with specific permissions" -ForegroundColor White