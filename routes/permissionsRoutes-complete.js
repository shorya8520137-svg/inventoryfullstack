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
            message: 'Access token required',
            error: 'NO_TOKEN'
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

// Middleware for checking permissions
const checkPermission = (requiredPermission) => {
    return (req, res, next) => {
        try {
            const db = require('../db/connection');
            
            const query = `
                SELECT p.name
                FROM permissions p
                JOIN role_permissions rp ON p.id = rp.permission_id
                JOIN users u ON rp.role_id = u.role_id
                WHERE u.id = ? AND p.is_active = true
            `;
            
            db.query(query, [req.user.id], (err, permissions) => {
                if (err) {
                    console.error('Permission check error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Permission check failed'
                    });
                }
                
                const userPermissions = permissions.map(p => p.name);
                
                // Super admin or user with permission
                if (req.user.role_name === 'super_admin' || userPermissions.includes(requiredPermission)) {
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

// ================= ROLE MANAGEMENT ROUTES ================= //

// GET /api/roles - Get all roles
router.get('/roles', PermissionsController.getRoles);

// GET /api/roles/:roleId - Get role by ID
router.get('/roles/:roleId', 
    authenticateToken, 
    checkPermission('SYSTEM_ROLE_MANAGEMENT'), 
    (req, res) => {
        try {
            const { roleId } = req.params;
            const db = require('../db/connection');
            
            const query = 'SELECT * FROM roles WHERE id = ? AND is_active = true';
            
            db.query(query, [roleId], (err, roles) => {
                if (err) {
                    console.error('Get role error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to fetch role'
                    });
                }
                
                if (roles.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Role not found'
                    });
                }
                
                const role = roles[0];
                
                // Get role permissions
                const permQuery = `
                    SELECT p.id, p.name, p.display_name, p.category
                    FROM permissions p
                    JOIN role_permissions rp ON p.id = rp.permission_id
                    WHERE rp.role_id = ? AND p.is_active = true
                    ORDER BY p.category, p.name
                `;
                
                db.query(permQuery, [roleId], (err2, permissions) => {
                    if (err2) {
                        console.error('Get permissions error:', err2);
                        return res.status(500).json({
                            success: false,
                            message: 'Failed to fetch permissions'
                        });
                    }
                    
                    role.permissions = permissions;
                    
                    res.json({
                        success: true,
                        data: role
                    });
                });
            });
        } catch (error) {
            console.error('Get role error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch role'
            });
        }
    }
);

// POST /api/roles - Create new role
router.post('/roles', 
    authenticateToken, 
    checkPermission('SYSTEM_ROLE_MANAGEMENT'), 
    PermissionsController.createRole
);

// PUT /api/roles/:roleId - Update role
router.put('/roles/:roleId', 
    authenticateToken, 
    checkPermission('SYSTEM_ROLE_MANAGEMENT'), 
    (req, res) => {
        try {
            const { roleId } = req.params;
            const { name, displayName, display_name, description, color } = req.body;
            
            // Handle both camelCase and snake_case, use name as fallback
            const finalDisplayName = displayName || display_name || name;
            
            const db = require('../db/connection');
            
            const query = `
                UPDATE roles 
                SET name = ?, display_name = ?, description = ?, color = ?, updated_at = NOW()
                WHERE id = ?
            `;
            
            db.query(query, [name, finalDisplayName, description, color, roleId], (err, result) => {
                if (err) {
                    console.error('Update role error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to update role'
                    });
                }
                
                // Get updated role
                db.query('SELECT * FROM roles WHERE id = ?', [roleId], (err2, roles) => {
                    if (err2 || roles.length === 0) {
                        return res.json({
                            success: true,
                            message: 'Role updated successfully'
                        });
                    }
                    
                    res.json({
                        success: true,
                        message: 'Role updated successfully',
                        data: roles[0]
                    });
                });
            });
        } catch (error) {
            console.error('Update role error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update role'
            });
        }
    }
);

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

