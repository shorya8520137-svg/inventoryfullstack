const http = require('http');

const API_BASE = 'http://16.171.196.15.nip.io';

console.log('🔍 Testing HTTP with nip.io (no SSL)');
console.log('='.repeat(50));
console.log(`📡 API Base: ${API_BASE}`);

function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const req = http.request(url, {
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
                const responseTime = Date.now() - startTime;
                resolve({
                    statusCode: res.statusCode,
                    data: data,
                    responseTime: responseTime
                });
            });
        });
        
        req.on('error', (error) => {
            const responseTime = Date.now() - startTime;
            reject({
                error: error.message,
                responseTime: responseTime
            });
        });
        
        req.on('timeout', () => {
            req.destroy();
            reject({
                error: 'Request timeout',
                responseTime: 10000
            });
        });
        
        if (options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
}

async function testHTTPNip() {
    console.log('\n1️⃣ Testing Health Endpoint...');
    try {
        const health = await makeRequest(`${API_BASE}/`);
        console.log(`✅ Health: ${health.statusCode} (${health.responseTime}ms)`);
        console.log(`📄 Response: ${health.data.substring(0, 100)}...`);
        
        if (health.statusCode === 301 || health.statusCode === 302) {
            console.log('⚠️  Got redirect - server might be forcing HTTPS');
            return false;
        }
        
    } catch (error) {
        console.log(`❌ Health Failed: ${error.error} (${error.responseTime}ms)`);
        return false;
    }

    console.log('\n2️⃣ Testing Login...');
    try {
        const login = await makeRequest(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            body: JSON.stringify({
                email: 'admin@company.com',
                password: 'admin@123'
            })
        });
        
        console.log(`✅ Login: ${login.statusCode} (${login.responseTime}ms)`);
        
        if (login.statusCode === 301 || login.statusCode === 302) {
            console.log('⚠️  Got redirect - server is forcing HTTPS');
            return false;
        }
        
        const loginData = JSON.parse(login.data);
        if (loginData.success && loginData.token) {
            console.log(`🔑 Token: ${loginData.token.substring(0, 20)}...`);
            console.log(`👤 User: ${loginData.user.email}`);
            return true;
        } else {
            console.log(`❌ Login failed: ${loginData.message}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Login Failed: ${error.error} (${error.responseTime}ms)`);
        return false;
    }
}

testHTTPNip().then(success => {
    console.log('\n' + '='.repeat(50));
    if (success) {
        console.log('🎉 HTTP nip.io is working!');
        console.log(`✅ Use: NEXT_PUBLIC_API_BASE=${API_BASE}`);
    } else {
        console.log('❌ HTTP nip.io failed');
        console.log('🔧 Server might be redirecting HTTP to HTTPS');
        console.log('💡 Try: NEXT_PUBLIC_API_BASE=https://16.171.196.15.nip.io');
    }
}).catch(console.error);