Write-Host "Deploying JWT Authentication System..." -ForegroundColor Green

# Step 1: Upload fixed server.js
Write-Host "Step 1: Uploading fixed server.js..." -ForegroundColor Yellow
scp -i "C:\Users\Admin\awsconection.pem" server.js ubuntu@16.171.161.150:~/inventoryfullstack/

# Step 2: Upload admin user creation script
Write-Host "Step 2: Uploading admin user creation script..." -ForegroundColor Yellow
scp -i "C:\Users\Admin\awsconection.pem" create-admin-user.sql ubuntu@16.171.161.150:~/inventoryfullstack/

# Step 3: Create admin user in database
Write-Host "Step 3: Creating admin user in database..." -ForegroundColor Yellow
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "cd inventoryfullstack && mysql -u inventory_user -pStrongPass@123 inventory_db < create-admin-user.sql"

# Step 4: Restart server
Write-Host "Step 4: Restarting server..." -ForegroundColor Yellow
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "cd inventoryfullstack && pkill -9 node; sleep 3; nohup node server.js > server.log 2>&1 &"

# Step 5: Wait for server to start
Write-Host "Step 5: Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Step 6: Test server health
Write-Host "Step 6: Testing server health..." -ForegroundColor Yellow
$healthResponse = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "curl -s https://16.171.161.150.nip.io/"
Write-Host "Health Response: $healthResponse" -ForegroundColor White

# Step 7: Test JWT login
Write-Host "Step 7: Testing JWT login..." -ForegroundColor Yellow
$loginResponse = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "curl -s -X POST https://16.171.161.150.nip.io/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"admin@company.com\",\"password\":\"admin@123\"}'"
Write-Host "Login Response: $loginResponse" -ForegroundColor White

# Step 8: Upload updated login page
Write-Host "Step 8: Uploading updated login page..." -ForegroundColor Yellow
scp -i "C:\Users\Admin\awsconection.pem" -r src/app/login/ ubuntu@16.171.161.150:~/inventoryfullstack/src/app/

Write-Host "JWT Authentication System Deployment Complete!" -ForegroundColor Green
Write-Host "Admin Credentials: admin@company.com / admin@123" -ForegroundColor Cyan