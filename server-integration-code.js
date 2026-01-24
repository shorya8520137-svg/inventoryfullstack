/**
 * SERVER INTEGRATION FOR EVENT-BASED AUDIT SYSTEM
 * Add this code to your server.js file
 */

// Add at the top of server.js (after other requires)
const EventAuditLogger = require('./EventAuditLogger');
const eventAuditLogger = new EventAuditLogger();

// Add middleware to capture IP addresses properly
app.use((req, res, next) => {
    // Fix IP address capture for audit logging
    req.realIP = req.headers['x-forwarded-for'] || 
                 req.headers['x-real-ip'] || 
                 req.connection.remoteAddress || 
                 req.socket.remoteAddress ||
                 req.ip ||
                 '127.0.0.1';
    next();
});

// Update your login route (find and replace existing login route)
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Your existing login logic here...
        // After successful authentication:
        
        if (loginSuccessful) {
            // Log successful login event
            await eventAuditLogger.logLogin(user, req, 'success');
            
            res.json({
                success: true,
                token: token,
                user: user
            });
        } else {
            // Log failed login attempt
            await eventAuditLogger.logEvent({
                user_id: null,
                action: 'LOGIN',
                resource: 'SESSION',
                resource_id: 'failed',
                details: {
                    attempted_email: email,
                    failure_reason: 'Invalid credentials',
                    attempt_time: new Date().toISOString()
                },
                ip_address: req.realIP,
                user_agent: req.get('User-Agent') || 'Unknown'
            });
            
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed'
        });
    }
});

// Add logout route (if it doesn't exist)
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
    try {
        // Log logout event
        await eventAuditLogger.logLogout(req.user, req);
        
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed'
        });
    }
});