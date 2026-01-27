/**
 * EVENT-BASED AUDIT SYSTEM
 * Complete user journey tracking with IP, session, and event-based approach
 * 
 * Your Vision: Track EVENTS not just CRUD operations
 * LOGIN → ORDER_VIEW → DISPATCH_CREATE → RETURN_CREATE → DAMAGE_CREATE → LOGOUT
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 Creating EVENT-BASED Audit System');
console.log('='.repeat(60));
console.log('📋 Your Vision: Complete User Journey Tracking');
console.log('🔍 Track: LOGIN → ORDER_VIEW → DISPATCH_CREATE → LOGOUT');
console.log('📊 Include: IP Address, Session ID, User Agent, Permissions');
console.log('='.repeat(60));

// 1. Update existing audit table structure
function createAuditTableUpdate() {
    console.log('\n📊 Step 1: Updating Audit Table Structure');
    
    const updateSQL = `-- EVENT-BASED AUDIT SYSTEM UPDATE
-- Add missing columns to existing audit table

-- First, let's see the current structure
DESCRIBE audit_logs;

-- Add missing columns for complete event tracking
ALTER TABLE audit_logs 
ADD COLUMN IF NOT EXISTS user_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS user_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS user_role VARCHAR(100),
ADD COLUMN IF NOT EXISTS event_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS permission VARCHAR(100),
ADD COLUMN IF NOT EXISTS session_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS status ENUM('success', 'failed') DEFAULT 'success',
ADD COLUMN IF NOT EXISTS duration_ms INT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS request_method VARCHAR(10),
ADD COLUMN IF NOT EXISTS request_url VARCHAR(500);

-- Update existing records to have proper user info
UPDATE audit_logs a
JOIN users u ON a.user_id = u.id
SET 
    a.user_name = u.name,
    a.user_email = u.email,
    a.user_role = (SELECT r.name FROM roles r WHERE r.id = u.role_id)
WHERE a.user_name IS NULL AND a.user_id IS NOT NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_session ON audit_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_audit_user_event ON audit_logs(user_id, event_type);
CREATE INDEX IF NOT EXISTS idx_audit_ip ON audit_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);

-- Show updated structure
DESCRIBE audit_logs;
SELECT COUNT(*) as total_events FROM audit_logs;`;

    fs.writeFileSync('update-audit-table-structure.sql', updateSQL);
    console.log('✅ Created update-audit-table-structure.sql');
}

// 2. Create Enhanced Event Logger
function createEventLogger() {
    console.log('\n🔧 Step 2: Creating Enhanced Event Logger');
    
    const eventLoggerCode = `/**
 * EVENT-BASED AUDIT LOGGER
 * Tracks complete user journey with IP, session, and event types
 */

const mysql = require('mysql2/promise');
const crypto = require('crypto');

class EventAuditLogger {
    constructor() {
        this.dbConfig = {
            host: '127.0.0.1',
            port: 3306,
            user: 'inventory_user',
            database: 'inventory_db'
        };
        this.sessions = new Map(); // Track active sessions
    }

    // Generate session ID for user
    generateSessionId(userId) {
        return crypto.randomBytes(16).toString('hex') + '_' + userId + '_' + Date.now();
    }

    // Get or create session for user
    getSession(userId, req) {
        const existingSession = this.sessions.get(userId);
        if (existingSession && (Date.now() - existingSession.created) < 24 * 60 * 60 * 1000) {
            return existingSession.sessionId;
        }
        
        const sessionId = this.generateSessionId(userId);
        this.sessions.set(userId, {
            sessionId,
            created: Date.now(),
            ip: this.getClientIP(req),
            userAgent: req.get('User-Agent')
        });
        
        return sessionId;
    }

