/**
 * AUDIT LOGGER
 * Basic audit logger for general audit operations
 */

const db = require('./db/connection');
const IPGeolocationTracker = require('./IPGeolocationTracker');

class AuditLogger {
    constructor() {
        this.geoTracker = new IPGeolocationTracker();
    }

    // Log any audit event
    async logEvent(userId, action, resourceType, resourceId, details, req = null) {
        try {
            const ipAddress = req ? this.getClientIP(req) : '127.0.0.1';
            const userAgent = req ? (req.get('User-Agent') || 'Unknown') : 'Unknown';
            
            // Get location data
            const location = await this.geoTracker.getLocationData(ipAddress);
            
            const auditData = {
                user_id: userId,
                action: action,
                resource_type: resourceType,
                resource_id: resourceId,
                description: `${action} ${resourceType} ${resourceId || ''}`,
                details: JSON.stringify({
                    ...details,
                    location_info: location
                }),
                ip_address: ipAddress,
                user_agent: userAgent,
                request_method: req ? req.method : 'POST',
                request_url: req ? req.originalUrl : '/api/audit',
                location_country: location?.country,
                location_city: location?.city,
                location_region: location?.region,
                location_coordinates: location?.coordinates
            };

            await this.insertAuditLog(auditData);
            
            console.log(`📝 Audit logged: ${action} ${resourceType} by user ${userId}`);
            
            return { success: true, auditData };
            
        } catch (error) {
            console.error('Audit logging error:', error);
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
                    user_id, action, resource_type, resource_id, description, 
                    details, ip_address, user_agent, request_method, request_url, 
                    location_country, location_city, location_region, location_coordinates
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [
                auditData.user_id,
                auditData.action,
                auditData.resource_type,
                auditData.resource_id,
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

module.exports = AuditLogger;