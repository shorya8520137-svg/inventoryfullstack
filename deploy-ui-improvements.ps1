Write-Host "🎨 Deploying Professional UI Improvements..." -ForegroundColor Green

# Step 1: Upload global styles
Write-Host "Step 1: Uploading global styles..." -ForegroundColor Yellow
scp -i "C:\Users\Admin\awsconection.pem" src/app/globals.css ubuntu@16.171.161.150:~/inventoryfullstack/src/app/

# Step 2: Upload updated layout files
Write-Host "Step 2: Uploading layout files..." -ForegroundColor Yellow
scp -i "C:\Users\Admin\awsconection.pem" src/app/layout.jsx ubuntu@16.171.161.150:~/inventoryfullstack/src/app/
scp -i "C:\Users\Admin\awsconection.pem" src/app/layout.client.js ubuntu@16.171.161.150:~/inventoryfullstack/src/app/

# Step 3: Upload new login page
Write-Host "Step 3: Uploading modern login page..." -ForegroundColor Yellow
scp -i "C:\Users\Admin\awsconection.pem" -r src/app/login/ ubuntu@16.171.161.150:~/inventoryfullstack/src/app/

# Step 4: Build the application
Write-Host "Step 4: Building application..." -ForegroundColor Yellow
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "cd inventoryfullstack && npm run build"

Write-Host "✅ Professional UI Improvements Deployed!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 UI Improvements Summary:" -ForegroundColor Cyan
Write-Host "   ✅ Global scrollbar removed" -ForegroundColor White
Write-Host "   ✅ Custom hidden scrollbars for internal elements" -ForegroundColor White
Write-Host "   ✅ Professional light theme" -ForegroundColor White
Write-Host "   ✅ Modern login page with animations" -ForegroundColor White
Write-Host "   ✅ Enhanced modal styling" -ForegroundColor White
Write-Host "   ✅ Improved layout structure" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Test the new UI:" -ForegroundColor Cyan
Write-Host "   Frontend: https://16.171.161.150.nip.io/login" -ForegroundColor White
Write-Host "   Credentials: admin@company.com / admin@123" -ForegroundColor White