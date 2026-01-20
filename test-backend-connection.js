// Quick backend connectivity test
const API_BASE = 'https://16.171.197.86.nip.io';

async function testConnection() {
    console.log('🔍 TESTING BACKEND CONNECTION');
    console.log('=============================');
    console.log(`🌐 API Base: ${API_BASE}`);
    
    try {
        console.log('1. Testing basic API endpoint...');
        const response = await fetch(`${API_BASE}/api`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Backend is responding!');
            console.log('📊 Response:', data);
            
            // Test login endpoint
            console.log('\n2. Testing login endpoint...');
            const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'admin@company.com',
                    password: 'admin@123'
                })
            });
            
            const loginData = await loginResponse.json();
            if (loginResponse.ok) {
                console.log('✅ Login successful!');
                console.log('🔐 Token received:', loginData.token ? 'Yes' : 'No');
                console.log('👤 User permissions:', loginData.user?.permissions?.length || 0);
                
                return { connected: true, token: loginData.token };
            } else {
                console.log('❌ Login failed:', loginData.message);
                return { connected: true, loginFailed: true };
            }
        } else {
            console.log(`❌ Backend not responding: ${response.status}`);
            return { connected: false, status: response.status };
        }
    } catch (error) {
        console.log('❌ Connection error:', error.message);
        return { connected: false, error: error.message };
    }
}

// Test and provide recommendations
testConnection().then(result => {
    console.log('\n🎯 RECOMMENDATIONS:');
    
    if (!result.connected) {
        console.log('❌ Backend server is not running or not accessible');
        console.log('🔧 Solutions:');
        console.log('1. Check if AWS server is running');
        console.log('2. SSH to server: ssh -i "C:\\Users\\Admin\\awsconection.pem" ubuntu@16.171.197.86');
        console.log('3. Start server: cd ~/inventoryfullstack && node server.js');
        console.log('4. Check server logs for errors');
    } else if (result.loginFailed) {
        console.log('⚠️ Backend is running but login failed');
        console.log('🔧 Check admin credentials in database');
    } else {
        console.log('✅ Backend is fully operational!');
        console.log('🚀 You can now run the 4-scenario test');
        console.log('📝 Command: node quick-4-scenario-test.js');
    }
}).catch(console.error);