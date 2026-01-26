/**
 * FIREBASE NOTIFICATION SERVICE
 * Handles Firebase push notifications and database notifications
 */

const admin = require('firebase-admin');
const db = require('../db/connection');

class FirebaseNotificationService {
    constructor() {
        this.isInitialized = false;
        this.initializeFirebase();
    }

    // Initialize Firebase Admin SDK
    initializeFirebase() {
        try {
            // Initialize Firebase Admin SDK
            // Note: You'll need to add your Firebase service account key
            if (!admin.apps.length) {
                admin.initializeApp({
                    credential: admin.credential.applicationDefault(),
                    // Or use service account key:
                    // credential: admin.credential.cert(require('../config/firebase-service-account.json'))
                });
            }
            this.isInitialized = true;
            console.log('✅ Firebase Admin SDK initialized');
        } catch (error) {
            console.log('⚠️ Firebase initialization failed:', error.message);
            console.log('💡 Notifications will be stored in database only');
            this.isInitialized = false;
        }
    }

    // Create notification in database
    async createNotification(userId, title, message, type, eventData = {}) {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO notifications (user_id, title, message, type, event_data)
                VALUES (?, ?, ?, ?, ?)
            `;
            
            db.query(query, [userId, title, message, type, JSON.stringify(eventData)], (err, result) => {
                if (err) {
                    console.error('Create notification error:', err);
                    reject(err);
                } else {
                    console.log(`📱 Notification created: ${title} for user ${userId}`);
                    resolve(result.insertId);
                }
            });
        });
    }

    // Send push notification via Firebase
    async sendPushNotification(tokens, title, message, data = {}) {
        if (!this.isInitialized || !tokens || tokens.length === 0) {
            console.log('⚠️ Firebase not initialized or no tokens provided');
            return { success: false, error: 'Firebase not available' };
        }

        try {
            const payload = {
                notification: {
                    title: title,
                    body: message,
                    icon: '/icon-192x192.png',
                    badge: '/icon-192x192.png'
                },
                data: {
                    ...data,
                    timestamp: Date.now().toString()
                }
            };

            const response = await admin.messaging().sendToDevice(tokens, payload);
            
            console.log(`🚀 Push notification sent to ${tokens.length} devices`);
            console.log(`✅ Success: ${response.successCount}, Failed: ${response.failureCount}`);
            
            return {
                success: true,
                successCount: response.successCount,
                failureCount: response.failureCount,
                results: response.results
            };
            
        } catch (error) {
            console.error('Push notification error:', error);
            return { success: false, error: error.message };
        }
    }

    // Get user's Firebase tokens
    async getUserTokens(userId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT token FROM firebase_tokens 
                WHERE user_id = ? AND is_active = TRUE
            `;
            
            db.query(query, [userId], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    const tokens = results.map(row => row.token);
                    resolve(tokens);
                }
            });
        });
    }

    // Send notification to specific user
    async sendNotificationToUser(userId, title, message, type, eventData = {}) {
        try {
            // 1. Create notification in database
            const notificationId = await this.createNotification(userId, title, message, type, eventData);
            
            // 2. Get user's Firebase tokens
            const tokens = await this.getUserTokens(userId);
            
            // 3. Send push notification if tokens exist
            let pushResult = null;
            if (tokens.length > 0) {
                pushResult = await this.sendPushNotification(tokens, title, message, {
                    type: type,
                    notificationId: notificationId.toString(),
                    ...eventData
                });
            }
            
            return {
                success: true,
                notificationId: notificationId,
                pushResult: pushResult,
                tokensCount: tokens.length
            };
            
        } catch (error) {
            console.error('Send notification error:', error);
            return { success: false, error: error.message };
        }
    }

    // Send notification to all users except sender
    async sendNotificationToAllExcept(senderId, title, message, type, eventData = {}) {
        try {
            // Get all active users except sender
            const users = await new Promise((resolve, reject) => {
                const query = `
                    SELECT id FROM users 
                    WHERE is_active = TRUE AND id != ?
                `;
                
                db.query(query, [senderId], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });
            
            const results = [];
            
            // Send notification to each user
            for (const user of users) {
                const result = await this.sendNotificationToUser(user.id, title, message, type, eventData);
                results.push({ userId: user.id, ...result });
            }
            
            console.log(`📢 Broadcast notification sent to ${users.length} users`);
            
            return {
                success: true,
                totalUsers: users.length,
                results: results
            };
            
        } catch (error) {
            console.error('Broadcast notification error:', error);
            return { success: false, error: error.message };
        }
    }

    // Event-specific notification methods
    async notifyUserLogin(loginUserId, loginUserName, location = 'Unknown') {
        const title = '👤 User Login Alert';
        const message = `${loginUserName} has logged in from ${location}`;
        const eventData = {
            action: 'LOGIN',
            user_name: loginUserName,
            location: location,
            timestamp: new Date().toISOString()
        };
        
        return await this.sendNotificationToAllExcept(loginUserId, title, message, 'LOGIN', eventData);
    }

    async notifyDispatchCreated(dispatchUserId, dispatchUserName, productName, quantity, location = 'Unknown') {
        const title = '📦 New Dispatch Created';
        const message = `${dispatchUserName} dispatched ${quantity}x ${productName} from ${location}`;
        const eventData = {
            action: 'DISPATCH_CREATE',
            user_name: dispatchUserName,
            product_name: productName,
            quantity: quantity,
            location: location,
            timestamp: new Date().toISOString()
        };
        
        return await this.sendNotificationToAllExcept(dispatchUserId, title, message, 'DISPATCH', eventData);
    }

    async notifyReturnCreated(returnUserId, returnUserName, productName, quantity, location = 'Unknown') {
        const title = '↩️ Product Return';
        const message = `${returnUserName} processed return of ${quantity}x ${productName} from ${location}`;
        const eventData = {
            action: 'RETURN_CREATE',
            user_name: returnUserName,
            product_name: productName,
            quantity: quantity,
            location: location,
            timestamp: new Date().toISOString()
        };
        
        return await this.sendNotificationToAllExcept(returnUserId, title, message, 'RETURN', eventData);
    }

    async notifyDamageReported(damageUserId, damageUserName, productName, quantity, location = 'Unknown') {
        const title = '⚠️ Damage Reported';
        const message = `${damageUserName} reported damage for ${quantity}x ${productName} from ${location}`;
        const eventData = {
            action: 'DAMAGE_CREATE',
            user_name: damageUserName,
            product_name: productName,
            quantity: quantity,
            location: location,
            timestamp: new Date().toISOString()
        };
        
        return await this.sendNotificationToAllExcept(damageUserId, title, message, 'DAMAGE', eventData);
    }

    // Register Firebase token for user
    async registerToken(userId, token, deviceType = 'web', deviceInfo = {}) {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO firebase_tokens (user_id, token, device_type, device_info)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                device_type = VALUES(device_type),
                device_info = VALUES(device_info),
                is_active = TRUE,
                updated_at = CURRENT_TIMESTAMP
            `;
            
            db.query(query, [userId, token, deviceType, JSON.stringify(deviceInfo)], (err, result) => {
                if (err) {
                    console.error('Register token error:', err);
                    reject(err);
                } else {
                    console.log(`🔑 Firebase token registered for user ${userId}`);
                    resolve(result);
                }
            });
        });
    }

    // Get user notifications
    async getUserNotifications(userId, limit = 50, offset = 0) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT n.*, u.name as sender_name
                FROM notifications n
                LEFT JOIN users u ON JSON_EXTRACT(n.event_data, '$.user_id') = u.id
                WHERE n.user_id = ?
                ORDER BY n.created_at DESC
                LIMIT ? OFFSET ?
            `;
            
            db.query(query, [userId, limit, offset], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    // Parse event_data JSON
                    const notifications = results.map(notification => ({
                        ...notification,
                        event_data: typeof notification.event_data === 'string' 
                            ? JSON.parse(notification.event_data) 
                            : notification.event_data
                    }));
                    resolve(notifications);
                }
            });
        });
    }

    // Mark notification as read
    async markAsRead(notificationId, userId) {
        return new Promise((resolve, reject) => {
            const query = `
                UPDATE notifications 
                SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP
                WHERE id = ? AND user_id = ?
            `;
            
            db.query(query, [notificationId, userId], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result.affectedRows > 0);
                }
            });
        });
    }
}

module.exports = new FirebaseNotificationService();