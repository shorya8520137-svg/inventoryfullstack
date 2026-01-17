# Deploy Clean Database and Permission Setup
Write-Host "🧹 CLEANING DATABASE AND SETTING UP PERMISSIONS" -ForegroundColor Green
Write-Host "This will:" -ForegroundColor Yellow
Write-Host "  ✅ Keep only admin@company.com user" -ForegroundColor Yellow
Write-Host "  ✅ Remove duplicate permissions" -ForegroundColor Yellow
Write-Host "  ✅ Set up clean 28-permission structure" -ForegroundColor Yellow
Write-Host "  ✅ Assign all permissions to admin" -ForegroundColor Yellow

# Confirm action
$confirm = Read-Host "Are you sure you want to proceed? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "❌ Operation cancelled" -ForegroundColor Red
    exit
}

Write-Host "`n🚀 Executing database cleanup..." -ForegroundColor Green

# Upload SQL script to server
Write-Host "📤 Uploading SQL script to server..."
scp -i "C:\Users\Admin\awsconection.pem" "clean-database-and-setup-permissions.sql" "ubuntu@13.51.56.188:/tmp/clean-database-and-setup-permissions.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ SQL script uploaded successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to upload SQL script" -ForegroundColor Red
    exit 1
}

# Execute SQL script on server
Write-Host "`n🗄️ Executing database cleanup and permission setup..."
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.51.56.188 "mysql -u inventory_user -p'StrongPass@123' inventory_db < /tmp/clean-database-and-setup-permissions.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database cleanup completed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Database cleanup failed" -ForegroundColor Red
    exit 1
}

# Verify the results
Write-Host "`n🔍 Verifying results..."
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.51.56.188 "mysql -u inventory_user -p'StrongPass@123' -e 'SELECT COUNT(*) as user_count FROM inventory_db.users; SELECT COUNT(*) as permission_count FROM inventory_db.permissions WHERE is_active=1;'"

# Clean up temporary file
Write-Host "`n🧹 Cleaning up temporary files..."
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.51.56.188 "rm -f /tmp/clean-database-and-setup-permissions.sql"

Write-Host "`n🎉 DATABASE CLEANUP COMPLETED!" -ForegroundColor Green
Write-Host "📋 Summary:" -ForegroundColor Yellow
Write-Host "  👤 Users: Only admin@company.com remains" -ForegroundColor White
Write-Host "  🔐 Permissions: 28 clean permissions (no duplicates)" -ForegroundColor White
Write-Host "  🛡️ Admin Role: All permissions assigned" -ForegroundColor White
Write-Host "  🎯 Ready: You can now create users via UI" -ForegroundColor White

Write-Host "`n🔑 Admin Login:" -ForegroundColor Cyan
Write-Host "  Email: admin@company.com" -ForegroundColor White
Write-Host "  Password: admin@123" -ForegroundColor White
Write-Host "  Role: Super Admin (all permissions)" -ForegroundColor White

Write-Host "`n📝 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Login to the system with admin credentials" -ForegroundColor White
Write-Host "  2. Go to /permissions page" -ForegroundColor White
Write-Host "  3. Create roles with specific permissions" -ForegroundColor White
Write-Host "  4. Create users and assign roles via UI" -ForegroundColor White