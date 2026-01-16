# Test All Backend APIs
Write-Host "🧪 Testing Backend APIs..." -ForegroundColor Cyan
Write-Host ""

$baseUrl = "https://16.171.161.150.nip.io"

# Test 1: Order Tracking
Write-Host "1️⃣  Testing Order Tracking API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/order-tracking" -Method Get
    if ($response.success) {
        Write-Host "   ✅ Success! Found $($response.data.Count) orders" -ForegroundColor Green
        Write-Host "   📦 Self-transfers: $($response.data | Where-Object {$_.source_type -eq 'self_transfer'} | Measure-Object | Select-Object -ExpandProperty Count)" -ForegroundColor Gray
        Write-Host "   📦 Dispatches: $($response.data | Where-Object {$_.source_type -eq 'dispatch'} | Measure-Object | Select-Object -ExpandProperty Count)" -ForegroundColor Gray
    } else {
        Write-Host "   ❌ Failed: $($response.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Bulk Upload Warehouses
Write-Host "2️⃣  Testing Bulk Upload Warehouses API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/bulk-upload/warehouses" -Method Get
    if ($response.success) {
        Write-Host "   ✅ Success! Found $($response.warehouses.Count) warehouses" -ForegroundColor Green
        $response.warehouses | ForEach-Object {
            Write-Host "   🏢 $($_.warehouse_code) - $($_.Warehouse_name)" -ForegroundColor Gray
        }
    } else {
        Write-Host "   ❌ Failed: $($response.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Products API
Write-Host "3️⃣  Testing Products API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/products" -Method Get
    if ($response.success) {
        Write-Host "   ✅ Success! Found $($response.data.Count) products" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Failed: $($response.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Dispatch Warehouses
Write-Host "4️⃣  Testing Dispatch Warehouses API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/dispatch/warehouses" -Method Get
    if ($response.success) {
        Write-Host "   ✅ Success! Found $($response.warehouses.Count) warehouses" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Failed: $($response.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 5: Self-Transfer API
Write-Host "5️⃣  Testing Self-Transfer API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/self-transfer" -Method Get
    if ($response.success) {
        Write-Host "   ✅ Success! Found $($response.data.Count) self-transfers" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Failed: $($response.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ All Backend API Tests Completed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Check if all APIs returned success=true"
Write-Host "   2. Verify data counts are correct"
Write-Host "   3. Test frontend integration"
Write-Host ""