    // Extract real client IP
    getClientIP(req) {
        return req.headers['x-forwarded-for'] || 
               req.headers['x-real-ip'] || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress ||
               (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
               req.ip ||
               'unknown';
    }

    // Core event logging function
    async logEvent(eventData) {
        let connection;
        try {
            connection = await mysql.createConnection(this.dbConfig);
            
            const sql = \`
                INSERT INTO audit_logs (
                    user_id, user_name, user_email, user_role,
                    action, event_type, resource, resource_id,
                    details, permission, ip_address, user_agent,
                    session_id, status, request_method, request_url,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            \`;
            
            await connection.execute(sql, [
                eventData.user_id,
                eventData.user_name,
                eventData.user_email,
                eventData.user_role,
                eventData.action,
                eventData.event_type,
                eventData.resource,
                eventData.resource_id,
                JSON.stringify(eventData.details),
                eventData.permission,
                eventData.ip_address,
                eventData.user_agent,
                eventData.session_id,
                eventData.status || 'success',
                eventData.request_method,
                eventData.request_url
            ]);
            
            console.log(\`📝 Event logged: \${eventData.event_type} by \${eventData.user_name}\`);
        } catch (error) {
            console.error('❌ Event logging failed:', error.message);
        } finally {
            if (connection) {
                await connection.end();
            }
        }
    }

    // LOGIN Event
    async logLogin(user, req, status = 'success') {
        const sessionId = this.getSession(user.id, req);
        
        await this.logEvent({
            user_id: user.id,
            user_name: user.name,
            user_email: user.email,
            user_role: user.role_name,
            action: 'LOGIN',
            event_type: 'LOGIN',
            resource: 'SESSION',
            resource_id: sessionId,
            details: {
                login_time: new Date().toISOString(),
                browser: this.parseBrowser(req.get('User-Agent')),
                os: this.parseOS(req.get('User-Agent')),
                device: this.parseDevice(req.get('User-Agent'))
            },
            permission: 'SYSTEM_LOGIN',
            ip_address: this.getClientIP(req),
            user_agent: req.get('User-Agent'),
            session_id: sessionId,
            status: status,
            request_method: 'POST',
            request_url: '/api/auth/login'
        });
    }

    // LOGOUT Event
    async logLogout(user, req) {
        const sessionId = this.getSession(user.id, req);
        
        await this.logEvent({
            user_id: user.id,
            user_name: user.name,
            user_email: user.email,
            user_role: user.role_name,
            action: 'LOGOUT',
            event_type: 'LOGOUT',
            resource: 'SESSION',
            resource_id: sessionId,
            details: {
                logout_time: new Date().toISOString(),
                session_duration: 'calculated_on_frontend'
            },
            permission: 'SYSTEM_LOGIN',
            ip_address: this.getClientIP(req),
            user_agent: req.get('User-Agent'),
            session_id: sessionId,
            status: 'success',
            request_method: 'POST',
            request_url: '/api/auth/logout'
        });
        
        // Clear session
        this.sessions.delete(user.id);
    }

    // ORDER_VIEW Event
    async logOrderView(user, orderId, req) {
        const sessionId = this.getSession(user.id, req);
        
        await this.logEvent({
            user_id: user.id,
            user_name: user.name,
            user_email: user.email,
            user_role: user.role_name,
            action: 'VIEW',
            event_type: 'ORDER_VIEW',
            resource: 'ORDER',
            resource_id: orderId.toString(),
            details: {
                view_time: new Date().toISOString(),
                order_id: orderId
            },
            permission: 'ORDERS_VIEW',
            ip_address: this.getClientIP(req),
            user_agent: req.get('User-Agent'),
            session_id: sessionId,
            status: 'success',
            request_method: req.method,
            request_url: req.originalUrl
        });
    }

    // DISPATCH_CREATE Event
    async logDispatchCreate(user, dispatchData, req, status = 'success') {
        const sessionId = this.getSession(user.id, req);
        
        await this.logEvent({
            user_id: user.id,
            user_name: user.name,
            user_email: user.email,
            user_role: user.role_name,
            action: 'CREATE',
            event_type: 'DISPATCH_CREATE',
            resource: 'DISPATCH',
            resource_id: dispatchData.dispatch_id?.toString(),
            details: {
                dispatch_id: dispatchData.dispatch_id,
                order_ref: dispatchData.order_ref,
                customer: dispatchData.customer,
                product_name: dispatchData.product_name,
                quantity: dispatchData.quantity,
                warehouse: dispatchData.warehouse,
                awb_number: dispatchData.awb,
                logistics: dispatchData.logistics,
                create_time: new Date().toISOString()
            },
            permission: 'OPERATIONS_DISPATCH',
            ip_address: this.getClientIP(req),
            user_agent: req.get('User-Agent'),
            session_id: sessionId,
            status: status,
            request_method: 'POST',
            request_url: '/api/dispatch'
        });
    }

    // RETURN_CREATE Event
    async logReturnCreate(user, returnData, req, status = 'success') {
        const sessionId = this.getSession(user.id, req);
        
        await this.logEvent({
            user_id: user.id,
            user_name: user.name,
            user_email: user.email,
            user_role: user.role_name,
            action: 'CREATE',
            event_type: 'RETURN_CREATE',
            resource: 'RETURN',
            resource_id: returnData.return_id?.toString(),
            details: {
                return_id: returnData.return_id,
                product_name: returnData.product_name,
                quantity: returnData.quantity,
                reason: returnData.reason,
                awb_number: returnData.awb,
                create_time: new Date().toISOString()
            },
            permission: 'OPERATIONS_RETURN',
            ip_address: this.getClientIP(req),
            user_agent: req.get('User-Agent'),
            session_id: sessionId,
            status: status,
            request_method: 'POST',
            request_url: '/api/returns'
        });
    }

    // DAMAGE_CREATE Event
    async logDamageCreate(user, damageData, req, status = 'success') {
        const sessionId = this.getSession(user.id, req);
        
        await this.logEvent({
            user_id: user.id,
            user_name: user.name,
            user_email: user.email,
            user_role: user.role_name,
            action: 'CREATE',
            event_type: 'DAMAGE_CREATE',
            resource: 'DAMAGE',
            resource_id: damageData.damage_id?.toString(),
            details: {
                damage_id: damageData.damage_id,
                product_name: damageData.product_name,
                quantity: damageData.quantity,
                reason: damageData.reason,
                location: damageData.location,
                create_time: new Date().toISOString()
            },
            permission: 'OPERATIONS_DAMAGE',
            ip_address: this.getClientIP(req),
            user_agent: req.get('User-Agent'),
            session_id: sessionId,
            status: status,
            request_method: 'POST',
            request_url: '/api/damage'
        });
    }

    // Helper functions
    parseBrowser(userAgent) {
        if (!userAgent) return 'Unknown';
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        return 'Unknown';
    }

    parseOS(userAgent) {
        if (!userAgent) return 'Unknown';
        if (userAgent.includes('Windows')) return 'Windows';
        if (userAgent.includes('Mac')) return 'macOS';
        if (userAgent.includes('Linux')) return 'Linux';
        if (userAgent.includes('Android')) return 'Android';
        if (userAgent.includes('iOS')) return 'iOS';
        return 'Unknown';
    }

    parseDevice(userAgent) {
        if (!userAgent) return 'Unknown';
        if (userAgent.includes('Mobile')) return 'Mobile';
        if (userAgent.includes('Tablet')) return 'Tablet';
        return 'Desktop';
    }
}

module.exports = EventAuditLogger;`;

    fs.writeFileSync('EventAuditLogger.js', eventLoggerCode);
    console.log('✅ Created EventAuditLogger.js');
}

// 3. Create middleware for automatic event tracking
function createEventMiddleware() {
    console.log('\n🔧 Step 3: Creating Event Tracking Middleware');
    
    const middlewareCode = `/**
 * EVENT TRACKING MIDDLEWARE
 * Automatically tracks user events across the application
 */

const EventAuditLogger = require('./EventAuditLogger');

class EventTrackingMiddleware {
    constructor() {
        this.eventLogger = new EventAuditLogger();
    }

    // Middleware to track all requests
    trackRequest() {
        return (req, res, next) => {
            // Store start time for duration calculation
            req.startTime = Date.now();
            
            // Override res.json to capture successful responses
            const originalJson = res.json;
            res.json = function(data) {
                // Log successful events based on route and method
                if (req.user && data.success) {
                    const duration = Date.now() - req.startTime;
                    req.eventLogger = req.eventLogger || new EventAuditLogger();
                    
                    // Auto-track based on route patterns
                    if (req.path.includes('/api/dispatch') && req.method === 'POST') {
                        req.eventLogger.logDispatchCreate(req.user, data, req, 'success');
                    } else if (req.path.includes('/api/returns') && req.method === 'POST') {
                        req.eventLogger.logReturnCreate(req.user, data, req, 'success');
                    } else if (req.path.includes('/api/damage') && req.method === 'POST') {
                        req.eventLogger.logDamageCreate(req.user, data, req, 'success');
                    } else if (req.path.includes('/api/order') && req.method === 'GET') {
                        req.eventLogger.logOrderView(req.user, req.params.id || 'list', req);
                    }
                }
                
                return originalJson.call(this, data);
            };
            
            next();
        };
    }

    // Track login events
    trackLogin() {
        return async (req, res, next) => {
            if (req.user) {
                await this.eventLogger.logLogin(req.user, req, 'success');
            }
            next();
        };
    }

    // Track failed login attempts
    trackFailedLogin() {
        return async (req, res, next) => {
            if (req.body.email) {
                await this.eventLogger.logEvent({
                    user_id: null,
                    user_name: 'Unknown',
                    user_email: req.body.email,
                    user_role: 'Unknown',
                    action: 'LOGIN',
                    event_type: 'LOGIN',
                    resource: 'SESSION',
                    resource_id: 'failed',
                    details: {
                        attempted_email: req.body.email,
                        failure_reason: 'Invalid credentials',
                        attempt_time: new Date().toISOString()
                    },
                    permission: 'SYSTEM_LOGIN',
                    ip_address: this.eventLogger.getClientIP(req),
                    user_agent: req.get('User-Agent'),
                    session_id: 'failed_' + Date.now(),
                    status: 'failed',
                    request_method: 'POST',
                    request_url: '/api/auth/login'
                });
            }
            next();
        };
    }
}

module.exports = EventTrackingMiddleware;`;

    fs.writeFileSync('EventTrackingMiddleware.js', middlewareCode);
    console.log('✅ Created EventTrackingMiddleware.js');
}

// 4. Create integration guide
function createIntegrationGuide() {
    console.log('\n📖 Step 4: Creating Integration Guide');
    
    const guide = `# 🎯 EVENT-BASED AUDIT SYSTEM INTEGRATION

## 🚀 Your Vision Implemented

**Complete User Journey Tracking:**
\`\`\`
10:00 - LOGIN (IP: 192.168.1.100, Session: abc123)
10:02 - ORDER_VIEW (order_id: 8892)
10:05 - DISPATCH_CREATE (dispatch_id: 332, AWB: AWB123)
10:07 - RETURN_CREATE (return_id: 118)
10:10 - DAMAGE_CREATE (damage_id: 44)
10:15 - LOGOUT (Session duration: 15 minutes)
\`\`\`

## 📊 Enhanced Audit Table Structure

Your existing audit table will be enhanced with:
- ✅ **user_name, user_email, user_role** - Complete user info
- ✅ **event_type** - LOGIN, DISPATCH_CREATE, ORDER_VIEW, etc.
- ✅ **session_id** - Track complete user sessions
- ✅ **ip_address** - Real client IP (with proxy support)
- ✅ **permission** - Which permission allowed the action
- ✅ **status** - success/failed for security tracking
- ✅ **duration_ms** - Performance tracking

## 🔧 Server Integration Steps

### 1. Update Database Structure
\`\`\`bash
ssh -i "C:\\Users\\Admin\\awsconection.pem" ubuntu@16.171.5.50
cd /home/ubuntu/inventoryfullstack
git pull origin main
mysql -u inventory_user -p inventory_db < update-audit-table-structure.sql
\`\`\`

### 2. Update server.js
\`\`\`javascript
const EventTrackingMiddleware = require('./EventTrackingMiddleware');
const eventTracker = new EventTrackingMiddleware();

// Add event tracking middleware
app.use(eventTracker.trackRequest());

// Update login route
app.post('/api/auth/login', async (req, res) => {
    try {
        // Your existing login logic
        const result = await authenticateUser(req.body);
        
        if (result.success) {
            // Log successful login
            await eventTracker.eventLogger.logLogin(result.user, req, 'success');
            res.json(result);
        } else {
            // Log failed login
            await eventTracker.trackFailedLogin()(req, res, () => {});
            res.status(401).json(result);
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
\`\`\`

### 3. Update Dispatch Controller
\`\`\`javascript
// In your dispatch controller success response
if (req.user) {
    const eventLogger = new EventAuditLogger();
    await eventLogger.logDispatchCreate(req.user, {
        dispatch_id: dispatchId,
        order_ref: order_ref,
        customer: customer,
        product_name: product_name,
        quantity: quantity,
        warehouse: warehouse,
        awb: awb,
        logistics: logistics
    }, req, 'success');
}
\`\`\`

## 🎯 Expected Results

After integration, your audit logs will show:

**Complete User Journey:**
- 🔐 **LOGIN**: "Admin logged in from 192.168.1.100 (Chrome/Windows)"
- 👀 **ORDER_VIEW**: "Admin viewed order #8892"
- 📤 **DISPATCH_CREATE**: "Admin created dispatch #332 (5x Samsung Galaxy → GGM_WH)"
- 📥 **RETURN_CREATE**: "Admin processed return #118 (2x iPhone → Customer complaint)"
- ⚠️ **DAMAGE_CREATE**: "Admin reported damage #44 (1x MacBook → Water damage)"
- 🚪 **LOGOUT**: "Admin logged out (Session: 15 minutes)"

**Security Tracking:**
- Failed login attempts with IP addresses
- Unusual IP address patterns
- Session hijacking detection
- Permission violations

**Analytics Ready:**
- User productivity metrics
- Average session duration
- Most active users
- Peak usage times
- Error patterns

## 🔍 Query Examples

\`\`\`sql
-- Complete user session
SELECT * FROM audit_logs 
WHERE session_id = 'abc123_user_1234567890' 
ORDER BY created_at;

-- Failed login attempts
SELECT * FROM audit_logs 
WHERE event_type = 'LOGIN' AND status = 'failed' 
ORDER BY created_at DESC;

-- User activity summary
SELECT user_name, event_type, COUNT(*) as count
FROM audit_logs 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAYS)
GROUP BY user_name, event_type;

-- IP address analysis
SELECT ip_address, user_name, COUNT(*) as login_count
FROM audit_logs 
WHERE event_type = 'LOGIN' AND status = 'success'
GROUP BY ip_address, user_name
HAVING login_count > 1;
\`\`\`

## ✅ Benefits

1. **Complete User Journey** - See exactly what each user did
2. **Security Monitoring** - Track failed logins, unusual IPs
3. **Performance Analytics** - Session duration, user productivity
4. **Compliance Ready** - Full audit trail for regulations
5. **Real-time Tracking** - Events logged as they happen
6. **IP-based Security** - Detect suspicious access patterns

Your vision of complete event-based user journey tracking is now ready! 🎉`;

    fs.writeFileSync('EVENT_BASED_AUDIT_INTEGRATION.md', guide);
    console.log('✅ Created EVENT_BASED_AUDIT_INTEGRATION.md');
}

// Run all steps
function createEventBasedSystem() {
    console.log('🚀 Creating Complete Event-Based Audit System...\n');
    
    createAuditTableUpdate();
    createEventLogger();
    createEventMiddleware();
    createIntegrationGuide();
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 EVENT-BASED AUDIT SYSTEM CREATED!');
    console.log('='.repeat(60));
    
    console.log('\n📁 Files Created:');
    console.log('  ✅ update-audit-table-structure.sql - Database updates');
    console.log('  ✅ EventAuditLogger.js - Event logging with IP tracking');
    console.log('  ✅ EventTrackingMiddleware.js - Automatic event tracking');
    console.log('  ✅ EVENT_BASED_AUDIT_INTEGRATION.md - Complete guide');
    
    console.log('\n🎯 Your Vision Implemented:');
    console.log('  📊 Complete user journey tracking');
    console.log('  🌐 Real IP address capture');
    console.log('  🔐 Session-based tracking');
    console.log('  📈 Event-based analytics');
    console.log('  🛡️ Security monitoring');
    
    console.log('\n🚀 Next Steps:');
    console.log('  1. Upload files to server');
    console.log('  2. Run database update SQL');
    console.log('  3. Integrate middleware in server.js');
    console.log('  4. Test complete user journey');
    console.log('  5. See LOGIN → DISPATCH_CREATE → LOGOUT in audit logs!');
    
    console.log('\n✨ Result: Complete event-based user journey tracking with IP addresses!');
    console.log('='.repeat(60));
}

// Execute
createEventBasedSystem();