// PUT /api/users/:userId/role - Update user role
router.put('/users/:userId/role', 
    authenticateToken, 
    checkPermission('SYSTEM_USER_MANAGEMENT'), 
    (req, res) => {
        try {
            const { userId } = req.params;
            const { roleId } = req.body;
            
            const db = require('../db/connection');
            
            db.query('UPDATE users SET role_id = ? WHERE id = ?', [roleId, userId], (err, result) => {
                if (err) {
                    console.error('Update user role error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to update user role'
                    });
                }
                
                res.json({
                    success: true,
                    message: 'User role updated successfully'
                });
            });
        } catch (error) {
            console.error('Update user role error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update user role'
            });
        }
    }
);

// ================= PERMISSION MANAGEMENT ROUTES ================= //

// GET /api/permissions - Get all permissions
router.get('/permissions', PermissionsController.getPermissions);

// GET /api/permissions/:permissionId - Get permission by ID
router.get('/permissions/:permissionId', 
    authenticateToken, 
    checkPermission('SYSTEM_PERMISSION_MANAGEMENT'), 
    (req, res) => {
        try {
            const { permissionId } = req.params;
            const db = require('../db/connection');
            
            db.query('SELECT * FROM permissions WHERE id = ? AND is_active = true', [permissionId], (err, permissions) => {
                if (err) {
                    console.error('Get permission error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to fetch permission'
                    });
                }
                
                if (permissions.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Permission not found'
                    });
                }
                
                res.json({
                    success: true,
                    data: permissions[0]
                });
            });
        } catch (error) {
            console.error('Get permission error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch permission'
            });
        }
    }
);

// ================= ROLE-PERMISSION MAPPING ROUTES ================= //

// GET /api/roles/:roleId/permissions - Get role permissions
router.get('/roles/:roleId/permissions', 
    authenticateToken, 
    checkPermission('SYSTEM_ROLE_MANAGEMENT'), 
    (req, res) => {
        try {
            const { roleId } = req.params;
            const db = require('../db/connection');
            
            const query = `
                SELECT p.id, p.name, p.display_name, p.category
                FROM permissions p
                JOIN role_permissions rp ON p.id = rp.permission_id
                WHERE rp.role_id = ? AND p.is_active = true
                ORDER BY p.category, p.name
            `;
            
            db.query(query, [roleId], (err, permissions) => {
                if (err) {
                    console.error('Get role permissions error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to fetch role permissions'
                    });
                }
                
                res.json({
                    success: true,
                    data: permissions
                });
            });
        } catch (error) {
            console.error('Get role permissions error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch role permissions'
            });
        }
    }
);

// PUT /api/roles/:roleId/permissions - Update role permissions (bulk)
router.put('/roles/:roleId/permissions', 
    authenticateToken, 
    checkPermission('SYSTEM_ROLE_MANAGEMENT'), 
    (req, res) => {
        try {
            const { roleId } = req.params;
            const { permissionIds } = req.body;
            
            const db = require('../db/connection');
            
            // Remove all existing permissions
            db.query('DELETE FROM role_permissions WHERE role_id = ?', [roleId], (err) => {
                if (err) {
                    console.error('Delete permissions error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to update role permissions'
                    });
                }
                
                // Add new permissions
                if (permissionIds && permissionIds.length > 0) {
                    const values = permissionIds.map(permId => [roleId, permId]);
                    const query = 'INSERT INTO role_permissions (role_id, permission_id) VALUES ?';
                    
                    db.query(query, [values], (err2) => {
                        if (err2) {
                            console.error('Insert permissions error:', err2);
                            return res.status(500).json({
                                success: false,
                                message: 'Failed to update role permissions'
                            });
                        }
                        
                        res.json({
                            success: true,
                            message: 'Role permissions updated successfully'
                        });
                    });
                } else {
                    res.json({
                        success: true,
                        message: 'Role permissions updated successfully'
                    });
                }
            });
        } catch (error) {
            console.error('Update role permissions error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update role permissions'
            });
        }
    }
);

// GET /api/audit-logs - Get audit logs
router.get('/audit-logs', 
    authenticateToken, 
    checkPermission('SYSTEM_AUDIT_LOG'), 
    PermissionsController.getAuditLogs
);

module.exports = router;
