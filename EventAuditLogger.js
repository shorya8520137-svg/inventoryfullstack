/**
 * EVENT AUDIT LOGGER
 * Simplified audit logger for damage recovery and other events
 */

const db = require('./db/connection');
const IPGeolocationTracker = require('./IPGeolocationTracker');

class EventAuditLogger {
    constructor() {
        this.geoTracker = new IPGeolocationTracker();
    }

    // Log damage creation event
    async logDamageCreate(user, damageData, req = null) {
        try {
            const ipAddress = req ? this.getClientIP(req) : '127.0.0.1';
            const userAgent = req ? (req.get('User-Agent') || 'Unknown') : 'Unknown';
            
            // Get location data
            const location = await this.geoTracker.getLocationData(ipAddress);
            
            const auditData = {
                user_id: user.id,
                user_name: user.name,
                user_email: user.email,
                user_role: user.role,
                action: 'CREATE',
                resource_type: 'DAMAGE',
                resource_id: damageData.damage_id || null,
                resource_name: `${damageData.product_name} Damage Report`,
                description: `${user.name} created damage report for ${damageData.quantity}x ${damageData.product_name}`,
                details: JSON.stringify({
                    product_name: damageData.product_name,
                    quantity: damageData.quantity,
                    reason: damageData.reason,
                    location: damageData.location,
                    estimated_loss: damageData.estimated_loss,
                    damage_id: damageData.damage_id,
                    location_info: location
                }),
                ip_address: ipAddress,
                user_agent: userAgent,
                request_method: req ? req.method : 'POST',
                request_url: req ? req.originalUrl : '/api/damage',
                location_country: location?.country,
                location_city: location?.city,
                location_region: location?.region,
                location_coordinates: location?.coordinates
            };

            await this.insertAuditLog(auditData);
            
            console.log(`🔴 Damage audit logged: ${user.name} created damage report for ${damageData.product_name}`);
            
            return { success: true, auditData };
            
        } catch (error) {
            console.error('Damage audit logging error:', error);
            return { success: false, error: error.message };
        }
    }

    // Log recovery creation event
    async logRecoveryCreate(user, recoveryData, req = null) {
        try {
            const ipAddress = req ? this.getClientIP(req) : '127.0.0.1';
            const userAgent = req ? (req.get('User-Agent') || 'Unknown') : 'Unknown';
            
            // Get location data
            const location = await this.geoTracker.getLocationData(ipAddress);
            
            const auditData = {
                user_id: user.id,
                user_name: user.name,
                user_email: user.email,
                user_role: user.role,
                action: 'CREATE',
                resource_type: 'RECOVERY',
                resource_id: recoveryData.recovery_id || null,
                resource_name: `${recoveryData.product_name} Recovery`,
                description: `${user.name} created recovery for ${recoveryData.quantity}x ${recoveryData.product_name}`,
                details: JSON.stringify({
                    product_name: recoveryData.product_name,
                    quantity: recoveryData.quantity,
                    recovery_type: recoveryData.recovery_type,
                    recovery_id: recoveryData.recovery_id,
                    location_info: location
                }),
                ip_address: ipAddress,
                user_agent: userAgent,
                request_method: req ? req.method : 'POST',
                request_url: req ? req.originalUrl : '/api/recovery',
                location_country: location?.country,
                location_city: location?.city,
                location_region: location?.region,
                location_coordinates: location?.coordinates
            };

            await this.insertAuditLog(auditData);
            
            console.log(`🔄 Recovery audit logged: ${user.name} created recovery for ${recoveryData.product_name}`);
            
            return { success: true, auditData };
            
        } catch (error) {
            console.error('Recovery audit logging error:', error);
            return { success: false, error: error.message };
        }
    }

