const axios = require('axios');

async function testServer() {
    const baseURL = 'http://16.171.197.86:5000';
    
    console.log('🧪 Testing server APIs...\n');
    
    try {
        // Test 1: Health check
        console.log('1. Testing server health...');
        const healthResponse = await axios.get(`${baseURL}/api/health`, {
            timeout: 5000
        });
        console.log('✅ Server health:', healthResponse.status);
        
        // Test 2: Login API
        console.log('\n2. Testing login API...');
        const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
            email: 'admin@company.com',
            password: 'admin123'
        }, {
            timeout: 5000
        });
        console.log('✅ Login successful:', loginResponse.status);
        
        const token = loginResponse.data.token;
        console.log('🔑 Token received');
        
        // Test 3: Protected API with token
        console.log('\n3. Testing protected API...');
        const usersResponse = await axios.get(`${baseURL}/api/permissions/users`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            timeout: 5000
        });
        console.log('✅ Users API working:', usersResponse.status);
        console.log('👥 Users count:', usersResponse.data.data?.length || 0);
        
        // Test 4: Permissions API
        console.log('\n4. Testing permissions API...');
        const permissionsResponse = await axios.get(`${baseURL}/api/permissions/permissions`, {
            timeout: 5000
        });
        console.log('✅ Permissions API working:', permissionsResponse.status);
        console.log('🔐 Permissions count:', permissionsResponse.data.data?.length || 0);
        
        console.log('\n🎉 ALL TESTS PASSED! Server is working correctly.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.status || error.message);
        if (error.response?.data) {
            console.error('Error details:', error.response.data);
        }
    }
}

testServer();