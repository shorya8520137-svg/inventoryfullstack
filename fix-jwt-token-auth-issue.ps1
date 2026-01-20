Write-Host "🔧 Fixing JWT Token Authentication Issue..." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$SERVER_IP = "16.171.197.86"
$SSH_KEY = "C:\Users\Admin\awsconection.pem"

Write-Host "📤 Uploading fixed permissions routes to server..." -ForegroundColor Yellow

# Upload the fixed permissions routes file
scp -i $SSH_KEY routes/permissionsRoutes.js ubuntu@${SERVER_IP}:~/inventoryfullstack/routes/

Write-Host "🔄 Restarting server to apply changes..." -ForegroundColor Yellow

# Restart the server
ssh -i $SSH_KEY ubuntu@$SERVER_IP @"
cd ~/inventoryfullstack

# Kill existing server process
pkill -f 'node server.js' || true
pkill -f 'npm start' || true

# Wait a moment
sleep 2

# Start server in background
nohup node server.js > server.log 2>&1 &

# Wait for server to start
sleep 3

echo '✅ Server restarted'
"@

Write-Host "🧪 Testing JWT token authentication..." -ForegroundColor Yellow

# Test the fix
node test-jwt-token-issue.js

Write-Host ""
Write-Host "🎉 JWT Token Authentication Fix Complete!" -ForegroundColor Green
Write-Host "The /api/users endpoint should now work properly with valid JWT tokens." -ForegroundColor Green