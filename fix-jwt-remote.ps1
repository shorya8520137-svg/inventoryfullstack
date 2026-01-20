Write-Host "🔧 Fixing JWT Authentication Issue Remotely..." -ForegroundColor Cyan

$SERVER_IP = "16.171.197.86"
$SSH_KEY = "C:\Users\Admin\awsconection.pem"

Write-Host "🔄 Connecting to server and applying fix..." -ForegroundColor Yellow

# Create the fix script on server and execute it
ssh -i $SSH_KEY ubuntu@$SERVER_IP "
cd ~/inventoryfullstack

echo '🔧 Backing up original permissions routes...'
cp routes/permissionsRoutes.js routes/permissionsRoutes.js.backup

echo '🔧 Applying JWT authentication fix...'
cat > routes/permissionsRoutes.js << 'EOFFIX'
const express = require('express');
const router = express.Router();
const PermissionsController = require('../controllers/permissionsController');
const { authenticateToken, checkPermission } = require('../middleware/auth');

// ================= AUTHENTICATION ROUTES ================= //

// POST /api/auth/login - User login
router.post('/auth/login', PermissionsController.login);

// POST /api/auth/logout - User logout
router.post('/auth/logout', authenticateToken, PermissionsController.logout);

// POST /api/auth/refresh - Refresh JWT token
router.post('/auth/refresh', PermissionsController.refreshToken);

// ================= USER MANAGEMENT ROUTES ================= //

// GET /api/users - Get all users
router.get('/users', 
    authenticateToken, 
    checkPermission('SYSTEM_USER_MANAGEMENT'), 
    PermissionsController.getUsers
);

// GET /api/users/:userId - Get user by ID
router.get('/users/:userId', 
    authenticateToken, 
    checkPermission('SYSTEM_USER_MANAGEMENT'), 
    PermissionsController.getUserById
);

// POST /api/users - Create new user
router.post('/users', 
    authenticateToken, 
    checkPermission('SYSTEM_USER_MANAGEMENT'), 
    PermissionsController.createUser
);

// PUT /api/users/:userId - Update user
router.put('/users/:userId', 
    authenticateToken, 
    checkPermission('SYSTEM_USER_MANAGEMENT'), 
    PermissionsController.updateUser
);

// DELETE /api/users/:userId - Delete user
router.delete('/users/:userId', 
    authenticateToken, 
    checkPermission('SYSTEM_USER_MANAGEMENT'), 
    PermissionsController.deleteUser
);

// ================= ROLE MANAGEMENT ROUTES ================= //

// GET /api/roles - Get all roles (public for frontend to load role data)
router.get('/roles', 
    PermissionsController.getRoles
);

// ================= PERMISSION MANAGEMENT ROUTES ================= //

// GET /api/permissions - Get all permissions (public for frontend to load permission data)
router.get('/permissions', 
    PermissionsController.getPermissions
);

module.exports = router;
EOFFIX

echo '🔄 Restarting server...'
pkill -f 'node server.js' || true
pkill -f 'npm start' || true
sleep 2
nohup node server.js > server.log 2>&1 &
sleep 3

echo '✅ Server restarted with JWT fix applied'
echo '📋 Server status:'
ps aux | grep node | grep -v grep
"

Write-Host "🧪 Testing the fix..." -ForegroundColor Yellow
node test-jwt-token-issue.js

Write-Host ""
Write-Host "🎉 JWT Authentication Fix Complete!" -ForegroundColor Green