const http = require('http');
const https = require('https');

// Disable SSL verification for testing
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

console.log('🔍 Testing all possible API endpoint configurations');
console.log('='.repeat(60));

const endpoints = [
    'http://16.171.5.50:5000',
    'https://16.171.5.50:5000', 
    'http://16.171.5.50:3000',
    'https://16.171.5.50:3000',
    'https://16.171.5.50.nip.io',
    'http://16.171.5.50.nip.io'
];

function makeRequest(url, useHttps = false) {
    return new Promise((resolve, reject) => {
        const client = useHttps ? https : http;
        const startTime = Date.now();
        
        const req = client.request(url, {
            method: 'GET',
            timeout: 5000,
            headers: {
                'User-Agent': 'Endpoint-Test-Client'
            }
        }, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                const responseTime = Date.now() - startTime;
                resolve({
                    success: true,
                    statusCode: res.statusCode,
                    data: data.substring(0, 200),
                    responseTime: responseTime
                });
            });
        });
        
        req.on('error', (error) => {
            const responseTime = Date.now() - startTime;
            reject({
                success: false,
                error: error.message,
                responseTime: responseTime
            });
        });
        
        req.on('timeout', () => {
            req.destroy();
            reject({
                success: false,
                error: 'Timeout',
                responseTime: 5000
            });
        });
        
        req.end();
    });
}

async function testEndpoint(endpoint) {
    const isHttps = endpoint.startsWith('https://');
    
    try {
        console.log(`\n🔗 Testing: ${endpoint}`);
        const result = await makeRequest(endpoint, isHttps);
        
        console.log(`   ✅ Status: ${result.statusCode} (${result.responseTime}ms)`);
        console.log(`   📄 Response: ${result.data}...`);
        
        return { endpoint, working: true, ...result };
    } catch (error) {
        console.log(`   ❌ Failed: ${error.error} (${error.responseTime}ms)`);
        return { endpoint, working: false, error: error.error };
    }
}

async function testLoginEndpoint(baseUrl) {
    const isHttps = baseUrl.startsWith('https://');
    const client = isHttps ? https : http;
    
    return new Promise((resolve, reject) => {
        const loginData = JSON.stringify({
            email: 'admin@company.com',
            password: 'admin@123'
        });
        
        const url = `${baseUrl}/api/auth/login`;
        
        const req = client.request(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Login-Test-Client'
            },
            timeout: 5000
        }, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({
                        success: true,
                        statusCode: res.statusCode,
                        hasToken: !!jsonData.token,
                        userEmail: jsonData.user?.email
                    });
                } catch (parseError) {
                    resolve({
                        success: false,
                        statusCode: res.statusCode,
                        error: 'JSON Parse Error',
                        rawData: data.substring(0, 100)
                    });
                }
            });
        });
        
        req.on('error', (error) => {
            reject({
                success: false,
                error: error.message
            });
        });
        
        req.on('timeout', () => {
            req.destroy();
            reject({
                success: false,
                error: 'Timeout'
            });
        });
        
        req.write(loginData);
        req.end();
    });
}

async function runAllTests() {
    console.log('📋 Testing basic connectivity to all endpoints...\n');
    
    const results = [];
    
    for (const endpoint of endpoints) {
        const result = await testEndpoint(endpoint);
        results.push(result);
    }
    
    // Find working endpoints
    const workingEndpoints = results.filter(r => r.working);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 CONNECTIVITY RESULTS');
    console.log('='.repeat(60));
    
    if (workingEndpoints.length > 0) {
        console.log('\n✅ Working endpoints:');
        workingEndpoints.forEach(endpoint => {
            console.log(`   🔗 ${endpoint.endpoint} (${endpoint.statusCode})`);
        });
        
        // Test login on working endpoints
        console.log('\n🔐 Testing login on working endpoints...');
        
        for (const workingEndpoint of workingEndpoints) {
            try {
                console.log(`\n   Testing login: ${workingEndpoint.endpoint}`);
                const loginResult = await testLoginEndpoint(workingEndpoint.endpoint);
                
                if (loginResult.success && loginResult.hasToken) {
                    console.log(`   ✅ Login successful! Token received.`);
                    console.log(`   👤 User: ${loginResult.userEmail}`);
                    console.log(`\n🎉 RECOMMENDED ENDPOINT: ${workingEndpoint.endpoint}`);
                    console.log(`🔧 Update .env.local with: NEXT_PUBLIC_API_BASE=${workingEndpoint.endpoint}`);
                    break;
                } else {
                    console.log(`   ❌ Login failed: ${loginResult.error || 'No token'}`);
                }
            } catch (loginError) {
                console.log(`   ❌ Login error: ${loginError.error}`);
            }
        }
    } else {
        console.log('\n❌ No working endpoints found!');
        console.log('🔧 Check if the API server is running on 16.171.5.50');
    }
    
    console.log('\n' + '='.repeat(60));
}

runAllTests().catch(console.error);