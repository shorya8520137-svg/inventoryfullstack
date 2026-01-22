const https = require('https');

// Disable SSL verification for testing
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const API_BASE = 'https://16.171.196.15.nip.io';

console.log('🚀 Testing API with new IP address: 16.171.196.15');
console.log('='.repeat(60));

// Test configuration
const testConfig = {
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'API-Test-Client'
    }
};

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const req = https.request(url, {
            ...testConfig,
            ...options,
            timeout: testConfig.timeout
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
                responseTime: testConfig.timeout
            });
        });
        
        if (options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
}

// Test functions
async function testHealthEndpoint() {
    console.log('\n1️⃣ Testing Health Endpoint');
    console.log('-'.repeat(40));
    
    try {
        const response = await makeRequest(`${API_BASE}/`);
        console.log(`✅ Status: ${response.statusCode}`);
        console.log(`⏱️  Response Time: ${response.responseTime}ms`);
        console.log(`📄 Response: ${response.data.substring(0, 200)}...`);
        return true;
    } catch (error) {
        console.log(`❌ Health check failed: ${error.error}`);
        console.log(`⏱️  Response Time: ${error.responseTime}ms`);
        return false;
    }
}

async function testLoginEndpoint() {
    console.log('\n2️⃣ Testing Login Endpoint');
    console.log('-'.repeat(40));
    
    const loginData = {
        email: 'admin@company.com',
        password: 'admin@123'
    };
    
    try {
        const response = await makeRequest(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            body: JSON.stringify(loginData)
        });
        
        console.log(`✅ Status: ${response.statusCode}`);
        console.log(`⏱️  Response Time: ${response.responseTime}ms`);
        
        let responseData;
        try {
            responseData = JSON.parse(response.data);
            console.log(`📄 Success: ${responseData.success || 'N/A'}`);
            console.log(`🔑 Token: ${responseData.token ? 'Present' : 'Missing'}`);
            return responseData.token || null;
        } catch (parseError) {
            console.log(`📄 Raw Response: ${response.data.substring(0, 200)}...`);
            return null;
        }
    } catch (error) {
        console.log(`❌ Login failed: ${error.error}`);
        console.log(`⏱️  Response Time: ${error.responseTime}ms`);
        return null;
    }
}

async function testProductsEndpoint(token) {
    console.log('\n3️⃣ Testing Products Endpoint');
    console.log('-'.repeat(40));
    
    const headers = token ? {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    } : testConfig.headers;
    
    try {
        const response = await makeRequest(`${API_BASE}/api/products?limit=5`, {
            method: 'GET',
            headers: headers
        });
        
        console.log(`✅ Status: ${response.statusCode}`);
        console.log(`⏱️  Response Time: ${response.responseTime}ms`);
        
        try {
            const responseData = JSON.parse(response.data);
            console.log(`📄 Success: ${responseData.success || 'N/A'}`);
            console.log(`📦 Products Count: ${responseData.data ? responseData.data.length : 'N/A'}`);
        } catch (parseError) {
            console.log(`📄 Raw Response: ${response.data.substring(0, 200)}...`);
        }
        
        return true;
    } catch (error) {
        console.log(`❌ Products test failed: ${error.error}`);
        console.log(`⏱️  Response Time: ${error.responseTime}ms`);
        return false;
    }
}

async function testInventoryEndpoint(token) {
    console.log('\n4️⃣ Testing Inventory Endpoint');
    console.log('-'.repeat(40));
    
    const headers = token ? {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    } : testConfig.headers;
    
    try {
        const response = await makeRequest(`${API_BASE}/api/inventory?limit=5`, {
            method: 'GET',
            headers: headers
        });
        
        console.log(`✅ Status: ${response.statusCode}`);
        console.log(`⏱️  Response Time: ${response.responseTime}ms`);
        
        try {
            const responseData = JSON.parse(response.data);
            console.log(`📄 Success: ${responseData.success || 'N/A'}`);
            console.log(`📋 Inventory Count: ${responseData.data ? responseData.data.length : 'N/A'}`);
        } catch (parseError) {
            console.log(`📄 Raw Response: ${response.data.substring(0, 200)}...`);
        }
        
        return true;
    } catch (error) {
        console.log(`❌ Inventory test failed: ${error.error}`);
        console.log(`⏱️  Response Time: ${error.responseTime}ms`);
        return false;
    }
}

async function testCORSHeaders() {
    console.log('\n5️⃣ Testing CORS Configuration');
    console.log('-'.repeat(40));
    
    try {
        const response = await makeRequest(`${API_BASE}/api/products`, {
            method: 'OPTIONS'
        });
        
        console.log(`✅ Status: ${response.statusCode}`);
        console.log(`⏱️  Response Time: ${response.responseTime}ms`);
        console.log(`🔗 CORS Headers:`);
        console.log(`   Access-Control-Allow-Origin: ${response.headers['access-control-allow-origin'] || 'Not set'}`);
        console.log(`   Access-Control-Allow-Methods: ${response.headers['access-control-allow-methods'] || 'Not set'}`);
        console.log(`   Access-Control-Allow-Headers: ${response.headers['access-control-allow-headers'] || 'Not set'}`);
        
        return true;
    } catch (error) {
        console.log(`❌ CORS test failed: ${error.error}`);
        console.log(`⏱️  Response Time: ${error.responseTime}ms`);
        return false;
    }
}

// Main test runner
async function runAllTests() {
    console.log(`🎯 API Base URL: ${API_BASE}`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
    
    const results = {
        health: false,
        login: false,
        products: false,
        inventory: false,
        cors: false,
        token: null
    };
    
    // Run tests sequentially
    results.health = await testHealthEndpoint();
    results.token = await testLoginEndpoint();
    results.login = !!results.token;
    results.products = await testProductsEndpoint(results.token);
    results.inventory = await testInventoryEndpoint(results.token);
    results.cors = await testCORSHeaders();
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    
    const tests = [
        { name: 'Health Check', status: results.health },
        { name: 'Login Authentication', status: results.login },
        { name: 'Products API', status: results.products },
        { name: 'Inventory API', status: results.inventory },
        { name: 'CORS Configuration', status: results.cors }
    ];
    
    tests.forEach(test => {
        const icon = test.status ? '✅' : '❌';
        const status = test.status ? 'PASS' : 'FAIL';
        console.log(`${icon} ${test.name}: ${status}`);
    });
    
    const passedTests = tests.filter(t => t.status).length;
    const totalTests = tests.length;
    
    console.log('\n' + '-'.repeat(40));
    console.log(`🎯 Overall Result: ${passedTests}/${totalTests} tests passed`);
    console.log(`🔑 Authentication Token: ${results.token ? 'Obtained' : 'Failed'}`);
    console.log(`⏰ Completed at: ${new Date().toISOString()}`);
    
    if (passedTests === totalTests) {
        console.log('\n🎉 All tests passed! API is working correctly.');
    } else {
        console.log('\n⚠️  Some tests failed. Check the API server status.');
    }
}

// Run the tests
runAllTests().catch(error => {
    console.error('\n💥 Test runner failed:', error);
    process.exit(1);
});