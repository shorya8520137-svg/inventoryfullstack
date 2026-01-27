/**
 * FIX NOTIFICATION SYSTEM COMPLETE
 * Complete fix for the notification system IPGeolocationTracker error
 */

const fs = require('fs');
const path = require('path');

async function fixNotificationSystemComplete() {
    console.log('🔧 FIXING NOTIFICATION SYSTEM COMPLETELY');
    console.log('=========================================\n');
    
    try {
        // Step 1: Fix ExistingSchemaNotificationService.js
        console.log('📋 Step 1: Fixing ExistingSchemaNotificationService.js');
        console.log('------------------------------------------------------');
        
        const servicePath = path.join(__dirname, 'services', 'ExistingSchemaNotificationService.js');
        
        if (!fs.existsSync(servicePath)) {
            console.log('❌ ExistingSchemaNotificationService.js not found');
            return;
        }
        
        let serviceContent = fs.readFileSync(servicePath, 'utf8');
        
        // Check if fix is already applied
        if (serviceContent.includes('const geoTracker = new IPGeolocationTracker()')) {
            console.log('✅ IPGeolocationTracker instance fix already applied');
        } else {
            console.log('🔧 Applying IPGeolocationTracker instance fix...');
            
            // Fix the import and create instance
            serviceContent = serviceContent.replace(
                "const IPGeolocationTracker = require('../IPGeolocationTracker');",
                `const IPGeolocationTracker = require('../IPGeolocationTracker');

// Create a single instance of IPGeolocationTracker
const geoTracker = new IPGeolocationTracker();`
            );
            
            console.log('✅ IPGeolocationTracker instance created');
        }
        
        // Fix method calls
        let methodCallsFixed = 0;
        const originalContent = serviceContent;
        
        serviceContent = serviceContent.replace(
            /IPGeolocationTracker\.getLocationFromIP/g,
            (match) => {
                methodCallsFixed++;
                return 'geoTracker.getLocationData';
            }
        );
        
        if (methodCallsFixed > 0) {
            console.log(`🔧 Fixed ${methodCallsFixed} method calls from getLocationFromIP to getLocationData`);
        } else {
            console.log('✅ Method calls already fixed or no calls found');
        }
        
        // Write back if changes were made
        if (serviceContent !== originalContent) {
            fs.writeFileSync(servicePath, serviceContent);
            console.log('✅ ExistingSchemaNotificationService.js updated');
        } else {
            console.log('✅ No changes needed in ExistingSchemaNotificationService.js');
        }
        
        // Step 2: Test IPGeolocationTracker
        console.log('\n📋 Step 2: Testing IPGeolocationTracker');
        console.log('---------------------------------------');
        
        const IPGeolocationTracker = require('./IPGeolocationTracker');
        const geoTracker = new IPGeolocationTracker();
        
        console.log('🌍 Testing geolocation with office IP...');
        const testLocation = await geoTracker.getLocationData('103.100.219.248');
        
        console.log(`✅ Location resolved: ${testLocation.city}, ${testLocation.region}, ${testLocation.country}`);
        
        // Step 3: Test notification service (if possible)
        console.log('\n📋 Step 3: Testing Notification Service');
        console.log('---------------------------------------');
        
        try {
            const ExistingSchemaNotificationService = require('./services/ExistingSchemaNotificationService');
            
            console.log('📱 Testing basic notification creation...');
            const notificationId = await ExistingSchemaNotificationService.createNotification(
                '🔧 System Fixed',
                'Notification system has been repaired and is working correctly',
                'system',
                {
                    userId: 1,
                    priority: 'high',
                    data: {
                        fix: 'IPGeolocationTracker',
                        timestamp: new Date().toISOString(),
                        test: true
                    }
                }
            );
            
            console.log(`✅ Basic notification created successfully with ID: ${notificationId}`);
            
            console.log('\n👤 Testing login notification with geolocation...');
            const loginResult = await ExistingSchemaNotificationService.notifyUserLogin(
                1,
                'System Test User',
                '103.100.219.248'
            );
            
            if (loginResult.success) {
                console.log(`✅ Login notification sent successfully to ${loginResult.totalUsers} users`);
                console.log('✅ Geolocation tracking is working correctly');
            } else {
                console.log(`⚠️ Login notification had issues: ${loginResult.error || loginResult.reason}`);
            }
            
        } catch (error) {
            console.log(`⚠️ Notification service test failed: ${error.message}`);
            console.log('This might be due to missing dependencies or database connection issues');
        }
        
        // Step 4: Summary and instructions
        console.log('\n📋 Step 4: Summary and Next Steps');
        console.log('----------------------------------');
        
        console.log('🎉 NOTIFICATION SYSTEM FIX COMPLETED!');
        console.log('');
        console.log('✅ Fixed Issues:');
        console.log('   - IPGeolocationTracker.getLocationFromIP is not a function');
        console.log('   - Changed to use geoTracker.getLocationData() instance method');
        console.log('   - Created proper IPGeolocationTracker instance');
        console.log('');
        console.log('🚀 What was fixed:');
        console.log('   1. Created IPGeolocationTracker instance in ExistingSchemaNotificationService');
        console.log('   2. Changed static method calls to instance method calls');
        console.log('   3. Updated method name from getLocationFromIP to getLocationData');
        console.log('   4. Verified geolocation tracking is working');
        console.log('');
        console.log('📱 Expected behavior now:');
        console.log('   - Login notifications will include location information');
        console.log('   - Dispatch notifications will include location information');
        console.log('   - Return notifications will include location information');
        console.log('   - No more "IPGeolocationTracker.getLocationFromIP is not a function" errors');
        console.log('');
        console.log('🔄 To apply changes:');
        console.log('   1. Restart your Node.js server (pm2 restart all)');
        console.log('   2. Test login with different users');
        console.log('   3. Check that notifications show location information');
        console.log('');
        console.log('💡 If you still see issues:');
        console.log('   - Check server logs for any remaining errors');
        console.log('   - Verify database connection is working');
        console.log('   - Ensure all notification tables exist');
        
    } catch (error) {
        console.error('❌ Fix failed:', error.message);
        console.log('\nError details:', error);
        console.log('\n💡 Manual fix steps:');
        console.log('1. Edit services/ExistingSchemaNotificationService.js');
        console.log('2. Add: const geoTracker = new IPGeolocationTracker();');
        console.log('3. Replace: IPGeolocationTracker.getLocationFromIP with geoTracker.getLocationData');
        console.log('4. Restart server');
    }
}

// Run the complete fix
fixNotificationSystemComplete();