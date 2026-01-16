const express = require('express');
const router = express.Router();
const PermissionsController = require('../controllers/permissionsController');

// Middleware for authentication
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token required'
        });
    }
    
    const jwt = require('jsonwebtoken');
    
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

// Middleware for checking permissions - FIXED TO USE CALLBACKS
const checkPermission = (requiredPermission) => {
    return (req, res, next) => {
        try {
            const db = require('../db/connection');
            
            // Get user permissions using callback
            const query = `
                SELECT p.name
                FROM permissions p
                JOIN role_permissions rp ON p.id = rp.permission_id
                JOIN users u ON rp.role_id = u.role_id
                WHERE u.id = ? AND p.is_active = true
            `;
            
            db.query(query, [req.user.userId], (err, permissions) => {
                if (err) {
                    console.error('Permission check error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Permission check failed'
                    });
                }
                
                const userPermissions = permissions.map(p => p.name);
                
                // Super admin has all permissions
                if (req.user.role === 'super_admin' || userPermissions.includes(requiredPermission)) {
                    next();
                } else {
                    res.status(403).json({
                        success: false,
                        message: 'Insufficient permissions'
                    });
                }
            });
        } catch (error) {
            console.error('Permission check error:', error);
            res.status(500).json({
                success: false,
                message: 'Permission check failed'
            });
        }
    };
};

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

// GET /api/roles - Get all roles
router.get('/roles', 
    PermissionsController.getRoles
);

// POST /api/roles - Create new role
router.post('/roles', 
    authenticateToken, 
    checkPermission('SYSTEM_ROLE_MANAGEMENT'), 
    PermissionsController.createRole
);

// ================= PERMISSION MANAGEMENT ROUTES ================= //

// GET /api/permissions - Get all permissions
router.get('/permissions', 
    PermissionsController.getPermissions
);

// ================= AUDIT LOG ROUTES ================= //

// GET /api/audit-logs - Get audit logs
router.get('/audit-logs', 
    authenticateToken, 
    checkPermission('SYSTEM_AUDIT_LOG'), 
    PermissionsController.getAuditLogs
);

// ================= SYSTEM STATS ROUTES ================= //

// GET /api/system/stats - Get system statistics
router.get('/system/stats', 
    authenticateToken, 
    checkPermission('SYSTEM_MONITORING'), 
    PermissionsController.getSystemStats
);

module.exports = router;
