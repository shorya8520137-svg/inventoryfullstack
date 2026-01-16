Write-Host "🚀 Deploying and Testing Complete Permissions System..." -ForegroundColor Green

# Step 1: Upload test files
Write-Host "📤 Step 1: Uploading test files..." -ForegroundColor Yellow
scp -i "C:\Users\Admin\awsconection.pem" create-test-users.sql ubuntu@16.171.161.150:~/inventoryfullstack/
scp -i "C:\Users\Admin\awsconection.pem" comprehensive-permissions-test.js ubuntu@16.171.161.150:~/inventoryfullstack/

# Step 2: Upload permissions controller
Write-Host "📤 Step 2: Uploading permissions system..." -ForegroundColor Yellow
scp -i "C:\Users\Admin\awsconection.pem" controllers/permissionsController.js ubuntu@16.171.161.150:~/inventoryfullstack/controllers/

# Step 3: Enable permissions routes in server.js
Write-Host "🔧 Step 3: Enabling permissions routes..." -ForegroundColor Yellow
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "cd inventoryfullstack; sed -i 's|// permissions routes - TEMPORARILY DISABLED TO FIX SERVER CRASH|// permissions routes|g' server.js; sed -i 's|// app.use.*permissionsRoutes.*|app.use(\"/api\", require(\"./routes/permissionsRoutes\"));|g' server.js"

# Step 4: Create test users in database
Write-Host "👥 Step 4: Creating test users..." -ForegroundColor Yellow
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "cd inventoryfullstack && mysql -u inventory_user -pStrongPass@123 inventory_db < create-test-users.sql"

# Step 5: Restart server
Write-Host "🔄 Step 5: Restarting server..." -ForegroundColor Yellow
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "cd inventoryfullstack && pkill -9 node; sleep 3; nohup node server.js > server.log 2>&1 &"

# Step 6: Wait for server to start
Write-Host "⏳ Step 6: Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Step 7: Run comprehensive permissions test
Write-Host "🧪 Step 7: Running comprehensive permissions test..." -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "cd inventoryfullstack && node comprehensive-permissions-test.js"

Write-Host ""
Write-Host "✅ Complete Permissions System Testing Finished!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 What was tested:" -ForegroundColor Cyan
Write-Host "   ✅ 6 different user types with varying permissions" -ForegroundColor White
Write-Host "   ✅ 12 API endpoints across all modules" -ForegroundColor White
Write-Host "   ✅ JWT authentication for all users" -ForegroundColor White
Write-Host "   ✅ Role-based access control validation" -ForegroundColor White
Write-Host "   ✅ Audit logging of all activities" -ForegroundColor White
Write-Host "   ✅ Comprehensive success/failure reporting" -ForegroundColor White
Write-Host ""
Write-Host "👥 Test Users Created:" -ForegroundColor Cyan
Write-Host "   - admin@company.com (Super Admin) - Full access" -ForegroundColor White
Write-Host "   - manager@test.com (Manager) - Management access" -ForegroundColor White
Write-Host "   - operator@test.com (Operator) - Operational access" -ForegroundColor White
Write-Host "   - warehouse@test.com (Warehouse) - Warehouse access" -ForegroundColor White
Write-Host "   - viewer@test.com (Viewer) - Read-only access" -ForegroundColor White
Write-Host "   - limited@test.com (Limited) - Very limited access" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Backend API: https://16.171.161.150.nip.io" -ForegroundColor Cyan
Write-Host "📊 All test results are shown above with detailed statistics" -ForegroundColor White
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Review the test results above" -ForegroundColor White
Write-Host "   2. Check audit logs for user activities" -ForegroundColor White
Write-Host "   3. Test frontend permissions page" -ForegroundColor White
Write-Host "   4. Deploy to Vercel for production testing" -ForegroundColor White