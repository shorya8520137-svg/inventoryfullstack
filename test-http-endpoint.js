const http = require('http');

const API_BASE = 'http://16.171.196.15:5000';

console.log('🚀 Testing HTTP API endpoint (no SSL issues)');
console.log('='.repeat(50));
console.log(`📡 API Base URL: ${API_BASE}`);

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const req = http.request(url, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Frontend-Test-Client',
                ...options.headers
            },
            timeout: 10000
        }, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                const responseTime = Date.now() - startTime;
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
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

async function testLogin() {
    console.log('\n🔐 Testing Login with HTTP');
    console.log('-'.repeat(30));
    
    const loginData = JSON.stringify({
        email: 'admin@company.com',
        password: 'admin@123'
    });
    
    try {
        const response = await makeRequest(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            body: loginData
        });
        
        console.log(`✅ Status: ${response.statusCode}`);
        console.log(`⏱️  Response Time: ${response.responseTime}ms`);
        
        let responseData;
        try {
            responseData = JSON.parse(response.data);
            console.log(`📄 Success: ${responseData.success}`);
            console.log(`🔑 Token: ${responseData.token ? 'Present' : 'Missing'}`);
            console.log(`👤 User: ${responseData.user?.email || 'N/A'}`);
            return responseData.token;
        } catch (parseError) {
            console.log(`📄 Raw Response: ${response.data}`);
            return null;
        }
    } catch (error) {
        console.log(`❌ Login failed: ${error.error}`);
        return null;
    }
}

async function testProducts(token) {
    console.log('\n📦 Testing Products API with HTTP');
    console.log('-'.repeat(30));
    
    try {
        const response = await makeRequest(`${API_BASE}/api/products?limit=3`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log(`✅ Status: ${response.statusCode}`);
        console.log(`⏱️  Response Time: ${response.responseTime}ms`);
        
        try {
            const responseData = JSON.parse(response.data);
            console.log(`📄 Success: ${responseData.success}`);
            console.log(`📦 Products: ${responseData.data ? 'Data received' : 'No data'}`);
        } catch (parseError) {
            console.log(`📄 Raw Response: ${response.data.substring(0, 100)}...`);
        }
        
        return true;
    } catch (error) {
        console.log(`❌ Products test failed: ${error.error}`);
        return false;
    }
}

async function runTest() {
    console.log('🎯 Testing the same endpoints the frontend will use');
    
    const token = await testLogin();
    
    if (token) {
        await testProducts(token);
        
        console.log('\n' + '='.repeat(50));
        console.log('✅ HTTP endpoint is working!');
        console.log('🔧 Frontend should now connect without SSL errors');
        console.log(`📡 Use this in .env.local: NEXT_PUBLIC_API_BASE=${API_BASE}`);
    } else {
        console.log('\n❌ Login failed - check API server');
    }
}

runTest().catch(console.error);