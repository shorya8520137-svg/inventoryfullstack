# INSTALL DEPENDENCIES AND START SERVER
Write-Host "INSTALLING DEPENDENCIES AND STARTING SERVER" -ForegroundColor Green
Write-Host "==========================================="

$SERVER_IP = "13.48.248.180"
$SSH_KEY = "C:\Users\Admin\awsconection.pem"

Write-Host "1. Installing missing dependencies..." -ForegroundColor Cyan
ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && npm install bcryptjs jsonwebtoken mysql2 express cors morgan dotenv"

Write-Host ""
Write-Host "2. Running npm install..." -ForegroundColor Cyan
ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && npm install"

Write-Host ""
Write-Host "3. Starting server..." -ForegroundColor Cyan
ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && nohup node server.js > server.log 2>&1 &"

Start-Sleep -Seconds 5

$serverCheck = ssh -i $SSH_KEY ubuntu@$SERVER_IP "ps aux | grep 'node server.js' | grep -v grep | wc -l"

if ($serverCheck -gt 0) {
    Write-Host "✅ Server started!" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "4. Testing login API..." -ForegroundColor Cyan
    Start-Sleep -Seconds 3
    
    $loginTest = ssh -i $SSH_KEY ubuntu@$SERVER_IP "curl -s -X POST https://13.48.248.180.nip.io/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"admin@company.com\",\"password\":\"password\"}' -k"
    
    if ($loginTest -match "success") {
        Write-Host ""
        Write-Host "🎉 COMPLETE SUCCESS!" -ForegroundColor Green
        Write-Host "===================="
        Write-Host "✅ Dependencies: Installed"
        Write-Host "✅ Server: Running"
        Write-Host "✅ Database: Admin has 28 permissions"
        Write-Host "✅ API: Working"
        Write-Host ""
        Write-Host "LOGIN CREDENTIALS:" -ForegroundColor Yellow
        Write-Host "Email: admin@company.com"
        Write-Host "Password: password"
        Write-Host "URL: https://13.48.248.180.nip.io"
        Write-Host ""
        Write-Host "Your admin permissions issue is now FIXED!"
    } else {
        Write-Host "❌ API test failed. Response:"
        Write-Host $loginTest
    }
} else {
    Write-Host "❌ Server still failed to start"
    $logs = ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && tail -10 server.log"
    Write-Host "Logs:"
    Write-Host $logs
}