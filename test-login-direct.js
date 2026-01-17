#!/usr/bin/env node

// Disable SSL certificate validation for testing
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const axios = require('axios');

// Test login with admin credentials from database
async function testLogin() {
    try {
        console.log('🔐 Testing login with admin@example.com...');
        
        const loginData = {
            email: "admin@company.com",
            password: "admin@123"
        };

        const response = await axios.post('https://16.171.161.150.nip.io/api/auth/login', loginData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ LOGIN SUCCESS!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
        // Extract token for further testing
        const token = response.data.token;
        if (token) {
            console.log('\n🎫 JWT Token:', token);
            
            // Test a protected endpoint
            console.log('\n🔒 Testing protected endpoint...');
            const userResponse = await axios.get('https://16.171.161.150.nip.io/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('✅ PROTECTED ENDPOINT SUCCESS!');
            console.log('User data:', JSON.stringify(userResponse.data, null, 2));
        }

    } catch (error) {
        console.error('❌ LOGIN FAILED!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Response:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    }
}

// Run the test
testLogin();