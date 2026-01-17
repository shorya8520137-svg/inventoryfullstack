const db = require('../db/connection');
const admin = require('firebase-admin');

class NotificationController {
    
    // ================= NOTIFICATION MANAGEMENT ================= //
    
    static async createNotification(req, res) {
        try {
            const { title, message, type, priority = 'medium', user_id = null, related_entity_type = null, related_entity_id = null, data = null } = req.body;
            
            if (!title || !message || !type) {
                return res.status(400).json({
                    success: false,
                    message: 'Title, message, and type are required'
                });
            }
            
            const insertSql = `
                INSERT INTO notifications (title, message, type, priority, user_id, related_entity_type, related_entity_id, data)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            db.query(insertSql, [title, message, type, priority, user_id, related_entity_type, related_entity_id, JSON.stringify(data)], async (err, result) => {
                if (err) {
                    console.error('Create notification error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to create notification'
                    });
                }
                
                const notificationId = result.insertId;
                
                // Send Firebase push notification
                try {
                    await NotificationController.sendPushNotification(notificationId, user_id);
                } catch (pushError) {
                    console.error('Push notification error:', pushError);
                }
                
                res.status(201).json({
                    success: true,
                    message: 'Notification created successfully',
                    data: { id: notificationId }
                });
            });
            
        } catch (error) {
            console.error('Create notification error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create notification'
            });
        }
    }
    
    static getNotifications(req, res) {
        try {
            const { page = 1, limit = 20, type, is_read, user_id } = req.query;
            const offset = (page - 1) * limit;
            
            let whereClause = '1=1';
            let params = [];
            
            // Filter by user - show notifications for specific user or global notifications
            if (user_id) {
                whereClause += ' AND (user_id = ? OR user_id IS NULL)';
                params.push(user_id);
            }
            
            if (type) {
                whereClause += ' AND type = ?';
                params.push(type);
            }
            
            if (is_read !== undefined) {
                whereClause += ' AND is_read = ?';
                params.push(is_read === 'true' ? 1 : 0);
            }
            
            const sql = `
                SELECT * FROM notifications 
                WHERE ${whereClause}
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
            `;
            
            db.query(sql, [...params, parseInt(limit), parseInt(offset)], (err, notifications) => {
                if (err) {
                    console.error('Get notifications error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to fetch notifications'
                    });
                }
                
                // Get total count
                const countSql = `SELECT COUNT(*) as total FROM notifications WHERE ${whereClause}`;
                db.query(countSql, params, (countErr, countResult) => {
                    if (countErr) {
                        console.error('Count notifications error:', countErr);
                        return res.status(500).json({
                            success: false,
                            message: 'Failed to count notifications'
                        });
                    }
                    
                    res.json({
                        success: true,
                        data: {
                            notifications: notifications.map(n => ({
                                ...n,
                                data: n.data ? JSON.parse(n.data) : null
                            })),
                            pagination: {
                                page: parseInt(page),
                                limit: parseInt(limit),
                                total: countResult[0].total,
                                pages: Math.ceil(countResult[0].total / limit)
                            }
                        }
                    });
                });
            });
            
        } catch (error) {
            console.error('Get notifications error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch notifications'
            });
        }
    }
    
    static markAsRead(req, res) {
        try {
            const { notificationId } = req.params;
            
            const sql = `
                UPDATE notifications 
                SET is_read = TRUE, read_at = NOW() 
                WHERE id = ?
            `;
            
            db.query(sql, [notificationId], (err, result) => {
                if (err) {
                    console.error('Mark notification as read error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to mark notification as read'
                    });
                }
                
                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Notification not found'
                    });
                }
                
                res.json({
                    success: true,
                    message: 'Notification marked as read'
                });
            });
            
        } catch (error) {
            console.error('Mark notification as read error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to mark notification as read'
            });
        }
    }
    
    static markAllAsRead(req, res) {
        try {
            const { user_id } = req.body;
            
            let sql = 'UPDATE notifications SET is_read = TRUE, read_at = NOW()';
            let params = [];
            
            if (user_id) {
                sql += ' WHERE (user_id = ? OR user_id IS NULL)';
                params.push(user_id);
            }
            
            db.query(sql, params, (err, result) => {
                if (err) {
                    console.error('Mark all notifications as read error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to mark notifications as read'
                    });
                }
                
                res.json({
                    success: true,
                    message: `${result.affectedRows} notifications marked as read`
                });
            });
            
        } catch (error) {
            console.error('Mark all notifications as read error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to mark notifications as read'
            });
        }
    }
    
    // ================= FIREBASE TOKEN MANAGEMENT ================= //
    
    static saveFirebaseToken(req, res) {
        try {
            const { user_id, token, device_type = 'web', device_info = null } = req.body;
            
            if (!user_id || !token) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID and token are required'
                });
            }
            
            const sql = `
                INSERT INTO firebase_tokens (user_id, token, device_type, device_info, last_used_at)
                VALUES (?, ?, ?, ?, NOW())
                ON DUPLICATE KEY UPDATE
                device_type = VALUES(device_type),
                device_info = VALUES(device_info),
                is_active = TRUE,
                last_used_at = NOW(),
                updated_at = NOW()
            `;
            
            db.query(sql, [user_id, token, device_type, JSON.stringify(device_info)], (err, result) => {
                if (err) {
                    console.error('Save Firebase token error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to save Firebase token'
                    });
                }
                
                res.json({
                    success: true,
                    message: 'Firebase token saved successfully'
                });
            });
            
        } catch (error) {
            console.error('Save Firebase token error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to save Firebase token'
            });
        }
    }
    
    // ================= NOTIFICATION TRIGGERS ================= //
    
    static async triggerDispatchNotification(dispatchData) {
        try {
            const title = 'New Dispatch Created';
            const message = `Dispatch #${dispatchData.id} has been created for ${dispatchData.product_name || 'product'}`;
            
            await NotificationController.createNotificationInternal({
                title,
                message,
                type: 'dispatch',
                priority: 'high',
                user_id: null, // Send to all users
                related_entity_type: 'dispatch',
                related_entity_id: dispatchData.id,
                data: {
                    dispatch_id: dispatchData.id,
                    product_name: dispatchData.product_name,
                    quantity: dispatchData.quantity,
                    warehouse: dispatchData.warehouse
                }
            });
            
            console.log('✅ Dispatch notification triggered:', dispatchData.id);
        } catch (error) {
            console.error('❌ Dispatch notification error:', error);
        }
    }
    
