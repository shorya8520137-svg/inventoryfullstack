/**
 * TEST NEW API IP ADDRESS
 * Test to verify the new API endpoint 16.171.5.50 is working
 */

const https = require('https');

// Test configuration
const API_BASE = 'https://16.171.5.50.nip.io';
const TEST_CREDENTIALS = {
    email: 'admin@company.com',
    password: 'admin@123'
};

// Disable SSL verification for testing
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

async function makeRequest(path, options = {}) {
    return new Promise((resolve, reject) => {
        const url = `${API_BASE}${path}`;
        console.log(`🔗 Making request to: ${url}`);
        
        const req = https.request(url, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            rejectUnauthorized: false
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
        
        if (options.body) {
            req.write(JSON.stringify(options.body));
        }
        
        req.end();
    });
}

async function testNewApiIp() {
    console.log('🧪 Testing New API IP Address: 16.171.5.50');
    console.log('=' .repeat(60));
    
    try {
        // Step 1: Test basic connectivity
        console.log('1️⃣ Testing basic connectivity...');
        try {
            const healthResponse = await makeRequest('/health');
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
        const loginResponse = await makeRequest('/api/auth/login', {
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
            const orderResponse = await makeRequest('/api/order-tracking', {
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
            
            // Test inventory
            const inventoryResponse = await makeRequest('/api/inventory', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (inventoryResponse.statusCode === 200) {
                console.log('✅ Inventory API: Working');
                console.log(`   Records found: ${inventoryResponse.data.data?.length || 0}`);
            } else {
                console.log(`❌ Inventory API failed: ${inventoryResponse.statusCode}`);
            }
            
            // Test returns
            const returnsResponse = await makeRequest('/api/returns', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (returnsResponse.statusCode === 200) {
                console.log('✅ Returns API: Working');
                console.log(`   Records found: ${returnsResponse.data.data?.length || 0}`);
            } else {
                console.log(`❌ Returns API failed: ${returnsResponse.statusCode}`);
            }
            
            // Step 4: Test export functionality
            console.log('\n4️⃣ Testing export functionality...');
            const exportResponse = await makeRequest('/api/order-tracking/export', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (exportResponse.statusCode === 200) {
                console.log('✅ Export API: Working');
                console.log('   Export data received successfully');
            } else {
                console.log(`❌ Export API failed: ${exportResponse.statusCode}`);
            }
            
        } else {
            console.log('❌ Login failed!');
            console.log(`   Status: ${loginResponse.statusCode}`);
            console.log(`   Response: ${JSON.stringify(loginResponse.data)}`);
        }
        
        console.log('\n' + '=' .repeat(60));
        console.log('🏁 API Test Complete');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\n🔍 Troubleshooting:');
        console.log('   1. Check if the server is running on 16.171.5.50');
        console.log('   2. Verify the server is accessible via HTTPS');
        console.log('   3. Check firewall and security group settings');
        console.log('   4. Ensure the backend is running on the correct port');
        process.exit(1);
    }
}

// Run the test
testNewApiIp();