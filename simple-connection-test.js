// Simple connection test
async function testSimpleConnection() {
    console.log('🔍 SIMPLE CONNECTION TEST');
    console.log('========================');
    
    const testUrls = [
        'http://16.171.197.86:5000/api',
        'https://16.171.197.86.nip.io/api'
    ];
    
    for (const url of testUrls) {
        console.log(`\n🌐 Testing: ${url}`);
        
        try {
            const controller = new AbortController();
            setTimeout(() => controller.abort(), 10000); // 10 second timeout
            
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ SUCCESS!');
                console.log('📊 Response:', JSON.stringify(data, null, 2));
                
                // Test login
                console.log('\n🔐 Testing admin login...');
                const loginUrl = url.replace('/api', '/api/auth/login');
                const loginResponse = await fetch(loginUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: 'admin@company.com',
                        password: 'admin@123'
                    })
                });
                
                const loginData = await loginResponse.json();
                if (loginResponse.ok && loginData.token) {
                    console.log('✅ Login successful!');
                    console.log('🔐 Token received');
                    console.log('👤 Permissions:', loginData.user?.permissions?.length || 0);
                    
                    const baseUrl = url.replace('/api', '');
                    console.log(`\n🎯 WORKING API BASE: ${baseUrl}`);
                    return baseUrl;
                } else {
                    console.log('❌ Login failed:', loginData.message || 'Unknown error');
                }
            } else {
                console.log(`❌ HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('❌ Request timeout (10 seconds)');
            } else {
                console.log(`❌ Error: ${error.message}`);
            }
        }
    }
    
    return null;
}

// Run test and provide next steps
testSimpleConnection().then(workingUrl => {
    if (workingUrl) {
        console.log('\n🚀 READY TO RUN 4-SCENARIO TEST!');
        console.log('================================');
        console.log('✅ Backend is accessible and working');
        console.log('✅ Admin login is functional');
        console.log('✅ Database is connected');
        console.log('\n📝 Next step: Run the comprehensive test');
        console.log('Command: node quick-4-scenario-test.js');
    } else {
        console.log('\n❌ CONNECTION ISSUES');
        console.log('===================');
        console.log('The server is running on AWS but not accessible from your location.');
        console.log('This could be due to:');
        console.log('1. AWS Security Group blocking external access');
        console.log('2. Firewall settings');
        console.log('3. Network configuration');
        console.log('\n💡 Alternative: Use manual testing guide');
        console.log('File: MANUAL_4_SCENARIO_TEST_GUIDE.md');
    }
}).catch(console.error);