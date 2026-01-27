const http = require('http');

const API_BASE = 'http://16.171.5.50:5000';

console.log('🔍 Testing HTTP API (no SSL complications)');
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

async function testHTTP() {
    console.log('\n1️⃣ Testing Health Endpoint...');
    try {
        const health = await makeRequest(`${API_BASE}/`);
        console.log(`✅ Health: ${health.statusCode} (${health.responseTime}ms)`);
        console.log(`📄 Response: ${health.data.substring(0, 100)}...`);
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

testHTTP().then(success => {
    console.log('\n' + '='.repeat(50));
    if (success) {
        console.log('🎉 HTTP API is working!');
        console.log(`✅ Use: NEXT_PUBLIC_API_BASE=${API_BASE}`);
    } else {
        console.log('❌ HTTP API is not responding');
        console.log('🔧 Check if server is running on port 5000');
    }
}).catch(console.error);