const jwt = require('jsonwebtoken');
const db = require('../db/connection');

// JWT Secret (should be in .env file)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Generate JWT Token
 */
const generateToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        name: user.name,
        role_id: user.role_id,
        role_name: user.role_name || user.role,
        iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, JWT_SECRET, { 
        expiresIn: JWT_EXPIRES_IN,
        issuer: 'inventory-system',
        audience: 'inventory-users'
    });
};

/**
 * Verify JWT Token Middleware
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token required',
            error: 'NO_TOKEN'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log('JWT verification failed:', err.message);
            
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expired',
                    error: 'TOKEN_EXPIRED'
                });
            }
            
            if (err.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token',
                    error: 'INVALID_TOKEN'
                });
            }

            return res.status(403).json({
                success: false,
                message: 'Token verification failed',
                error: 'TOKEN_VERIFICATION_FAILED'
            });
        }

        // Add user info to request
        req.user = decoded;
        next();
    });
};

/**
 * Check if user has specific permission
 */
const checkPermission = (permissionName) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            const roleId = req.user.role_id;

            // Check if user has the permission through their role
            const permissionQuery = `
                SELECT p.name 
                FROM permissions p
                JOIN role_permissions rp ON p.id = rp.permission_id
                WHERE rp.role_id = ? AND p.name = ?
                LIMIT 1
            `;

            db.query(permissionQuery, [roleId, permissionName], (err, results) => {
                if (err) {
                    console.error('Permission check error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Permission check failed'
                    });
                }

                if (results.length === 0) {
                    return res.status(403).json({
                        success: false,
                        message: 'Insufficient permissions',
                        required_permission: permissionName,
                        user_role: req.user.role_name
                    });
                }

                next();
            });
        } catch (error) {
            console.error('Permission middleware error:', error);
            return res.status(500).json({
                success: false,
                message: 'Permission check failed'
            });
        }
    };
};

/**
 * Get user permissions
 */
const getUserPermissions = async (userId, roleId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT DISTINCT p.name, p.display_name, p.category
            FROM permissions p
            JOIN role_permissions rp ON p.id = rp.permission_id
            WHERE rp.role_id = ?
            ORDER BY p.category, p.name
        `;

        db.query(query, [roleId], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

module.exports = {
    generateToken,
    authenticateToken,
    checkPermission,
    requirePermission: checkPermission, // Alias for compatibility
    getUserPermissions,
    JWT_SECRET
};