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