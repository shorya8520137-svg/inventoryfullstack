# CREATE SIMPLE AUTH MIDDLEWARE
Write-Host "CREATING SIMPLE AUTH MIDDLEWARE" -ForegroundColor Green
Write-Host "==============================="

$SERVER_IP = "13.48.248.180"
$SSH_KEY = "C:\Users\Admin\awsconection.pem"

Write-Host "1. Creating simple auth middleware..." -ForegroundColor Cyan

# Create simple auth middleware
$authMiddlewareContent = @"
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token required'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
        req.user = user;
        next();
    });
};

module.exports = {
    authenticateToken
};
"@

# Upload auth middleware
ssh -i $SSH_KEY ubuntu@$SERVER_IP "mkdir -p ~/inventoryfullstack/middleware"
ssh -i $SSH_KEY ubuntu@$SERVER_IP "cat > ~/inventoryfullstack/middleware/auth.js << 'EOF'
$authMiddlewareContent
EOF"

Write-Host "✅ Created auth middleware" -ForegroundColor Green

Write-Host ""
Write-Host "2. Creating simple authRoutes..." -ForegroundColor Cyan

# Create simple authRoutes
$authRoutesContent = @"
const express = require('express');
const router = express.Router();
const PermissionsController = require('../controllers/permissionsController');

// POST /api/auth/login - User login
router.post('/login', PermissionsController.login);

// POST /api/auth/logout - User logout
router.post('/logout', PermissionsController.logout);

// POST /api/auth/refresh - Refresh token
router.post('/refresh', PermissionsController.refreshToken);

module.exports = router;
"@

# Upload authRoutes
ssh -i $SSH_KEY ubuntu@$SERVER_IP "cat > ~/inventoryfullstack/routes/authRoutes.js << 'EOF'
$authRoutesContent
EOF"

Write-Host "✅ Created authRoutes" -ForegroundColor Green

Write-Host ""
Write-Host "3. Starting server..." -ForegroundColor Cyan

# Kill existing server
ssh -i $SSH_KEY ubuntu@$SERVER_IP "pkill -f 'node server.js'" 2>$null
Start-Sleep -Seconds 3

# Start server
ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && nohup node server.js > server.log 2>&1 &" 2>$null
Start-Sleep -Seconds 5

# Check server status
$serverCheck = ssh -i $SSH_KEY ubuntu@$SERVER_IP "ps aux | grep 'node server.js' | grep -v grep"

if ($serverCheck) {
    Write-Host "✅ Server started successfully!" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "4. Testing login API..." -ForegroundColor Cyan
    
    # Test login
    ssh -i $SSH_KEY ubuntu@$SERVER_IP "echo '{\"email\":\"admin@company.com\",\"password\":\"password\"}' > /tmp/login_test.json"
    $loginTest = ssh -i $SSH_KEY ubuntu@$SERVER_IP "curl -s -X POST https://13.48.248.180.nip.io/api/auth/login -H 'Content-Type: application/json' -d @/tmp/login_test.json -k"
    
    Write-Host "Login Response:"
    Write-Host $loginTest
    
    if ($loginTest -match '"success":true') {
        Write-Host ""
        Write-Host "🎉 PERFECT! LOGIN IS WORKING!" -ForegroundColor Green
        Write-Host "================================" -ForegroundColor Green
        Write-Host "✅ Server: Running" -ForegroundColor Yellow
        Write-Host "✅ Auth: Fixed" -ForegroundColor Yellow
        Write-Host "✅ Login: admin@company.com / password" -ForegroundColor Yellow
        Write-Host "✅ Frontend: Should work now!" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Try your frontend at: https://13.48.248.180.nip.io" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Login test failed" -ForegroundColor Red
        Write-Host $loginTest
    }
    
    ssh -i $SSH_KEY ubuntu@$SERVER_IP "rm -f /tmp/login_test.json" 2>$null
    
} else {
    Write-Host "❌ Server failed to start" -ForegroundColor Red
    $logs = ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && tail -15 server.log"
    Write-Host "Logs:"
    Write-Host $logs
}