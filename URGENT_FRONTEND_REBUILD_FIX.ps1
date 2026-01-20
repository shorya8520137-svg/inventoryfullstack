# URGENT: Fix Frontend Notification Endpoints
# This script rebuilds the frontend to fix the missing /api prefix issue

Write-Host "🔧 URGENT FRONTEND NOTIFICATION FIX" -ForegroundColor Yellow
Write-Host "====================================" -ForegroundColor Yellow

Write-Host "`n📋 ISSUE IDENTIFIED:" -ForegroundColor Red
Write-Host "Frontend calling: /notifications/stats (404 error)" -ForegroundColor Red
Write-Host "Should be calling: /api/notifications/stats (works)" -ForegroundColor Red

Write-Host "`n✅ FIXES APPLIED:" -ForegroundColor Green
Write-Host "- Fixed dashboard API service to use notificationsAPI" -ForegroundColor Green
Write-Host "- All API services now use proper base URL" -ForegroundColor Green
Write-Host "- Environment variables are correct" -ForegroundColor Green

Write-Host "`n🚀 REBUILDING FRONTEND..." -ForegroundColor Cyan

# Clear Next.js cache
Write-Host "1. Clearing Next.js cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "   ✅ .next directory cleared" -ForegroundColor Green
} else {
    Write-Host "   ℹ️ .next directory not found" -ForegroundColor Blue
}

# Clear node_modules/.cache if exists
Write-Host "2. Clearing node cache..." -ForegroundColor Yellow
if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force "node_modules/.cache"
    Write-Host "   ✅ Node cache cleared" -ForegroundColor Green
} else {
    Write-Host "   ℹ️ Node cache not found" -ForegroundColor Blue
}

# Build the project
Write-Host "3. Building project..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Build successful!" -ForegroundColor Green
    
    Write-Host "`n🎯 NEXT STEPS:" -ForegroundColor Cyan
    Write-Host "1. Start the server: npm run start" -ForegroundColor White
    Write-Host "2. Open browser and check notifications" -ForegroundColor White
    Write-Host "3. Verify in Network tab: should see /api/notifications calls" -ForegroundColor White
    
    Write-Host "`n📊 EXPECTED RESULTS:" -ForegroundColor Green
    Write-Host "✅ Notification panel shows 14 notifications" -ForegroundColor Green
    Write-Host "✅ Stats show '14 total, 1 unread'" -ForegroundColor Green
    Write-Host "✅ No 404 errors in console" -ForegroundColor Green
    Write-Host "✅ All API calls use /api prefix" -ForegroundColor Green
    
} else {
    Write-Host "   ❌ Build failed!" -ForegroundColor Red
    Write-Host "Check the error messages above" -ForegroundColor Red
}

Write-Host "`n🔍 VERIFICATION:" -ForegroundColor Cyan
Write-Host "After starting server, check browser console:" -ForegroundColor White
Write-Host "- Should NOT see: GET /notifications/stats 404" -ForegroundColor Red
Write-Host "- Should see: GET /api/notifications/stats 200" -ForegroundColor Green