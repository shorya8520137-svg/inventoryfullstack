/**
 * TEST HTTP API (No SSL)
 * Test the API using HTTP instead of HTTPS
 */

const http = require('http');

// Test configuration
const API_BASE = 'http://16.171.5.50:5000';
const TEST_CREDENTIALS = {
    email: 'admin@company.com',
    password: 'admin@123'
};

async function makeHttpRequest(path, options = {}) {
    return new Promise((resolve, reject) => {
        const url = `${API_BASE}${path}`;
        console.log(`🔗 Making HTTP request to: ${url}`);
        
        const postData = options.body ? JSON.stringify(options.body) : null;
        
        const req = http.request(url, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        }, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: jsonData
                    });
                } catch (error) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: data,
                        parseError: error.message
                    });
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        if (postData) {
            req.write(postData);
        }
        
        req.end();
    });
}

async function testHttpApi() {
    console.log('🧪 Testing HTTP API (No SSL)');
    console.log('API Base:', API_BASE);
    console.log('=' .repeat(60));
    
    try {
        // Step 1: Test basic connectivity
        console.log('1️⃣ Testing basic connectivity...');
        try {
            const healthResponse = await makeHttpRequest('/health');
            if (healthResponse.statusCode === 200) {
                console.log('✅ Health check: API is responding');
            } else {
                console.log(`⚠️ Health check returned: ${healthResponse.statusCode}`);
            }
        } catch (error) {
            console.log('⚠️ Health endpoint not available, trying login...');
        }
        
        // Step 2: Test login endpoint
        console.log('\n2️⃣ Testing login endpoint...');
        const loginResponse = await makeHttpRequest('/api/auth/login', {
            method: 'POST',
            body: TEST_CREDENTIALS
        });
        
        if (loginResponse.statusCode === 200 && loginResponse.data.success) {
            console.log('✅ Login successful!');
            console.log(`   Token received: ${loginResponse.data.token ? 'Yes' : 'No'}`);
            
            const token = loginResponse.data.token;
            
            // Step 3: Test authenticated endpoints
            console.log('\n3️⃣ Testing authenticated endpoints...');
            
            // Test order tracking
            const orderResponse = await makeHttpRequest('/api/order-tracking', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (orderResponse.statusCode === 200) {
                console.log('✅ Order tracking API: Working');
                console.log(`   Records found: ${orderResponse.data.data?.length || 0}`);
            } else {
                console.log(`❌ Order tracking API failed: ${orderResponse.statusCode}`);
            }
            
        } else {
            console.log('❌ Login failed!');
            console.log(`   Status: ${loginResponse.statusCode}`);
            console.log(`   Response: ${JSON.stringify(loginResponse.data)}`);
        }
        
        console.log('\n' + '=' .repeat(60));
        console.log('🏁 HTTP API Test Complete');
        
        if (loginResponse.statusCode === 200) {
            console.log('🎉 SUCCESS: HTTP API is working!');
            console.log('💡 Frontend should now work without SSL issues');
        } else {
            console.log('❌ FAILED: HTTP API is not responding correctly');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\n🔍 Troubleshooting:');
        console.log('   1. Check if the server is running on 16.171.5.50:5000');
        console.log('   2. Verify the server is configured for HTTP (not HTTPS)');
        console.log('   3. Check firewall allows port 5000');
        console.log('   4. Ensure the backend is running on the correct port');
        process.exit(1);
    }
}

// Run the test
testHttpApi();