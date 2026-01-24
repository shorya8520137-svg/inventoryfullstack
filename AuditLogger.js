/**
 * Audit Logger for inventory_db
 * Auto-generated with correct database configuration
 */

const mysql = require('mysql2/promise');

class AuditLogger {
    constructor() {
        this.dbConfig = {
            host: '127.0.0.1',
            port: 3306,
            user: 'inventory_user',
            database: 'inventory_db',
            // Remove invalid options that cause warnings
            // acquireTimeout, timeout, reconnect are not valid for mysql2
        };
    }

    async logActivity(auditData) {
        let connection;
        try {
            connection = await mysql.createConnection(this.dbConfig);
            
            const sql = `
                INSERT INTO audit_logs (
                    user_id, user_name, user_email, user_role, action, 
                    resource_type, resource_id, resource_name, description, 
                    details, ip_address, user_agent, request_method, request_url
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            await connection.execute(sql, [
                auditData.user_id,
                auditData.user_name,
                auditData.user_email,
                auditData.user_role,
                auditData.action,
                auditData.resource_type,
                auditData.resource_id,
                auditData.resource_name,
                auditData.description,
                JSON.stringify(auditData.details),
                auditData.ip_address,
                auditData.user_agent,
                auditData.request_method,
                auditData.request_url
            ]);
            
            console.log('📝 Audit logged:', auditData.description);
        } catch (error) {
            console.error('❌ Audit logging failed:', error.message);
        } finally {
            if (connection) {
                await connection.end();
            }
        }
    }

    // Dispatch Activity
    async logDispatch(user, product, quantity, warehouse, awbNumber, req) {
        await this.logActivity({
            user_id: user.id,
            user_name: user.name,
            user_email: user.email,
            user_role: user.role_name,
            action: 'DISPATCH',
            resource_type: 'product',
            resource_id: product.id,
            resource_name: product.name,
            description: `${user.name} dispatched ${quantity} units of ${product.name} to ${warehouse} warehouse`,
            details: {
                quantity: quantity,
                warehouse: warehouse,
                awb_number: awbNumber,
                product_sku: product.sku,
                dispatch_time: new Date().toISOString()
            },
            ip_address: req.ip || req.connection.remoteAddress,
            user_agent: req.get('User-Agent'),
            request_method: 'POST',
            request_url: '/api/dispatch'
        });
    }

    // Return Activity
    async logReturn(user, product, quantity, reason, awbNumber, req) {
        await this.logActivity({
            user_id: user.id,
            user_name: user.name,
            user_email: user.email,
            user_role: user.role_name,
            action: 'RETURN',
            resource_type: 'product',
            resource_id: product.id,
            resource_name: product.name,
            description: `${user.name} processed return of ${quantity} units of ${product.name} (Reason: ${reason})`,
            details: {
                quantity: quantity,
                reason: reason,
                awb_number: awbNumber,
                product_sku: product.sku,
                return_time: new Date().toISOString()
            },
            ip_address: req.ip || req.connection.remoteAddress,
            user_agent: req.get('User-Agent'),
            request_method: 'POST',
            request_url: '/api/returns'
        });
    }

    // Login Activity
    async logLogin(user, req) {
        await this.logActivity({
            user_id: user.id,
            user_name: user.name,
            user_email: user.email,
            user_role: user.role_name,
            action: 'LOGIN',
            resource_type: 'session',
            resource_id: `sess_${Date.now()}`,
            resource_name: 'User Session',
            description: `${user.name} logged into the system`,
            details: {
                login_time: new Date().toISOString(),
                browser: this.parseBrowser(req.get('User-Agent')),
                os: this.parseOS(req.get('User-Agent'))
            },
            ip_address: req.ip || req.connection.remoteAddress,
            user_agent: req.get('User-Agent'),
            request_method: 'POST',
            request_url: '/api/login'
        });
    }

    // Bulk Upload Activity
    async logBulkUpload(user, filename, totalItems, processedItems, req) {
        await this.logActivity({
            user_id: user.id,
            user_name: user.name,
            user_email: user.email,
            user_role: user.role_name,
            action: 'BULK_UPLOAD',
            resource_type: 'inventory',
            resource_id: `bulk_${Date.now()}`,
            resource_name: filename,
            description: `${user.name} uploaded bulk inventory file "${filename}" with ${totalItems} items`,
            details: {
                filename: filename,
                total_items: totalItems,
                processed_items: processedItems,
                success_rate: ((processedItems / totalItems) * 100).toFixed(2) + '%',
                upload_time: new Date().toISOString()
            },
            ip_address: req.ip || req.connection.remoteAddress,
            user_agent: req.get('User-Agent'),
            request_method: 'POST',
            request_url: '/api/bulk-upload'
        });
    }

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
}

module.exports = AuditLogger;