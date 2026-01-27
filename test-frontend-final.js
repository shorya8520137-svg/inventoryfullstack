/**
 * FINAL FRONTEND TEST
 * Test the frontend to ensure it's using the correct API endpoint
 */

const https = require('https');
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

console.log('🎯 FINAL FRONTEND API TEST');
console.log('=' .repeat(60));

// Test the API directly first
async function testApiDirect() {
    console.log('1️⃣ Testing API directly...');
    
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
        
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    console.log(`   ✅ Direct API test: Status ${res.statusCode}`);
                    if (result.success) {
                        console.log('   ✅ Login successful - API is working!');
                        resolve(result.token);
                    } else {
                        console.log('   ❌ Login failed:', result.message);
                        reject(new Error('Login failed'));
                    }
                } catch (error) {
                    console.log('   ❌ Parse error:', error.message);
                    reject(error);
                }
            });
        });
        
        req.on('error', (error) => {
            console.log('   ❌ Connection error:', error.message);
            reject(error);
        });
        
        req.write(postData);
        req.end();
    });
}

// Test frontend environment
async function testFrontendEnv() {
    console.log('\n2️⃣ Testing frontend environment...');
    
    // Load environment like Next.js does
    require('dotenv').config({ path: '.env.local' });
    
    const apiBase = process.env.NEXT_PUBLIC_API_BASE;
    console.log(`   📍 Frontend API Base: ${apiBase}`);
    
    if (apiBase === 'https://16.171.5.50.nip.io') {
        console.log('   ✅ Correct API endpoint configured');
        return true;
    } else {
        console.log('   ❌ Wrong API endpoint!');
        console.log('   Expected: https://16.171.5.50.nip.io');
        console.log(`   Got: ${apiBase}`);
        return false;
    }
}

// Test frontend API call simulation
async function testFrontendApiCall() {
    console.log('\n3️⃣ Simulating frontend API call...');
    
    const apiBase = process.env.NEXT_PUBLIC_API_BASE;
    
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            email: 'admin@company.com',
            password: 'admin@123'
        });
        
        const url = new URL(`${apiBase}/api/auth/login`);
        
        const options = {
            hostname: url.hostname,
            port: url.port || 443,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            },
            rejectUnauthorized: false
        };
        
        console.log(`   🔗 Calling: ${url.href}`);
        
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    console.log(`   ✅ Frontend API call: Status ${res.statusCode}`);
                    if (result.success) {
                        console.log('   ✅ Frontend can successfully login!');
                        resolve(true);
                    } else {
                        console.log('   ❌ Frontend login failed:', result.message);
                        resolve(false);
                    }
                } catch (error) {
                    console.log('   ❌ Parse error:', error.message);
                    resolve(false);
                }
            });
        });
        
        req.on('error', (error) => {
            console.log('   ❌ Frontend API call failed:', error.message);
            resolve(false);
        });
        
        req.write(postData);
        req.end();
    });
}

// Run all tests
async function runTests() {
    try {
        // Test 1: Direct API
        await testApiDirect();
        
        // Test 2: Frontend Environment
        const envCorrect = await testFrontendEnv();
        
        // Test 3: Frontend API Call
        const apiCallWorks = await testFrontendApiCall();
        
        console.log('\n' + '=' .repeat(60));
        console.log('📊 TEST RESULTS:');
        console.log(`   Direct API: ✅ Working`);
        console.log(`   Environment: ${envCorrect ? '✅ Correct' : '❌ Wrong'}`);
        console.log(`   Frontend API: ${apiCallWorks ? '✅ Working' : '❌ Failed'}`);
        
        if (envCorrect && apiCallWorks) {
            console.log('\n🎉 SUCCESS! Frontend is now using the correct API endpoint!');
            console.log('\n📋 Next Steps:');
            console.log('1. Test the login page: http://localhost:3000/login');
            console.log('2. Check the API debug page: http://localhost:3000/api-debug');
            console.log('3. If deploying to Vercel, update environment variables there');
        } else {
            console.log('\n❌ ISSUES FOUND! Check the problems above.');
        }
        
    } catch (error) {
        console.log('\n❌ Test failed:', error.message);
    }
}

runTests();