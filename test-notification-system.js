const axios = require('axios');

const API_BASE = 'https://13.48.248.180.nip.io';

async function testNotificationSystem() {
    try {
        console.log('🔔 TESTING NOTIFICATION SYSTEM');
        console.log('==============================');
        
        // Step 1: Login to get token
        console.log('1. 🔐 Logging in as admin...');
        const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
            email: 'admin@company.com',
            password: 'admin@123'
        }, {
            httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
        });
        
        if (!loginResponse.data.success) {
            throw new Error('Login failed');
        }
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful');
        
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        
        const axiosConfig = {
            headers,
            httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
        };
        
        // Step 2: Get notification stats
        console.log('\n2. 📊 Getting notification stats...');
        const statsResponse = await axios.get(`${API_BASE}/api/notifications/stats?user_id=1`, axiosConfig);
        console.log('✅ Stats:', statsResponse.data.data);
        
        // Step 3: Get existing notifications
        console.log('\n3. 📋 Getting existing notifications...');
        const notificationsResponse = await axios.get(`${API_BASE}/api/notifications?user_id=1&limit=5`, axiosConfig);
        console.log('✅ Notifications:', notificationsResponse.data.data.notifications.length, 'found');
        
        // Step 4: Test dispatch notification
        console.log('\n4. 🚚 Testing dispatch notification...');
        const dispatchTestResponse = await axios.post(`${API_BASE}/api/notifications/test/dispatch`, {}, axiosConfig);
        console.log('✅ Dispatch notification:', dispatchTestResponse.data.message);
        
        // Step 5: Test return notification
        console.log('\n5. 📦 Testing return notification...');
        const returnTestResponse = await axios.post(`${API_BASE}/api/notifications/test/return`, {}, axiosConfig);
        console.log('✅ Return notification:', returnTestResponse.data.message);
        
        // Step 6: Test status change notification
        console.log('\n6. 🔄 Testing status change notification...');
        const statusTestResponse = await axios.post(`${API_BASE}/api/notifications/test/status-change`, {}, axiosConfig);
        console.log('✅ Status change notification:', statusTestResponse.data.message);
        
        // Step 7: Test data insert notification
        console.log('\n7. 📝 Testing data insert notification...');
        const dataInsertTestResponse = await axios.post(`${API_BASE}/api/notifications/test/data-insert`, {}, axiosConfig);
        console.log('✅ Data insert notification:', dataInsertTestResponse.data.message);
        
        // Step 8: Create custom notification
        console.log('\n8. ✨ Creating custom notification...');
        const customNotificationResponse = await axios.post(`${API_BASE}/api/notifications`, {
            title: 'Test Custom Notification',
            message: 'This is a test notification created via API',
            type: 'system',
            priority: 'high',
            data: {
                test: true,
                timestamp: new Date().toISOString()
            }
        }, axiosConfig);
        console.log('✅ Custom notification created:', customNotificationResponse.data.data.id);
        
        // Step 9: Get updated notifications
        console.log('\n9. 📋 Getting updated notifications...');
        const updatedNotificationsResponse = await axios.get(`${API_BASE}/api/notifications?user_id=1&limit=10`, axiosConfig);
        console.log('✅ Updated notifications:', updatedNotificationsResponse.data.data.notifications.length, 'found');
        
        // Show recent notifications
        console.log('\n📋 Recent Notifications:');
        updatedNotificationsResponse.data.data.notifications.slice(0, 5).forEach((notif, index) => {
            console.log(`${index + 1}. [${notif.type.toUpperCase()}] ${notif.title} - ${notif.message}`);
        });
        
        // Step 10: Mark first notification as read
        if (updatedNotificationsResponse.data.data.notifications.length > 0) {
            const firstNotificationId = updatedNotificationsResponse.data.data.notifications[0].id;
            console.log(`\n10. ✅ Marking notification ${firstNotificationId} as read...`);
            const markReadResponse = await axios.put(`${API_BASE}/api/notifications/${firstNotificationId}/read`, {}, axiosConfig);
            console.log('✅ Marked as read:', markReadResponse.data.message);
        }
        
        // Step 11: Get final stats
        console.log('\n11. 📊 Getting final stats...');
        const finalStatsResponse = await axios.get(`${API_BASE}/api/notifications/stats?user_id=1`, axiosConfig);
        console.log('✅ Final stats:', finalStatsResponse.data.data);
        
        // Step 12: Test Firebase token save
        console.log('\n12. 📱 Testing Firebase token save...');
        const firebaseTokenResponse = await axios.post(`${API_BASE}/api/notifications/firebase-token`, {
            user_id: 1,
            token: 'test-firebase-token-' + Date.now(),
            device_type: 'web',
            device_info: {
                browser: 'Chrome',
                os: 'Windows',
                version: '1.0.0'
            }
        }, axiosConfig);
        console.log('✅ Firebase token saved:', firebaseTokenResponse.data.message);
        
        console.log('\n🎉 NOTIFICATION SYSTEM TEST COMPLETED SUCCESSFULLY!');
        console.log('=====================================');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        if (error.response?.data) {
            console.error('📋 Full error:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

// Run the test
testNotificationSystem();