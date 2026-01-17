# Comprehensive AWS server API test
Write-Host "🚀 COMPREHENSIVE AWS SERVER API TEST" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

$keyPath = "C:\Users\Admin\awsconection.pem"
$serverUser = "ubuntu"
$serverIP = "16.171.161.150"
$projectPath = "/home/ubuntu/inventoryfullstack"

Write-Host "Server: $serverUser@$serverIP"
Write-Host "Project: $projectPath"
Write-Host ""

# Create comprehensive test script
$testScript = @'
const axios = require('axios');

const SERVER_URL = 'http://localhost:5000';

console.log('🔍 COMPREHENSIVE API TEST');
console.log('========================');
console.log('Server URL:', SERVER_URL);
console.log('');

async function runTests() {
    try {
        // Test 1: Health Check
        console.log('1️⃣ Health Check...');
        const health = await axios.get(`${SERVER_URL}/`, { timeout: 5000 });
        console.log('✅ Health Check:', health.data);
        console.log('');

        // Test 2: Login
        console.log('2️⃣ Login Test...');
        const loginResponse = await axios.post(`${SERVER_URL}/api/auth/login`, {
            username: 'admin',
            password: 'admin123'
        }, { timeout: 5000 });
        
        const token = loginResponse.data.token;
        console.log('✅ Login Success:', {
            success: loginResponse.data.success,
            user: loginResponse.data.user?.username,
            hasToken: !!token
        });
        console.log('');

        if (!token) {
            console.log('❌ No token received - cannot test protected routes');
            return;
        }

        const headers = { 'Authorization': `Bearer ${token}` };

        // Test 3: Products API
        console.log('3️⃣ Products API...');
        try {
            const products = await axios.get(`${SERVER_URL}/api/products`, { headers, timeout: 5000 });
            console.log('✅ Products API:', products.data?.length || 0, 'records');
        } catch (e) {
            console.log('❌ Products API Error:', e.response?.status, e.response?.data?.error || e.message);
        }

        // Test 4: Dispatch API
        console.log('4️⃣ Dispatch API...');
        try {
            const dispatch = await axios.get(`${SERVER_URL}/api/dispatch`, { headers, timeout: 5000 });
            console.log('✅ Dispatch API:', dispatch.data?.length || 0, 'records');
        } catch (e) {
            console.log('❌ Dispatch API Error:', e.response?.status, e.response?.data?.error || e.message);
        }

        // Test 5: Inventory API
        console.log('5️⃣ Inventory API...');
        try {
            const inventory = await axios.get(`${SERVER_URL}/api/inventory`, { headers, timeout: 5000 });
            console.log('✅ Inventory API:', inventory.data?.length || 0, 'records');
        } catch (e) {
            console.log('❌ Inventory API Error:', e.response?.status, e.response?.data?.error || e.message);
        }

        // Test 6: Timeline API
        console.log('6️⃣ Timeline API...');
        try {
            const timeline = await axios.get(`${SERVER_URL}/api/timeline`, { headers, timeout: 5000 });
            console.log('✅ Timeline API:', timeline.data?.length || 0, 'records');
        } catch (e) {
            console.log('❌ Timeline API Error:', e.response?.status, e.response?.data?.error || e.message);
        }

        // Test 7: Users API (Permissions)
        console.log('7️⃣ Users API...');
        try {
            const users = await axios.get(`${SERVER_URL}/api/users`, { headers, timeout: 5000 });
            console.log('✅ Users API:', users.data?.length || 0, 'records');
        } catch (e) {
            console.log('❌ Users API Error:', e.response?.status, e.response?.data?.error || e.message);
        }

        // Test 8: Roles API
        console.log('8️⃣ Roles API...');
        try {
            const roles = await axios.get(`${SERVER_URL}/api/roles`, { headers, timeout: 5000 });
            console.log('✅ Roles API:', roles.data?.length || 0, 'records');
        } catch (e) {
            console.log('❌ Roles API Error:', e.response?.status, e.response?.data?.error || e.message);
        }

        console.log('');
        console.log('🎉 COMPREHENSIVE TEST COMPLETED!');
        console.log('================================');

    } catch (error) {
        console.log('❌ CRITICAL ERROR:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('🔥 SERVER NOT ACCESSIBLE!');
        }
    }
}

runTests();
'@

Write-Host "Creating and running comprehensive test..." -ForegroundColor Yellow

# Run the test on server
& ssh -i $keyPath "$serverUser@$serverIP" @"
cd $projectPath
echo 'Creating test script...'
cat > comprehensive-test.js << 'EOF'
$testScript
EOF
echo 'Running comprehensive API test...'
node comprehensive-test.js
echo ''
echo 'Cleaning up...'
rm comprehensive-test.js
echo 'Test completed!'
"@

Write-Host ""
Write-Host "✅ Comprehensive test completed!" -ForegroundColor Green