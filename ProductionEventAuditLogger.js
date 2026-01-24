/**
 * PRODUCTION-READY EVENT AUDIT LOGGER
 * Clean, simple, Cloudflare-aware IP extraction
 * Based on Cloudflare's official best practices
 */

const mysql = require('mysql2/promise');
const crypto = require('crypto');
require('dotenv').config();

class ProductionEventAuditLogger {
    constructor() {
        this.dbConfig = {
            host: process.env.DB_HOST || '127.0.0.1',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'inventory_user',
            password: process.env.DB_PASSWORD || 'StrongPass@123',
            database: process.env.DB_NAME || 'inventory_db'
        };
        this.sessions = new Map();
        
        // Major Cloudflare IP ranges (simplified)
        this.CLOUDFLARE_RANGES = [
            { start: '104.16.0.0', end: '104.31.255.255' },    // 104.16.0.0/13
            { start: '172.64.0.0', end: '172.79.255.255' },    // 172.64.0.0/13
            { start: '173.245.48.0', end: '173.245.63.255' }   // 173.245.48.0/20
        ];
    }

    // PRODUCTION RULE: Clean, simple IP extraction
    getClientIP(req) {
        const remoteIP = req.connection?.remoteAddress || req.socket?.remoteAddress;
        
        // 🔒 RULE #1: If from Cloudflare, ONLY trust CF-Connecting-IP
        if (this.isFromCloudflare(remoteIP)) {
            const cfIP = req.headers['cf-connecting-ip'];
            if (cfIP && this.isValidIP(cfIP)) {
                console.log('✅ Cloudflare request - using CF-Connecting-IP:', cfIP);
                return cfIP;
            }
            console.log('⚠️ Cloudflare request but no valid CF-Connecting-IP header');
        }
        
        // 🔒 RULE #2: Not from Cloudflare, use X-Forwarded-For
        const forwarded = req.headers['x-forwarded-for'];
        if (forwarded) {
            const firstIP = forwarded.split(',')[0].trim();
            if (this.isValidIP(firstIP)) {
                console.log('✅ Non-Cloudflare request - using X-Forwarded-For:', firstIP);
                return firstIP;
            }
        }
        
        // 🔒 RULE #3: Fallback to other headers
        const fallbackSources = [
            req.headers['x-real-ip'],
            req.headers['x-client-ip'],
            remoteIP,
            req.ip
        ];
        
        for (const ip of fallbackSources) {
            if (ip && this.isValidIP(ip)) {
                console.log('✅ Using fallback IP:', ip);
                return ip;
            }
        }
        
        console.log('⚠️ No valid IP found, using localhost');
        return '127.0.0.1';
    }

    // Simple Cloudflare detection (no complex CIDR math)
    isFromCloudflare(ip) {
        if (!ip || !this.isValidIP(ip)) return false;
        
        const ipNum = this.ipToNumber(ip);
        return this.CLOUDFLARE_RANGES.some(range => {
            const startNum = this.ipToNumber(range.start);
            const endNum = this.ipToNumber(range.end);
            return ipNum >= startNum && ipNum <= endNum;
        });
    }

    // Basic IP validation
    isValidIP(ip) {
        if (!ip || ip === '127.0.0.1') return false;
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (!ipRegex.test(ip)) return false;
        const parts = ip.split('.').map(Number);
        return parts.every(part => part >= 0 && part <= 255);
    }

    // Convert IP to number for range checking
    ipToNumber(ip) {
        return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
    }

    // Generate session ID
    generateSessionId(userId) {
        return crypto.randomBytes(16).toString('hex') + '_' + userId + '_' + Date.now();
    }

    // Get or create session
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

    // Core event logging
    async logEvent(eventData) {
        let connection;
        try {
            connection = await mysql.createConnection(this.dbConfig);
            
            const sql = `
                INSERT INTO audit_logs (
                    user_id, action, resource, resource_id, details, 
                    ip_address, user_agent, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            `;
            
            await connection.execute(sql, [
                eventData.user_id || null,
                eventData.action,
                eventData.resource,
                eventData.resource_id,
                JSON.stringify(eventData.details),
                eventData.ip_address || '127.0.0.1',
                eventData.user_agent || 'Unknown'
            ]);
            
            console.log(`📝 Event logged: ${eventData.action} by user ${eventData.user_id} from ${eventData.ip_address}`);
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
            action: 'LOGIN',
            resource: 'SESSION',
            resource_id: sessionId,
            details: {
                user_name: user.name,
                user_email: user.email,
                user_role: user.role_name,
                login_time: new Date().toISOString(),
                status: status
            },
            ip_address: this.getClientIP(req),
            user_agent: req.get('User-Agent') || 'Unknown'
        });
    }

    // LOGOUT Event
    async logLogout(user, req) {
        const sessionId = this.getSession(user.id, req);
        
        await this.logEvent({
            user_id: user.id,
            action: 'LOGOUT',
            resource: 'SESSION',
            resource_id: sessionId,
            details: {
                user_name: user.name,
                user_email: user.email,
                user_role: user.role_name,
                logout_time: new Date().toISOString()
            },
            ip_address: this.getClientIP(req),
            user_agent: req.get('User-Agent') || 'Unknown'
        });
        
        this.sessions.delete(user.id);
    }

    // DISPATCH_CREATE Event
    async logDispatchCreate(user, dispatchData, req, status = 'success') {
        await this.logEvent({
            user_id: user.id,
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
            ip_address: this.getClientIP(req),
            user_agent: req.get('User-Agent') || 'Unknown'
        });
    }

    // RETURN_CREATE Event
    async logReturnCreate(user, returnData, req, status = 'success') {
        await this.logEvent({
            user_id: user.id,
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
            ip_address: this.getClientIP(req),
            user_agent: req.get('User-Agent') || 'Unknown'
        });
    }

    // DAMAGE_CREATE Event
    async logDamageCreate(user, damageData, req, status = 'success') {
        await this.logEvent({
            user_id: user.id,
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
            ip_address: this.getClientIP(req),
            user_agent: req.get('User-Agent') || 'Unknown'
        });
    }
}

module.exports = ProductionEventAuditLogger;