    static async triggerReturnNotification(returnData) {
        try {
            const title = 'New Return Created';
            const message = `Return #${returnData.id} has been created for ${returnData.product_name || 'product'}`;
            
            await NotificationController.createNotificationInternal({
                title,
                message,
                type: 'return',
                priority: 'high',
                user_id: null,
                related_entity_type: 'return',
                related_entity_id: returnData.id,
                data: {
                    return_id: returnData.id,
                    product_name: returnData.product_name,
                    reason: returnData.reason
                }
            });
            
            console.log('✅ Return notification triggered:', returnData.id);
        } catch (error) {
            console.error('❌ Return notification error:', error);
        }
    }
    
    static async triggerStatusChangeNotification(statusData) {
        try {
            const title = 'Status Updated';
            const message = `${statusData.product_name || 'Product'} status changed to ${statusData.new_status}`;
            
            await NotificationController.createNotificationInternal({
                title,
                message,
                type: 'status_change',
                priority: 'medium',
                user_id: null,
                related_entity_type: statusData.entity_type,
                related_entity_id: statusData.entity_id,
                data: {
                    product_name: statusData.product_name,
                    old_status: statusData.old_status,
                    new_status: statusData.new_status,
                    entity_type: statusData.entity_type
                }
            });
            
            console.log('✅ Status change notification triggered:', statusData);
        } catch (error) {
            console.error('❌ Status change notification error:', error);
        }
    }
    
    static async triggerDataInsertNotification(insertData) {
        try {
            const title = 'New Data Added';
            const message = `New ${insertData.type} has been added to the system`;
            
            await NotificationController.createNotificationInternal({
                title,
                message,
                type: 'data_insert',
                priority: 'low',
                user_id: null,
                related_entity_type: insertData.type,
                related_entity_id: insertData.id,
                data: insertData
            });
            
            console.log('✅ Data insert notification triggered:', insertData);
        } catch (error) {
            console.error('❌ Data insert notification error:', error);
        }
    }
    
    static async triggerUserLoginNotification(userData) {
        try {
            const title = 'User Login';
            const message = `${userData.name} (${userData.email}) logged in`;
            
            await NotificationController.createNotificationInternal({
                title,
                message,
                type: 'user_login',
                priority: 'low',
                user_id: null,
                related_entity_type: 'user',
                related_entity_id: userData.id,
                data: {
                    user_id: userData.id,
                    user_name: userData.name,
                    user_email: userData.email,
                    login_time: new Date().toISOString()
                }
            });
            
            console.log('✅ User login notification triggered:', userData.email);
        } catch (error) {
            console.error('❌ User login notification error:', error);
        }
    }
    
