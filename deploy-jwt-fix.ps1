Write-Host "🚀 Deploying JWT Authentication Fix..." -ForegroundColor Green

# Upload fixed server.js
Write-Host "📤 Uploading fixed server.js..." -ForegroundColor Yellow
scp -i "C:\Users\Admin\awsconection.pem" server.js ubuntu@16.171.161.150:~/inventoryfullstack/

# Restart server
Write-Host "🔄 Restarting server..." -ForegroundColor Yellow
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "cd inventoryfullstack && pkill -9 node; sleep 2; nohup node server.js > server.log 2>&1 &"

# Wait for server to start
Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Test server health
Write-Host "🏥 Testing server health..." -ForegroundColor Yellow
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "curl -s https://16.171.161.150.nip.io/"

# Test JWT login endpoint
Write-Host "🔐 Testing JWT login endpoint..." -ForegroundColor Yellow
$loginTest = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "curl -s -X POST https://16.171.161.150.nip.io/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"admin@company.com\",\"password\":\"admin@123\"}'"
Write-Host $loginTest

Write-Host "✅ JWT Authentication Fix Deployed!" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 Test URLs:" -ForegroundColor Cyan
Write-Host "   Health Check: https://16.171.161.150.nip.io/" -ForegroundColor White
Write-Host "   Login API: https://16.171.161.150.nip.io/api/auth/login" -ForegroundColor White
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Test login with admin credentials" -ForegroundColor White
Write-Host "   2. Update frontend login page" -ForegroundColor White
Write-Host "   3. Add JWT token to API calls" -ForegroundColor White