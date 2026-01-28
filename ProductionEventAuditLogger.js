/**
 * PRODUCTION EVENT AUDIT LOGGER
 * Handles audit logging for production events with proper user tracking
 */

const db = require('./db/connection');
const IPGeolocationTracker = require('./IPGeolocationTracker');

class ProductionEventAuditLogger {
    constructor() {
        this.geoTracker = new IPGeolocationTracker();
    }

    // Log dispatch event
    async logDispatchEvent(userId, userName, userEmail, userRole, action, dispatchData, req) {
        try {
            const ipAddress = this.extractRealIP(req);
            const userAgent = req.headers['user-agent'] || 'Unknown';
            
            // Get location data
            const location = await this.geoTracker.getLocationData(ipAddress);
            
            const auditData = {
                user_id: userId,
                user_name: userName,
                user_email: userEmail,
                user_role: userRole,
                action: action,
                resource_type: 'DISPATCH',
                resource_id: dispatchData.id || null,
                resource_name: `${dispatchData.product_name} Dispatch`,
                description: `${userName} ${action.toLowerCase()}ed dispatch for ${dispatchData.quantity}x ${dispatchData.product_name}`,
                details: JSON.stringify({
                    product_name: dispatchData.product_name,
                    quantity: dispatchData.quantity,
                    customer: dispatchData.customer,
                    warehouse: dispatchData.warehouse,
                    awb_number: dispatchData.awb_number,
                    logistics: dispatchData.logistics,
                    dispatch_id: dispatchData.id,
                    location: location
                }),
                ip_address: ipAddress,
                user_agent: userAgent,
                request_method: req.method,
                request_url: req.originalUrl,
                location_country: location?.country,
                location_city: location?.city,
                location_region: location?.region,
                location_coordinates: location?.coordinates
            };

            await this.insertAuditLog(auditData);
            
            console.log(`📦 Dispatch audit logged: ${userName} ${action} ${dispatchData.product_name} from ${location?.city || 'Unknown'}`);
            
            return { success: true, auditData };
            
        } catch (error) {
            console.error('Dispatch audit logging error:', error);
            return { success: false, error: error.message };
        }
    }

    // Log return event
    async logReturnEvent(userId, userName, userEmail, userRole, action, returnData, req) {
        try {
            const ipAddress = this.extractRealIP(req);
            const userAgent = req.headers['user-agent'] || 'Unknown';
            
            // Get location data
            const location = await this.geoTracker.getLocationData(ipAddress);
            
            const auditData = {
                user_id: userId,
                user_name: userName,
                user_email: userEmail,
                user_role: userRole,
                action: action,
                resource_type: 'RETURN',
                resource_id: returnData.id || null,
                resource_name: `${returnData.product_name} Return`,
                description: `${userName} ${action.toLowerCase()}ed return for ${returnData.quantity}x ${returnData.product_name}`,
                details: JSON.stringify({
                    product_name: returnData.product_name,
                    quantity: returnData.quantity,
                    reason: returnData.reason,
                    awb_number: returnData.awb_number,
                    return_id: returnData.id,
                    location: location
                }),
                ip_address: ipAddress,
                user_agent: userAgent,
                request_method: req.method,
                request_url: req.originalUrl,
                location_country: location?.country,
                location_city: location?.city,
                location_region: location?.region,
                location_coordinates: location?.coordinates
            };

            await this.insertAuditLog(auditData);
            
            console.log(`↩️ Return audit logged: ${userName} ${action} ${returnData.product_name} from ${location?.city || 'Unknown'}`);
            
            return { success: true, auditData };
            
        } catch (error) {
            console.error('Return audit logging error:', error);
            return { success: false, error: error.message };
        }
    }

    // Log return creation (alias for compatibility)
    async logReturnCreate(user, returnData, req = null) {
        return await this.logReturnEvent(
            user.id,
            user.name,
            user.email,
            user.role_name || user.role,
            'CREATE',
            returnData,
            req
        );
    }

    // Log dispatch creation (alias for compatibility)
    async logDispatchCreate(user, dispatchData, req = null) {
        return await this.logDispatchEvent(
            user.id,
            user.name,
            user.email,
            user.role_name || user.role,
            'CREATE',
            dispatchData,
            req
        );
    }

