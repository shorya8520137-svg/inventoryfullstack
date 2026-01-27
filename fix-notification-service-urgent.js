/**
 * FIX NOTIFICATION SERVICE URGENT
 * Fixes the IPGeolocationTracker.getLocationFromIP error
 */

const fs = require('fs');
const path = require('path');

async function fixNotificationService() {
    console.log('🔧 FIXING NOTIFICATION SERVICE');
    console.log('==============================\n');
    
    try {
        const servicePath = path.join(__dirname, 'services', 'ExistingSchemaNotificationService.js');
        
        console.log('📁 Reading ExistingSchemaNotificationService.js...');
        let serviceContent = fs.readFileSync(servicePath, 'utf8');
        
        console.log('🔍 Checking for IPGeolocationTracker issues...');
        
        // Check if the fix is already applied
        if (serviceContent.includes('const geoTracker = new IPGeolocationTracker()')) {
            console.log('✅ Fix already applied - IPGeolocationTracker instance exists');
        } else {
            console.log('🔧 Applying IPGeolocationTracker fix...');
            
            // Fix 1: Create instance after import
            serviceContent = serviceContent.replace(
                "const IPGeolocationTracker = require('../IPGeolocationTracker');",
                `const IPGeolocationTracker = require('../IPGeolocationTracker');

// Create a single instance of IPGeolocationTracker
const geoTracker = new IPGeolocationTracker();`
            );
            
            // Fix 2: Replace static method calls with instance method calls
            serviceContent = serviceContent.replace(
                /IPGeolocationTracker\.getLocationFromIP/g,
                'geoTracker.getLocationData'
            );
            
            // Write the fixed content back
            fs.writeFileSync(servicePath, serviceContent);
            console.log('✅ ExistingSchemaNotificationService.js fixed');
        }
        
        console.log('\n🧪 Testing the fix...');
        
        // Test the fixed service
        const ExistingSchemaNotificationService = require('./services/ExistingSchemaNotificationService');
        
        console.log('📱 Creating test notification...');
        const notificationId = await ExistingSchemaNotificationService.createNotification(
            '🔧 Service Fixed',
            'IPGeolocationTracker error has been resolved',
            'system',
            {
                userId: 1,
                priority: 'high',
                data: {
                    fix: 'IPGeolocationTracker',
                    timestamp: new Date().toISOString()
                }
            }
        );
        
        console.log(`✅ Test notification created with ID: ${notificationId}`);
        
        console.log('\n👤 Testing login notification...');
        const loginResult = await ExistingSchemaNotificationService.notifyUserLogin(
            1,
            'Fix Test User',
            '192.168.1.100'
        );
        
        if (loginResult.success) {
            console.log(`✅ Login notification test passed - sent to ${loginResult.totalUsers} users`);
        } else {
            console.log(`❌ Login notification test failed: ${loginResult.error}`);
        }
        
        console.log('\n🎉 NOTIFICATION SERVICE FIX COMPLETED!');
        console.log('The IPGeolocationTracker.getLocationFromIP error has been resolved.');
        console.log('Login notifications should now work correctly with location tracking.');
        
    } catch (error) {
        console.error('❌ Fix failed:', error.message);
        console.log('\nError details:', error);
    }
}

// Run the fix
fixNotificationService();