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
                
                // Verify password - check if bcrypt hashed or plain text
                let isValidPassword = false;
                if (user.password) {
                    // Check if password is bcrypt hashed
                    if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
                        isValidPassword = await bcrypt.compare(password, user.password);
                    } else {
                        // Plain text password (for existing users)
                        isValidPassword = (password === user.password);
                    }
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
                SELECT u.id, u.name, u.email, u.is_active, u.last_login, u.created_at, u.role_id,
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
        try {
            const { userId } = req.params;
            const { name, email, role_id, is_active } = req.body;
            
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
                const updateQuery = `
                    UPDATE users 
                    SET name = ?, email = ?, role_id = ?, is_active = ?, updated_at = NOW()
                    WHERE id = ?
                `;
                
                db.query(updateQuery, [name, email, role_id, is_active, userId], (updateErr) => {
                    if (updateErr) {
                        console.error('Update user error:', updateErr);
                        return res.status(500).json({
                            success: false,
                            message: 'Failed to update user'
                        });
                    }
                    
                    // Log audit
                    PermissionsController.createAuditLog(req.user?.userId, 'UPDATE', 'USER', userId, {
                        name, email, role_id, is_active
                    });
                    
                    res.json({
                        success: true,
                        message: 'User updated successfully'
                    });
                });
            });
            
        } catch (error) {
            console.error('Update user error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update user'
            });
        }
    }
    
    static deleteUser(req, res) {
        try {
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
            
        } catch (error) {
            console.error('Delete user error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete user'
            });
        }
    }
    
    // ================= ROLE MANAGEMENT ================= //
    
    static getRoles(req, res) {
        try {
            const query = `
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
            
            db.query(query, (err, roles) => {
                if (err) {
                    console.error('Get roles error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to fetch roles'
                    });
                }
                
                // Get permissions for each role
                let completed = 0;
                const rolesWithPerms = [];
                
                if (roles.length === 0) {
                    return res.json({
                        success: true,
                        data: []
                    });
                }
                
                roles.forEach((role, index) => {
                    const permQuery = `
                        SELECT p.id, p.name, p.display_name, p.category
                        FROM permissions p
                        JOIN role_permissions rp ON p.id = rp.permission_id
                        WHERE rp.role_id = ? AND p.is_active = true
                        ORDER BY p.category, p.name
                    `;
                    
                    db.query(permQuery, [role.id], (permErr, permissions) => {
                        if (!permErr) {
                            role.permissions = permissions || [];
                        } else {
                            role.permissions = [];
                        }
                        
                        rolesWithPerms[index] = role;
                        completed++;
                        
                        if (completed === roles.length) {
                            res.json({
                                success: true,
                                data: rolesWithPerms
                            });
                        }
                    });
                });
            });
            
        } catch (error) {
            console.error('Get roles error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch roles'
            });
        }
    }
    
    static createRole(req, res) {
        try {
            const { name, displayName, description, color = '#6366f1', permissionIds = [] } = req.body;
            
            if (!name || !displayName) {
                return res.status(400).json({
                    success: false,
                    message: 'Name and display name are required'
                });
            }
            
            // Create role
            const insertQuery = `
                INSERT INTO roles (name, display_name, description, color)
                VALUES (?, ?, ?, ?)
            `;
            
            db.query(insertQuery, [name, displayName, description, color], (err, result) => {
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
                    const values = permissionIds.map(permId => [roleId, permId]);
                    const permQuery = 'INSERT INTO role_permissions (role_id, permission_id) VALUES ?';
                    
                    db.query(permQuery, [values], (permErr) => {
                        if (permErr) {
                            console.error('Assign permissions error:', permErr);
                        }
                        
                        // Log audit
                        PermissionsController.createAuditLog(req.user?.userId, 'CREATE', 'ROLE', roleId, {
                            name, displayName, description, color, permissionIds
                        });
                        
                        res.status(201).json({
                            success: true,
                            message: 'Role created successfully',
                            data: { id: roleId }
                        });
                    });
                } else {
                    // Log audit
                    PermissionsController.createAuditLog(req.user?.userId, 'CREATE', 'ROLE', roleId, {
                        name, displayName, description, color, permissionIds
                    });
                    
                    res.status(201).json({
                        success: true,
                        message: 'Role created successfully',
                        data: { id: roleId }
                    });
                }
            });
            
        } catch (error) {
            console.error('Create role error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create role'
            });
        }
    }
    
    // ================= PERMISSION MANAGEMENT ================= //
    
    static getPermissions(req, res) {
        try {
            const query = `
                SELECT * FROM permissions 
                WHERE is_active = true 
                ORDER BY category, name
            `;
            
            db.query(query, (err, permissions) => {
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
            
        } catch (error) {
            console.error('Get permissions error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch permissions'
            });
        }
    }
    
    // ================= AUDIT LOG ================= //
    
    static getAuditLogs(req, res) {
        try {
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
            
            const query = `
                SELECT al.*, u.name as user_name, u.email as user_email
                FROM audit_logs al
                LEFT JOIN users u ON al.user_id = u.id
                WHERE ${whereClause}
                ORDER BY al.created_at DESC
                LIMIT ? OFFSET ?
            `;
            
            db.query(query, [...params, parseInt(limit), parseInt(offset)], (err, logs) => {
                if (err) {
                    console.error('Get audit logs error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to fetch audit logs'
                    });
                }
                
                const countQuery = `
                    SELECT COUNT(*) as total
                    FROM audit_logs al
                    WHERE ${whereClause}
                `;
                
                db.query(countQuery, params, (countErr, countResult) => {
                    if (countErr) {
                        console.error('Count audit logs error:', countErr);
                        return res.status(500).json({
                            success: false,
                            message: 'Failed to count audit logs'
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
            
        } catch (error) {
            console.error('Get audit logs error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch audit logs'
            });
        }
    }
    
    // ================= HELPER METHODS ================= //
    
    static createAuditLog(userId, action, resource, resourceId, details) {
        try {
            const query = `
                INSERT INTO audit_logs (user_id, action, resource, resource_id, details)
                VALUES (?, ?, ?, ?, ?)
            `;
            
            db.query(query, [userId, action, resource, resourceId, JSON.stringify(details)], (err) => {
                if (err) {
                    console.error('Create audit log error:', err);
                }
            });
        } catch (error) {
            console.error('Create audit log error:', error);
        }
    }
    
    // ================= SYSTEM STATS ================= //
    
    static getSystemStats(req, res) {
        try {
            const userStatsQuery = `
                SELECT 
                    COUNT(*) as total_users,
                    SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_users,
                    SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive_users
                FROM users
            `;
            
            db.query(userStatsQuery, (err, userStats) => {
                if (err) {
                    console.error('Get user stats error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to fetch user stats'
                    });
                }
                
                const roleStatsQuery = `
                    SELECT r.name, r.display_name, COUNT(u.id) as user_count
                    FROM roles r
                    LEFT JOIN users u ON r.id = u.role_id
                    WHERE r.is_active = true
                    GROUP BY r.id
                    ORDER BY user_count DESC
                `;
                
                db.query(roleStatsQuery, (roleErr, roleStats) => {
                    if (roleErr) {
                        console.error('Get role stats error:', roleErr);
                        return res.status(500).json({
                            success: false,
                            message: 'Failed to fetch role stats'
                        });
                    }
                    
                    const permStatsQuery = `
                        SELECT category, COUNT(*) as permission_count
                        FROM permissions
                        WHERE is_active = true
                        GROUP BY category
                        ORDER BY permission_count DESC
                    `;
                    
                    db.query(permStatsQuery, (permErr, permissionStats) => {
                        if (permErr) {
                            console.error('Get permission stats error:', permErr);
                            return res.status(500).json({
                                success: false,
                                message: 'Failed to fetch permission stats'
                            });
                        }
                        
                        const activityQuery = `
                            SELECT COUNT(*) as activity_count
                            FROM audit_logs
                            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
                        `;
                        
                        db.query(activityQuery, (actErr, recentActivity) => {
                            if (actErr) {
                                console.error('Get activity stats error:', actErr);
                                return res.status(500).json({
                                    success: false,
                                    message: 'Failed to fetch activity stats'
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
            
        } catch (error) {
            console.error('Get system stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch system stats'
            });
        }
    }
    
    // ================= HELPER METHODS ================= //
    
    static createAuditLog(userId, action, resource, resourceId, details) {
        try {
            const query = `
                INSERT INTO audit_logs (user_id, action, resource, resource_id, details)
                VALUES (?, ?, ?, ?, ?)
            `;
            
            db.query(query, [userId, action, resource, resourceId, JSON.stringify(details)], (err) => {
                if (err) {
                    console.error('Create audit log error:', err);
                }
            });
        } catch (error) {
            console.error('Create audit log error:', error);
        }
    }
}

module.exports = PermissionsController;