    // Log damage creation (alias for compatibility)
    async logDamageCreate(user, damageData, req = null) {
        return await this.logDamageEvent(
            user.id,
            user.name,
            user.email,
            user.role_name || user.role,
            'CREATE',
            damageData,
            req
        );
    }

    // Log inventory update (alias for compatibility)
    async logInventoryUpdate(user, inventoryData, req = null) {
        return await this.logInventoryEvent(
            user.id,
            user.name,
            user.email,
            user.role_name || user.role,
            'UPDATE',
            inventoryData,
            req
        );
    }

    // Log damage event
    async logDamageEvent(userId, userName, userEmail, userRole, action, damageData, req) {
        try {
            const ipAddress = this.extractRealIP(req);
            const userAgent = req.headers['user-agent'] || 'Unknown';
            
            // Get location data
            const location = await this.geoTracker.getLocationData(ipAddress);
            
            const auditData = {
                user_id: userId,
                user_name: userName,
                user_email: userEmail,
                user_role: userRole,
                action: action,
                resource_type: 'DAMAGE',
                resource_id: damageData.id || null,
                resource_name: `${damageData.product_name} Damage Report`,
                description: `${userName} ${action.toLowerCase()}ed damage report for ${damageData.quantity}x ${damageData.product_name}`,
                details: JSON.stringify({
                    product_name: damageData.product_name,
                    quantity: damageData.quantity,
                    reason: damageData.reason,
                    location: damageData.location,
                    estimated_loss: damageData.estimated_loss,
                    damage_id: damageData.id,
                    location: location
                }),
                ip_address: ipAddress,
                user_agent: userAgent,
                request_method: req.method,
                request_url: req.originalUrl,
                location_country: location?.country,
                location_city: location?.city,
                location_region: location?.region,
                location_coordinates: location?.coordinates
            };

            await this.insertAuditLog(auditData);
            
            console.log(`🔴 Damage audit logged: ${userName} ${action} ${damageData.product_name} from ${location?.city || 'Unknown'}`);
            
            return { success: true, auditData };
            
        } catch (error) {
            console.error('Damage audit logging error:', error);
            return { success: false, error: error.message };
        }
    }

    // Log inventory event
    async logInventoryEvent(userId, userName, userEmail, userRole, action, inventoryData, req) {
        try {
            const ipAddress = this.extractRealIP(req);
            const userAgent = req.headers['user-agent'] || 'Unknown';
            
            // Get location data
            const location = await this.geoTracker.getLocationData(ipAddress);
            
            const auditData = {
                user_id: userId,
                user_name: userName,
                user_email: userEmail,
                user_role: userRole,
                action: action,
                resource_type: 'INVENTORY',
                resource_id: inventoryData.id || null,
                resource_name: `${inventoryData.product_name} Inventory Update`,
                description: `${userName} ${action.toLowerCase()}ed inventory for ${inventoryData.product_name}`,
                details: JSON.stringify({
                    product_name: inventoryData.product_name,
                    quantity: inventoryData.quantity,
                    warehouse: inventoryData.warehouse,
                    source_type: inventoryData.source_type,
                    inventory_id: inventoryData.id,
                    location: location
                }),
                ip_address: ipAddress,
                user_agent: userAgent,
                request_method: req.method,
                request_url: req.originalUrl,
                location_country: location?.country,
                location_city: location?.city,
                location_region: location?.region,
                location_coordinates: location?.coordinates
            };

            await this.insertAuditLog(auditData);
            
            console.log(`📊 Inventory audit logged: ${userName} ${action} ${inventoryData.product_name} from ${location?.city || 'Unknown'}`);
            
            return { success: true, auditData };
            
        } catch (error) {
            console.error('Inventory audit logging error:', error);
            return { success: false, error: error.message };
        }
    }

    // Extract real IP address (handles Cloudflare, proxies, etc.)
    extractRealIP(req) {
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

    // Get user info from request (assuming JWT middleware sets req.user)
    getUserInfo(req) {
        if (req.user) {
            return {
                userId: req.user.id,
                userName: req.user.name,
                userEmail: req.user.email,
                userRole: req.user.role
            };
        }
        
        // Fallback for requests without user context
        return {
            userId: null,
            userName: 'System',
            userEmail: null,
            userRole: 'System'
        };
    }
}

module.exports = ProductionEventAuditLogger;