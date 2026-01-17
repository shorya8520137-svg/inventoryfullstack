# PowerShell script to test AWS server APIs
Write-Host "🚀 TESTING AWS SERVER APIs..." -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

# AWS Server connection details
$keyPath = "C:\Users\Admin\awsconection.pem"
$serverUser = "ubuntu"
$serverIP = "16.171.161.150"
$projectPath = "/var/www/stockiqfullstacktest"

Write-Host "🔗 Server: $serverUser@$serverIP" -ForegroundColor Yellow
Write-Host "🔑 Key: $keyPath" -ForegroundColor Yellow
Write-Host "📁 Project: $projectPath" -ForegroundColor Yellow
Write-Host ""

# Create the test script content
$testScript = @'
const axios = require('axios');

const SERVER_URL = 'http://localhost:5000';

console.log('🔍 TESTING SERVER APIs ON AWS');
console.log('=============================');
console.log('Server URL:', SERVER_URL);
console.log('');

async function testServer() {
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

        // Test 3: Protected Routes
        if (login.data.token) {
            const headers = { 'Authorization': `Bearer ${login.data.token}` };
            
            console.log('3️⃣ Testing Protected APIs...');
            
            // Products API
            try {
                const products = await axios.get(`${SERVER_URL}/api/products`, { headers, timeout: 5000 });
                console.log('✅ Products API:', products.data?.length || 0, 'records');
            } catch (e) {
                console.log('❌ Products API Error:', e.response?.data?.error || e.message);
            }
            
            // Dispatch API
            try {
                const dispatch = await axios.get(`${SERVER_URL}/api/dispatch`, { headers, timeout: 5000 });
                console.log('✅ Dispatch API:', dispatch.data?.length || 0, 'records');
            } catch (e) {
                console.log('❌ Dispatch API Error:', e.response?.data?.error || e.message);
            }
            
            // Inventory API
            try {
                const inventory = await axios.get(`${SERVER_URL}/api/inventory`, { headers, timeout: 5000 });
                console.log('✅ Inventory API:', inventory.data?.length || 0, 'records');
            } catch (e) {
                console.log('❌ Inventory API Error:', e.response?.data?.error || e.message);
            }
            
            console.log('');
        }

        console.log('🎉 SERVER TEST COMPLETED!');
        console.log('========================');
        
    } catch (error) {
        console.log('❌ ERROR:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('🔥 SERVER NOT RUNNING!');
            console.log('Check: sudo systemctl status stockiq-backend');
        } else if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
        }
    }
}

testServer();
'@

# Commands to run on AWS server
$serverCommands = @"
cd $projectPath
echo '📍 Current directory:' && pwd
echo ''
echo '🔍 Checking server status...'
sudo systemctl status stockiq-backend --no-pager -l | head -10
echo ''
echo '🌐 Checking port 5000...'
sudo netstat -tlnp | grep :5000
echo ''
echo '📝 Creating test script...'
cat > aws-server-test.js << 'EOF'
$testScript
EOF
echo '✅ Test script created'
echo ''
echo '🚀 Running API test...'
node aws-server-test.js
echo ''
echo '🧹 Cleaning up...'
rm aws-server-test.js
echo '✅ Test completed!'
"@

try {
    Write-Host "🚀 Connecting to AWS server..." -ForegroundColor Green
    Write-Host ""
    
    # Execute via SSH with key file
    & ssh -i $keyPath "$serverUser@$serverIP" $serverCommands
    
    Write-Host ""
    Write-Host "✅ AWS server test completed!" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error connecting to server: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Manual steps:" -ForegroundColor Yellow
    Write-Host "1. SSH to server: ssh -i `"$keyPath`" $serverUser@$serverIP"
    Write-Host "2. Go to project: cd $projectPath"
    Write-Host "3. Check status: sudo systemctl status stockiq-backend"
    Write-Host "4. Test manually: curl http://localhost:5000/"
}