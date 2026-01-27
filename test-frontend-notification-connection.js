/**
 * TEST FRONTEND NOTIFICATION CONNECTION
 * Test if frontend can connect to backend notification API
 */

const API_BASE = 'https://16.171.141.4.nip.io';

async function testNotificationAPI() {
    console.log('🔍 Testing Frontend → Backend Notification Connection');
    console.log(`📡 API Base: ${API_BASE}`);
    
    try {
        // Test 1: Login to get token
        console.log('\n1️⃣ Testing Login...');
        const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@company.com',
                password: 'admin@123'
            })
        });
        
        if (!loginResponse.ok) {
            throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
        }
        
        const loginData = await loginResponse.json();
        console.log('✅ Login successful');
        console.log(`👤 User: ${loginData.user.name}`);
        
        const token = loginData.token;
        
        // Test 2: Fetch notifications
        console.log('\n2️⃣ Testing Notifications API...');
        const notificationResponse = await fetch(`${API_BASE}/api/notifications`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!notificationResponse.ok) {
            throw new Error(`Notifications API failed: ${notificationResponse.status} ${notificationResponse.statusText}`);
        }
        
        const notificationData = await notificationResponse.json();
        console.log('✅ Notifications API working');
        console.log(`📱 Total notifications: ${notificationData.data.notifications.length}`);
        console.log(`🔔 Unread count: ${notificationData.data.unreadCount}`);
        
        // Show recent notifications
        if (notificationData.data.notifications.length > 0) {
            console.log('\n📋 Recent Notifications:');
            notificationData.data.notifications.slice(0, 3).forEach((notif, index) => {
                console.log(`${index + 1}. ${notif.title} - ${notif.message}`);
                console.log(`   📅 ${new Date(notif.created_at).toLocaleString()}`);
                console.log(`   👁️ Read: ${notif.is_read ? 'Yes' : 'No'}`);
            });
        }
        
        console.log('\n🎉 Frontend → Backend connection test PASSED!');
        console.log('💡 The frontend should now be able to connect to the backend');
        
    } catch (error) {
        console.error('\n❌ Connection test FAILED:', error.message);
        console.log('\n🔧 Troubleshooting steps:');
        console.log('1. Check if backend is running at https://16.171.141.4.nip.io');
        console.log('2. Verify CORS settings allow frontend domain');
        console.log('3. Check if .env.local is properly loaded in frontend');
        console.log('4. Try rebuilding frontend: npm run build');
    }
}

// Run the test
testNotificationAPI();