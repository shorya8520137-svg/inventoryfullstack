Write-Host "========================================" -ForegroundColor Yellow
Write-Host "🚨 EMERGENCY AUTH CONTROLLER FIX" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Yellow

Write-Host ""
Write-Host "1. Pushing auth controller fix to GitHub..." -ForegroundColor Cyan

# Push to GitHub
git add controllers/authController.js
git commit -m "🚨 EMERGENCY FIX: Auth controller exports and getCurrentUser function"
git push origin main

Write-Host "✅ Code pushed to GitHub" -ForegroundColor Green

Write-Host ""
Write-Host "2. Connecting to server and deploying fix..." -ForegroundColor Cyan

# SSH commands to deploy and restart
$sshCommands = @"
cd ~/inventoryfullstack &&
echo "📥 Pulling latest code..." &&
git pull origin main &&
echo "🔄 Stopping server..." &&
pkill -f "node server.js" &&
sleep 2 &&
echo "🚀 Starting server..." &&
nohup node server.js > server.log 2>&1 & &&
sleep 3 &&
echo "🏥 Testing server health..." &&
curl -k https://13.48.248.180.nip.io/api/health &&
echo "" &&
echo "✅ Server restart complete!"
"@

Write-Host "SSH Commands to run:" -ForegroundColor Yellow
Write-Host $sshCommands -ForegroundColor Gray

Write-Host ""
Write-Host "3. Run this SSH command manually:" -ForegroundColor Cyan
Write-Host 'ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180' -ForegroundColor White

Write-Host ""
Write-Host "4. After server restart, test login:" -ForegroundColor Cyan
Write-Host "node test-cms-login-after-fix.js" -ForegroundColor White

Write-Host ""
Write-Host "🎯 EXPECTED RESULT:" -ForegroundColor Green
Write-Host "- Server starts without Route.get() error" -ForegroundColor White
Write-Host "- Login returns user with permissions > 0" -ForegroundColor White
Write-Host "- CMS user can access inventory APIs" -ForegroundColor White

Read-Host "Press Enter to continue..."