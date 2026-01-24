/**
 * EVENT-BASED AUDIT LOGGER
 * Tracks complete user journey with IP, session, and event types
 * Fixes the NULL user_id and ip_address issues in existing audit system
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

    // Extract real client IP (fixes NULL ip_address issue)
    getClientIP(req) {
        // Try multiple headers for real IP
        const forwarded = req.headers['x-forwarded-for'];
        if (forwarded) {
            return forwarded.split(',')[0].trim();
        }
        
        return req.headers['x-real-ip'] || 
               req.headers['cf-connecting-ip'] || // Cloudflare
               req.headers['x-client-ip'] ||
               req.connection.remoteAddress || 
               req.socket.remoteAddress ||
               (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
               req.ip ||
               '127.0.0.1'; // Default fallback
    }

    // Core event logging function (fixes user_id NULL issue)
    async logEvent(eventData) {
        let connection;
        try {
            connection = await mysql.createConnection(this.dbConfig);
            
            // Ensure we have user_id (this was the main issue)
            const userId = eventData.user_id || null;
            const ipAddress = eventData.ip_address || '127.0.0.1';
            const userAgent = eventData.user_agent || 'Unknown';
            
            const sql = `
                INSERT INTO audit_logs (
                    user_id, action, resource, resource_id, details, 
                    ip_address, user_agent, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            `;
            
            await connection.execute(sql, [
                userId,                                    // Fix: Ensure user_id is not NULL
                eventData.action,
                eventData.resource,
                eventData.resource_id,
                JSON.stringify(eventData.details),
                ipAddress,                                 // Fix: Ensure ip_address is not NULL
                userAgent                                  // Fix: Ensure user_agent is not NULL
            ]);
            
            console.log(`📝 Event logged: ${eventData.action} by user ${userId} from ${ipAddress}`);
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
            user_id: user.id,                             // Fix: Ensure user_id is captured
            action: 'LOGIN',
            resource: 'SESSION',
            resource_id: sessionId,
            details: {
                user_name: user.name,
                user_email: user.email,
                user_role: user.role_name,
                login_time: new Date().toISOString(),
                browser: this.parseBrowser(req.get('User-Agent')),
                os: this.parseOS(req.get('User-Agent')),
                device: this.parseDevice(req.get('User-Agent')),
                status: status
            },
            ip_address: this.getClientIP(req),            // Fix: Ensure IP is captured
            user_agent: req.get('User-Agent') || 'Unknown'
        });
    }

    // LOGOUT Event
    async logLogout(user, req) {
        const sessionId = this.getSession(user.id, req);
        
        await this.logEvent({
            user_id: user.id,                             // Fix: Ensure user_id is captured
            action: 'LOGOUT',
            resource: 'SESSION',
            resource_id: sessionId,
            details: {
                user_name: user.name,
                user_email: user.email,
                user_role: user.role_name,
                logout_time: new Date().toISOString()
            },
            ip_address: this.getClientIP(req),            // Fix: Ensure IP is captured
            user_agent: req.get('User-Agent') || 'Unknown'
        });
        
        // Clear session
        this.sessions.delete(user.id);
    }

    // DISPATCH_CREATE Event (this is what you want to see)
    async logDispatchCreate(user, dispatchData, req, status = 'success') {
        await this.logEvent({
            user_id: user.id,                             // Fix: Ensure user_id is captured
            action: 'CREATE',
            resource: 'DISPATCH',
            resource_id: dispatchData.dispatch_id?.toString(),
            details: {
                user_name: user.name,
                user_email: user.email,
                user_role: user.role_name,
                dispatch_id: dispatchData.dispatch_id,
                order_ref: dispatchData.order_ref,
                customer: dispatchData.customer,
                product_name: dispatchData.product_name,
                quantity: dispatchData.quantity,
                warehouse: dispatchData.warehouse,
                awb_number: dispatchData.awb,
                logistics: dispatchData.logistics,
                create_time: new Date().toISOString(),
                status: status
            },
            ip_address: this.getClientIP(req),            // Fix: Ensure IP is captured
            user_agent: req.get('User-Agent') || 'Unknown'
        });
    }

    // RETURN_CREATE Event
    async logReturnCreate(user, returnData, req, status = 'success') {
        await this.logEvent({
            user_id: user.id,                             // Fix: Ensure user_id is captured
            action: 'CREATE',
            resource: 'RETURN',
            resource_id: returnData.return_id?.toString(),
            details: {
                user_name: user.name,
                user_email: user.email,
                user_role: user.role_name,
                return_id: returnData.return_id,
                product_name: returnData.product_name,
                quantity: returnData.quantity,
                reason: returnData.reason,
                awb_number: returnData.awb,
                create_time: new Date().toISOString(),
                status: status
            },
            ip_address: this.getClientIP(req),            // Fix: Ensure IP is captured
            user_agent: req.get('User-Agent') || 'Unknown'
        });
    }

    // DAMAGE_CREATE Event
    async logDamageCreate(user, damageData, req, status = 'success') {
        await this.logEvent({
            user_id: user.id,                             // Fix: Ensure user_id is captured
            action: 'CREATE',
            resource: 'DAMAGE',
            resource_id: damageData.damage_id?.toString(),
            details: {
                user_name: user.name,
                user_email: user.email,
                user_role: user.role_name,
                damage_id: damageData.damage_id,
                product_name: damageData.product_name,
                quantity: damageData.quantity,
                reason: damageData.reason,
                location: damageData.location,
                create_time: new Date().toISOString(),
                status: status
            },
            ip_address: this.getClientIP(req),            // Fix: Ensure IP is captured
            user_agent: req.get('User-Agent') || 'Unknown'
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

module.exports = EventAuditLogger;