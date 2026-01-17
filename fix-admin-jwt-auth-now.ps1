Write-Host "FIXING ADMIN JWT AUTHENTICATION ISSUE" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Push to GitHub
Write-Host "Pushing JWT auth fix to GitHub..." -ForegroundColor Yellow
git add middleware/auth.js
git commit -m "Fix JWT token field mismatch causing admin 404 errors - normalize userId/id and roleId/role_id fields"
git push origin main

# Deploy to server
Write-Host "Pulling latest code on server..." -ForegroundColor Yellow
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.51.56.188 "cd /home/ubuntu/inventoryfullstack; git pull origin main"

# Restart server
Write-Host "Restarting server..." -ForegroundColor Yellow
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.51.56.188 "cd /home/ubuntu/inventoryfullstack; pkill -f 'node server.js' || true; nohup node server.js > server.log 2>&1 &"

# Wait for server to start
Write-Host "Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Test admin login
Write-Host "Testing admin login..." -ForegroundColor Yellow
$loginTest = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.51.56.188 "cd /home/ubuntu/inventoryfullstack; curl -s -X POST https://13.51.56.188.nip.io/api/auth/login -H 'Content-Type: application/json' -d '{`"email`":`"admin@company.com`",`"password`":`"admin@123`"}'"

Write-Host "Login test result:" -ForegroundColor Cyan
Write-Host $loginTest

# Test API access
Write-Host "Testing API access with admin token..." -ForegroundColor Yellow
try {
    $loginData = $loginTest | ConvertFrom-Json
    $token = $loginData.token
    if ($token) {
        $apiTest = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.51.56.188 "cd /home/ubuntu/inventoryfullstack; curl -s -H 'Authorization: Bearer $token' https://13.51.56.188.nip.io/api/products"
        Write-Host "API test result:" -ForegroundColor Cyan
        Write-Host $apiTest
    } else {
        Write-Host "No token received from login" -ForegroundColor Red
    }
} catch {
    Write-Host "Error parsing login response" -ForegroundColor Red
}

Write-Host "JWT AUTH FIX DEPLOYMENT COMPLETE!" -ForegroundColor Green