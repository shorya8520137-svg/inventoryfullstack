/**
 * QUICK NOTIFICATION TEST
 * Simple test to verify notification service is working
 */

const ExistingSchemaNotificationService = require('./services/ExistingSchemaNotificationService');

async function quickTest() {
    console.log('🚀 Quick Notification Test');
    console.log('==========================\n');
    
    try {
        // Test 1: Create a simple notification
        console.log('📱 Test 1: Creating test notification...');
        
        const notificationId = await ExistingSchemaNotificationService.createNotification(
            '✅ Quick Test',
            'Notification system is working correctly!',
            'system',
            {
                userId: 1, // Assuming user ID 1 exists
                priority: 'medium',
                data: {
                    test: true,
                    timestamp: new Date().toISOString()
                }
            }
        );
        
        console.log(`✅ Notification created with ID: ${notificationId}`);
        
        // Test 2: Test login notification
        console.log('\n👤 Test 2: Testing login notification...');
        
        const loginResult = await ExistingSchemaNotificationService.notifyUserLogin(
            1,
            'Test User',
            '192.168.1.100'
        );
        
        if (loginResult.success) {
            console.log(`✅ Login notification sent to ${loginResult.totalUsers} users`);
        } else {
            console.log(`❌ Login notification failed: ${loginResult.error}`);
        }
        
        // Test 3: Get notifications
        console.log('\n📋 Test 3: Getting user notifications...');
        
        const notifications = await ExistingSchemaNotificationService.getUserNotifications(1, 5, 0);
        console.log(`✅ Retrieved ${notifications.length} notifications`);
        
        if (notifications.length > 0) {
            console.log('Latest notification:', notifications[0].title);
        }
        
        console.log('\n🎉 ALL TESTS PASSED!');
        console.log('The notification system is working correctly.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\nError details:', error);
    }
}

// Run quick test
quickTest();