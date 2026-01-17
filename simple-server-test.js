const axios = require('axios');

const SERVER_URL = 'http://16.171.161.150:5000';

console.log('🔍 SIMPLE SERVER TEST');
console.log('====================');

async function test() {
    try {
        // Health check
        console.log('1. Health Check...');
        const health = await axios.get(SERVER_URL);
        console.log('✅ Health:', health.data);
        
        // Login test with different credentials
        console.log('\n2. Login Tests...');
        
        // Try admin@admin.com
        try {
            const login1 = await axios.post(`${SERVER_URL}/api/auth/login`, {
                email: 'admin@admin.com',
                password: 'admin123'
            });
            console.log('✅ Login with admin@admin.com:', login1.data.success);
            if (login1.data.token) {
                console.log('✅ Token received!');
                
                // Test protected route
                const products = await axios.get(`${SERVER_URL}/api/products`, {
                    headers: { Authorization: `Bearer ${login1.data.token}` }
                });
                console.log('✅ Products API works:', products.data?.length || 0, 'records');
            }
        } catch (e) {
            console.log('❌ admin@admin.com failed:', e.response?.data?.message || e.message);
        }
        
        // Try admin/admin123
        try {
            const login2 = await axios.post(`${SERVER_URL}/api/auth/login`, {
                username: 'admin',
                password: 'admin123'
            });
            console.log('✅ Login with username admin:', login2.data.success);
        } catch (e) {
            console.log('❌ username admin failed:', e.response?.data?.message || e.message);
        }
        
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

test();