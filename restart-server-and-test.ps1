#!/usr/bin/env pwsh

Write-Host "🔄 Restarting server and testing APIs..." -ForegroundColor Cyan

# Kill any existing Node.js processes
Write-Host "🛑 Stopping existing server processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Wait a moment
Start-Sleep -Seconds 2

# Start server in background
Write-Host "🚀 Starting server..." -ForegroundColor Green
$serverProcess = Start-Process -FilePath "node" -ArgumentList "server.js" -NoNewWindow -PassThru -RedirectStandardOutput "server-output.log" -RedirectStandardError "server-error.log"

# Wait for server to start
Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Test basic endpoints
Write-Host "🧪 Testing basic endpoints..." -ForegroundColor Cyan

# Test health endpoint
try {
    $healthResponse = Invoke-RestMethod -Uri "https://16.171.161.150.nip.io/api/health" -Method GET -SkipCertificateCheck
    Write-Host "✅ Health endpoint: $($healthResponse.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test login
try {
    $loginData = @{
        email = "admin@company.com"
        password = "admin@123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "https://16.171.161.150.nip.io/api/auth/login" -Method POST -Body $loginData -ContentType "application/json" -SkipCertificateCheck
    
    if ($loginResponse.success) {
        Write-Host "✅ Login successful" -ForegroundColor Green
        $token = $loginResponse.token
        
        # Test users endpoint
        try {
            $headers = @{ Authorization = "Bearer $token" }
            $usersResponse = Invoke-RestMethod -Uri "https://16.171.161.150.nip.io/api/users" -Method GET -Headers $headers -SkipCertificateCheck
            Write-Host "✅ Users endpoint: Found $($usersResponse.data.Count) users" -ForegroundColor Green
        } catch {
            Write-Host "❌ Users endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # Test roles endpoint
        try {
            $rolesResponse = Invoke-RestMethod -Uri "https://16.171.161.150.nip.io/api/roles" -Method GET -SkipCertificateCheck
            Write-Host "✅ Roles endpoint: Found $($rolesResponse.data.Count) roles" -ForegroundColor Green
        } catch {
            Write-Host "❌ Roles endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
        }
        
    } else {
        Write-Host "❌ Login failed: $($loginResponse.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "🏁 Server test completed. Server is running with PID: $($serverProcess.Id)" -ForegroundColor Cyan
Write-Host "📋 To stop server: Stop-Process -Id $($serverProcess.Id)" -ForegroundColor Yellow