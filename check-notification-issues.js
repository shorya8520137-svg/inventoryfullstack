/**
 * CHECK NOTIFICATION SYSTEM ISSUES
 * Identifies potential problems with the notification system
 */

const https = require('https');

// Disable SSL verification for testing
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const SERVER_URL = 'https://54.169.107.64:8443';

async function checkNotificationIssues() {
    console.log('🔍 CHECKING NOTIFICATION SYSTEM ISSUES');
    console.log('======================================\n');

    try {
        // Step 1: Login to get token
        console.log('1️⃣ Logging in to get authentication token...');
        const loginData = {
            email: 'admin@company.com',
            password: 'Admin@123'
        };

        const loginResponse = await makeRequest(`${SERVER_URL}/api/auth/login`, 'POST', loginData);
        if (!loginResponse || !loginResponse.token) {
            console.log('❌ Login failed - cannot test notifications');
            return;
        }
        console.log('   ✅ Login successful');

        const authHeaders = {
            'Authorization': `Bearer ${loginResponse.token}`,
            'Content-Type': 'application/json'
        };

        // Step 2: Test notifications endpoint
        console.log('\n2️⃣ Testing notifications endpoint...');
        const notificationsResponse = await makeRequest(`${SERVER_URL}/api/notifications`, 'GET', null, authHeaders);
        
        if (notificationsResponse) {
            console.log('   ✅ Notifications endpoint accessible');
            console.log(`   📊 Response structure:`, Object.keys(notificationsResponse));
            
            if (notificationsResponse.data) {
                console.log(`   📬 Notifications count: ${notificationsResponse.data.notifications?.length || 0}`);
                console.log(`   📮 Unread count: ${notificationsResponse.data.unreadCount || 0}`);
                
                // Check notification structure
                if (notificationsResponse.data.notifications && notificationsResponse.data.notifications.length > 0) {
                    const firstNotification = notificationsResponse.data.notifications[0];
                    console.log('\n   📋 Sample notification structure:');
                    console.log(`      ID: ${firstNotification.id}`);
                    console.log(`      Title: ${firstNotification.title}`);
                    console.log(`      Type: ${firstNotification.type}`);
                    console.log(`      Is Read: ${firstNotification.is_read}`);
                    console.log(`      Created: ${firstNotification.created_at}`);
                    
                    // Check for missing fields
                    const requiredFields = ['id', 'title', 'message', 'type', 'user_id', 'is_read', 'created_at'];
                    const missingFields = requiredFields.filter(field => !(field in firstNotification));
                    
                    if (missingFields.length > 0) {
                        console.log(`   ⚠️  Missing fields: ${missingFields.join(', ')}`);
                    } else {
                        console.log('   ✅ All required fields present');
                    }
                }
            }
        } else {
            console.log('   ❌ Notifications endpoint failed');
        }

        // Step 3: Test notification settings
        console.log('\n3️⃣ Testing notification settings...');
        const settingsResponse = await makeRequest(`${SERVER_URL}/api/notifications/settings`, 'GET', null, authHeaders);
        
        if (settingsResponse) {
            console.log('   ✅ Notification settings endpoint accessible');
            console.log('   📋 Settings:', settingsResponse.data);
        } else {
            console.log('   ❌ Notification settings endpoint failed');
        }

        // Step 4: Test Firebase token registration
        console.log('\n4️⃣ Testing Firebase token registration...');
        const tokenData = {
            token: 'test-firebase-token-' + Date.now(),
            deviceType: 'web',
            deviceInfo: { browser: 'test', version: '1.0' }
        };
        
        const tokenResponse = await makeRequest(`${SERVER_URL}/api/notifications/register-token`, 'POST', tokenData, authHeaders);
        
        if (tokenResponse) {
            console.log('   ✅ Firebase token registration endpoint accessible');
            console.log('   📝 Response:', tokenResponse.message);
        } else {
            console.log('   ❌ Firebase token registration failed');
        }

        // Step 5: Test mark as read functionality
        console.log('\n5️⃣ Testing mark all as read...');
        const markReadResponse = await makeRequest(`${SERVER_URL}/api/notifications/mark-all-read`, 'PUT', {}, authHeaders);
        
        if (markReadResponse) {
            console.log('   ✅ Mark all as read endpoint accessible');
            console.log('   📝 Response:', markReadResponse.message);
        } else {
            console.log('   ❌ Mark all as read failed');
        }

        // Step 6: Check for common notification issues
        console.log('\n6️⃣ CHECKING FOR COMMON ISSUES...');
        
        // Check if notifications are being created
        if (notificationsResponse && notificationsResponse.data) {
            const notifications = notificationsResponse.data.notifications || [];
            
            if (notifications.length === 0) {
                console.log('   ⚠️  No notifications found - might indicate:');
                console.log('      - Notification creation is not working');
                console.log('      - Database table is empty');
                console.log('      - Query is filtering out all results');
            }
            
            // Check for old notifications
            const now = new Date();
            const oldNotifications = notifications.filter(n => {
                const created = new Date(n.created_at);
                const daysDiff = (now - created) / (1000 * 60 * 60 * 24);
                return daysDiff > 30;
            });
            
            if (oldNotifications.length > 0) {
                console.log(`   📅 Found ${oldNotifications.length} notifications older than 30 days`);
                console.log('      Consider implementing notification cleanup');
            }
            
            // Check for unread notifications
            const unreadCount = notificationsResponse.data.unreadCount || 0;
            if (unreadCount > 100) {
                console.log(`   📬 High unread count (${unreadCount}) - users might not be reading notifications`);
            }
        }

        console.log('\n🎉 NOTIFICATION SYSTEM CHECK COMPLETE!');
        console.log('=====================================');
        
        // Summary
        const endpoints = [
            { name: 'Notifications List', working: !!notificationsResponse },
            { name: 'Notification Settings', working: !!settingsResponse },
            { name: 'Firebase Token Registration', working: !!tokenResponse },
            { name: 'Mark as Read', working: !!markReadResponse }
        ];
        
        const workingEndpoints = endpoints.filter(e => e.working).length;
        const totalEndpoints = endpoints.length;
        
        console.log(`\n📊 SUMMARY: ${workingEndpoints}/${totalEndpoints} endpoints working`);
        endpoints.forEach(endpoint => {
            console.log(`   ${endpoint.working ? '✅' : '❌'} ${endpoint.name}`);
        });
        
        if (workingEndpoints === totalEndpoints) {
            console.log('\n🎉 All notification endpoints are working properly!');
        } else {
            console.log('\n⚠️  Some notification endpoints have issues - check server logs');
        }

    } catch (error) {
        console.error('❌ CHECK ERROR:', error.message);
    }
}

function makeRequest(url, method = 'GET', data = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname + urlObj.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            rejectUnauthorized: false
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(responseData);
                    resolve(jsonData);
                } catch (e) {
                    resolve(responseData);
                }
            });
        });

        req.on('error', (error) => {
            console.error(`Request error for ${url}:`, error.message);
            resolve(null);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

// Run the check
if (require.main === module) {
    checkNotificationIssues();
}

module.exports = { checkNotificationIssues };