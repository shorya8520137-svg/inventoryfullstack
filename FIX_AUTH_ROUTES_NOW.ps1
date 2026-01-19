# FIX AUTH ROUTES - USE PERMISSIONS CONTROLLER
Write-Host "FIXING AUTH ROUTES TO USE PERMISSIONS CONTROLLER" -ForegroundColor Green
Write-Host "==============================================="

$SERVER_IP = "13.48.248.180"
$SSH_KEY = "C:\Users\Admin\awsconection.pem"

Write-Host "1. Updating authRoutes.js to use permissionsController..." -ForegroundColor Cyan

# Create fixed authRoutes.js
$authRoutesContent = @"
const express = require('express');
const router = express.Router();
const PermissionsController = require('../controllers/permissionsController');
const { authenticateToken } = require('../middleware/auth');

// POST /api/auth/login - User login
router.post('/login', PermissionsController.login);

// POST /api/auth/logout - User logout (protected)
router.post('/logout', authenticateToken, PermissionsController.logout);

// POST /api/auth/refresh - Refresh token
router.post('/refresh', PermissionsController.refreshToken);

module.exports = router;
"@

# Upload fixed authRoutes
ssh -i $SSH_KEY ubuntu@$SERVER_IP "cat > ~/inventoryfullstack/routes/authRoutes.js << 'EOF'
$authRoutesContent
EOF"

Write-Host "✅ Updated authRoutes.js" -ForegroundColor Green

Write-Host ""
Write-Host "2. Restarting server..." -ForegroundColor Cyan

# Kill existing server
ssh -i $SSH_KEY ubuntu@$SERVER_IP "pkill -f 'node server.js'" 2>$null
Start-Sleep -Seconds 3

# Start server
ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && nohup node server.js > server.log 2>&1 &" 2>$null
Start-Sleep -Seconds 5

# Check if server started
$serverCheck = ssh -i $SSH_KEY ubuntu@$SERVER_IP "ps aux | grep 'node server.js' | grep -v grep"

if ($serverCheck) {
    Write-Host "✅ Server restarted successfully" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "3. Testing login API..." -ForegroundColor Cyan
    
    # Create JSON file for login test
    ssh -i $SSH_KEY ubuntu@$SERVER_IP "echo '{\"email\":\"admin@company.com\",\"password\":\"password\"}' > /tmp/test_login.json"
    
    # Test login
    $loginTest = ssh -i $SSH_KEY ubuntu@$SERVER_IP "curl -s -X POST https://13.48.248.180.nip.io/api/auth/login -H 'Content-Type: application/json' -d @/tmp/test_login.json -k"
    
    Write-Host "Login Response:"
    Write-Host $loginTest
    
    if ($loginTest -match '"success":true') {
        Write-Host ""
        Write-Host "🎉 SUCCESS! LOGIN IS WORKING!" -ForegroundColor Green
        Write-Host "✅ Admin user: admin@company.com / password" -ForegroundColor Yellow
        Write-Host "✅ Frontend should now work properly!" -ForegroundColor Yellow
        
        # Count permissions in response
        if ($loginTest -match '"permissions":\[([^\]]*)\]') {
            $permsContent = $matches[1]
            if ($permsContent.Length -gt 10) {
                Write-Host "✅ Permissions loaded in response" -ForegroundColor Green
            }
        }
    } else {
        Write-Host ""
        Write-Host "❌ Login still failing" -ForegroundColor Red
        if ($loginTest -match '"message":"([^"]*)"') {
            Write-Host "Error: $($matches[1])" -ForegroundColor Yellow
        }
    }
    
    # Cleanup
    ssh -i $SSH_KEY ubuntu@$SERVER_IP "rm -f /tmp/test_login.json" 2>$null
    
} else {
    Write-Host "❌ Server failed to start" -ForegroundColor Red
    Write-Host ""
    Write-Host "Server logs:"
    $logs = ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && tail -10 server.log"
    Write-Host $logs
}