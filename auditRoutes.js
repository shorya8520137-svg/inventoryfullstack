/**
 * Audit Routes for inventory_db
 * Provides user-friendly audit log endpoints
 */

const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
    host: '127.0.0.1',
    port: 3306,
    user: 'inventory_user',
    database: 'inventory_db'
};

// Get audit logs with filtering
router.get('/audit-logs', async (req, res) => {
    let connection;
    try {
        const {
            page = 1,
            limit = 50,
            user_id,
            action,
            resource_type,
            start_date,
            end_date,
            search
        } = req.query;

        const offset = (page - 1) * limit;
        let whereConditions = [];
        let queryParams = [];

        // Build WHERE conditions
        if (user_id) {
            whereConditions.push('user_id = ?');
            queryParams.push(user_id);
        }

        if (action) {
            whereConditions.push('action = ?');
            queryParams.push(action);
        }

        if (resource_type) {
            whereConditions.push('resource_type = ?');
            queryParams.push(resource_type);
        }

        if (start_date) {
            whereConditions.push('created_at >= ?');
            queryParams.push(start_date);
        }

        if (end_date) {
            whereConditions.push('created_at <= ?');
            queryParams.push(end_date);
        }

        if (search) {
            whereConditions.push('(description LIKE ? OR user_name LIKE ? OR resource_name LIKE ?)');
            queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

        connection = await mysql.createConnection(dbConfig);

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM audit_logs ${whereClause}`;
        const [countResult] = await connection.execute(countQuery, queryParams);
        const total = countResult[0].total;

        // Get audit logs
        const query = `
            SELECT 
                id, user_id, user_name, user_email, user_role, action, 
                resource_type, resource_id, resource_name, description, 
                details, ip_address, created_at
            FROM audit_logs 
            ${whereClause}
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        `;

        queryParams.push(parseInt(limit), parseInt(offset));
        const [logs] = await connection.execute(query, queryParams);

        // Format logs for display
        const formattedLogs = logs.map(log => ({
            ...log,
            details: typeof log.details === 'string' ? JSON.parse(log.details) : log.details,
            time_ago: getTimeAgo(log.created_at),
            action_icon: getActionIcon(log.action),
            action_color: getActionColor(log.action)
        }));

        res.json({
            success: true,
            data: {
                logs: formattedLogs,
                pagination: {
                    current_page: parseInt(page),
                    per_page: parseInt(limit),
                    total: total,
                    total_pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('Audit logs fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch audit logs'
        });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

// Get audit statistics
router.get('/audit-stats', async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        const [stats] = await connection.execute(`
            SELECT 
                COUNT(*) as total_activities,
                COUNT(DISTINCT user_id) as active_users,
                COUNT(CASE WHEN action = 'DISPATCH' THEN 1 END) as dispatches,
                COUNT(CASE WHEN action = 'RETURN' THEN 1 END) as returns,
                COUNT(CASE WHEN action = 'DAMAGE' THEN 1 END) as damages,
                COUNT(CASE WHEN action = 'BULK_UPLOAD' THEN 1 END) as bulk_uploads,
                COUNT(CASE WHEN action = 'LOGIN' THEN 1 END) as logins,
                COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 END) as last_24h
            FROM audit_logs
        `);

        const [topUsers] = await connection.execute(`
            SELECT user_name, COUNT(*) as activity_count
            FROM audit_logs 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAYS)
            GROUP BY user_id, user_name 
            ORDER BY activity_count DESC 
            LIMIT 5
        `);

        const [recentActions] = await connection.execute(`
            SELECT action, COUNT(*) as count
            FROM audit_logs 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAYS)
            GROUP BY action 
            ORDER BY count DESC
        `);

        res.json({
            success: true,
            data: {
                overview: stats[0],
                top_users: topUsers,
                recent_actions: recentActions
            }
        });

    } catch (error) {
        console.error('Audit stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch audit statistics'
        });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

// Helper functions
function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return new Date(date).toLocaleDateString();
}

function getActionIcon(action) {
    const icons = {
        'DISPATCH': '📤',
        'RETURN': '📥',
        'DAMAGE': '⚠️',
        'BULK_UPLOAD': '📊',
        'LOGIN': '🔐',
        'LOGOUT': '🚪',
        'CREATE': '➕',
        'UPDATE': '✏️',
        'DELETE': '🗑️',
        'TRANSFER': '🔄'
    };
    return icons[action] || '📋';
}

function getActionColor(action) {
    const colors = {
        'DISPATCH': 'blue',
        'RETURN': 'orange',
        'DAMAGE': 'red',
        'BULK_UPLOAD': 'green',
        'LOGIN': 'purple',
        'LOGOUT': 'gray',
        'CREATE': 'green',
        'UPDATE': 'yellow',
        'DELETE': 'red',
        'TRANSFER': 'blue'
    };
    return colors[action] || 'gray';
}

module.exports = router;