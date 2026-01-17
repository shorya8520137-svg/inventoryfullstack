#!/usr/bin/env node

// Disable SSL certificate validation for testing
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const axios = require('axios');

const BASE_URL = 'https://16.171.161.150.nip.io';

async function testPermissionsDebug() {
    let token = null;
    
    try {
        // Step 1: Login to get token
        console.log('🔐 Step 1: Getting token...');
        
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: "admin@company.com",
            password: "admin@123"
        }, {
            headers: { 'Content-Type': 'application/json' }
        });

        token = loginResponse.data.token;
        console.log('✅ Token obtained');

        // Step 2: Test each endpoint individually with detailed error info
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        console.log('\n🔍 Testing /api/roles...');
        try {
            const rolesResponse = await axios.get(`${BASE_URL}/api/roles`, { headers });
            console.log('✅ Roles SUCCESS:', rolesResponse.data);
        } catch (error) {
            console.error('❌ Roles FAILED:');
            console.error('Status:', error.response?.status);
            console.error('Data:', error.response?.data);
            console.error('Headers:', error.response?.headers);
        }

        console.log('\n🔍 Testing /api/permissions...');
        try {
            const permissionsResponse = await axios.get(`${BASE_URL}/api/permissions`, { headers });
            console.log('✅ Permissions SUCCESS:', permissionsResponse.data);
        } catch (error) {
            console.error('❌ Permissions FAILED:');
            console.error('Status:', error.response?.status);
            console.error('Data:', error.response?.data);
            console.error('Headers:', error.response?.headers);
        }

        console.log('\n🔍 Testing /api/users...');
        try {
            const usersResponse = await axios.get(`${BASE_URL}/api/users`, { headers });
            console.log('✅ Users SUCCESS:', usersResponse.data);
        } catch (error) {
            console.error('❌ Users FAILED:');
            console.error('Status:', error.response?.status);
            console.error('Data:', error.response?.data);
            console.error('Headers:', error.response?.headers);
        }

    } catch (error) {
        console.error('❌ LOGIN FAILED!');
        console.error('Error:', error.message);
    }
}

// Run the test
testPermissionsDebug().catch(console.error);