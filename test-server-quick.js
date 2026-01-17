const axios = require('axios');

// Update with your server IP
const SERVER_URL = 'http://your-server-ip:5000'; // Replace with actual server IP

console.log('🔍 QUICK SERVER TEST');
console.log('===================');
console.log(`Testing: ${SERVER_URL}`);

async function quickTest() {
    try {
        // Test 1: Health Check
        console.log('\n1. Health Check...');
        const health = await axios.get(`${SERVER_URL}/`, { timeout: 5000 });
        console.log('✅ Server is UP:', health.data);

        // Test 2: Login
        console.log('\n2. Login Test...');
        const login = await axios.post(`${SERVER_URL}/api/auth/login`, {
            username: 'admin',
            password: 'admin123'
        }, { timeout: 5000 });
        
        console.log('✅ Login Success:', {
            user: login.data.user?.username,
            hasToken: !!login.data.token
        });

        // Test 3: Protected Route
        if (login.data.token) {
            console.log('\n3. Protected Route Test...');
            const products = await axios.get(`${SERVER_URL}/api/products`, {
                headers: { 'Authorization': `Bearer ${login.data.token}` },
                timeout: 5000
            });
            console.log('✅ Protected Route Works:', {
                productsCount: products.data?.length || 0
            });
        }

        console.log('\n🎉 ALL TESTS PASSED - SERVER IS WORKING!');
        
    } catch (error) {
        console.log('\n❌ ERROR:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('🔥 SERVER NOT ACCESSIBLE!');
            console.log('Check: sudo systemctl status stockiq-backend');
        } else if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
        }
    }
}

quickTest();