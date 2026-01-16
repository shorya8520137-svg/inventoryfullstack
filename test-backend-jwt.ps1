# JWT Backend API Test Script
# Tests all API endpoints with JWT authentication

$API_BASE = "https://16.171.161.150.nip.io"
$TEST_USER = @{
    email = "admin@company.com"
    password = "admin@123"
}

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "🧪 JWT AUTHENTICATION - BACKEND API TEST" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "API Base: $API_BASE" -ForegroundColor Cyan
Write-Host "Test User: $($TEST_USER.email)" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

$passed = 0
$failed = 0

# Test 1: Login and get JWT token
Write-Host "`n📝 TEST 1: Login and JWT Token Generation" -ForegroundColor Blue
Write-Host "============================================================" -ForegroundColor Blue

try {
    $loginBody = $TEST_USER | ConvertTo-Json
    $loginResponse = Invoke-RestMethod -Uri "$API_BASE/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -ErrorAction Stop
    
    if ($loginResponse.token) {
        $token = $loginResponse.token
        Write-Host "✅ Login successful" -ForegroundColor Green
        Write-Host "   Token received: $($token.Substring(0, 20))..." -ForegroundColor Cyan
        Write-Host "   User: $($loginResponse.user.email), Role: $($loginResponse.user.role_name)" -ForegroundColor Cyan
        $passed++
    } else {
        Write-Host "❌ Login failed - No token received" -ForegroundColor Red
        $failed++
        exit 1
    }
} catch {
    Write-Host "❌ Login failed - $($_.Exception.Message)" -ForegroundColor Red
    $failed++
    exit 1
}

# Create headers with JWT token
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Test 2: Products API
Write-Host "`n📦 TEST 2: Products API" -ForegroundColor Blue
Write-Host "============================================================" -ForegroundColor Blue

try {
    $products = Invoke-RestMethod -Uri "$API_BASE/api/products?page=1&limit=5" -Method Get -Headers $headers -ErrorAction Stop
    Write-Host "✅ GET /api/products" -ForegroundColor Green
    Write-Host "   Retrieved $($products.products.Count) products" -ForegroundColor Cyan
    $passed++
} catch {
    Write-Host "❌ GET /api/products - Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    $failed++
}

# Test 3: Dispatch API endpoints
Write-Host "`n🚚 TEST 3: Dispatch API Endpoints" -ForegroundColor Blue
Write-Host "============================================================" -ForegroundColor Blue

$dispatchTests = @(
    @{ url = "/api/dispatch/warehouses"; name = "warehouses" },
    @{ url = "/api/dispatch/logistics"; name = "logistics" },
    @{ url = "/api/dispatch/processed-persons"; name = "processed persons" }
)

foreach ($test in $dispatchTests) {
    try {
        $result = Invoke-RestMethod -Uri "$API_BASE$($test.url)" -Method Get -Headers $headers -ErrorAction Stop
        $count = if ($result -is [Array]) { $result.Count } else { 1 }
        Write-Host "✅ GET $($test.url)" -ForegroundColor Green
        Write-Host "   Retrieved $count $($test.name)" -ForegroundColor Cyan
        $passed++
    } catch {
        Write-Host "❌ GET $($test.url) - Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        $failed++
    }
}

# Test 4: Order Tracking API
Write-Host "`n📋 TEST 4: Order Tracking API" -ForegroundColor Blue
Write-Host "============================================================" -ForegroundColor Blue

try {
    $orders = Invoke-RestMethod -Uri "$API_BASE/api/order-tracking" -Method Get -Headers $headers -ErrorAction Stop
    Write-Host "✅ GET /api/order-tracking" -ForegroundColor Green
    Write-Host "   Retrieved $($orders.orders.Count) orders" -ForegroundColor Cyan
    $passed++
} catch {
    Write-Host "❌ GET /api/order-tracking - Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    $failed++
}

# Test 5: Inventory API
Write-Host "`n📊 TEST 5: Inventory API" -ForegroundColor Blue
Write-Host "============================================================" -ForegroundColor Blue

