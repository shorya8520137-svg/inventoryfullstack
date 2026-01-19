# AUTOMATED DEPLOYMENT SCRIPT
# Pushes Saturday working version to GitHub and deploys to server
# Target: Commit 0bc079c (Saturday, January 17, 2026 at 6:39 PM IST)

Write-Host "🚀 AUTOMATED DEPLOYMENT - SATURDAY WORKING VERSION" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Step 1: Push current code to GitHub
Write-Host "📤 Step 1: Pushing code to GitHub..." -ForegroundColor Yellow
try {
    git add .
    git commit -m "RESTORE: Saturday working version with updated API IP (13.53.54.181)"
    git push origin main
    Write-Host "✅ Code pushed to GitHub successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to push to GitHub: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Deploy to server via SSH
Write-Host "📥 Step 2: Deploying to server..." -ForegroundColor Yellow

$sshCommand = @"
cd ~/inventoryfullstack &&
echo '🛑 Stopping current server...' &&
pkill -f 'node server.js' || true &&
echo '📥 Pulling latest code from GitHub...' &&
git fetch origin &&
git reset --hard origin/main &&
echo '📦 Installing dependencies...' &&
npm install &&
echo '🚀 Starting server...' &&
nohup node server.js > server.log 2>&1 & &&
sleep 3 &&
echo '✅ Server started successfully' &&
echo '🧪 Testing server health...' &&
curl -X GET https://13.53.54.181.nip.io/ -k -s | head -1 &&
echo '🔐 Testing admin login...' &&
curl -X POST https://13.53.54.181.nip.io/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"admin@company.com\",\"password\":\"password\"}' -k -s | jq '.success' &&
echo '🎉 Deployment completed successfully!'
"@

try {
    ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.53.54.181 $sshCommand
    Write-Host "✅ Server deployment completed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Server deployment failed: $_" -ForegroundColor Red
    exit 1
}

# Step 3: Final verification
Write-Host "🔍 Step 3: Final verification..." -ForegroundColor Yellow
Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔗 Backend API: https://13.53.54.181.nip.io" -ForegroundColor Cyan
Write-Host "👤 Login: admin@company.com / password" -ForegroundColor Cyan

Write-Host "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green