Write-Host "🚀 INVENTORY DASHBOARD PHASE 1.5 - COMPLETE DEPLOYMENT" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green
Write-Host "Server: 13.48.248.180 | Notification System Implementation" -ForegroundColor Cyan
Write-Host ""

$startTime = Get-Date

# Task 1: Deploy Database Schema
Write-Host "EXECUTING TASK 1..." -ForegroundColor Magenta
& .\TASK_1_deploy_database_schema.ps1
if ($LASTEXITCODE -ne 0) { Write-Host "❌ TASK 1 FAILED" -ForegroundColor Red; exit 1 }
Write-Host ""

# Task 2: Deploy Backend Code
Write-Host "EXECUTING TASK 2..." -ForegroundColor Magenta
& .\TASK_2_deploy_backend_code.ps1
if ($LASTEXITCODE -ne 0) { Write-Host "❌ TASK 2 FAILED" -ForegroundColor Red; exit 1 }
Write-Host ""

# Task 3: Restart Server and Test
Write-Host "EXECUTING TASK 3..." -ForegroundColor Magenta
& .\TASK_3_restart_server_and_test.ps1
if ($LASTEXITCODE -ne 0) { Write-Host "❌ TASK 3 FAILED" -ForegroundColor Red; exit 1 }
Write-Host ""

# Task 4: Test Notification System
Write-Host "EXECUTING TASK 4..." -ForegroundColor Magenta
& .\TASK_4_test_notification_system.ps1
if ($LASTEXITCODE -ne 0) { Write-Host "❌ TASK 4 FAILED" -ForegroundColor Red; exit 1 }
Write-Host ""

# Task 5: Notification Triggers (Manual)
Write-Host "EXECUTING TASK 5..." -ForegroundColor Magenta
& .\TASK_5_add_notification_triggers.ps1
Write-Host ""

# Task 6: Final Verification
Write-Host "EXECUTING TASK 6..." -ForegroundColor Magenta
& .\TASK_6_final_verification.ps1
if ($LASTEXITCODE -ne 0) { Write-Host "❌ TASK 6 FAILED" -ForegroundColor Red; exit 1 }
Write-Host ""

$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host "🎉 PHASE 1.5 DEPLOYMENT COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
Write-Host "⏱️  Total Time: $($duration.Minutes)m $($duration.Seconds)s" -ForegroundColor Cyan
Write-Host "🌐 API Endpoint: https://13.48.248.180.nip.io" -ForegroundColor Cyan
Write-Host "🔐 Admin Login: admin@company.com / admin@123" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Database schema deployed" -ForegroundColor White
Write-Host "✅ Backend code deployed" -ForegroundColor White
Write-Host "✅ Server restarted" -ForegroundColor White
Write-Host "✅ Notification APIs working" -ForegroundColor White
Write-Host "✅ System verified" -ForegroundColor White
Write-Host ""
Write-Host "🔔 NOTIFICATION SYSTEM IS LIVE!" -ForegroundColor Yellow