try {
    $inventory = Invoke-RestMethod -Uri "$API_BASE/api/inventory?limit=10" -Method Get -Headers $headers -ErrorAction Stop
    $count = if ($inventory -is [Array]) { $inventory.Count } else { 1 }
    Write-Host "✅ GET /api/inventory" -ForegroundColor Green
    Write-Host "   Retrieved $count inventory items" -ForegroundColor Cyan
    $passed++
} catch {
    Write-Host "❌ GET /api/inventory - Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    $failed++
}

# Test 6: Permissions API
Write-Host "`n🔐 TEST 6: Permissions API" -ForegroundColor Blue
Write-Host "============================================================" -ForegroundColor Blue

$permissionTests = @(
    @{ url = "/api/users"; name = "users" },
    @{ url = "/api/roles"; name = "roles" },
    @{ url = "/api/permissions"; name = "permissions" }
)

foreach ($test in $permissionTests) {
    try {
        $result = Invoke-RestMethod -Uri "$API_BASE$($test.url)" -Method Get -Headers $headers -ErrorAction Stop
        $count = if ($result -is [Array]) { $result.Count } else { 1 }
        Write-Host "✅ GET $($test.url)" -ForegroundColor Green
        Write-Host "   Retrieved $count $($test.name)" -ForegroundColor Cyan
        $passed++
    } catch {
        Write-Host "❌ GET $($test.url) - Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        $failed++
    }
}

# Test 7: Self Transfer / Inventory Ledger
Write-Host "`n🔄 TEST 7: Self Transfer / Inventory Ledger API" -ForegroundColor Blue
Write-Host "============================================================" -ForegroundColor Blue

try {
    $ledger = Invoke-RestMethod -Uri "$API_BASE/api/inventory-ledger" -Method Get -Headers $headers -ErrorAction Stop
    Write-Host "✅ GET /api/inventory-ledger" -ForegroundColor Green
    Write-Host "   Ledger accessible" -ForegroundColor Cyan
    $passed++
} catch {
    Write-Host "❌ GET /api/inventory-ledger - Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    $failed++
}

try {
    $summary = Invoke-RestMethod -Uri "$API_BASE/api/inventory-ledger/summary" -Method Get -Headers $headers -ErrorAction Stop
    Write-Host "✅ GET /api/inventory-ledger/summary" -ForegroundColor Green
    Write-Host "   Summary accessible" -ForegroundColor Cyan
    $passed++
} catch {
    Write-Host "❌ GET /api/inventory-ledger/summary - Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    $failed++
}

# Test 8: Unauthorized Access (should fail with 401)
Write-Host "`n🚫 TEST 8: Unauthorized Access (Should Fail)" -ForegroundColor Blue
Write-Host "============================================================" -ForegroundColor Blue

try {
    $noAuthHeaders = @{ "Content-Type" = "application/json" }
    $result = Invoke-RestMethod -Uri "$API_BASE/api/products" -Method Get -Headers $noAuthHeaders -ErrorAction Stop
    Write-Host "❌ Unauthorized access NOT blocked - Expected 401" -ForegroundColor Red
    $failed++
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Write-Host "✅ Unauthorized access blocked" -ForegroundColor Green
        Write-Host "   Correctly returned 401 without token" -ForegroundColor Cyan
        $passed++
    } else {
        Write-Host "❌ Unexpected status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        $failed++
    }
}

# Final summary
$total = $passed + $failed
$successRate = [math]::Round(($passed / $total) * 100, 1)

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "📊 FINAL TEST RESULTS" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Total Tests: $total" -ForegroundColor Blue
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Yellow" })
Write-Host "============================================================`n" -ForegroundColor Cyan

if ($failed -eq 0) {
    Write-Host "🎉 ALL TESTS PASSED! JWT authentication is working correctly." -ForegroundColor Green
    Write-Host "✅ Backend is ready. Frontend can be deployed to Vercel." -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️  Some tests failed. Please review the errors above." -ForegroundColor Yellow
    exit 1
}
