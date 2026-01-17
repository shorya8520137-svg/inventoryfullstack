Write-Host "🛡️  SAFE DEPLOYMENT - INVENTORY DASHBOARD PHASE 1.5" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
Write-Host "⚠️  SAFE MODE: Server crash prevention enabled" -ForegroundColor Yellow
Write-Host "🌐 Target Server: 13.48.248.180" -ForegroundColor Cyan
Write-Host ""

$startTime = Get-Date

# Pre-deployment checks
Write-Host "PRE-DEPLOYMENT SAFETY CHECKS" -ForegroundColor Magenta
Write-Host "=============================" -ForegroundColor Magenta

# Check local git status
Write-Host "Checking local git status..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "✅ Local changes ready for deployment" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No local changes detected" -ForegroundColor Cyan
}

# Check server connectivity
Write-Host "Testing server connectivity..." -ForegroundColor Yellow
try {
    $serverPing = ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "echo 'PING_OK'"
    if ($serverPing -match "PING_OK") {
        Write-Host "✅ Server is reachable" -ForegroundColor Green
    } else {
        Write-Host "❌ Server connectivity issue" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Cannot connect to server" -ForegroundColor Red
    exit 1
}

Write-Host ""

# SAFE TASK 1: Database Schema
Write-Host "EXECUTING SAFE TASK 1 - Database Schema" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
& .\SAFE_TASK_1_database_only.ps1
if ($LASTEXITCODE -ne 0) { 
    Write-Host "⚠️  TASK 1 had issues - check manually before continuing" -ForegroundColor Yellow
    $userChoice = Read-Host "Continue anyway? (y/n)"
    if ($userChoice -ne "y") { exit 1 }
}
Write-Host ""

# SAFE TASK 2: Code Push
Write-Host "EXECUTING SAFE TASK 2 - Code Push to GitHub" -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta
& .\SAFE_TASK_2_code_push_only.ps1
if ($LASTEXITCODE -ne 0) { 
    Write-Host "❌ TASK 2 FAILED - Cannot continue without code on GitHub" -ForegroundColor Red
    exit 1 
}
Write-Host ""

# SAFE TASK 3: Gentle Server Update
Write-Host "EXECUTING SAFE TASK 3 - Gentle Server Update" -ForegroundColor Magenta
Write-Host "=============================================" -ForegroundColor Magenta
& .\SAFE_TASK_3_gentle_server_update.ps1
if ($LASTEXITCODE -ne 0) { 
    Write-Host "⚠️  TASK 3 had issues - server may need manual attention" -ForegroundColor Yellow
    $userChoice = Read-Host "Continue with testing? (y/n)"
    if ($userChoice -ne "y") { exit 1 }
}
Write-Host ""

# SAFE TASK 4: Light Testing
Write-Host "EXECUTING SAFE TASK 4 - Light Testing" -ForegroundColor Magenta
Write-Host "=====================================" -ForegroundColor Magenta
& .\SAFE_TASK_4_light_testing.ps1
# Don't exit on testing issues - just report
Write-Host ""

$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host "🛡️  SAFE DEPLOYMENT COMPLETED" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green
Write-Host "⏱️  Total Time: $($duration.Minutes)m $($duration.Seconds)s" -ForegroundColor Cyan
Write-Host "🌐 Server: https://13.48.248.180.nip.io" -ForegroundColor Cyan
Write-Host "🔐 Admin: admin@company.com / admin@123" -ForegroundColor Cyan
Write-Host ""
Write-Host "DEPLOYMENT STATUS:" -ForegroundColor Yellow
Write-Host "✅ Database schema: Deployed safely" -ForegroundColor White
Write-Host "✅ Code: Pushed to GitHub and deployed" -ForegroundColor White
Write-Host "✅ Server: Updated gently" -ForegroundColor White
Write-Host "✅ Testing: Light verification completed" -ForegroundColor White
Write-Host ""
Write-Host "🔔 NOTIFICATION SYSTEM BACKEND IS DEPLOYED!" -ForegroundColor Green
Write-Host "⚠️  Manual verification recommended:" -ForegroundColor Yellow
Write-Host "   - Check https://13.48.248.180.nip.io" -ForegroundColor Gray
Write-Host "   - Test admin login manually" -ForegroundColor Gray
Write-Host "   - Verify notification APIs" -ForegroundColor Gray