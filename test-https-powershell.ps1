# PowerShell script to test HTTPS backend
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "                  TESTING HTTPS BACKEND" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: HTTPS Health Check
Write-Host "Testing HTTPS health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://54.179.63.233.nip.io/api/health" -Method GET -SkipCertificateCheck
    Write-Host "✅ HTTPS Health Check: SUCCESS" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "❌ HTTPS Health Check: FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: HTTP Redirect
Write-Host "Testing HTTP redirect..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://54.179.63.233.nip.io/api/health" -Method GET -MaximumRedirection 0 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 301 -or $response.StatusCode -eq 302) {
        Write-Host "✅ HTTP Redirect: SUCCESS" -ForegroundColor Green
        Write-Host "Redirect Location: $($response.Headers.Location)" -ForegroundColor Green
    } else {
        Write-Host "❌ HTTP Redirect: No redirect found" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ HTTP Redirect: FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: HTTPS Login
Write-Host "Testing HTTPS login..." -ForegroundColor Yellow
try {
    $loginData = @{
        email = "admin@company.com"
        password = "Admin@123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "https://54.179.63.233.nip.io/api/auth/login" -Method POST -Body $loginData -ContentType "application/json" -SkipCertificateCheck
    
    if ($response.token) {
        Write-Host "✅ HTTPS Login: SUCCESS" -ForegroundColor Green
        Write-Host "Token received: $($response.token.Substring(0, 20))..." -ForegroundColor Green
        Write-Host "User: $($response.user.email)" -ForegroundColor Green
    } else {
        Write-Host "❌ HTTPS Login: No token received" -ForegroundColor Red
        Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ HTTPS Login: FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "                      TEST SUMMARY" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If all tests passed, your HTTPS backend is working!" -ForegroundColor Green
Write-Host "Frontend should now connect without Mixed Content errors." -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Frontend: https://stockiqfullstacktest.vercel.app" -ForegroundColor Cyan
Write-Host "🔒 Backend:  https://54.179.63.233.nip.io" -ForegroundColor Cyan
Write-Host ""