    // Log return creation event (for returns controller compatibility)
    async logReturnCreate(user, returnData, req = null) {
        try {
            const ipAddress = req ? this.getClientIP(req) : '127.0.0.1';
            const userAgent = req ? (req.get('User-Agent') || 'Unknown') : 'Unknown';
            
            // Get location data
            const location = await this.geoTracker.getLocationData(ipAddress);
            
            const auditData = {
                user_id: user.id,
                user_name: user.name,
                user_email: user.email,
                user_role: user.role_name || user.role,
                action: 'CREATE',
                resource_type: 'RETURN',
                resource_id: returnData.return_id || null,
                resource_name: `${returnData.product_name} Return`,
                description: `${user.name} created return for ${returnData.quantity}x ${returnData.product_name}`,
                details: JSON.stringify({
                    product_name: returnData.product_name,
                    quantity: returnData.quantity,
                    reason: returnData.reason,
                    awb: returnData.awb,
                    return_id: returnData.return_id,
                    location_info: location
                }),
                ip_address: ipAddress,
                user_agent: userAgent,
                request_method: req ? req.method : 'POST',
                request_url: req ? req.originalUrl : '/api/returns',
                location_country: location?.country,
                location_city: location?.city,
                location_region: location?.region,
                location_coordinates: location?.coordinates
            };

            await this.insertAuditLog(auditData);
            
            console.log(`↩️ Return audit logged: ${user.name} created return for ${returnData.product_name}`);
            
            return { success: true, auditData };
            
        } catch (error) {
            console.error('Return audit logging error:', error);
            return { success: false, error: error.message };
        }
    }

    // Generic event logging method
    async logEvent(eventData) {
        try {
            const location = await this.geoTracker.getLocationData(eventData.ip_address || '127.0.0.1');
            
            const auditData = {
                user_id: eventData.user_id || null,
                user_name: eventData.user_name || 'Unknown',
                user_email: eventData.user_email || null,
                user_role: eventData.user_role || 'Unknown',
                action: eventData.action || 'UNKNOWN',
                resource_type: eventData.resource_type || eventData.resource || 'UNKNOWN',
                resource_id: eventData.resource_id || null,
                resource_name: eventData.resource_name || `${eventData.resource_type || eventData.resource || 'Unknown'} Event`,
                description: eventData.description || `${eventData.action || 'Action'} performed on ${eventData.resource_type || eventData.resource || 'resource'}`,
                details: JSON.stringify({
                    ...eventData.details,
                    location_info: location
                }),
                ip_address: eventData.ip_address || '127.0.0.1',
                user_agent: eventData.user_agent || 'Unknown',
                request_method: eventData.request_method || 'POST',
                request_url: eventData.request_url || '/api/event',
                location_country: location?.country,
                location_city: location?.city,
                location_region: location?.region,
                location_coordinates: location?.coordinates
            };

            await this.insertAuditLog(auditData);
            
            console.log(`📝 Event audit logged: ${eventData.action} ${eventData.resource_type || eventData.resource}`);
            
            return { success: true, auditData };
            
        } catch (error) {
            console.error('Event audit logging error:', error);
            return { success: false, error: error.message };
        }
    }

    // Extract client IP address
    getClientIP(req) {
        // Check various headers for real IP
        const possibleHeaders = [
            'cf-connecting-ip',      // Cloudflare
            'x-forwarded-for',       // Standard proxy header
            'x-real-ip',             // Nginx proxy
            'x-client-ip',           // Apache
            'x-forwarded',           // General
            'forwarded-for',         // General
            'forwarded'              // RFC 7239
        ];

        for (const header of possibleHeaders) {
            const value = req.headers[header];
            if (value) {
                // x-forwarded-for can contain multiple IPs, take the first one
                const ip = value.split(',')[0].trim();
                if (ip && ip !== 'unknown') {
                    return ip;
                }
            }
        }

        // Fallback to connection remote address
        return req.connection?.remoteAddress || 
               req.socket?.remoteAddress || 
               req.ip || 
               '127.0.0.1';
    }

    // Insert audit log into database
    async insertAuditLog(auditData) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO audit_logs (
                    user_id, user_name, user_email, user_role, action, resource_type, 
                    resource_id, resource_name, description, details, ip_address, 
                    user_agent, request_method, request_url, location_country, 
                    location_city, location_region, location_coordinates
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [
                auditData.user_id,
                auditData.user_name,
                auditData.user_email,
                auditData.user_role,
                auditData.action,
                auditData.resource_type,
                auditData.resource_id,
                auditData.resource_name,
                auditData.description,
                auditData.details,
                auditData.ip_address,
                auditData.user_agent,
                auditData.request_method,
                auditData.request_url,
                auditData.location_country,
                auditData.location_city,
                auditData.location_region,
                auditData.location_coordinates
            ];

            db.query(sql, values, (err, result) => {
                if (err) {
                    console.error('Audit log insert error:', err);
                    reject(err);
                } else {
                    resolve(result.insertId);
                }
            });
        });
    }
}

module.exports = EventAuditLogger;