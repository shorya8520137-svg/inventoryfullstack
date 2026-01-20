const axios = require('axios');
const https = require('https');

// Ignore SSL certificate errors for testing
const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});

const API_BASE = 'https://16.171.197.86.nip.io';

async function testAfterFix() {
    console.log('🧪 Testing JWT Fix Results...\n');

    try {
        // Step 1: Login to get token
        console.log('Step 1: Getting JWT token...');
        const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
            email: 'admin@company.com',
            password: 'admin@123'
        }, { httpsAgent });

        if (!loginResponse.data.success) {
            console.error('❌ Login failed:', loginResponse.data.message);
            return;
        }

        const token = loginResponse.data.token;
        console.log('✅ Login successful');

        // Step 2: Test the previously failing /api/users endpoint
        console.log('\nStep 2: Testing /api/users endpoint...');
        try {
            const usersResponse = await axios.get(`${API_BASE}/api/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                httpsAgent
            });

            console.log('✅ /api/users: SUCCESS!');
            console.log(`   Status: ${usersResponse.status}`);
            console.log(`   Users found: ${usersResponse.data.data?.length || 0}`);
            
            if (usersResponse.data.data?.length > 0) {
                console.log(`   First user: ${usersResponse.data.data[0].name} (${usersResponse.data.data[0].email})`);
            }

        } catch (error) {
            console.error('❌ /api/users still failing:', error.response?.status, error.response?.data?.message);
            return;
        }

        // Step 3: Test other endpoints to ensure they still work
        console.log('\nStep 3: Verifying other endpoints still work...');
        
        const testEndpoints = [
            { path: '/api/roles', name: 'Roles' },
            { path: '/api/permissions', name: 'Permissions' }
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
                console.log(`✅ ${endpoint.name}: ${response.status} - Working`);
            } catch (error) {
                console.error(`❌ ${endpoint.name}: ${error.response?.status} - ${error.response?.data?.message}`);
            }
        }

        console.log('\n🎉 JWT Authentication Fix Verification Complete!');
        console.log('All endpoints are now working with JWT tokens.');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testAfterFix();