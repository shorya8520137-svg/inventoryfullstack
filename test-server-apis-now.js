const axios = require('axios');

// Update this with your actual server URL
const SERVER_URL = 'http://your-server-ip:5000'; // Replace with your server IP
// const SERVER_URL = 'http://localhost:5000'; // For local testing

console.log('🚀 TESTING SERVER APIs...');
console.log('========================');
console.log(`🌍 Server URL: ${SERVER_URL}`);
console.log('');

async function testAPI() {
    let token = null;
    
    try {
        // 1. Test Health Check
        console.log('1️⃣ Testing Health Check...');
        const healthResponse = await axios.get(`${SERVER_URL}/`);
        console.log('✅ Health Check:', healthResponse.data);
        console.log('');

        // 2. Test Login (to get JWT token)
        console.log('2️⃣ Testing Login...');
        const loginData = {
            username: 'admin',
            password: 'admin123'
        };
        
        const loginResponse = await axios.post(`${SERVER_URL}/api/auth/login`, loginData);
        token = loginResponse.data.token;
        console.log('✅ Login Success:', {
            success: loginResponse.data.success,
            user: loginResponse.data.user?.username,
            tokenReceived: !!token
        });
        console.log('');

        if (!token) {
            console.log('❌ No token received, cannot test protected routes');
            return;
        }

        // Headers with JWT token
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // 3. Test Products API
        console.log('3️⃣ Testing Products API...');
        try {
            const productsResponse = await axios.get(`${SERVER_URL}/api/products`, { headers });
            console.log('✅ Products API:', {
                success: true,
                count: productsResponse.data?.length || 0,
                sample: productsResponse.data?.slice(0, 2) || []
            });
        } catch (error) {
            console.log('❌ Products API Error:', error.response?.data || error.message);
        }
        console.log('');

        // 4. Test Dispatch API
        console.log('4️⃣ Testing Dispatch API...');
        try {
            const dispatchResponse = await axios.get(`${SERVER_URL}/api/dispatch`, { headers });
            console.log('✅ Dispatch API:', {
                success: true,
                count: dispatchResponse.data?.length || 0
            });
        } catch (error) {
            console.log('❌ Dispatch API Error:', error.response?.data || error.message);
        }
        console.log('');

        // 5. Test Inventory API
        console.log('5️⃣ Testing Inventory API...');
        try {
            const inventoryResponse = await axios.get(`${SERVER_URL}/api/inventory`, { headers });
            console.log('✅ Inventory API:', {
                success: true,
                count: inventoryResponse.data?.length || 0
            });
        } catch (error) {
            console.log('❌ Inventory API Error:', error.response?.data || error.message);
        }
        console.log('');

        // 6. Test Timeline API
        console.log('6️⃣ Testing Timeline API...');
        try {
            const timelineResponse = await axios.get(`${SERVER_URL}/api/timeline`, { headers });
            console.log('✅ Timeline API:', {
                success: true,
                count: timelineResponse.data?.length || 0
            });
        } catch (error) {
            console.log('❌ Timeline API Error:', error.response?.data || error.message);
        }
        console.log('');

        // 7. Test Permissions API
        console.log('7️⃣ Testing Permissions API...');
        try {
            const permissionsResponse = await axios.get(`${SERVER_URL}/api/users`, { headers });
            console.log('✅ Permissions API (Users):', {
                success: true,
                count: permissionsResponse.data?.length || 0
            });
        } catch (error) {
            console.log('❌ Permissions API Error:', error.response?.data || error.message);
        }
        console.log('');

        // 8. Test Roles API
        console.log('8️⃣ Testing Roles API...');
        try {
            const rolesResponse = await axios.get(`${SERVER_URL}/api/roles`, { headers });
            console.log('✅ Roles API:', {
                success: true,
                count: rolesResponse.data?.length || 0
            });
        } catch (error) {
            console.log('❌ Roles API Error:', error.response?.data || error.message);
        }
        console.log('');

        console.log('🎉 API TESTING COMPLETE!');
        console.log('========================');

    } catch (error) {
        console.log('❌ CRITICAL ERROR:', error.message);
        if (error.response) {
            console.log('Response Status:', error.response.status);
            console.log('Response Data:', error.response.data);
        }
        if (error.code === 'ECONNREFUSED') {
            console.log('🔥 SERVER IS NOT RUNNING OR NOT ACCESSIBLE!');
            console.log('Check:');
            console.log('1. Server is running: sudo systemctl status stockiq-backend');
            console.log('2. Port 5000 is open: sudo netstat -tlnp | grep :5000');
            console.log('3. Firewall allows port 5000');
            console.log('4. Server URL is correct');
        }
    }
}

// Run the test
testAPI();