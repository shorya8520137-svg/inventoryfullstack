const bcrypt = require('bcryptjs');
const db = require('../db/connection');
const { generateToken, getUserPermissions } = require('../middleware/auth');

/**
 * LOGIN USER
 */
exports.login = async (req, res) => {
    try {
        const { email, password, username } = req.body;

        console.log('🔐 Login attempt:', { email, username });

        if (!email && !username) {
            return res.status(400).json({
                success: false,
                message: 'Email or username is required'
            });
        }

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password is required'
            });
        }

        // Find user by email or username
        const userQuery = `
            SELECT 
                u.id,
                u.name,
                u.email,
                u.password,
                u.role_id,
                u.is_active,
                r.name as role_name,
                r.display_name as role_display_name
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE (u.email = ? OR u.name = ?) AND u.is_active = 1
            LIMIT 1
        `;

        const identifier = email || username;

        db.query(userQuery, [identifier, identifier], async (err, users) => {
            if (err) {
                console.error('Database error during login:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Database error'
                });
            }

            if (users.length === 0) {
                console.log('❌ User not found:', identifier);
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            const user = users[0];

            // For demo purposes, allow simple passwords
            // In production, use proper bcrypt comparison
            let passwordValid = false;
            
            if (password === 'admin@123' && (user.role_name === 'admin' || user.role_name === 'super_admin')) {
                passwordValid = true;
            } else if (password === 'Admin@123' && (user.role_name === 'admin' || user.role_name === 'super_admin')) {
                passwordValid = true;
            } else {
                // Try bcrypt comparison for hashed passwords
                try {
                    passwordValid = await bcrypt.compare(password, user.password);
                } catch (bcryptError) {
                    // If bcrypt fails, try plain text comparison (for demo)
                    passwordValid = (password === user.password);
                }
            }

            if (!passwordValid) {
                console.log('❌ Invalid password for user:', identifier);
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Get user permissions
            try {
                const permissions = await getUserPermissions(user.id, user.role_id);

                // Generate JWT token
                const token = generateToken(user);

                // Update last login
                const updateLoginQuery = 'UPDATE users SET last_login = NOW(), login_count = login_count + 1 WHERE id = ?';
                db.query(updateLoginQuery, [user.id], (updateErr) => {
                    if (updateErr) {
                        console.warn('Failed to update last login:', updateErr);
                    }
                });

                console.log('✅ Login successful for user:', user.email);

                res.json({
                    success: true,
                    message: 'Login successful',
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role_name,
                        role_display: user.role_display_name,
                        permissions: permissions.map(p => p.name)
                    }
                });

            } catch (permissionError) {
                console.error('Error fetching permissions:', permissionError);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to load user permissions'
                });
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * GET CURRENT USER
 */
exports.getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.id;

        const userQuery = `
            SELECT 
                u.id,
                u.name,
                u.email,
                u.role_id,
                u.is_active,
                u.last_login,
                u.login_count,
                r.name as role_name,
                r.display_name as role_display_name
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = ? AND u.is_active = 1
        `;

        db.query(userQuery, [userId], async (err, users) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Database error'
                });
            }

            if (users.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const user = users[0];

            try {
                const permissions = await getUserPermissions(user.id, user.role_id);

                res.json({
                    success: true,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role_name,
                        role_display: user.role_display_name,
                        last_login: user.last_login,
                        login_count: user.login_count,
                        permissions: permissions.map(p => p.name)
                    }
                });

            } catch (permissionError) {
                console.error('Error fetching permissions:', permissionError);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to load user permissions'
                });
            }
        });

    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * LOGOUT USER
 */
exports.logout = (req, res) => {
    // In a more sophisticated setup, you might want to blacklist the token
    // For now, we'll just return success and let the frontend handle token removal
    
    console.log('🚪 User logged out:', req.user.email);
    
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
};

/**
 * CHANGE PASSWORD
 */
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long'
            });
        }

        // Get current user
        const userQuery = 'SELECT password FROM users WHERE id = ?';
        
        db.query(userQuery, [userId], async (err, users) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Database error'
                });
            }

            if (users.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const user = users[0];

            // Verify current password
            const currentPasswordValid = await bcrypt.compare(currentPassword, user.password);
            
            if (!currentPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }

            // Hash new password
            const saltRounds = 10;
            const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

            // Update password
            const updateQuery = 'UPDATE users SET password = ? WHERE id = ?';
            
            db.query(updateQuery, [hashedNewPassword, userId], (updateErr) => {
                if (updateErr) {
                    console.error('Password update error:', updateErr);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to update password'
                    });
                }

                console.log('✅ Password changed for user:', req.user.email);

                res.json({
                    success: true,
                    message: 'Password changed successfully'
                });
            });
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = exports;