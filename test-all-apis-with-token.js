#!/usr/bin/env node

// Disable SSL certificate validation for testing
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const axios = require('axios');

const BASE_URL = 'https://16.171.161.150.nip.io';

// Disable SSL certificate validation for testing
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function testAllAPIs() {
    let token = null;
    
    try {
        // Step 1: Login to get token
        console.log('🔐 Step 1: Testing login...');
        
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: "admin@company.com",
            password: "admin@123"
        }, {
            headers: { 'Content-Type': 'application/json' }
        });

        console.log('✅ LOGIN SUCCESS!');
        console.log('User:', loginResponse.data.user.name, '(' + loginResponse.data.user.email + ')');
        console.log('Role:', loginResponse.data.user.role);
        console.log('Permissions:', loginResponse.data.user.permissions.join(', '));
        
        token = loginResponse.data.token;
        console.log('🎫 Token obtained:', token.substring(0, 50) + '...');

    } catch (error) {
        console.error('❌ LOGIN FAILED!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Response:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
        return;
    }

    // Step 2: Test protected endpoints
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    const endpoints = [
        { method: 'GET', url: '/api/auth/me', name: 'Get Current User' },
        { method: 'GET', url: '/api/permissions/roles', name: 'Get Roles' },
        { method: 'GET', url: '/api/permissions/permissions', name: 'Get Permissions' },
        { method: 'GET', url: '/api/permissions/users', name: 'Get Users' },
        { method: 'GET', url: '/api/products', name: 'Get Products' },
        { method: 'GET', url: '/api/dispatch', name: 'Get Dispatches' },
        { method: 'GET', url: '/api/inventory', name: 'Get Inventory' }
    ];

    console.log('\n🔒 Step 2: Testing protected endpoints...');
    
    for (const endpoint of endpoints) {
        try {
            console.log(`\n📡 Testing: ${endpoint.name}`);
            
            const response = await axios({
                method: endpoint.method,
                url: `${BASE_URL}${endpoint.url}`,
                headers: headers
            });

            console.log(`✅ ${endpoint.name}: SUCCESS (${response.status})`);
            
            // Show sample data for some endpoints
            if (endpoint.url.includes('/roles') || endpoint.url.includes('/permissions')) {
                console.log('   Data count:', response.data.data ? response.data.data.length : 'N/A');
            }
            
        } catch (error) {
            console.error(`❌ ${endpoint.name}: FAILED`);
            if (error.response) {
                console.error(`   Status: ${error.response.status}`);
                console.error(`   Message: ${error.response.data.message || 'Unknown error'}`);
            } else {
                console.error(`   Error: ${error.message}`);
            }
        }
    }

    console.log('\n🎉 API testing completed!');
}

// Run the test
testAllAPIs().catch(console.error);