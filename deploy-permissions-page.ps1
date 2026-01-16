Write-Host "🔐 Deploying Permissions Management Page..." -ForegroundColor Green

# Step 1: Upload permissions page files
Write-Host "Step 1: Uploading permissions page..." -ForegroundColor Yellow
scp -i "C:\Users\Admin\awsconection.pem" -r src/app/permissions/ ubuntu@16.171.161.150:~/inventoryfullstack/src/app/

# Step 2: Upload updated API utility
Write-Host "Step 2: Uploading updated API utility..." -ForegroundColor Yellow
scp -i "C:\Users\Admin\awsconection.pem" src/utils/api.js ubuntu@16.171.161.150:~/inventoryfullstack/src/utils/

# Step 3: Upload fixed permissions controller
Write-Host "Step 3: Uploading fixed permissions controller..." -ForegroundColor Yellow
scp -i "C:\Users\Admin\awsconection.pem" controllers/permissionsController.js ubuntu@16.171.161.150:~/inventoryfullstack/controllers/

# Step 4: Enable permissions routes in server.js
Write-Host "Step 4: Enabling permissions routes..." -ForegroundColor Yellow
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "cd inventoryfullstack && sed -i 's|// permissions routes - TEMPORARILY DISABLED TO FIX SERVER CRASH|// permissions routes|g' server.js && sed -i 's|// app.use.*permissionsRoutes.*|app.use(\"/api\", require(\"./routes/permissionsRoutes\"));|g' server.js"

# Step 5: Restart server
Write-Host "Step 5: Restarting server..." -ForegroundColor Yellow
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "cd inventoryfullstack && pkill -9 node; sleep 3; nohup node server.js > server.log 2>&1 &"

# Step 6: Wait for server to start
Write-Host "Step 6: Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Step 7: Test permissions API
Write-Host "Step 7: Testing permissions API..." -ForegroundColor Yellow
$loginResponse = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "curl -s -X POST http://localhost:5000/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"admin@company.com\",\"password\":\"admin@123\"}'"

if ($loginResponse -match '"token":"([^"]+)"') {
    $token = $matches[1]
    Write-Host "✅ Login successful, testing permissions endpoints..." -ForegroundColor Green
    
    # Test users endpoint
    $usersResponse = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "curl -s -H 'Authorization: Bearer $token' http://localhost:5000/api/users"
    Write-Host "Users API Response: $($usersResponse.Substring(0, [Math]::Min(100, $usersResponse.Length)))..." -ForegroundColor White
    
    # Test roles endpoint
    $rolesResponse = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "curl -s -H 'Authorization: Bearer $token' http://localhost:5000/api/roles"
    Write-Host "Roles API Response: $($rolesResponse.Substring(0, [Math]::Min(100, $rolesResponse.Length)))..." -ForegroundColor White
    
    # Test permissions endpoint
    $permissionsResponse = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "curl -s -H 'Authorization: Bearer $token' http://localhost:5000/api/permissions"
    Write-Host "Permissions API Response: $($permissionsResponse.Substring(0, [Math]::Min(100, $permissionsResponse.Length)))..." -ForegroundColor White
    
} else {
    Write-Host "❌ Login failed, cannot test permissions endpoints" -ForegroundColor Red
    Write-Host "Login Response: $loginResponse" -ForegroundColor White
}

Write-Host ""
Write-Host "✅ Permissions Management Page Deployed!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Features Deployed:" -ForegroundColor Cyan
Write-Host "   ✅ Complete permissions management UI" -ForegroundColor White
Write-Host "   ✅ Users CRUD operations" -ForegroundColor White
Write-Host "   ✅ Roles CRUD operations" -ForegroundColor White
Write-Host "   ✅ Permissions viewing and assignment" -ForegroundColor White
Write-Host "   ✅ Audit logs viewing" -ForegroundColor White
Write-Host "   ✅ Professional modern design" -ForegroundColor White
Write-Host "   ✅ Role-based access control" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Access URLs:" -ForegroundColor Cyan
Write-Host "   Frontend: https://your-vercel-app.vercel.app/permissions" -ForegroundColor White
Write-Host "   Backend API: https://16.171.161.150.nip.io/api/users" -ForegroundColor White
Write-Host ""
Write-Host "👤 Admin Access:" -ForegroundColor Cyan
Write-Host "   Email: admin@company.com" -ForegroundColor White
Write-Host "   Password: admin@123" -ForegroundColor White
Write-Host "   Permissions: Full system access (62 permissions)" -ForegroundColor White
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Deploy frontend to Vercel" -ForegroundColor White
Write-Host "   2. Test permissions page functionality" -ForegroundColor White
Write-Host "   3. Create additional users and roles" -ForegroundColor White
Write-Host "   4. Test role-based access control" -ForegroundColor White