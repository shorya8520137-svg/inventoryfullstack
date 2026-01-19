# DIRECT FILE FIX - SIMPLE APPROACH
Write-Host "DIRECT FILE FIX FOR AUTH SYSTEM" -ForegroundColor Green
Write-Host "==============================="

$SERVER_IP = "13.48.248.180"
$SSH_KEY = "C:\Users\Admin\awsconection.pem"

Write-Host "1. Creating auth middleware directly..." -ForegroundColor Cyan

# Create auth middleware with simple echo
ssh -i $SSH_KEY ubuntu@$SERVER_IP "mkdir -p ~/inventoryfullstack/middleware"
ssh -i $SSH_KEY ubuntu@$SERVER_IP "echo 'const jwt = require(\"jsonwebtoken\");' > ~/inventoryfullstack/middleware/auth.js"
ssh -i $SSH_KEY ubuntu@$SERVER_IP "echo '' >> ~/inventoryfullstack/middleware/auth.js"
ssh -i $SSH_KEY ubuntu@$SERVER_IP "echo 'const authenticateToken = (req, res, next) => {' >> ~/inventoryfullstack/middleware/auth.js"
ssh -i $SSH_KEY ubuntu@$SERVER_IP "echo '    const authHeader = req.headers[\"authorization\"];' >> ~/inventoryfullstack/middleware/auth.js"
ssh -i $SSH_KEY ubuntu@$SERVER_IP "echo '    const token = authHeader && authHeader.split(\" \")[1];' >> ~/inventoryfullstack/middleware/auth.js"
ssh -i $SSH_KEY ubuntu@$SERVER_IP "echo '    if (!token) return res.status(401).json({success: false, message: \"Token required\"});' >> ~/inventoryfullstack/middleware/auth.js"
ssh -i $SSH_KEY ubuntu@$SERVER_IP "echo '    jwt.verify(token, process.env.JWT_SECRET || \"your-secret-key\", (err, user) => {' >> ~/inventoryfullstack/middleware/auth.js"
ssh -i $SSH_KEY ubuntu@$SERVER_IP "echo '        if (err) return res.status(403).json({success: false, message: \"Invalid token\"});' >> ~/inventoryfullstack/middleware/auth.js"
ssh -i $SSH_KEY ubuntu@$SERVER_IP "echo '        req.user = user; next();' >> ~/inventoryfullstack/middleware/auth.js"
ssh -i $SSH_KEY ubuntu@$SERVER_IP "echo '    });' >> ~/inventoryfullstack/middleware/auth.js"
ssh -i $SSH_KEY ubuntu@$SERVER_IP "echo '};' >> ~/inventoryfullstack/middleware/auth.js"
ssh -i $SSH_KEY ubuntu@$SERVER_IP "echo '' >> ~/inventoryfullstack/middleware/auth.js"
ssh -i $SSH_KEY ubuntu@$SERVER_IP "echo 'module.exports = { authenticateToken };' >> ~/inventoryfullstack/middleware/auth.js"

Write-Host "✅ Created auth middleware" -ForegroundColor Green

Write-Host ""
Write-Host "2. Creating simple authRoutes..." -ForegroundColor Cyan

# Create authRoutes with simple echo
ssh -i $SSH_KEY ubuntu@$SERVER_IP "echo 'const express = require(\"express\");' > ~/inventoryfullstack/routes/authRoutes.js"
ssh -i $SSH_KEY ubuntu@$SERVER_IP "echo 'const router = express.Router();' >> ~/inventoryfullstack/routes/authRoutes.js"
ssh -i $SSH_KEY ubuntu@$SERVER_IP "echo 'const PermissionsController = require(\"../controllers/permissionsController\");' >> ~/inventoryfullstack/routes/authRoutes.js"
ssh -i $SSH_KEY ubuntu@$SERVER_IP "echo '' >> ~/inventoryfullstack/routes/authRoutes.js"
ssh -i $SSH_KEY ubuntu@$SERVER_IP "echo 'router.post(\"/login\", PermissionsController.login);' >> ~/inventoryfullstack/routes/authRoutes.js"
ssh -i $SSH_KEY ubuntu@$SERVER_IP "echo 'router.post(\"/logout\", PermissionsController.logout);' >> ~/inventoryfullstack/routes/authRoutes.js"
ssh -i $SSH_KEY ubuntu@$SERVER_IP "echo 'router.post(\"/refresh\", PermissionsController.refreshToken);' >> ~/inventoryfullstack/routes/authRoutes.js"
ssh -i $SSH_KEY ubuntu@$SERVER_IP "echo '' >> ~/inventoryfullstack/routes/authRoutes.js"
ssh -i $SSH_KEY ubuntu@$SERVER_IP "echo 'module.exports = router;' >> ~/inventoryfullstack/routes/authRoutes.js"

Write-Host "✅ Created authRoutes" -ForegroundColor Green

Write-Host ""
Write-Host "3. Verifying files..." -ForegroundColor Cyan
$authCheck = ssh -i $SSH_KEY ubuntu@$SERVER_IP "head -5 ~/inventoryfullstack/middleware/auth.js"
Write-Host "Auth middleware: $authCheck"

$routesCheck = ssh -i $SSH_KEY ubuntu@$SERVER_IP "head -5 ~/inventoryfullstack/routes/authRoutes.js"
Write-Host "Auth routes: $routesCheck"

Write-Host ""
Write-Host "4. Starting server..." -ForegroundColor Cyan

# Kill and restart server
ssh -i $SSH_KEY ubuntu@$SERVER_IP "pkill -f 'node server.js'" 2>$null
Start-Sleep -Seconds 3
ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && nohup node server.js > server.log 2>&1 &" 2>$null
Start-Sleep -Seconds 5

$serverCheck = ssh -i $SSH_KEY ubuntu@$SERVER_IP "ps aux | grep 'node server.js' | grep -v grep"

if ($serverCheck) {
    Write-Host "✅ Server started!" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "5. Final login test..." -ForegroundColor Cyan
    
    # Simple curl test
    $loginTest = ssh -i $SSH_KEY ubuntu@$SERVER_IP "curl -s -X POST https://13.48.248.180.nip.io/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"admin@company.com\",\"password\":\"password\"}' -k"
    
    if ($loginTest -match '"success":true') {
        Write-Host ""
        Write-Host "🎉🎉🎉 SUCCESS! 🎉🎉🎉" -ForegroundColor Green
        Write-Host "======================" -ForegroundColor Green
        Write-Host "✅ Server: Running" -ForegroundColor Yellow
        Write-Host "✅ Auth: Fixed" -ForegroundColor Yellow
        Write-Host "✅ Login: Working" -ForegroundColor Yellow
        Write-Host "✅ Admin: admin@company.com / password" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Your frontend should now work perfectly!" -ForegroundColor Cyan
        Write-Host "URL: https://13.48.248.180.nip.io" -ForegroundColor Cyan
    } else {
        Write-Host "Login response: $loginTest" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Server failed" -ForegroundColor Red
    $logs = ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && tail -10 server.log"
    Write-Host $logs
}