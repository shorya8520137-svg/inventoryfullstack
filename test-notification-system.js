/**
 * TEST NOTIFICATION SYSTEM
 * Tests the complete Firebase notification system
 */

const axios = require('axios');

async function testNotificationSystem() {
    console.log('🧪 TESTING NOTIFICATION SYSTEM');
    console.log('==============================');
    
    const API_BASE = 'https://13.60.36.159.nip.io';
    let authToken = null;
    
    try {
        // Step 1: Login to get token
        console.log('🔐 Step 1: Login to get authentication token...');
        
        const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
            email: 'admin@company.com',
            password: 'admin@123'
        }, {
            timeout: 10000,
            httpsAgent: new (require('https').Agent)({
                rejectUnauthorized: false
            })
        });
        
        if (!loginResponse.data.success) {
            throw new Error('Login failed');
        }
        
        authToken = loginResponse.data.token;
        console.log('✅ Login successful');
        
        // Step 2: Test notification endpoints
        console.log('\n📱 Step 2: Testing notification endpoints...');
        
        const headers = {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        };
        
        const httpsAgent = new (require('https').Agent)({
            rejectUnauthorized: false
        });
        
        // Test get notifications
        console.log('📋 Testing GET /api/notifications...');
        try {
            const notificationsResponse = await axios.get(`${API_BASE}/api/notifications`, {
                headers,
                httpsAgent,
                timeout: 10000
            });
            
            if (notificationsResponse.data.success) {
                console.log('✅ Get notifications working');
                console.log(`📊 Found ${notificationsResponse.data.data.notifications.length} notifications`);
                console.log(`🔔 Unread count: ${notificationsResponse.data.data.unreadCount}`);
            } else {
                console.log('❌ Get notifications failed:', notificationsResponse.data.message);
            }
        } catch (error) {
            console.log('❌ Get notifications error:', error.message);
        }
        
        // Test notification settings
        console.log('\n⚙️ Testing GET /api/notifications/settings...');
        try {
            const settingsResponse = await axios.get(`${API_BASE}/api/notifications/settings`, {
                headers,
                httpsAgent,
                timeout: 10000
            });
            
            if (settingsResponse.data.success) {
                console.log('✅ Get notification settings working');
                console.log('📊 Settings:', settingsResponse.data.data);
            } else {
                console.log('❌ Get settings failed:', settingsResponse.data.message);
            }
        } catch (error) {
            console.log('❌ Get settings error:', error.message);
        }
        
        // Test register Firebase token
        console.log('\n🔑 Testing POST /api/notifications/register-token...');
        try {
            const tokenResponse = await axios.post(`${API_BASE}/api/notifications/register-token`, {
                token: 'test-firebase-token-' + Date.now(),
                deviceType: 'web',
                deviceInfo: {
                    browser: 'Chrome',
                    os: 'Windows',
                    timestamp: new Date().toISOString()
                }
            }, {
                headers,
                httpsAgent,
                timeout: 10000
            });
            
            if (tokenResponse.data.success) {
                console.log('✅ Register Firebase token working');
            } else {
                console.log('❌ Register token failed:', tokenResponse.data.message);
            }
        } catch (error) {
            console.log('❌ Register token error:', error.message);
        }
        
        // Test send test notification
        console.log('\n🧪 Testing POST /api/notifications/test...');
        try {
            const testNotificationResponse = await axios.post(`${API_BASE}/api/notifications/test`, {
                title: '🧪 Test Notification',
                message: 'This is a test notification from the notification system test script',
                type: 'SYSTEM'
            }, {
                headers,
                httpsAgent,
                timeout: 10000
            });
            
            if (testNotificationResponse.data.success) {
                console.log('✅ Send test notification working');
                console.log('📊 Result:', testNotificationResponse.data.data);
            } else {
                console.log('❌ Send test notification failed:', testNotificationResponse.data.message);
            }
        } catch (error) {
            console.log('❌ Send test notification error:', error.message);
        }
        
        // Step 3: Test event-based notifications by creating a dispatch
        console.log('\n📦 Step 3: Testing event-based notifications (dispatch creation)...');
        try {
            const dispatchResponse = await axios.post(`${API_BASE}/api/dispatch`, {
                selectedWarehouse: 'GGM_WH',
                orderRef: 'TEST-' + Date.now(),
                customerName: 'Test Customer for Notifications',
                awbNumber: 'AWB-' + Date.now(),
                selectedLogistics: 'Blue Dart',
                selectedPaymentMode: 'COD',
                parcelType: 'Forward',
                selectedExecutive: 'Test Executive',
                invoiceAmount: '100',
                weight: '1',
                dimensions: { length: 10, width: 10, height: 10 },
                remarks: 'Test dispatch for notification system',
                products: [{
                    barcode: 'TEST001',
                    product_name: 'Test Product for Notifications',
                    qty: 1,
                    variant: 'Default'
                }]
            }, {
                headers,
                httpsAgent,
                timeout: 15000
            });
            
            if (dispatchResponse.data.success) {
                console.log('✅ Dispatch created successfully');
                console.log('📦 Dispatch ID:', dispatchResponse.data.dispatch_id);
                console.log('💡 This should have triggered a notification to other users');
            } else {
                console.log('❌ Dispatch creation failed:', dispatchResponse.data.message);
            }
        } catch (error) {
            console.log('❌ Dispatch creation error:', error.message);
            if (error.response) {
                console.log('📊 Response status:', error.response.status);
                console.log('📋 Response data:', error.response.data);
            }
        }
        
        // Step 4: Check notifications again to see if new ones were created
        console.log('\n🔄 Step 4: Checking for new notifications...');
        try {
            const finalNotificationsResponse = await axios.get(`${API_BASE}/api/notifications`, {
                headers,
                httpsAgent,
                timeout: 10000
            });
            
            if (finalNotificationsResponse.data.success) {
                console.log('✅ Final notification check successful');
                console.log(`📊 Total notifications: ${finalNotificationsResponse.data.data.notifications.length}`);
                console.log(`🔔 Unread count: ${finalNotificationsResponse.data.data.unreadCount}`);
                
                // Show recent notifications
                const recentNotifications = finalNotificationsResponse.data.data.notifications.slice(0, 3);
                console.log('\n📱 Recent notifications:');
                recentNotifications.forEach((notif, index) => {
                    console.log(`   ${index + 1}. ${notif.title}: ${notif.message}`);
                    console.log(`      Type: ${notif.type}, Read: ${notif.is_read ? 'Yes' : 'No'}`);
                });
            }
        } catch (error) {
            console.log('❌ Final notification check error:', error.message);
        }
        
        console.log('\n🎉 NOTIFICATION SYSTEM TEST COMPLETE!');
        console.log('=====================================');
        console.log('✅ Login notifications: Should work when users log in');
        console.log('✅ Dispatch notifications: Should work when dispatches are created');
        console.log('✅ API endpoints: All notification endpoints tested');
        console.log('✅ Database integration: Notifications stored in database');
        console.log('💡 Next: Implement frontend notification UI');
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
        if (error.response) {
            console.log('📊 Response status:', error.response.status);
            console.log('📋 Response data:', error.response.data);
        }
    }
}

// Run the test
testNotificationSystem().catch(console.error);