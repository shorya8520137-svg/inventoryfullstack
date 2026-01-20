const axios = require('axios');

async function quickTest() {
    console.log('🧪 QUICK SERVER TEST');
    console.log('===================');
    
    const baseURL = 'https://16.171.197.86.nip.io/api';
    
    const httpsAgent = new (require('https').Agent)({
        rejectUnauthorized: false
    });
    
    try {
        // Test 1: Health check
        console.log('🔍 Testing server health...');
        const healthResponse = await axios.get('https://16.171.197.86.nip.io/', { 
            httpsAgent, 
            timeout: 5000 
        });
        console.log('✅ Server is running:', healthResponse.data.status);
        
        // Test 2: Login
        console.log('🔐 Testing login...');
        const loginResponse = await axios.post(`${baseURL}/auth/login`, {
            email: 'admin@company.com',
            password: 'admin@123'
        }, { httpsAgent, timeout: 10000 });
        
        if (loginResponse.data.success) {
            console.log('✅ Login successful');
            const token = loginResponse.data.token;
            
            // Test 3: Protected API
            console.log('🔒 Testing protected API...');
            const productsResponse = await axios.get(`${baseURL}/products`, {
                headers: { 'Authorization': `Bearer ${token}` },
                httpsAgent,
                timeout: 5000
            });
            console.log('✅ Products API working');
            
            // Test 4: Dispatch API
            console.log('📦 Testing dispatch API...');
            const dispatchResponse = await axios.get(`${baseURL}/dispatch`, {
                headers: { 'Authorization': `Bearer ${token}` },
                httpsAgent,
                timeout: 5000
            });
            console.log('✅ Dispatch API working');
            
            console.log('\n🎉 ALL TESTS PASSED!');
            console.log('🌐 Server: https://16.171.197.86.nip.io');
            console.log('✅ Status: WORKING');
            
        } else {
            console.log('❌ Login failed');
        }
        
    } catch (error) {
        console.error('💥 ERROR:', error.message);
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
        }
    }
}

quickTest();