    static async triggerUserLogoutNotification(userData) {
        try {
            const title = 'User Logout';
            const message = `${userData.name} (${userData.email}) logged out`;
            
            await NotificationController.createNotificationInternal({
                title,
                message,
                type: 'user_logout',
                priority: 'low',
                user_id: null,
                related_entity_type: 'user',
                related_entity_id: userData.id,
                data: {
                    user_id: userData.id,
                    user_name: userData.name,
                    user_email: userData.email,
                    logout_time: new Date().toISOString()
                }
            });
            
            console.log('✅ User logout notification triggered:', userData.email);
        } catch (error) {
            console.error('❌ User logout notification error:', error);
        }
    }
    
    // ================= HELPER METHODS ================= //
    
    static async createNotificationInternal(notificationData) {
        return new Promise((resolve, reject) => {
            const { title, message, type, priority = 'medium', user_id = null, related_entity_type = null, related_entity_id = null, data = null } = notificationData;
            
            const sql = `
                INSERT INTO notifications (title, message, type, priority, user_id, related_entity_type, related_entity_id, data)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            db.query(sql, [title, message, type, priority, user_id, related_entity_type, related_entity_id, JSON.stringify(data)], async (err, result) => {
                if (err) {
                    console.error('Create notification internal error:', err);
                    reject(err);
                    return;
                }
                
                const notificationId = result.insertId;
                
                // Send Firebase push notification
                try {
                    await NotificationController.sendPushNotification(notificationId, user_id);
                } catch (pushError) {
                    console.error('Push notification error:', pushError);
                }
                
                resolve({ id: notificationId });
            });
        });
    }
    
    static async sendPushNotification(notificationId, targetUserId = null) {
        try {
            // Get notification details
            const notificationSql = 'SELECT * FROM notifications WHERE id = ?';
            
            db.query(notificationSql, [notificationId], (err, notifications) => {
                if (err || notifications.length === 0) {
                    console.error('Notification not found for push:', notificationId);
                    return;
                }
                
                const notification = notifications[0];
                
                // Get Firebase tokens
                let tokenSql = 'SELECT token FROM firebase_tokens WHERE is_active = TRUE';
                let tokenParams = [];
                
                if (targetUserId) {
                    tokenSql += ' AND user_id = ?';
                    tokenParams.push(targetUserId);
                }
                
                db.query(tokenSql, tokenParams, async (tokenErr, tokens) => {
                    if (tokenErr || tokens.length === 0) {
                        console.log('No Firebase tokens found for notification:', notificationId);
                        return;
                    }
                    
                    const tokenList = tokens.map(t => t.token);
                    
                    // Prepare Firebase message
                    const message = {
                        notification: {
                            title: notification.title,
                            body: notification.message
                        },
                        data: {
                            notificationId: notificationId.toString(),
                            type: notification.type,
                            priority: notification.priority,
                            ...(notification.data ? JSON.parse(notification.data) : {})
                        },
                        tokens: tokenList
                    };
                    
                    try {
                        // Send to Firebase (commented out for now - will implement when Firebase is configured)
                        // const response = await admin.messaging().sendMulticast(message);
                        console.log('📱 Would send Firebase notification:', {
                            title: notification.title,
                            body: notification.message,
                            tokens: tokenList.length
                        });
                        
                        // Mark as sent
                        db.query('UPDATE notifications SET is_sent = TRUE WHERE id = ?', [notificationId], (updateErr) => {
                            if (updateErr) {
                                console.error('Failed to mark notification as sent:', updateErr);
                            }
                        });
                        
                    } catch (firebaseError) {
                        console.error('Firebase send error:', firebaseError);
                    }
                });
            });
            
        } catch (error) {
            console.error('Send push notification error:', error);
        }
    }
    
    // ================= STATISTICS ================= //
    
    static getNotificationStats(req, res) {
        try {
            const { user_id } = req.query;
            
            let whereClause = '1=1';
            let params = [];
            
            if (user_id) {
                whereClause += ' AND (user_id = ? OR user_id IS NULL)';
                params.push(user_id);
            }
            
            const statsSql = `
                SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN is_read = FALSE THEN 1 END) as unread,
                    COUNT(CASE WHEN type = 'dispatch' THEN 1 END) as dispatch_count,
                    COUNT(CASE WHEN type = 'return' THEN 1 END) as return_count,
                    COUNT(CASE WHEN type = 'status_change' THEN 1 END) as status_change_count,
                    COUNT(CASE WHEN type = 'user_login' THEN 1 END) as login_count,
                    COUNT(CASE WHEN priority = 'urgent' THEN 1 END) as urgent_count,
                    COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_count
                FROM notifications 
                WHERE ${whereClause}
            `;
            
            db.query(statsSql, params, (err, stats) => {
                if (err) {
                    console.error('Get notification stats error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to fetch notification statistics'
                    });
                }
                
                res.json({
                    success: true,
                    data: stats[0]
                });
            });
            
        } catch (error) {
            console.error('Get notification stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch notification statistics'
            });
        }
    }
}

module.exports = NotificationController;