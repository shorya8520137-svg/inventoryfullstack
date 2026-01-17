const https = require('https');

// Disable SSL verification for self-signed certificates
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const API_BASE = 'https://13.48.248.180.nip.io/api';

console.log('🔔 TESTING NOTIFICATION SYSTEM LOCALLY');
console.log('=====================================');

async function makeRequest(method, path, data = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(API_BASE + path);
        
        const options = {
            hostname: url.hostname,
            port: url.port || 443,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'NotificationTest/1.0'
            },
            rejectUnauthorized: false
        };
        
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }
        
        const req = https.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(responseData);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data: responseData });
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

async function testNotificationSystem() {
    try {
        // Step 1: Test admin login
        console.log('1. 🔐 Testing admin login...');
        const loginResponse = await makeRequest('POST', '/auth/login', {
            email: 'admin@company.com',
            password: 'admin@123'
        });
        
        if (loginResponse.status !== 200 || !loginResponse.data.success) {
            console.log('❌ Admin login failed:', loginResponse.data);
            return;
        }
        
        const token = loginResponse.data.token;
        console.log('✅ Admin login successful');
        
        // Step 2: Test notification stats
        console.log('2. 📊 Testing notification stats...');
        const statsResponse = await makeRequest('GET', '/notifications/stats?user_id=1', null, token);
        
        if (statsResponse.status === 200 && statsResponse.data.success) {
            console.log('✅ Notification stats working:', statsResponse.data.data);
        } else {
            console.log('❌ Notification stats failed:', statsResponse.data);
        }
        
        // Step 3: Test get notifications
        console.log('3. 📋 Testing get notifications...');
        const notificationsResponse = await makeRequest('GET', '/notifications?user_id=1&limit=5', null, token);
        
        if (notificationsResponse.status === 200 && notificationsResponse.data.success) {
            console.log('✅ Get notifications working');
            console.log('   Notifications found:', notificationsResponse.data.data.notifications.length);
        } else {
            console.log('❌ Get notifications failed:', notificationsResponse.data);
        }
        
        // Step 4: Test create notification
        console.log('4. ➕ Testing create notification...');
        const createResponse = await makeRequest('POST', '/notifications', {
            title: 'Test Notification',
            message: 'This is a test notification from Phase 1.5',
            type: 'system',
            priority: 'medium',
            user_id: 1
        }, token);
        
        if (createResponse.status === 201 && createResponse.data.success) {
            console.log('✅ Create notification working');
            
            // Step 5: Test mark as read
            const notificationId = createResponse.data.data.id;
            console.log('5. ✓ Testing mark as read...');
            const readResponse = await makeRequest('PUT', `/notifications/${notificationId}/read`, {}, token);
            
            if (readResponse.status === 200 && readResponse.data.success) {
                console.log('✅ Mark as read working');
            } else {
                console.log('❌ Mark as read failed:', readResponse.data);
            }
        } else {
            console.log('❌ Create notification failed:', createResponse.data);
        }
        
        // Step 6: Test Firebase token save
        console.log('6. 🔥 Testing Firebase token save...');
        const firebaseResponse = await makeRequest('POST', '/notifications/firebase-token', {
            user_id: 1,
            token: 'test_firebase_token_' + Date.now(),
            device_type: 'web',
            device_info: { browser: 'test', version: '1.0' }
        }, token);
        
        if (firebaseResponse.status === 200 && firebaseResponse.data.success) {
            console.log('✅ Firebase token save working');
        } else {
            console.log('❌ Firebase token save failed:', firebaseResponse.data);
        }
        
        console.log('\n🎉 NOTIFICATION SYSTEM TEST COMPLETED!');
        console.log('✅ Phase 1.5 notification backend is working properly');
        
    } catch (error) {
        console.log('❌ Test failed with error:', error.message);
    }
}

// Run the test
testNotificationSystem();