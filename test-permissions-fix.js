const https = require('https');

// Ignore SSL certificate errors for testing
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const API_BASE = 'https://13.48.248.180.nip.io/api';

async function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });
        
        req.on('error', reject);
        
        if (options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
}

async function testPermissionsFix() {
    console.log('🧪 TESTING PERMISSIONS FIX FOR TEST USER');
    console.log('==========================================');
    
    try {
        // Step 1: Login with test user
        console.log('🔐 Logging in with test user...');
        const loginResponse = await makeRequest(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'tetstetstestdt@company.com',
                password: 'gfx998sd'
            })
        });
        
        console.log(`Login Status: ${loginResponse.status}`);
        
        if (loginResponse.status !== 200 || !loginResponse.data.success) {
            console.log('❌ Login failed:', loginResponse.data);
            return;
        }
        
        const token = loginResponse.data.token;
        const user = loginResponse.data.user;
        
        console.log('✅ Login successful!');
        console.log(`User: ${user.name} (${user.email})`);
        console.log(`Role: ${user.role}`);
        console.log(`Permissions: ${user.permissions.join(', ')}`);
        console.log(`Token: ${token.substring(0, 20)}...`);
        
        // Step 2: Test inventory API
        console.log('\n📦 Testing inventory API...');
        const inventoryResponse = await makeRequest(`${API_BASE}/inventory?limit=5`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`Inventory API Status: ${inventoryResponse.status}`);
        
        if (inventoryResponse.status === 200 && inventoryResponse.data.success) {
            console.log('✅ SUCCESS: Test user can now access inventory API!');
            console.log(`Inventory items returned: ${inventoryResponse.data.data ? inventoryResponse.data.data.length : 0}`);
        } else {
            console.log('❌ FAILED: Test user still cannot access inventory API');
            console.log('Response:', inventoryResponse.data);
        }
        
        // Step 3: Test notification API (should still work)
        console.log('\n🔔 Testing notification API...');
        const notificationResponse = await makeRequest(`${API_BASE}/notifications/stats?user_id=${user.id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`Notification API Status: ${notificationResponse.status}`);
        
        if (notificationResponse.status === 200 && notificationResponse.data.success) {
            console.log('✅ Notification API still working');
            console.log(`Notification stats:`, notificationResponse.data.data);
        } else {
            console.log('⚠️ Notification API issue:', notificationResponse.data);
        }
        
        console.log('\n🎉 PERMISSIONS FIX TEST COMPLETE!');
        
    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
    }
}

testPermissionsFix();