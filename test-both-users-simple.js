// TEST BOTH USERS - ADMIN VS THEMS
const https = require('https');

const SERVER_URL = 'https://16.171.197.86.nip.io';

// Test credentials
const ADMIN_CREDS = {
    email: 'admin@company.com',
    password: 'admin@123'
};

const THEMS_CREDS = {
    email: 'thems@company.com',
    password: 'gfx998sd'
};

// Make HTTP request
function makeRequest(method, path, data = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, SERVER_URL);
        
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Test-Script/1.0'
            },
            rejectUnauthorized: false // For self-signed certificates
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = https.request(url, options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(responseData);
                    resolve({
                        status: res.statusCode,
                        data: jsonData,
                        headers: res.headers
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: responseData,
                        headers: res.headers
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

// Test user login and API access
async function testUser(userType, credentials) {
    console.log(`\n🧪 TESTING ${userType.toUpperCase()} USER`);
    console.log('='.repeat(40));
    
    try {
        // 1. Login
        console.log(`📝 Logging in ${credentials.email}...`);
        const loginResponse = await makeRequest('POST', '/api/auth/login', credentials);
        
        if (loginResponse.status !== 200) {
            console.log(`❌ Login failed: ${loginResponse.status}`);
            console.log('Response:', loginResponse.data);
            return false;
        }
        
        const token = loginResponse.data.token;
        console.log(`✅ Login successful - Token received`);
        
        // 2. Test Products API
        console.log(`🔍 Testing products API...`);
        const productsResponse = await makeRequest('GET', '/api/products?page=1&limit=5', null, token);
        
        if (productsResponse.status === 200) {
            console.log(`✅ Products API: ${productsResponse.status} - Success`);
            console.log(`   Products count: ${productsResponse.data.products?.length || 0}`);
        } else {
            console.log(`❌ Products API: ${productsResponse.status} - Failed`);
            console.log('   Error:', productsResponse.data.message || productsResponse.data);
        }
        
        // 3. Test Categories API
        console.log(`🏷️  Testing categories API...`);
        const categoriesResponse = await makeRequest('GET', '/api/products/categories/all', null, token);
        
        if (categoriesResponse.status === 200) {
            console.log(`✅ Categories API: ${categoriesResponse.status} - Success`);
        } else {
            console.log(`❌ Categories API: ${categoriesResponse.status} - Failed`);
            console.log('   Error:', categoriesResponse.data.message || categoriesResponse.data);
        }
        
        // 4. Test Inventory API
        console.log(`📦 Testing inventory API...`);
        const inventoryResponse = await makeRequest('GET', '/api/inventory?limit=5', null, token);
        
        if (inventoryResponse.status === 200) {
            console.log(`✅ Inventory API: ${inventoryResponse.status} - Success`);
        } else {
            console.log(`❌ Inventory API: ${inventoryResponse.status} - Failed`);
            console.log('   Error:', inventoryResponse.data.message || inventoryResponse.data);
        }
        
        return true;
        
    } catch (error) {
        console.log(`❌ Error testing ${userType}:`, error.message);
        return false;
    }
}

// Main test function
async function runTests() {
    console.log('🚀 TESTING BOTH USERS - ADMIN VS THEMS');
    console.log('=====================================');
    console.log(`Server: ${SERVER_URL}`);
    
    // Test Admin User
    const adminSuccess = await testUser('ADMIN', ADMIN_CREDS);
    
    // Test Thems User
    const themsSuccess = await testUser('THEMS', THEMS_CREDS);
    
    // Summary
    console.log('\n📊 TEST SUMMARY');
    console.log('===============');
    console.log(`Admin User: ${adminSuccess ? '✅ Working' : '❌ Failed'}`);
    console.log(`Thems User: ${themsSuccess ? '✅ Working' : '❌ Failed'}`);
    
    if (adminSuccess && !themsSuccess) {
        console.log('\n🎯 ISSUE CONFIRMED: Admin works, Thems gets 403 errors');
        console.log('This confirms the permissions issue we need to fix.');
    } else if (adminSuccess && themsSuccess) {
        console.log('\n🎉 BOTH USERS WORKING: Issue appears to be fixed!');
    } else {
        console.log('\n⚠️  UNEXPECTED RESULT: Check server status');
    }
}

// Run the tests
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { runTests };