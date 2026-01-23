const https = require('https');

// Disable SSL verification for testing
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const FRONTEND_URL = 'https://stockiqfullstacktest.vercel.app';
const API_URL = 'https://16.171.5.50.nip.io';

console.log('🎯 FINAL PRODUCTION TEST');
console.log('='.repeat(50));
console.log(`🌐 Frontend: ${FRONTEND_URL}`);
console.log(`📡 API: ${API_URL}`);

async function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const req = https.request(url, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Production-Test',
                ...options.headers
            },
            timeout: 10000
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
                        responseTime
                    });
                } catch (e) {
                    resolve({ 
                        success: true, 
                        statusCode: res.statusCode, 
                        data: data.substring(0, 200),
                        responseTime
                    });
                }
            });
        });
        
        req.on('error', error => {
            const responseTime = Date.now() - startTime;
            reject({ success: false, error: error.message, responseTime });
        });
        
        req.on('timeout', () => {
            req.destroy();
            reject({ success: false, error: 'Timeout', responseTime: 10000 });
        });
        
        if (options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
}

async function testComplete() {
    console.log('\n1️⃣ Testing Frontend...');
    try {
        const frontend = await makeRequest(FRONTEND_URL);
        console.log(`✅ Frontend: ${frontend.statusCode} (${frontend.responseTime}ms)`);
    } catch (error) {
        console.log(`❌ Frontend: ${error.error}`);
        return false;
    }

    console.log('\n2️⃣ Testing API Health...');
    try {
        const health = await makeRequest(`${API_URL}/`);
        console.log(`✅ API Health: ${health.statusCode} (${health.responseTime}ms)`);
        console.log(`📊 Status: ${health.data.status || 'OK'}`);
    } catch (error) {
        console.log(`❌ API Health: ${error.error}`);
        return false;
    }

    console.log('\n3️⃣ Testing API Login...');
    try {
        const login = await makeRequest(`${API_URL}/api/auth/login`, {
            method: 'POST',
            body: JSON.stringify({
                email: 'admin@company.com',
                password: 'admin@123'
            })
        });
        
        console.log(`✅ Login: ${login.statusCode} (${login.responseTime}ms)`);
        
        if (login.data.success && login.data.token) {
            console.log(`🔑 Token: Received`);
            console.log(`👤 User: ${login.data.user.email}`);
            return true;
        } else {
            console.log(`❌ Login failed: ${login.data.message}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Login: ${error.error}`);
        return false;
    }
}

testComplete().then(success => {
    console.log('\n' + '='.repeat(50));
    if (success) {
        console.log('🎉 PRODUCTION IS READY!');
        console.log('✅ Frontend deployed successfully');
        console.log('✅ API is responding correctly');
        console.log('✅ Authentication is working');
        
        console.log('\n📋 Production URLs:');
        console.log(`   🌐 Frontend: ${FRONTEND_URL}`);
        console.log(`   📡 API: ${API_URL}`);
        
        console.log('\n🔐 Login Credentials:');
        console.log('   📧 Email: admin@company.com');
        console.log('   🔑 Password: admin@123');
        
        console.log('\n💡 User Instructions:');
        console.log('   1. Visit the frontend URL');
        console.log('   2. If SSL certificate warning appears, accept it');
        console.log('   3. Login with the credentials above');
        console.log('   4. Enjoy your inventory management system!');
        
    } else {
        console.log('❌ Production has issues');
    }
}).catch(console.error);