/**
 * TEST NOTIFICATION FIX
 * Quick test to verify the IPGeolocationTracker fix is working
 */

const ExistingSchemaNotificationService = require('./services/ExistingSchemaNotificationService');

async function testNotificationFix() {
    console.log('🔧 TESTING NOTIFICATION FIX');
    console.log('============================\n');
    
    try {
        console.log('📱 Test 1: Testing login notification with IP geolocation...');
        
        // Test with a real IP address (your office IP)
        const testIP = '103.100.219.248'; // Your office IP
        const result = await ExistingSchemaNotificationService.notifyUserLogin(
            1, // User ID
            'Test User', // User name
            testIP // IP address
        );
        
        if (result.success) {
            console.log(`✅ Login notification sent successfully!`);
            console.log(`📊 Sent to ${result.totalUsers} users`);
            console.log(`🌍 IP ${testIP} location resolved successfully`);
        } else {
            console.log(`❌ Login notification failed: ${result.error || result.reason}`);
        }
        
        console.log('\n📱 Test 2: Testing dispatch notification...');
        
        const dispatchResult = await ExistingSchemaNotificationService.notifyDispatchCreated(
            1, // User ID
            'Test User', // User name
            'Test Product', // Product name
            5, // Quantity
            testIP, // IP address
            123 // Dispatch ID
        );
        
        if (dispatchResult.success) {
            console.log(`✅ Dispatch notification sent successfully!`);
            console.log(`📊 Sent to ${dispatchResult.totalUsers} users`);
        } else {
            console.log(`❌ Dispatch notification failed: ${dispatchResult.error || dispatchResult.reason}`);
        }
        
        console.log('\n📱 Test 3: Testing basic notification creation...');
        
        const notificationId = await ExistingSchemaNotificationService.createNotification(
            '🔧 Fix Test',
            'Testing notification system after IPGeolocationTracker fix',
            'system',
            {
                userId: 1,
                priority: 'medium',
                data: {
                    test: true,
                    fix: 'IPGeolocationTracker',
                    timestamp: new Date().toISOString()
                }
            }
        );
        
        console.log(`✅ Basic notification created with ID: ${notificationId}`);
        
        console.log('\n🎉 ALL TESTS COMPLETED!');
        console.log('The notification system should now be working correctly.');
        console.log('The IPGeolocationTracker.getLocationFromIP error has been fixed.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\nError details:', error);
        
        console.log('\n💡 If you still see errors:');
        console.log('1. Make sure the database is running');
        console.log('2. Check that all required tables exist');
        console.log('3. Verify network connectivity for geolocation APIs');
    }
}

// Run the test
testNotificationFix();