Write-Host "🔐 Testing JWT Authentication System..." -ForegroundColor Green

# Test 1: Health Check
Write-Host "`n1. Testing server health..." -ForegroundColor Yellow
$healthResponse = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "curl -s https://16.171.161.150.nip.io/"
Write-Host "Health Response: $healthResponse" -ForegroundColor White

# Test 2: Login API
Write-Host "`n2. Testing login API..." -ForegroundColor Yellow
$loginResponse = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "curl -s -X POST https://16.171.161.150.nip.io/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"admin@company.com\",\"password\":\"admin@123\"}'"
Write-Host "Login Response: $loginResponse" -ForegroundColor White

# Test 3: Extract token and test protected route
Write-Host "`n3. Testing protected route with JWT token..." -ForegroundColor Yellow
$token = ($loginResponse | ConvertFrom-Json).token
if ($token) {
    Write-Host "Token extracted successfully" -ForegroundColor Green
    $protectedResponse = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "curl -s -H 'Authorization: Bearer $token' https://16.171.161.150.nip.io/api/products"
    Write-Host "Protected Route Response: $protectedResponse" -ForegroundColor White
} else {
    Write-Host "Failed to extract token from login response" -ForegroundColor Red
}

# Test 4: Test without token (should fail)
Write-Host "`n4. Testing protected route without token (should fail)..." -ForegroundColor Yellow
$unauthorizedResponse = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "curl -s https://16.171.161.150.nip.io/api/products"
Write-Host "Unauthorized Response: $unauthorizedResponse" -ForegroundColor White

Write-Host "`n✅ JWT Authentication Tests Complete!" -ForegroundColor Green
Write-Host "`n📋 Summary:" -ForegroundColor Cyan
Write-Host "   - Server health check" -ForegroundColor White
Write-Host "   - Login API test" -ForegroundColor White
Write-Host "   - Protected route with token" -ForegroundColor White
Write-Host "   - Protected route without token" -ForegroundColor White