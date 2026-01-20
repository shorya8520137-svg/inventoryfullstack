const axios = require('axios');
const https = require('https');

// Create an agent that ignores SSL certificate errors
const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});

async function testLogin() {
    const baseURL = 'https://16.171.197.86.nip.io';
    
    console.log('🧪 Testing login API directly...\n');
    
    try {
        console.log('Testing login with admin credentials...');
        const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
            email: 'admin@company.com',
            password: 'admin@123'
        }, {
            timeout: 10000,
            httpsAgent: httpsAgent,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Login successful!');
        console.log('Status:', loginResponse.status);
        console.log('Response:', loginResponse.data);
        
        if (loginResponse.data.token) {
            console.log('\n🔑 JWT Token received successfully');
            
            // Test a protected endpoint
            console.log('\n🧪 Testing roles endpoint...');
            const rolesResponse = await axios.get(`${baseURL}/api/roles`, {
                httpsAgent: httpsAgent,
                timeout: 10000
            });
            
            console.log('✅ Roles API working!');
            console.log('Roles count:', rolesResponse.data.data?.length || 0);
            
            console.log('\n🎉 ALL TESTS PASSED! Server and APIs are working correctly.');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.response?.status || error.message);
        if (error.response?.data) {
            console.error('Error details:', error.response.data);
        }
        if (error.code === 'ECONNREFUSED') {
            console.error('🚨 Server connection refused - server might not be running');
        }
    }
}

testLogin();