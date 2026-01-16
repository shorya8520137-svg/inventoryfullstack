Write-Host "🚀 Deploying Complete JWT Authentication System..." -ForegroundColor Green

# Step 1: Upload fixed server.js
Write-Host "`n📤 Step 1: Uploading fixed server.js..." -ForegroundColor Yellow
scp -i "C:\Users\Admin\awsconection.pem" server.js ubuntu@16.171.161.150:~/inventoryfullstack/

# Step 2: Upload admin user creation script
Write-Host "`n📤 Step 2: Uploading admin user creation script..." -ForegroundColor Yellow
scp -i "C:\Users\Admin\awsconection.pem" create-admin-user.sql ubuntu@16.171.161.150:~/inventoryfullstack/

# Step 3: Create admin user in database
Write-Host "`n👤 Step 3: Creating admin user in database..." -ForegroundColor Yellow
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "cd inventoryfullstack && mysql -u inventory_user -pStrongPass@123 inventory_db < create-admin-user.sql"

# Step 4: Restart server
Write-Host "`n🔄 Step 4: Restarting server..." -ForegroundColor Yellow
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "cd inventoryfullstack && pkill -9 node; sleep 3; nohup node server.js > server.log 2>&1 &"

# Step 5: Wait for server to start
Write-Host "`n⏳ Step 5: Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Step 6: Test server health
Write-Host "`n🏥 Step 6: Testing server health..." -ForegroundColor Yellow
$healthResponse = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "curl -s https://16.171.161.150.nip.io/"
if ($healthResponse -match "Inventory Backend") {
    Write-Host "✅ Server is running!" -ForegroundColor Green
} else {
    Write-Host "❌ Server health check failed" -ForegroundColor Red
    Write-Host "Response: $healthResponse" -ForegroundColor White
}

# Step 7: Test JWT login
Write-Host "`n🔐 Step 7: Testing JWT login..." -ForegroundColor Yellow
$loginResponse = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "curl -s -X POST https://16.171.161.150.nip.io/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"admin@company.com\",\"password\":\"admin@123\"}'"

if ($loginResponse -match '"success":true') {
    Write-Host "✅ JWT Login successful!" -ForegroundColor Green
    
    # Extract token using regex
    if ($loginResponse -match '"token":"([^"]+)"') {
        $token = $matches[1]
        Write-Host "Token extracted successfully" -ForegroundColor Green
        
        # Step 8: Test protected route
        Write-Host "`n🔒 Step 8: Testing protected route..." -ForegroundColor Yellow
        $protectedResponse = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "curl -s -H 'Authorization: Bearer $token' https://16.171.161.150.nip.io/api/products"
        
        if ($protectedResponse -match "success") {
            Write-Host "✅ Protected route access successful!" -ForegroundColor Green
        } else {
            Write-Host "❌ Protected route access failed" -ForegroundColor Red
            Write-Host "Response: $protectedResponse" -ForegroundColor White
        }
    } else {
        Write-Host "❌ Failed to extract token" -ForegroundColor Red
    }
} else {
    Write-Host "❌ JWT Login failed" -ForegroundColor Red
    Write-Host "Response: $loginResponse" -ForegroundColor White
}

# Step 9: Upload updated frontend files
Write-Host "`n📤 Step 9: Uploading updated login page..." -ForegroundColor Yellow
scp -i "C:\Users\Admin\awsconection.pem" -r src/app/login/ ubuntu@16.171.161.150:~/inventoryfullstack/src/app/

Write-Host "`n✅ JWT Authentication System Deployment Complete!" -ForegroundColor Green
Write-Host "`n🔗 Test URLs:" -ForegroundColor Cyan
Write-Host "   Frontend: https://16.171.161.150.nip.io/login" -ForegroundColor White
Write-Host "   Health Check: https://16.171.161.150.nip.io/" -ForegroundColor White
Write-Host "   Login API: https://16.171.161.150.nip.io/api/auth/login" -ForegroundColor White
Write-Host "`n👤 Admin Credentials:" -ForegroundColor Cyan
Write-Host "   Email: admin@company.com" -ForegroundColor White
Write-Host "   Password: admin@123" -ForegroundColor White
Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Test login page in browser" -ForegroundColor White
Write-Host "   2. Verify JWT token storage" -ForegroundColor White
Write-Host "   3. Test protected routes" -ForegroundColor White
Write-Host "   4. Add JWT to all API calls" -ForegroundColor White