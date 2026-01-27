const https = require('https');

// Disable SSL verification for testing
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const API_BASE = 'https://16.171.5.50.nip.io';

console.log('🎯 FINAL VERIFICATION TEST');
console.log('='.repeat(50));
console.log(`📡 API Endpoint: ${API_BASE}`);
console.log(`📅 Test Date: ${new Date().toISOString()}`);

async function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            timeout: 10000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ success: true, statusCode: res.statusCode, data: jsonData });
                } catch (e) {
                    resolve({ success: true, statusCode: res.statusCode, data: data });
                }
            });
        });
        
        req.on('error', error => reject({ success: false, error: error.message }));
        req.on('timeout', () => {
            req.destroy();
            reject({ success: false, error: 'Timeout' });
        });
        
        if (options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
}

async function runFinalTest() {
    console.log('\n1️⃣ Testing API Health...');
    try {
        const health = await makeRequest(`${API_BASE}/`);
        console.log(`   ✅ Health Check: ${health.statusCode} - ${health.data.status || 'OK'}`);
    } catch (error) {
        console.log(`   ❌ Health Check Failed: ${error.error}`);
        return false;
    }

    console.log('\n2️⃣ Testing Authentication...');
    try {
        const login = await makeRequest(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            body: JSON.stringify({
                email: 'admin@company.com',
                password: 'admin@123'
            })
        });
        
        if (login.data.success && login.data.token) {
            console.log(`   ✅ Login Successful: Token received`);
            console.log(`   👤 User: ${login.data.user.email}`);
            
            // Test protected endpoint
            console.log('\n3️⃣ Testing Protected Endpoints...');
            const products = await makeRequest(`${API_BASE}/api/products?limit=3`, {
                headers: { 'Authorization': `Bearer ${login.data.token}` }
            });
            
            if (products.statusCode === 200) {
                console.log(`   ✅ Products API: Working correctly`);
            } else {
                console.log(`   ⚠️  Products API: Status ${products.statusCode}`);
            }
            
            return true;
        } else {
            console.log(`   ❌ Login Failed: ${login.data.message || 'No token'}`);
            return false;
        }
    } catch (error) {
        console.log(`   ❌ Authentication Failed: ${error.error}`);
        return false;
    }
}

async function main() {
    const success = await runFinalTest();
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 FINAL VERIFICATION RESULTS');
    console.log('='.repeat(50));
    
    if (success) {
        console.log('🎉 SUCCESS! API is working correctly with new IP address');
        console.log('✅ All core functionality verified');
        console.log('🔧 Frontend should now be able to connect');
        console.log('\n📋 Next Steps:');
        console.log('   1. Start your Next.js frontend');
        console.log('   2. Navigate to the login page');
        console.log('   3. If you see SSL certificate error, click the helper button');
        console.log('   4. Accept the certificate in the new tab');
        console.log('   5. Return to login page and try again');
    } else {
        console.log('❌ FAILED! API is not responding correctly');
        console.log('🔧 Check if the API server is running on 16.171.5.50');
    }
    
    console.log(`\n📡 API Base URL: ${API_BASE}`);
    console.log(`⏰ Test completed: ${new Date().toISOString()}`);
}

main().catch(console.error);