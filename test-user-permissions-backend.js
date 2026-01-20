// BACKEND TEST FOR USER PERMISSIONS
// Tests both admin and regular user API access

const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:5000';

// Test credentials
const ADMIN_CREDS = {
    email: 'admin@company.com',
    password: 'admin@123'
};

const USER_CREDS = {
    email: 'test@test.com', // Use any test user from your database
    password: 'test123'     // Adjust password as needed
};

async function testUserPermissions() {
    console.log('🧪 TESTING USER PERMISSIONS BACKEND');
    console.log('===================================');

    try {
        // Test 1: Admin login and API access
        console.log('\n1️⃣ Testing Admin User...');
        const adminResult = await testUserAPIs(ADMIN_CREDS, 'ADMIN');

        // Test 2: Regular user login and API access
        console.log('\n2️⃣ Testing Regular User...');
        const userResult = await testUserAPIs(USER_CREDS, 'USER');

        // Summary
        console.log('\n📊 TEST SUMMARY');
        console.log('===============');
        console.log(`Admin APIs: ${adminResult.success}/${adminResult.total} successful`);
        console.log(`User APIs: ${userResult.success}/${userResult.total} successful`);
        
        if (userResult.success > 0) {
            console.log('✅ USER PERMISSIONS WORKING!');
        } else {
            console.log('❌ USER PERMISSIONS STILL BROKEN');
        }

    } catch (error) {
        console.error('❌ Test error:', error.message);
    }
}

async function testUserAPIs(credentials, userType) {
    let token = null;
    let successCount = 0;
    let totalCount = 0;

    try {
        // Step 1: Login
        console.log(`\n🔐 Logging in ${userType}...`);
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, credentials);
        
        if (loginResponse.status === 200 && loginResponse.data.token) {
            token = loginResponse.data.token;
            console.log(`✅ ${userType} login successful`);
            console.log(`   Token: ${token.substring(0, 20)}...`);
            console.log(`   Role: ${loginResponse.data.user.role}`);
            console.log(`   Permissions: ${loginResponse.data.user.permissions.length}`);
        } else {
            console.log(`❌ ${userType} login failed`);
            return { success: 0, total: 1 };
        }

        // Step 2: Test API endpoints
        const apiTests = [
            { name: 'Products', url: '/api/products?page=1&limit=5' },
            { name: 'Categories', url: '/api/products/categories/all' },
            { name: 'Inventory', url: '/api/inventory?limit=10' },
            { name: 'Current User', url: '/api/auth/me' }
        ];

        console.log(`\n🔍 Testing ${apiTests.length} APIs for ${userType}...`);

        for (const test of apiTests) {
            totalCount++;
            try {
                const response = await axios.get(`${BASE_URL}${test.url}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 5000
                });

                if (response.status === 200) {
                    console.log(`   ✅ ${test.name}: ${response.status}`);
                    successCount++;
                } else {
                    console.log(`   ⚠️  ${test.name}: ${response.status}`);
                }
            } catch (error) {
                if (error.response) {
                    console.log(`   ❌ ${test.name}: ${error.response.status} ${error.response.statusText}`);
                    if (error.response.status === 403) {
                        console.log(`      Reason: ${error.response.data.message || 'Forbidden'}`);
                    }
                } else {
                    console.log(`   ❌ ${test.name}: ${error.message}`);
                }
            }
        }

    } catch (error) {
        console.log(`❌ ${userType} login error:`, error.response?.data?.message || error.message);
    }

    return { success: successCount, total: totalCount };
}

// Helper function to test specific permission
async function testSpecificPermission(token, permissionName, apiUrl) {
    try {
        const response = await axios.get(`${BASE_URL}${apiUrl}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`✅ Permission '${permissionName}' works: ${response.status}`);
        return true;
    } catch (error) {
        console.log(`❌ Permission '${permissionName}' failed: ${error.response?.status || error.message}`);
        return false;
    }
}

// Run the test
if (require.main === module) {
    testUserPermissions();
}

module.exports = { testUserPermissions };