Write-Host "🔧 DEPLOYING TEST USER PERMISSIONS FIX" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Step 1: Copy SQL file to server
Write-Host "📤 Copying SQL file to server..." -ForegroundColor Yellow
scp -i "C:\Users\Admin\awsconection.pem" "fix-test-user-permissions.sql" ubuntu@13.48.248.180:/tmp/fix_test_permissions.sql

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to copy SQL file to server" -ForegroundColor Red
    exit 1
}

Write-Host "✅ SQL file copied successfully" -ForegroundColor Green

# Step 2: Execute SQL on server
Write-Host "🗄️ Executing permission fix SQL..." -ForegroundColor Yellow
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 'mysql -u root -p"gfx998sd" inventory_system < /tmp/fix_test_permissions.sql'

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to execute SQL on server" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Permission fix SQL executed successfully" -ForegroundColor Green

# Step 3: Test the fix
Write-Host "🧪 Testing inventory API with test user..." -ForegroundColor Yellow

# First get auth token
$loginCmd = 'curl -k -s -X POST "https://13.48.248.180.nip.io/api/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"tetstetstestdt@company.com\",\"password\":\"gfx998sd\"}"'
$loginResponse = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 $loginCmd

Write-Host "Login Response: $loginResponse" -ForegroundColor Cyan

# Extract token using regex
if ($loginResponse -match '"token":"([^"]+)"') {
    $token = $matches[1]
    Write-Host "✅ Got auth token: $($token.Substring(0,20))..." -ForegroundColor Green
    
    # Test inventory API
    Write-Host "🧪 Testing inventory API..." -ForegroundColor Yellow
    $inventoryCmd = "curl -k -s -X GET 'https://13.48.248.180.nip.io/api/inventory?limit=5' -H 'Authorization: Bearer $token' -H 'Content-Type: application/json'"
    $inventoryResponse = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 $inventoryCmd
    
    Write-Host "Inventory API Response: $inventoryResponse" -ForegroundColor Cyan
    
    if ($inventoryResponse -match '"success":true') {
        Write-Host "✅ SUCCESS: Test user can now access inventory API!" -ForegroundColor Green
    } else {
        Write-Host "❌ FAILED: Test user still cannot access inventory API" -ForegroundColor Red
        Write-Host "Response: $inventoryResponse" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Failed to extract auth token from login response" -ForegroundColor Red
    Write-Host "Response: $loginResponse" -ForegroundColor Red
}

Write-Host "🎉 TEST USER PERMISSIONS FIX DEPLOYMENT COMPLETE!" -ForegroundColor Green