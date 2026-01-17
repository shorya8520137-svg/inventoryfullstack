const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');
const { authenticateToken, checkPermission } = require('../middleware/auth');

// ================= NOTIFICATION MANAGEMENT ================= //

// GET /api/notifications - Get notifications with filtering
router.get('/', 
    authenticateToken, 
    NotificationController.getNotifications
);

// POST /api/notifications - Create new notification
router.post('/', 
    authenticateToken, 
    checkPermission('system.user_management'), 
    NotificationController.createNotification
);

// PUT /api/notifications/:notificationId/read - Mark notification as read
router.put('/:notificationId/read', 
    authenticateToken, 
    NotificationController.markAsRead
);

// PUT /api/notifications/read-all - Mark all notifications as read
router.put('/read-all', 
    authenticateToken, 
    NotificationController.markAllAsRead
);

// GET /api/notifications/stats - Get notification statistics
router.get('/stats', 
    authenticateToken, 
    NotificationController.getNotificationStats
);

// ================= FIREBASE TOKEN MANAGEMENT ================= //

// POST /api/notifications/firebase-token - Save Firebase token
router.post('/firebase-token', 
    authenticateToken, 
    NotificationController.saveFirebaseToken
);

// ================= TESTING ENDPOINTS ================= //

// POST /api/notifications/test/dispatch - Test dispatch notification
router.post('/test/dispatch', 
    authenticateToken, 
    checkPermission('system.user_management'),
    async (req, res) => {
        try {
            const testData = {
                id: 12345,
                product_name: 'Test Product',
                quantity: 10,
                warehouse: 'Main Warehouse'
            };
            
            await NotificationController.triggerDispatchNotification(testData);
            
            res.json({
                success: true,
                message: 'Test dispatch notification sent'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to send test notification'
            });
        }
    }
);

// POST /api/notifications/test/return - Test return notification
router.post('/test/return', 
    authenticateToken, 
    checkPermission('system.user_management'),
    async (req, res) => {
        try {
            const testData = {
                id: 67890,
                product_name: 'Test Return Product',
                reason: 'Damaged item'
            };
            
            await NotificationController.triggerReturnNotification(testData);
            
            res.json({
                success: true,
                message: 'Test return notification sent'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to send test notification'
            });
        }
    }
);

// POST /api/notifications/test/status-change - Test status change notification
router.post('/test/status-change', 
    authenticateToken, 
    checkPermission('system.user_management'),
    async (req, res) => {
        try {
            const testData = {
                product_name: 'Test Status Product',
                old_status: 'pending',
                new_status: 'dispatched',
                entity_type: 'order',
                entity_id: 123
            };
            
            await NotificationController.triggerStatusChangeNotification(testData);
            
            res.json({
                success: true,
                message: 'Test status change notification sent'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to send test notification'
            });
        }
    }
);

// POST /api/notifications/test/data-insert - Test data insert notification
router.post('/test/data-insert', 
    authenticateToken, 
    checkPermission('system.user_management'),
    async (req, res) => {
        try {
            const testData = {
                type: 'product',
                id: 999,
                name: 'New Test Product',
                category: 'Electronics'
            };
            
            await NotificationController.triggerDataInsertNotification(testData);
            
            res.json({
                success: true,
                message: 'Test data insert notification sent'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to send test notification'
            });
        }
    }
);

module.exports = router;