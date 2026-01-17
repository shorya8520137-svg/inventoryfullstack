#!/usr/bin/env node

// Disable SSL certificate validation for testing
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const axios = require('axios');

const BASE_URL = 'https://16.171.161.150.nip.io';

async function testLogin() {
    try {
        console.log('🔐 Testing login...');
        
        const response = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'admin@company.com',
            password: 'admin@123'
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Login successful:', response.data);
        
    } catch (error) {
        console.error('❌ Login failed:');
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        console.error('Message:', error.message);
    }
}

testLogin();