const axios = require('axios');
const https = require('https');

// Ignore SSL certificate errors for testing
const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});

const API_BASE = 'https://16.171.197.86.nip.io';

async function testShoryaLogin() {
    console.log('🧪 Testing Shorya Login and Permissions...\n');

    try {
        // Test login
        console.log('1. Testing login...');
        const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
            email: 'shorya@company.com',
            password: 'shorya123'
        }, { httpsAgent });

        if (!loginResponse.data.success) {
            console.error('❌ Login failed:', loginResponse.data.message);
            return;
        }

        const token = loginResponse.data.token;
        const user = loginResponse.data.user;
        
        console.log('✅ Login successful!');
        console.log(`   User: ${user.name} (${user.email})`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Permissions: ${user.permissions.length} total`);
        console.log(`   Permissions: ${user.permissions.join(', ')}`);

        // Test API access
        console.log('\n2. Testing API access...');
        
        const testEndpoints = [
            { path: '/api/inventory', name: 'Inventory View' },
            { path: '/api/dispatch', name: 'Dispatch View' },
            { path: '/api/order-tracking', name: 'Order Tracking' }
        ];

        for (const endpoint of testEndpoints) {
            try {
                const response = await axios.get(`${API_BASE}${endpoint.path}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    httpsAgent
                });
                console.log(`✅ ${endpoint.name}: SUCCESS (${response.status})`);
            } catch (error) {
                console.log(`❌ ${endpoint.name}: FAILED (${error.response?.status}) - ${error.response?.data?.message || error.message}`);
            }
        }

        console.log('\n🎉 SHORYA LOGIN TEST COMPLETE!');
        console.log('\n📋 MANUAL FRONTEND TEST:');
        console.log('1. Go to: https://16.171.197.86.nip.io/login');
        console.log('2. Login: shorya@company.com / shorya123');
        console.log('3. Navigate to different tabs and test functionality');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testShoryaLogin();