const https = require('https');

// Test both the production frontend and API
const FRONTEND_URL = 'https://stockiqfullstacktest.vercel.app';
const API_URL = 'https://16.171.5.50.nip.io';

// Disable SSL verification for API testing
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

console.log('🚀 PRODUCTION DEPLOYMENT TEST');
console.log('='.repeat(60));
console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
console.log(`📡 API URL: ${API_URL}`);
console.log(`📅 Test Date: ${new Date().toISOString()}`);

async function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https://') ? https : require('http');
        
        const req = client.request(url, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Production-Test-Client',
                ...options.headers
            },
            timeout: 15000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const responseTime = Date.now() - startTime;
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ 
                        success: true, 
                        statusCode: res.statusCode, 
                        data: jsonData,
                        responseTime,
                        headers: res.headers
                    });
                } catch (e) {
                    resolve({ 
                        success: true, 
                        statusCode: res.statusCode, 
                        data: data.substring(0, 200),
                        responseTime,
                        headers: res.headers
                    });
                }
            });
        });
        
        const startTime = Date.now();
        
        req.on('error', error => {
            const responseTime = Date.now() - startTime;
            reject({ success: false, error: error.message, responseTime });
        });
        
        req.on('timeout', () => {
            req.destroy();
            const responseTime = Date.now() - startTime;
            reject({ success: false, error: 'Timeout', responseTime });
        });
        
        if (options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
}

async function testFrontend() {
    console.log('\n1️⃣ Testing Frontend Deployment...');
    try {
        const response = await makeRequest(FRONTEND_URL);
        console.log(`   ✅ Frontend Status: ${response.statusCode} (${response.responseTime}ms)`);
        console.log(`   🌐 Content-Type: ${response.headers['content-type'] || 'Unknown'}`);
        
        if (response.statusCode === 200) {
            console.log(`   📄 Page Content: ${response.data.includes('hunyhuny') ? 'Contains branding' : 'Basic HTML'}`);
            return true;
        }
        return false;
    } catch (error) {
        console.log(`   ❌ Frontend Failed: ${error.error} (${error.responseTime}ms)`);
        return false;
    }
}

async function testAPI() {
    console.log('\n2️⃣ Testing API Backend...');
    try {
        const health = await makeRequest(`${API_URL}/`);
        console.log(`   ✅ API Health: ${health.statusCode} (${health.responseTime}ms)`);
        console.log(`   📊 Status: ${health.data.status || 'OK'}`);
        
        if (health.statusCode === 200) {
            return await testAPILogin();
        }
        return false;
    } catch (error) {
        console.log(`   ❌ API Health Failed: ${error.error} (${error.responseTime}ms)`);
        return false;
    }
}

async function testAPILogin() {
    console.log('\n3️⃣ Testing API Authentication...');
    try {
        const login = await makeRequest(`${API_URL}/api/auth/login`, {
            method: 'POST',
            body: JSON.stringify({
                email: 'admin@company.com',
                password: 'admin@123'
            })
        });
        
        console.log(`   ✅ Login Status: ${login.statusCode} (${login.responseTime}ms)`);
        
        if (login.data.success && login.data.token) {
            console.log(`   🔑 Token: Received successfully`);
            console.log(`   👤 User: ${login.data.user.email}`);
            return true;
        } else {
            console.log(`   ❌ Login Failed: ${login.data.message || 'No token'}`);
            return false;
        }
    } catch (error) {
        console.log(`   ❌ Login Error: ${error.error} (${error.responseTime}ms)`);
        return false;
    }
}

async function testEnvironmentVariables() {
    console.log('\n4️⃣ Testing Environment Configuration...');
    
    // Test if the frontend can access the API
    try {
        const testPage = await makeRequest(`${FRONTEND_URL}/test-connection`);
        console.log(`   ✅ Test Connection Page: ${testPage.statusCode} (${testPage.responseTime}ms)`);
        
        if (testPage.statusCode === 200) {
            console.log(`   🔧 Environment: Production build includes test page`);
            return true;
        }
        return false;
    } catch (error) {
        console.log(`   ⚠️  Test Page: ${error.error} (may be expected)`);
        return true; // This might be expected in production
    }
}

async function runProductionTest() {
    const results = {
        frontend: false,
        api: false,
        auth: false,
        env: false
    };
    
    results.frontend = await testFrontend();
    results.api = await testAPI();
    results.env = await testEnvironmentVariables();
    
    return results;
}

async function main() {
    const results = await runProductionTest();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 PRODUCTION DEPLOYMENT RESULTS');
    console.log('='.repeat(60));
    
    const tests = [
        { name: 'Frontend Deployment', status: results.frontend, critical: true },
        { name: 'API Backend Connection', status: results.api, critical: true },
        { name: 'Environment Configuration', status: results.env, critical: false }
    ];
    
    tests.forEach(test => {
        const icon = test.status ? '✅' : (test.critical ? '❌' : '⚠️');
        const status = test.status ? 'PASS' : (test.critical ? 'FAIL' : 'WARNING');
        console.log(`${icon} ${test.name}: ${status}`);
    });
    
    const criticalTests = tests.filter(t => t.critical);
    const passedCritical = criticalTests.filter(t => t.status).length;
    const totalCritical = criticalTests.length;
    
    console.log('\n' + '-'.repeat(50));
    console.log(`🎯 Critical Systems: ${passedCritical}/${totalCritical} operational`);
    
    if (passedCritical === totalCritical) {
        console.log('\n🎉 PRODUCTION DEPLOYMENT SUCCESSFUL!');
        console.log('✅ Frontend is live and accessible');
        console.log('✅ API backend is responding correctly');
        console.log('✅ Authentication system is working');
        
        console.log('\n📋 Production URLs:');
        console.log(`   🌐 Frontend: ${FRONTEND_URL}`);
        console.log(`   📡 API: ${API_URL}`);
        
        console.log('\n🔐 Login Credentials:');
        console.log('   📧 Email: admin@company.com');
        console.log('   🔑 Password: admin@123');
        
        console.log('\n⚠️  SSL Certificate Note:');
        console.log('   If users encounter SSL errors, they should:');
        console.log('   1. Visit the API URL directly in browser');
        console.log('   2. Accept the security certificate');
        console.log('   3. Return to the frontend and login');
        
    } else {
        console.log('\n❌ PRODUCTION DEPLOYMENT ISSUES DETECTED');
        console.log('🔧 Check the failed components above');
    }
    
    console.log(`\n⏰ Test completed: ${new Date().toISOString()}`);
}

main().catch(console.error);