# PowerShell script to deploy and test user CRUD operations

Write-Host "🚀 DEPLOYING AND TESTING USER CRUD OPERATIONS" -ForegroundColor Blue
Write-Host "==============================================" -ForegroundColor Blue

# Step 1: Pull latest code from GitHub
Write-Host "`n📥 Step 1: Pulling latest code from GitHub..." -ForegroundColor Cyan
git pull origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Code pulled successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to pull code" -ForegroundColor Red
    exit 1
}

# Step 2: Install dependencies (if needed)
Write-Host "`n📦 Step 2: Installing dependencies..." -ForegroundColor Cyan
npm install

# Step 3: Check if server is running and restart if needed
Write-Host "`n🔄 Step 3: Managing server..." -ForegroundColor Cyan

# Kill existing server processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*server.js*" } | Stop-Process -Force -ErrorAction SilentlyContinue

Start-Sleep -Seconds 2

# Start server in background
Write-Host "Starting server..." -ForegroundColor Yellow
Start-Process -FilePath "node" -ArgumentList "server.js" -WindowStyle Hidden -RedirectStandardOutput "server.log" -RedirectStandardError "server_error.log"

Start-Sleep -Seconds 5

# Check if server is running
$serverProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*server.js*" }

if ($serverProcess) {
    Write-Host "✅ Server started successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Server failed to start" -ForegroundColor Red
    exit 1
}

# Step 4: Test server health
Write-Host "`n🏥 Step 4: Testing server health..." -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "https://13.51.56.188.nip.io/api/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Server health check passed" -ForegroundColor Green
    } else {
        Write-Host "❌ Server health check failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Server health check failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 5: Run comprehensive user CRUD test
Write-Host "`n🧪 Step 5: Running User CRUD Tests..." -ForegroundColor Cyan
node test-user-crud-complete.js

Write-Host "`n🎉 DEPLOYMENT AND TESTING COMPLETED!" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green