Write-Host "CLEANING ALL USERS AND CREATING FRESH ADMIN" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Copy SQL script to server
Write-Host "Copying SQL script to server..." -ForegroundColor Yellow
scp -i "C:\Users\Admin\awsconection.pem" clean-users-and-create-admin.sql ubuntu@13.51.56.188:/home/ubuntu/inventoryfullstack/

# Execute SQL script on server
Write-Host "Executing SQL script on server..." -ForegroundColor Yellow
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.51.56.188 "cd /home/ubuntu/inventoryfullstack; mysql -u inventory_user -pStrongPass@123 inventory_db < clean-users-and-create-admin.sql"

# Test admin login
Write-Host "Testing admin login..." -ForegroundColor Yellow
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.51.56.188 "cd /home/ubuntu/inventoryfullstack; ./test-admin-login-fixed.sh"

Write-Host "CLEAN USERS AND ADMIN SETUP COMPLETE!" -ForegroundColor Green