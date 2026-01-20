// Debug connection issues
const https = require('https');

async function testMultipleConnections() {
    console.log('🔍 DEBUGGING CONNECTION ISSUES');
    console.log('==============================');
    
    const testUrls = [
        'https://16.171.197.86.nip.io/api',
        'http://16.171.197.86:5000/api',
        'https://16.171.197.86:5000/api'
    ];
    
    for (const url of testUrls) {
        console.log(`\n🌐 Testing: ${url}`);
        
        try {
            // Create agent that ignores SSL certificate errors
            const agent = new https.Agent({
                rejectUnauthorized: false
            });
            
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                agent: url.startsWith('https') ? agent : undefined
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ SUCCESS!');
                console.log('📊 Response:', data);
                return url; // Return working URL
            } else {
                console.log(`❌ HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }
    }
    
    console.log('\n🚨 ALL CONNECTIONS FAILED');
    console.log('🔧 Possible issues:');
    console.log('1. Server not running on AWS');
    console.log('2. Firewall blocking connections');
    console.log('3. SSL certificate issues');
    console.log('4. Port 5000 not accessible');
    
    return null;
}

testMultipleConnections().then(workingUrl => {
    if (workingUrl) {
        console.log(`\n🎯 WORKING URL FOUND: ${workingUrl}`);
        console.log('🚀 You can now run the 4-scenario test!');
    } else {
        console.log('\n❌ No working connection found');
        console.log('📞 Please check server status manually');
    }
}).catch(console.error);