# QUICK JWT AUTHENTICATION FIX

## Problem Identified
The `/api/users` endpoint returns 403 "Invalid or expired token" while other endpoints work fine. This is because the permissions routes use different JWT middleware.

## Simple Fix Steps

### Step 1: SSH into server (new terminal)
```bash
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86
```

### Step 2: Navigate to project and backup
```bash
cd ~/inventoryfullstack
cp routes/permissionsRoutes.js routes/permissionsRoutes.js.backup
```

### Step 3: Replace the file with fixed version
```bash
cat > routes/permissionsRoutes.js << 'EOF'
const express = require('express');
const router = express.Router();
const PermissionsController = require('../controllers/permissionsController');
const { authenticateToken, checkPermission } = require('../middleware/auth');

// POST /api/auth/login - User login
router.post('/auth/login', PermissionsController.login);

// POST /api/auth/logout - User logout  
router.post('/auth/logout', authenticateToken, PermissionsController.logout);

// GET /api/users - Get all users
router.get('/users', 
    authenticateToken, 
    checkPermission('SYSTEM_USER_MANAGEMENT'), 
    PermissionsController.getUsers
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

// GET /api/roles - Get all roles
router.get('/roles', PermissionsController.getRoles);

// GET /api/permissions - Get all permissions
router.get('/permissions', PermissionsController.getPermissions);

module.exports = router;
EOF
```

### Step 4: Restart server
```bash
pkill -f "node server.js"
sleep 2
nohup node server.js > server.log 2>&1 &
sleep 3
```

### Step 5: Check server status
```bash
ps aux | grep node
tail -5 server.log
```

### Step 6: Exit SSH
```bash
exit
```

## Test the Fix
Run this in your local terminal:
```bash
node test-jwt-token-issue.js
```

## What This Fixes
- Uses the same JWT middleware (`middleware/auth.js`) for all endpoints
- Ensures consistent JWT_SECRET usage across all routes
- Removes duplicate authentication middleware that was causing token validation failures

The `/api/users` endpoint should now work with valid JWT tokens.