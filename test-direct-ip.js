// Test direct IP connection
const https = require('https');

async function testDirectIP() {
    console.log('🔍 TESTING DIRECT IP CONNECTION');
    console.log('===============================');
    
    const testUrls = [
        'http://16.171.197.86:5000/api',
        'https://16.171.197.86:5000/api',
        'http://16.171.197.86/api',
        'https://16.171.197.86/api'
    ];
    
    for (const url of testUrls) {
        console.log(`\n🌐 Testing: ${url}`);
        
        try {
            // Create custom agent for HTTPS that ignores certificate errors
            const agent = url.startsWith('https') ? new https.Agent({
                rejectUnauthorized: false,
                timeout: 5000
            }) : undefined;
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json',
                    'User-Agent': 'Test-Client/1.0'
                },
                signal: controller.signal,
                agent: agent
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ SUCCESS!');
                console.log('📊 Response:', data);
                
                // Test login with this working URL
                console.log('\n🔐 Testing login...');
                const loginResponse = await fetch(url.replace('/api', '/api/auth/login'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: 'admin@company.com',
                        password: 'admin@123'
                    }),
                    agent: agent
                });
                
                const loginData = await loginResponse.json();
                if (loginResponse.ok) {
                    console.log('✅ Login successful!');
                    console.log('🎯 WORKING API BASE:', url.replace('/api', ''));
                    return url.replace('/api', '');
                } else {
                    console.log('❌ Login failed:', loginData.message);
                }
                
            } else {
                console.log(`❌ HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                console.log('❌ Timeout (8 seconds)');
            } else {
                console.log(`❌ Error: ${error.message}`);
            }
        }
    }
    
    return null;
}

testDirectIP().then(workingUrl => {
    if (workingUrl) {
        console.log(`\n🎯 FOUND WORKING CONNECTION!`);
        console.log(`📝 Update your .env.local file:`);
        console.log(`NEXT_PUBLIC_API_BASE=${workingUrl}`);
        console.log('\n🚀 Now you can run the 4-scenario test!');
    } else {
        console.log('\n❌ No working connection found');
        console.log('🔧 The server is running but not accessible from outside');
        console.log('💡 This might be a firewall or security group issue');
    }
}).catch(console.error);