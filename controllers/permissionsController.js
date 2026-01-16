const db = require('../db/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class PermissionsController {
    // ================= AUTHENTICATION ================= //
    
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            }
            
            // Get user with role information
            const userQuery = `
                SELECT u.*, r.name as role_name, r.display_name as role_display_name
                FROM users u
                JOIN roles r ON u.role_id = r.id
                WHERE u.email = ?
            `;
            
            db.query(userQuery, [email], async (err, users) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Database error'
                    });
                }
                
                if (!users || users.length === 0) {
                    return res.status(401).json({
                        success: false,
                        message: 'Invalid credentials'
                    });
                }
                
                const user = users[0];
                
                // Verify password - check both password and password_hash columns
                let isValidPassword = false;
                if (user.password_hash) {
                    isValidPassword = await bcrypt.compare(password, user.password_hash);
                } else if (user.password) {
                    // For plain text passwords (temporary - should be hashed)
                    isValidPassword = (password === user.password);
                }
                
                if (!isValidPassword) {
                    return res.status(401).json({
                        success: false,
                        message: 'Invalid credentials'
                    });
                }
                
                // Get user permissions
                const permQuery = `
                    SELECT p.name, p.display_name, p.category
                    FROM permissions p
                    JOIN role_permissions rp ON p.id = rp.permission_id
                    WHERE rp.role_id = ? AND p.is_active = true
                `;
                
                db.query(permQuery, [user.role_id], async (permErr, permissions) => {
                    if (permErr) {
                        console.error('Permissions error:', permErr);
                        return res.status(500).json({
                            success: false,
                            message: 'Failed to load permissions'
                        });
                    }
                    
                    // Update last login
                    db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id], (updateErr) => {
                        if (updateErr) {
                            console.warn('Failed to update last login:', updateErr);
                        }
                    });
                    
                    // Generate JWT token
                    const token = jwt.sign(
                        { 
                            userId: user.id, 
                            email: user.email, 
                            role: user.role_name,
                            roleId: user.role_id
                        },
                        process.env.JWT_SECRET || 'your-secret-key',
                        { expiresIn: '24h' }
                    );
                    
                    // Log audit
                    PermissionsController.createAuditLog(user.id, 'LOGIN', 'USER', user.id, { ip: req.ip });
                    
                    res.json({
                        success: true,
                        message: 'Login successful',
                        token,
                        user: {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            role: user.role_name,
                            roleDisplayName: user.role_display_name,
                            permissions: permissions.map(p => p.name)
                        }
                    });
                });
            });
            
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    
    static logout(req, res) {
        try {
            // Log audit
            PermissionsController.createAuditLog(req.user?.userId, 'LOGOUT', 'USER', req.user?.userId, { ip: req.ip });
            
            res.json({
                success: true,
                message: 'Logout successful'
            });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    
    static refreshToken(req, res) {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');
            
            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'No token provided'
                });
            }
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            
            // Generate new token
            const newToken = jwt.sign(
                { 
                    userId: decoded.userId, 
                    email: decoded.email, 
                    role: decoded.role,
                    roleId: decoded.roleId
                },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '24h' }
            );
            
            res.json({
                success: true,
                token: newToken
            });
            
        } catch (error) {
            console.error('Token refresh error:', error);
            res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
    }
    
    // ================= USER MANAGEMENT ================= //
    
    static getUsers(req, res) {
        try {
            const query = `
                SELECT u.id, u.name, u.email, u.is_active, u.last_login, u.created_at,
                       r.name as role_name, r.display_name as role_display_name, r.color as role_color
                FROM users u
                JOIN roles r ON u.role_id = r.id
                ORDER BY u.created_at DESC
            `;
            
            db.query(query, (err, users) => {
                if (err) {
                    console.error('Get users error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to fetch users'
                    });
                }
                
                res.json({
                    success: true,
                    data: users
                });
            });
            
        } catch (error) {
            console.error('Get users error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch users'
            });
        }
    }
    
    static getUserById(req, res) {
        try {
            const { userId } = req.params;
            
            const query = `
                SELECT u.id, u.name, u.email, u.is_active, u.last_login, u.created_at,
                       r.name as role_name, r.display_name as role_display_name, r.color as role_color
                FROM users u
                JOIN roles r ON u.role_id = r.id
                WHERE u.id = ?
            `;
            
            db.query(query, [userId], (err, users) => {
                if (err) {
                    console.error('Get user error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to fetch user'
                    });
                }
                
                if (users.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'User not found'
                    });
                }
                
                const user = users[0];
                
                // Get user permissions
                const permQuery = `
                    SELECT p.name, p.display_name, p.category
                    FROM permissions p
                    JOIN role_permissions rp ON p.id = rp.permission_id
                    WHERE rp.role_id = ? AND p.is_active = true
                `;
                
                db.query(permQuery, [user.role_id], (permErr, permissions) => {
                    if (permErr) {
                        console.error('Get permissions error:', permErr);
                        return res.status(500).json({
                            success: false,
                            message: 'Failed to fetch user permissions'
                        });
                    }
                    
                    user.permissions = permissions;
                    
                    res.json({
                        success: true,
                        data: user
                    });
                });
            });
            
        } catch (error) {
            console.error('Get user error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch user'
            });
        }
    }
    
    static async createUser(req, res) {
        try {
            const { name, email, password, role_id, is_active = 1 } = req.body;
            
            if (!name || !email || !password || !role_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Name, email, password, and role are required'
                });
            }
            
            // Check if email already exists
            db.query('SELECT id FROM users WHERE email = ?', [email], async (err, existingUsers) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Database error'
                    });
                }
                
                if (existingUsers.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Email already exists'
                    });
                }
                
                // Hash password
                const passwordHash = await bcrypt.hash(password, 10);
                
                // Create user
                const insertQuery = `
                    INSERT INTO users (name, email, password, role_id, is_active)
                    VALUES (?, ?, ?, ?, ?)
                `;
                
                db.query(insertQuery, [name, email, passwordHash, role_id, is_active], (insertErr, result) => {
                    if (insertErr) {
                        console.error('Create user error:', insertErr);
                        return res.status(500).json({
                            success: false,
                            message: 'Failed to create user'
                        });
                    }
                    
                    // Log audit
                    PermissionsController.createAuditLog(req.user?.userId, 'CREATE', 'USER', result.insertId, {
                        name, email, role_id, is_active
                    });
                    
                    res.status(201).json({
                        success: true,
                        message: 'User created successfully',
                        data: { id: result.insertId }
                    });
                });
            });
            
        } catch (error) {
            console.error('Create user error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create user'
            });
        }
    }
    
    static updateUser(req, res) {
        const { userId } = req.params;
        const { name, email, roleId, status } = req.body;
        
        // Check if user exists
        db.query('SELECT id FROM users WHERE id = ?', [userId], (err, existingUsers) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Database error'
                });
            }
            
            if (existingUsers.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            
            // Update user
            const updateSql = `
                UPDATE users 
                SET name = ?, email = ?, role_id = ?, status = ?, updated_at = NOW()
                WHERE id = ?
            `;
            
            db.query(updateSql, [name, email, roleId, status, userId], (updateErr) => {
                if (updateErr) {
                    console.error('Update user error:', updateErr);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to update user'
                    });
                }
                
                // Log audit
                PermissionsController.createAuditLog(req.user?.userId, 'UPDATE', 'USER', userId, {
                    name, email, roleId, status
                });
                
                res.json({
                    success: true,
                    message: 'User updated successfully'
                });
            });
        });
    }
    
    static deleteUser(req, res) {
        const { userId } = req.params;
        
        // Check if user exists
        db.query('SELECT id FROM users WHERE id = ?', [userId], (err, existingUsers) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Database error'
                });
            }
            
            if (existingUsers.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            
            // Delete user
            db.query('DELETE FROM users WHERE id = ?', [userId], (deleteErr) => {
                if (deleteErr) {
                    console.error('Delete user error:', deleteErr);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to delete user'
                    });
                }
                
                // Log audit
                PermissionsController.createAuditLog(req.user?.userId, 'DELETE', 'USER', userId, {});
                
                res.json({
                    success: true,
                    message: 'User deleted successfully'
                });
            });
        });
    }
    
    // ================= ROLE MANAGEMENT ================= //
    
    static getRoles(req, res) {
        const sql = `
            SELECT r.*, 
                   COUNT(DISTINCT u.id) as user_count,
                   COUNT(DISTINCT rp.permission_id) as permission_count
            FROM roles r
            LEFT JOIN users u ON r.id = u.role_id
            LEFT JOIN role_permissions rp ON r.id = rp.role_id
            WHERE r.is_active = true
            GROUP BY r.id
            ORDER BY r.priority
        `;
        
        db.query(sql, (err, roles) => {
            if (err) {
                console.error('Get roles error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch roles'
                });
            }
            
            // Get permissions for each role
            let completed = 0;
            const total = roles.length;
            
            if (total === 0) {
                return res.json({
                    success: true,
                    data: []
                });
            }
            
            roles.forEach(role => {
                const permSql = `
                    SELECT p.name, p.display_name, p.category
                    FROM permissions p
                    JOIN role_permissions rp ON p.id = rp.permission_id
                    WHERE rp.role_id = ? AND p.is_active = true
                    ORDER BY p.category, p.name
                `;
                
                db.query(permSql, [role.id], (err2, permissions) => {
                    role.permissions = err2 ? [] : permissions;
                    completed++;
                    
                    if (completed === total) {
                        res.json({
                            success: true,
                            data: roles
                        });
                    }
                });
            });
        });
    }
    
    static createRole(req, res) {
        const { name, displayName, display_name, description, color = '#6366f1', permissionIds = [] } = req.body;
        
        // Accept both camelCase and snake_case
        const finalDisplayName = displayName || display_name;
        
        if (!name || !finalDisplayName) {
            return res.status(400).json({
                success: false,
                message: 'Name and display name are required'
            });
        }
        
        // Create role
        const insertSql = `
            INSERT INTO roles (name, display_name, description, color)
            VALUES (?, ?, ?, ?)
        `;
        
        db.query(insertSql, [name, finalDisplayName, description, color], (err, result) => {
            if (err) {
                console.error('Create role error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to create role'
                });
            }
            
            const roleId = result.insertId;
            
            // Assign permissions
            if (permissionIds.length > 0) {
                const values = permissionIds.map(permId => `(${roleId}, ${permId})`).join(',');
                const permSql = `INSERT INTO role_permissions (role_id, permission_id) VALUES ${values}`;
                
                db.query(permSql, (permErr) => {
                    if (permErr) {
                        console.error('Assign permissions error:', permErr);
                        return res.status(500).json({
                            success: false,
                            message: 'Role created but failed to assign permissions'
                        });
                    }
                    
                    // Log audit
                    PermissionsController.createAuditLog(req.user?.userId, 'CREATE', 'ROLE', roleId, {
                        name, displayName: finalDisplayName, description, color, permissionIds
                    });
                    
                    res.status(201).json({
                        success: true,
                        message: 'Role created successfully',
                        data: { id: roleId }
                    });
                });
            } else {
                // No permissions to assign
                PermissionsController.createAuditLog(req.user?.userId, 'CREATE', 'ROLE', roleId, {
                    name, displayName: finalDisplayName, description, color, permissionIds
                });
                
                res.status(201).json({
                    success: true,
                    message: 'Role created successfully',
                    data: { id: roleId }
                });
            }
        });
    }
    
    // ================= PERMISSION MANAGEMENT ================= //
    
    static getPermissions(req, res) {
        const sql = `
            SELECT * FROM permissions 
            WHERE is_active = true 
            ORDER BY category, name
        `;
        
        db.query(sql, (err, permissions) => {
            if (err) {
                console.error('Get permissions error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch permissions'
                });
            }
            
            // Group by category
            const groupedPermissions = permissions.reduce((acc, perm) => {
                if (!acc[perm.category]) {
                    acc[perm.category] = [];
                }
                acc[perm.category].push(perm);
                return acc;
            }, {});
            
            res.json({
                success: true,
                data: {
                    permissions,
                    grouped: groupedPermissions
                }
            });
        });
    }
    
    // ================= AUDIT LOG ================= //
    
    static getAuditLogs(req, res) {
        const { page = 1, limit = 50, userId, action, resource } = req.query;
        const offset = (page - 1) * limit;
        
        let whereClause = '1=1';
        let params = [];
        
        if (userId) {
            whereClause += ' AND al.user_id = ?';
            params.push(userId);
        }
        
        if (action) {
            whereClause += ' AND al.action = ?';
            params.push(action);
        }
        
        if (resource) {
            whereClause += ' AND al.resource = ?';
            params.push(resource);
        }
        
        const logsSql = `
            SELECT al.*, u.name as user_name, u.email as user_email
            FROM audit_logs al
            LEFT JOIN users u ON al.user_id = u.id
            WHERE ${whereClause}
            ORDER BY al.created_at DESC
            LIMIT ? OFFSET ?
        `;
        
        db.query(logsSql, [...params, parseInt(limit), parseInt(offset)], (err, logs) => {
            if (err) {
                console.error('Get audit logs error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch audit logs'
                });
            }
            
            const countSql = `
                SELECT COUNT(*) as total
                FROM audit_logs al
                WHERE ${whereClause}
            `;
            
            db.query(countSql, params, (countErr, countResult) => {
                if (countErr) {
                    console.error('Count audit logs error:', countErr);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to fetch audit logs count'
                    });
                }
                
                res.json({
                    success: true,
                    data: {
                        logs,
                        pagination: {
                            page: parseInt(page),
                            limit: parseInt(limit),
                            total: countResult[0].total,
                            pages: Math.ceil(countResult[0].total / limit)
                        }
                    }
                });
            });
        });
    }
    
    // ================= SYSTEM STATS ================= //
    
    static getSystemStats(req, res) {
        const userStatsSql = `
            SELECT 
                COUNT(*) as total_users,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_users,
                SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_users
            FROM users
        `;
        
        db.query(userStatsSql, (err, userStats) => {
            if (err) {
                console.error('Get user stats error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch system stats'
                });
            }
            
            const roleStatsSql = `
                SELECT r.name, r.display_name, COUNT(u.id) as user_count
                FROM roles r
                LEFT JOIN users u ON r.id = u.role_id
                WHERE r.is_active = true
                GROUP BY r.id
                ORDER BY user_count DESC
            `;
            
            db.query(roleStatsSql, (roleErr, roleStats) => {
                if (roleErr) {
                    console.error('Get role stats error:', roleErr);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to fetch system stats'
                    });
                }
                
                const permStatsSql = `
                    SELECT category, COUNT(*) as permission_count
                    FROM permissions
                    WHERE is_active = true
                    GROUP BY category
                    ORDER BY permission_count DESC
                `;
                
                db.query(permStatsSql, (permErr, permissionStats) => {
                    if (permErr) {
                        console.error('Get permission stats error:', permErr);
                        return res.status(500).json({
                            success: false,
                            message: 'Failed to fetch system stats'
                        });
                    }
                    
                    const activitySql = `
                        SELECT COUNT(*) as activity_count
                        FROM audit_logs
                        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
                    `;
                    
                    db.query(activitySql, (actErr, recentActivity) => {
                        if (actErr) {
                            console.error('Get activity stats error:', actErr);
                            return res.status(500).json({
                                success: false,
                                message: 'Failed to fetch system stats'
                            });
                        }
                        
                        res.json({
                            success: true,
                            data: {
                                users: userStats[0],
                                roles: roleStats,
                                permissions: permissionStats,
                                recentActivity: recentActivity[0].activity_count
                            }
                        });
                    });
                });
            });
        });
    }
    
    // ================= HELPER METHODS ================= //
    
    static createAuditLog(userId, action, resource, resourceId, details, callback) {
        // If no callback provided, use a no-op function to prevent crashes
        const cb = callback || (() => {});
        
        const sql = `
            INSERT INTO audit_logs (user_id, action, resource, resource_id, details)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        db.query(sql, [userId, action, resource, resourceId, JSON.stringify(details)], (err) => {
            if (err) {
                console.error('Create audit log error:', err);
            }
            // Always call the callback to prevent hanging
            cb(err);
        });
    }
}

module.exports = PermissionsController;
