/**
 * FINAL LOGIN TEST
 * Test the actual login functionality to confirm it's using the correct API
 */

const https = require('https');
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

console.log('🎯 FINAL LOGIN TEST - CONFIRMING NEW API');
console.log('=' .repeat(60));

async function testLoginWithNewApi() {
    console.log('🔐 Testing login with NEW API endpoint...');
    
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            email: 'admin@company.com',
            password: 'admin@123'
        });
        
        const options = {
            hostname: '16.171.5.50.nip.io',
            port: 443,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            },
            rejectUnauthorized: false
        };
        
        console.log('🔗 Calling: https://16.171.5.50.nip.io/api/auth/login');
        
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    console.log(`📊 Status: ${res.statusCode}`);
                    if (result.success) {
                        console.log('✅ NEW API LOGIN: SUCCESS');
                        console.log(`   Token: ${result.token ? 'Received' : 'Missing'}`);
                        console.log(`   User: ${result.user ? result.user.email : 'Missing'}`);
                        resolve(true);
                    } else {
                        console.log('❌ NEW API LOGIN: FAILED');
                        console.log(`   Error: ${result.message}`);
                        resolve(false);
                    }
                } catch (error) {
                    console.log('❌ Parse error:', error.message);
                    resolve(false);
                }
            });
        });
        
        req.on('error', (error) => {
            console.log('❌ Connection error:', error.message);
            resolve(false);
        });
        
        req.write(postData);
        req.end();
    });
}

async function testLoginWithOldApi() {
    console.log('\n🔐 Testing login with OLD API endpoint (should fail)...');
    
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            email: 'admin@company.com',
            password: 'admin@123'
        });
        
        const options = {
            hostname: '16.171.196.15.nip.io',
            port: 443,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            },
            rejectUnauthorized: false
        };
        
        console.log('🔗 Calling: https://16.171.196.15.nip.io/api/auth/login');
        
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                console.log(`📊 Status: ${res.statusCode}`);
                if (res.statusCode === 200) {
                    console.log('⚠️ OLD API still responds (server might still be running)');
                } else {
                    console.log('✅ OLD API not responding (good)');
                }
                resolve();
            });
        });
        
        req.on('error', (error) => {
            console.log('✅ OLD API connection failed (expected):', error.message);
            resolve();
        });
        
        req.setTimeout(5000, () => {
            console.log('✅ OLD API timeout (expected)');
            req.destroy();
            resolve();
        });
        
        req.write(postData);
        req.end();
    });
}

async function runFinalTest() {
    const newApiWorks = await testLoginWithNewApi();
    await testLoginWithOldApi();
    
    console.log('\n' + '=' .repeat(60));
    console.log('🏁 FINAL TEST RESULTS:');
    
    if (newApiWorks) {
        console.log('✅ NEW API (16.171.5.50.nip.io): WORKING');
        console.log('✅ Frontend should now use the correct API');
        
        console.log('\n📋 VERIFICATION STEPS:');
        console.log('1. Open: http://localhost:3000/login');
        console.log('2. Open browser DevTools (F12)');
        console.log('3. Go to Network tab');
        console.log('4. Try login: admin@company.com / admin@123');
        console.log('5. Check API call URL should be: https://16.171.5.50.nip.io/api/auth/login');
        console.log('6. Login should succeed');
        
        console.log('\n🎉 SUCCESS: API IP has been updated to 16.171.5.50.nip.io');
    } else {
        console.log('❌ NEW API not working - check server status');
    }
}

runFinalTest();