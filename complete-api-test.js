const http = require('http');

console.log('🚀 Starting Complete API Test Suite...\n');

// Test configuration
const baseURL = 'http://localhost:5000';
let authToken = null;

// Helper function to make HTTP requests
function makeRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: data
                });
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        if (postData) {
            req.write(postData);
        }
        req.end();
    });
}

// Test 1: Health Check
async function testHealthCheck() {
    console.log('1️⃣ Testing Health Check...');
    try {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/',
            method: 'GET'
        };

        const response = await makeRequest(options);
        console.log(`   Status: ${response.statusCode}`);
        console.log(`   Response: ${response.body}`);
        
        if (response.statusCode === 200) {
            console.log('   ✅ Health check passed\n');
            return true;
        } else {
            console.log('   ❌ Health check failed\n');
            return false;
        }
    } catch (error) {
        console.log(`   ❌ Health check error: ${error.message}\n`);
        return false;
    }
}

// Test 2: JWT Login
async function testJWTLogin() {
    console.log('2️⃣ Testing JWT Login...');
    try {
        const loginData = JSON.stringify({
            email: 'admin@company.com',
            password: 'admin@123'
        });

        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(loginData)
            }
        };

        const response = await makeRequest(options, loginData);
        console.log(`   Status: ${response.statusCode}`);
        console.log(`   Response: ${response.body}`);

        if (response.statusCode === 200) {
            const data = JSON.parse(response.body);
            if (data.success && data.token) {
                authToken = data.token;
                console.log('   ✅ JWT Login successful');
                console.log(`   User: ${data.user.name}`);
                console.log(`   Role: ${data.user.role}`);
                console.log(`   Permissions: ${data.user.permissions.length}`);
                console.log(`   Token: ${authToken.substring(0, 50)}...\n`);
                return true;
            }
        }
        
        console.log('   ❌ JWT Login failed\n');
        return false;
    } catch (error) {
        console.log(`   ❌ JWT Login error: ${error.message}\n`);
        return false;
    }
}

// Test 3: Protected Route (Products API)
async function testProtectedRoute() {
    console.log('3️⃣ Testing Protected Route (Products API)...');
    try {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/products',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        };

        const response = await makeRequest(options);
        console.log(`   Status: ${response.statusCode}`);
        console.log(`   Response: ${response.body.substring(0, 200)}...`);

        if (response.statusCode === 200) {
            console.log('   ✅ Protected route access successful\n');
            return true;
        } else {
            console.log('   ❌ Protected route access failed\n');
            return false;
        }
    } catch (error) {
        console.log(`   ❌ Protected route error: ${error.message}\n`);
        return false;
    }
}

// Test 4: Unauthorized Access
async function testUnauthorizedAccess() {
    console.log('4️⃣ Testing Unauthorized Access...');
    try {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/products',
            method: 'GET'
            // No Authorization header
        };

        const response = await makeRequest(options);
        console.log(`   Status: ${response.statusCode}`);
        console.log(`   Response: ${response.body}`);

        if (response.statusCode === 401) {
            console.log('   ✅ Unauthorized access properly blocked\n');
            return true;
        } else {
            console.log('   ❌ Unauthorized access not properly blocked\n');
            return false;
        }
    } catch (error) {
        console.log(`   ❌ Unauthorized access test error: ${error.message}\n`);
        return false;
    }
}

// Test 5: Other API Endpoints
async function testOtherAPIs() {
    console.log('5️⃣ Testing Other API Endpoints...');
    
    const endpoints = [
        '/api/dispatch',
        '/api/inventory',
        '/api/order-tracking',
        '/api/self-transfer'
    ];

    for (const endpoint of endpoints) {
        try {
            console.log(`   Testing ${endpoint}...`);
            const options = {
                hostname: 'localhost',
                port: 5000,
                path: endpoint,
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            };

            const response = await makeRequest(options);
            console.log(`   ${endpoint}: Status ${response.statusCode}`);
            
            if (response.statusCode === 200) {
                console.log(`   ✅ ${endpoint} working`);
            } else {
                console.log(`   ⚠️ ${endpoint} returned ${response.statusCode}`);
            }
        } catch (error) {
            console.log(`   ❌ ${endpoint} error: ${error.message}`);
        }
    }
    console.log('');
}

// Run all tests
async function runAllTests() {
    console.log('🧪 JWT Authentication & API Test Suite');
    console.log('=====================================\n');

    const results = {
        health: await testHealthCheck(),
        login: false,
        protected: false,
        unauthorized: false
    };

    if (results.health) {
        results.login = await testJWTLogin();
        
        if (results.login) {
            results.protected = await testProtectedRoute();
            results.unauthorized = await testUnauthorizedAccess();
            await testOtherAPIs();
        }
    }

    // Summary
    console.log('📊 Test Results Summary:');
    console.log('========================');
    console.log(`Health Check: ${results.health ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`JWT Login: ${results.login ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Protected Route: ${results.protected ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Unauthorized Block: ${results.unauthorized ? '✅ PASS' : '❌ FAIL'}`);

    const passCount = Object.values(results).filter(r => r).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`\n🎯 Overall: ${passCount}/${totalTests} tests passed`);
    
    if (passCount === totalTests) {
        console.log('🎉 All tests passed! JWT Authentication system is working correctly.');
    } else {
        console.log('⚠️ Some tests failed. Check the logs above for details.');
    }
}

// Start the test suite
runAllTests().catch(console.error);