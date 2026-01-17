# PowerShell script to deploy test files and run authentication test
Write-Host "🚀 Deploying test files and running authentication test..." -ForegroundColor Green

# Copy test files to server
Write-Host "📁 Copying test files to server..." -ForegroundColor Yellow
scp -i "C:\Users\Admin\awsconection.pem" test-login-direct.js ubuntu@16.171.161.150:~/inventoryfullstack/
scp -i "C:\Users\Admin\awsconection.pem" test-all-apis-with-token.js ubuntu@16.171.161.150:~/inventoryfullstack/
scp -i "C:\Users\Admin\awsconection.pem" test-login-on-server.sh ubuntu@16.171.161.150:~/inventoryfullstack/

# Run the comprehensive test
Write-Host "🔐 Running comprehensive authentication and API test..." -ForegroundColor Green
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "cd inventoryfullstack && node test-all-apis-with-token.js"

Write-Host "✅ Test completed!" -ForegroundColor Green