#!/bin/bash

echo "🚀 RUNNING API TEST ON SERVER..."
echo "================================"

# Server connection details (update these)
SERVER_USER="root"  # or your server username
SERVER_IP="your-server-ip"  # replace with actual server IP
PROJECT_PATH="/var/www/stockiqfullstacktest"

echo "🔗 Server: $SERVER_USER@$SERVER_IP"
echo "📁 Project: $PROJECT_PATH"
echo ""

# Create the test script content
read -r -d '' TEST_SCRIPT << 'EOF'
const axios = require('axios');

// Test localhost since we're running on the server
const SERVER_URL = 'http://localhost:5000';

console.log('🔍 TESTING SERVER APIs ON LOCALHOST');
console.log('===================================');
console.log('Server URL:', SERVER_URL);
console.log('');

async function quickTest() {
    try {
        // Test 1: Health Check
        console.log('1️⃣ Health Check...');
        const health = await axios.get(`${SERVER_URL}/`, { timeout: 5000 });
        console.log('✅ Server is UP:', health.data);
        console.log('');

        // Test 2: Login
        console.log('2️⃣ Login Test...');
        const login = await axios.post(`${SERVER_URL}/api/auth/login`, {
            username: 'admin',
            password: 'admin123'
        }, { timeout: 5000 });
        
        console.log('✅ Login Success:', {
            user: login.data.user?.username,
            hasToken: !!login.data.token
        });
        console.log('');

        // Test 3: Protected Route
        if (login.data.token) {
            console.log('3️⃣ Protected Route Test...');
            const products = await axios.get(`${SERVER_URL}/api/products`, {
                headers: { 'Authorization': `Bearer ${login.data.token}` },
                timeout: 5000
            });
            console.log('✅ Protected Route Works:', {
                productsCount: products.data?.length || 0
            });
            console.log('');
        }

        // Test 4: More APIs
        if (login.data.token) {
            const headers = { 'Authorization': `Bearer ${login.data.token}` };
            
            console.log('4️⃣ Testing More APIs...');
            
            try {
                const dispatch = await axios.get(`${SERVER_URL}/api/dispatch`, { headers, timeout: 5000 });
                console.log('✅ Dispatch API:', dispatch.data?.length || 0, 'records');
            } catch (e) {
                console.log('❌ Dispatch API Error:', e.response?.data?.error || e.message);
            }
            
            try {
                const inventory = await axios.get(`${SERVER_URL}/api/inventory`, { headers, timeout: 5000 });
                console.log('✅ Inventory API:', inventory.data?.length || 0, 'records');
            } catch (e) {
                console.log('❌ Inventory API Error:', e.response?.data?.error || e.message);
            }
            
            try {
                const timeline = await axios.get(`${SERVER_URL}/api/timeline`, { headers, timeout: 5000 });
                console.log('✅ Timeline API:', timeline.data?.length || 0, 'records');
            } catch (e) {
                console.log('❌ Timeline API Error:', e.response?.data?.error || e.message);
            }
            
            console.log('');
        }

        console.log('🎉 ALL CORE TESTS PASSED - SERVER IS WORKING!');
        console.log('==============================================');
        
    } catch (error) {
        console.log('❌ ERROR:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('🔥 SERVER NOT RUNNING!');
            console.log('Check: sudo systemctl status stockiq-backend');
            console.log('Start: sudo systemctl start stockiq-backend');
        } else if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
        }
        console.log('');
    }
}

quickTest();
EOF

# SSH to server and run the test
ssh "$SERVER_USER@$SERVER_IP" << ENDSSH
cd $PROJECT_PATH
echo "📍 Current directory: \$(pwd)"
echo ""
echo "🔍 Checking server status..."
sudo systemctl status stockiq-backend --no-pager -l | head -10
echo ""
echo "🌐 Checking if port 5000 is listening..."
sudo netstat -tlnp | grep :5000
echo ""
echo "📝 Creating test script..."
cat > server-api-test.js << 'TESTEOF'
$TEST_SCRIPT
TESTEOF
echo "✅ Test script created"
echo ""
echo "🚀 Running API test..."
node server-api-test.js
echo ""
echo "🧹 Cleaning up..."
rm server-api-test.js
echo "✅ Test completed!"
ENDSSH

echo ""
echo "✅ Server test execution completed!"