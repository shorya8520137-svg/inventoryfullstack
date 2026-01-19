// QUICK NOTIFICATION API TEST
// Run this to test all notification endpoints

const https = require('https');
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const API_BASE = 'https://13.48.248.180.nip.io/api';
const LOGIN_EMAIL = 'tetstetstestdt@company.com';
const LOGIN_PASSWORD = 'gfx998sd';

console.log('🔔 NOTIFICATION API TEST');
console.log('=======================');

async function makeRequest(method, endpoint, data = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = `${API_BASE}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };
        
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }
        
        const req = https.request(url, options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(responseData);
                    resolve({
                        status: res.statusCode,
                        data: parsed
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: responseData
                    });
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

async function testNotificationAPI() {
    try {
        // 1. Login to get token
        console.log('🔐 Step 1: Login...');
        const loginResponse = await makeRequest('POST', '/auth/login', {
            email: LOGIN_EMAIL,
            password: LOGIN_PASSWORD
        });
        
        if (loginResponse.status !== 200) {
            console.log('❌ Login failed:', loginResponse.data);
            return;
        }
        
        const token = loginResponse.data.token;
        const userId = loginResponse.data.user.id;
        console.log(`✅ Login successful - User ID: ${userId}`);
        
        // 2. Test notification stats
        console.log('\n📊 Step 2: Get notification stats...');
        const statsResponse = await makeRequest('GET', `/notifications/stats?user_id=${userId}`, null, token);
        console.log(`Status: ${statsResponse.status}`);
        if (statsResponse.status === 200) {
            console.log('✅ Stats:', JSON.stringify(statsResponse.data.data, null, 2));
        } else {
            console.log('❌ Stats failed:', statsResponse.data);
        }
        
        // 3. Test get notifications
        console.log('\n📋 Step 3: Get notifications...');
        const notifResponse = await makeRequest('GET', `/notifications?page=1&limit=5&user_id=${userId}`, null, token);
        console.log(`Status: ${notifResponse.status}`);
        if (notifResponse.status === 200) {
            const notifications = notifResponse.data.data.notifications || [];
            console.log(`✅ Found ${notifications.length} notifications:`);
            notifications.forEach((notif, index) => {
                console.log(`  ${index + 1}. ${notif.title} (${notif.type}) - ${notif.is_read ? 'Read' : 'Unread'}`);
            });
        } else {
            console.log('❌ Get notifications failed:', notifResponse.data);
        }
        
        // 4. Test create notification
        console.log('\n➕ Step 4: Create test notification...');
        const createResponse = await makeRequest('POST', '/notifications', {
            title: 'API Test Notification',
            message: 'This notification was created via API test',
            type: 'system',
            priority: 'medium',
            user_id: userId
        }, token);
        console.log(`Status: ${createResponse.status}`);
        if (createResponse.status === 201 || createResponse.status === 200) {
            console.log('✅ Notification created successfully');
        } else {
            console.log('❌ Create notification failed:', createResponse.data);
        }
        
        console.log('\n🎉 Test completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testNotificationAPI();