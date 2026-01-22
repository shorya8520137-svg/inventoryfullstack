// Complete notification flow test
// Test Flow: Create user nagdev -> Give admin permissions -> Login -> Create dispatch -> Logout -> Check notifications
const https = require('https');

// Ignore SSL certificate issues for testing
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const API_BASE = 'https://16.171.196.15.nip.io';

let authToken = null;
let nagdevUserId = null;

const apiRequest = async (endpoint, options = {}) => {
    return new Promise((resolve, reject) => {
        const url = `${API_BASE}${endpoint}`;
        const requestOptions = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
                ...options.headers
            },
            rejectUnauthorized: false
        };

        const req = https.request(url, requestOptions, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ status: res.statusCode, data: jsonData });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', (error) => {
            console.error(`❌ Request error for ${endpoint}:`, error.message);
            reject(error);
        });
        
        if (options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
};

const testCompleteNotificationFlow = async () => {
    console.log('🧪 Testing Complete Notification Flow...');
    console.log('=====================================');
    console.log(`🎯 Target Server: ${API_BASE}`);
    console.log('');
    
    try {
        // Step 1: Create user nagdev
        console.log('\n� Step 1: Creating user "nagdev"...');
        const createUserResponse = await apiRequest('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                name: 'Nag Dev',
                email: 'nagdev@test.com',
                password: 'nagdev123',
                role: 'admin'
            })
        });
        
        console.log(`Create User Response: ${createUserResponse.status}`);
        if (createUserResponse.status === 201 || createUserResponse.status === 200) {
            console.log('✅ User nagdev created successfully');
            nagdevUserId = createUserResponse.data.user?.id || createUserResponse.data.id;
        } else if (createUserResponse.status === 400 && createUserResponse.data.message?.includes('already exists')) {
            console.log('ℹ️  User nagdev already exists, continuing...');
        } else {
            console.log('❌ Failed to create user:', createUserResponse.data);
        }

        // Step 2: Login as nagdev (should trigger login notification)
        console.log('\n🔐 Step 2: Login as nagdev (should trigger login notification)...');
        const loginResponse = await apiRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email: 'nagdev@test.com',
                password: 'nagdev123'
            })
        });
        
        console.log(`Login Response: ${loginResponse.status}`);
        if (loginResponse.status === 200) {
            authToken = loginResponse.data.token;
            nagdevUserId = loginResponse.data.user?.id || nagdevUserId;
            console.log('✅ Login successful - should have triggered login notification');
            console.log(`User ID: ${nagdevUserId}`);
        } else {
            console.log('❌ Login failed:', loginResponse.data);
            return;
        }

        // Wait a moment for notification to be processed
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 3: Create a dispatch (should trigger dispatch notification)
        console.log('\n📦 Step 3: Creating dispatch (should trigger dispatch notification)...');
        const dispatchData = {
            product_name: 'Test Product for Nagdev',
            quantity: 5,
            warehouse: 'Main Warehouse',
            destination: 'Test Destination',
            notes: 'Test dispatch created by nagdev for notification testing'
        };
        
        const dispatchResponse = await apiRequest('/api/dispatch', {
            method: 'POST',
            body: JSON.stringify(dispatchData)
        });
        
        console.log(`Dispatch Response: ${dispatchResponse.status}`);
        if (dispatchResponse.status === 201 || dispatchResponse.status === 200) {
            console.log('✅ Dispatch created successfully - should have triggered dispatch notification');
            console.log(`Dispatch ID: ${dispatchResponse.data.id || 'Unknown'}`);
        } else {
            console.log('⚠️  Dispatch creation status:', dispatchResponse.status);
            console.log('Response:', dispatchResponse.data);
        }

        // Wait a moment for notification to be processed
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 4: Logout (should trigger logout notification)
        console.log('\n🚪 Step 4: Logout nagdev (should trigger logout notification)...');
        const logoutResponse = await apiRequest('/api/auth/logout', {
            method: 'POST'
        });
        
        console.log(`Logout Response: ${logoutResponse.status}`);
        if (logoutResponse.status === 200) {
            console.log('✅ Logout successful - should have triggered logout notification');
        } else {
            console.log('⚠️  Logout status:', logoutResponse.status);
        }

        // Clear auth token after logout
        authToken = null;

        // Wait a moment for notification to be processed
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Step 5: Login again to check notifications
        console.log('\n🔐 Step 5: Login again to check notifications...');
        const loginAgainResponse = await apiRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email: 'nagdev@test.com',
                password: 'nagdev123'
            })
        });
        
        if (loginAgainResponse.status === 200) {
            authToken = loginAgainResponse.data.token;
            console.log('✅ Logged in again to check notifications');
        }

        // Step 6: Check notification stats
        console.log('\n📊 Step 6: Checking notification stats...');
        const statsResponse = await apiRequest(`/api/notifications/stats?user_id=${nagdevUserId}`);
        
        console.log(`Stats Response: ${statsResponse.status}`);
        if (statsResponse.status === 200) {
            console.log('✅ Notification stats retrieved:');
            console.log(`  Total notifications: ${statsResponse.data.total || 0}`);
            console.log(`  Unread notifications: ${statsResponse.data.unread || 0}`);
            console.log(`  Login notifications: ${statsResponse.data.login_count || 0}`);
            console.log(`  Dispatch notifications: ${statsResponse.data.dispatch_count || 0}`);
        } else {
            console.log('⚠️  Stats check status:', statsResponse.status);
        }

        // Step 7: Get recent notifications
        console.log('\n📋 Step 7: Getting recent notifications...');
        const notificationsResponse = await apiRequest(`/api/notifications?user_id=${nagdevUserId}&limit=10`);
        
        console.log(`Notifications Response: ${notificationsResponse.status}`);
        if (notificationsResponse.status === 200) {
            const notifications = notificationsResponse.data.notifications || [];
            console.log(`✅ Retrieved ${notifications.length} notifications:`);
            
            notifications.forEach((notif, index) => {
                console.log(`  ${index + 1}. [${notif.type}] ${notif.title}`);
                console.log(`     Message: ${notif.message}`);
                console.log(`     Priority: ${notif.priority}`);
                console.log(`     Created: ${notif.created_at}`);
                console.log(`     Read: ${notif.is_read ? 'Yes' : 'No'}`);
                console.log('');
            });
        } else {
            console.log('⚠️  Notifications check status:', notificationsResponse.status);
        }

        // Step 8: Test notification triggers manually
        console.log('\n🧪 Step 8: Testing notification triggers manually...');
        
        // Test dispatch notification trigger
        const testDispatchNotif = await apiRequest('/api/notifications/test/dispatch', {
            method: 'POST'
        });
        console.log(`Test Dispatch Notification: ${testDispatchNotif.status}`);
        
        // Test status change notification trigger
        const testStatusNotif = await apiRequest('/api/notifications/test/status-change', {
            method: 'POST'
        });
        console.log(`Test Status Change Notification: ${testStatusNotif.status}`);

        // Final stats check
        console.log('\n📊 Final: Checking final notification stats...');
        const finalStatsResponse = await apiRequest(`/api/notifications/stats?user_id=${nagdevUserId}`);
        
        if (finalStatsResponse.status === 200) {
            console.log('✅ Final notification stats:');
            console.log(`  Total notifications: ${finalStatsResponse.data.total || 0}`);
            console.log(`  Unread notifications: ${finalStatsResponse.data.unread || 0}`);
        }

        console.log('\n🎉 COMPLETE NOTIFICATION FLOW TEST FINISHED!');
        console.log('===============================================');
        console.log('Expected notifications created:');
        console.log('1. User login notification (when nagdev logged in)');
        console.log('2. Dispatch notification (when dispatch was created)');
        console.log('3. User logout notification (when nagdev logged out)');
        console.log('4. Additional test notifications from manual triggers');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
};

// Run the complete test
testCompleteNotificationFlow();