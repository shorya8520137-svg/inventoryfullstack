const axios = require('axios');
const https = require('https');

// Ignore SSL certificate errors for testing
const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});

const API_BASE = 'https://16.171.197.86.nip.io';

async function testJWTTokenIssue() {
    console.log('🔍 Testing JWT Token Authentication Issue...\n');

    try {
        // Step 1: Login to get a valid token
        console.log('Step 1: Logging in to get JWT token...');
        const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
            email: 'admin@company.com',
            password: 'admin@123'
        }, { httpsAgent });

        if (!loginResponse.data.success) {
            console.error('❌ Login failed:', loginResponse.data.message);
            return;
        }

        const token = loginResponse.data.token;
        console.log('✅ Login successful, token received');
        console.log('Token preview:', token.substring(0, 50) + '...');

        // Step 2: Test API calls with the token
        console.log('\nStep 2: Testing API calls with JWT token...');

        const testEndpoints = [
            '/api/users',
            '/api/roles', 
            '/api/permissions'
        ];

        for (const endpoint of testEndpoints) {
            try {
                console.log(`\nTesting ${endpoint}...`);
                
                const response = await axios.get(`${API_BASE}${endpoint}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    httpsAgent
                });

                console.log(`✅ ${endpoint}: ${response.status} - Success`);
                console.log(`   Data count: ${response.data.data?.length || 'N/A'}`);
                
            } catch (error) {
                console.error(`❌ ${endpoint}: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
                
                if (error.response?.status === 403) {
                    console.log('   🔍 This is the 403 Forbidden error we\'re seeing!');
                }
            }
        }

        // Step 3: Test token validation
        console.log('\nStep 3: Testing token validation...');
        try {
            const meResponse = await axios.get(`${API_BASE}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                httpsAgent
            });
            console.log('✅ Token validation successful');
            console.log('   User:', meResponse.data.user.email);
            console.log('   Permissions count:', meResponse.data.user.permissions.length);
        } catch (error) {
            console.error('❌ Token validation failed:', error.response?.data?.message || error.message);
        }

        // Step 4: Test with malformed token
        console.log('\nStep 4: Testing with malformed token...');
        try {
            await axios.get(`${API_BASE}/api/users`, {
                headers: {
                    'Authorization': `Bearer invalid-token`,
                    'Content-Type': 'application/json'
                },
                httpsAgent
            });
        } catch (error) {
            console.log('✅ Malformed token correctly rejected:', error.response?.status, error.response?.data?.message);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testJWTTokenIssue();