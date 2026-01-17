const axios = require('axios');
const jwt = require('jsonwebtoken');

const API_BASE = 'https://13.51.56.188.nip.io';

async function testAdminJWT() {
    try {
        console.log('🔐 Testing admin JWT token structure...');
        
        // Login as admin
        const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
            email: 'admin@company.com',
            password: 'admin@123'
        });
        
        if (loginResponse.data.success) {
            console.log('✅ Admin login successful');
            
            const token = loginResponse.data.token;
            console.log('🎫 Token received:', token.substring(0, 50) + '...');
            
            // Decode JWT without verification to see payload
            const decoded = jwt.decode(token);
            console.log('🔍 JWT Payload:', JSON.stringify(decoded, null, 2));
            
            // Test API call with token
            console.log('\n🧪 Testing API call with admin token...');
            
            const apiResponse = await axios.get(`${API_BASE}/api/products`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('✅ API call successful:', apiResponse.status);
            
        } else {
            console.log('❌ Admin login failed:', loginResponse.data.message);
        }
        
    } catch (error) {
        console.log('❌ Error:', error.response?.data || error.message);
        
        if (error.response?.data) {
            console.log('📋 Full error response:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testAdminJWT();