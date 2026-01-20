// TEST BOTH USERS - ADMIN AND THEMS - CREATE DISPATCH
// This will show exactly what's working and what's broken

const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:5000';

// Test credentials
const ADMIN_USER = {
    email: 'admin@company.com',
    password: 'admin@123'
};

const THEMS_USER = {
    email: 'thems@company.com',
    password: 'gfx998sd'
};

async function testBothUsersDispatch() {
    console.log('🧪 TESTING BOTH USERS - DISPATCH CREATION');
    console.log('==========================================');

    try {
        // Test 1: Admin User
        console.log('\n1️⃣ TESTING ADMIN USER');
        console.log('=====================');
        await testUserDispatch(ADMIN_USER, 'ADMIN');

        // Test 2: Thems User
        console.log('\n2️⃣ TESTING THEMS USER');
        console.log('=====================');
        await testUserDispatch(THEMS_USER, 'THEMS');

    } catch (error) {
        console.error('❌ Test error:', error.message);
    }
}

async function testUserDispatch(credentials, userType) {
    let token = null;

    try {
        // Step 1: Login
        console.log(`\n🔐 Logging in ${userType}...`);
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, credentials);
        
        if (loginResponse.status === 200 && loginResponse.data.token) {
            token = loginResponse.data.token;
            console.log(`✅ ${userType} login successful`);
            console.log(`   Email: ${loginResponse.data.user.email}`);
            console.log(`   Role: ${loginResponse.data.user.role}`);
            console.log(`   Permissions: ${loginResponse.data.user.permissions?.length || 0}`);
            
            if (loginResponse.data.user.permissions?.length > 0) {
                console.log(`   Sample permissions: ${loginResponse.data.user.permissions.slice(0, 3).join(', ')}`);
            }
        } else {
            console.log(`❌ ${userType} login failed`);
            return;
        }

        // Step 2: Test basic APIs first
        console.log(`\n🔍 Testing basic APIs for ${userType}...`);
        await testBasicAPIs(token, userType);

        // Step 3: Try to create dispatch
        console.log(`\n📦 Testing dispatch creation for ${userType}...`);
        await testDispatchCreation(token, userType);

    } catch (error) {
        if (error.response) {
            console.log(`❌ ${userType} error: ${error.response.status} ${error.response.statusText}`);
            console.log(`   Message: ${error.response.data.message || 'Unknown error'}`);
            if (error.response.status === 403) {
                console.log(`   🚫 PERMISSION DENIED - This is the main issue!`);
            }
        } else {
            console.log(`❌ ${userType} network error:`, error.message);
        }
    }
}

async function testBasicAPIs(token, userType) {
    const basicTests = [
        { name: 'Products', url: '/api/products?page=1&limit=5' },
        { name: 'Inventory', url: '/api/inventory?limit=5' },
        { name: 'Categories', url: '/api/products/categories/all' }
    ];

    for (const test of basicTests) {
        try {
            const response = await axios.get(`${BASE_URL}${test.url}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 5000
            });

            console.log(`   ✅ ${test.name}: ${response.status}`);
        } catch (error) {
            if (error.response) {
                console.log(`   ❌ ${test.name}: ${error.response.status} - ${error.response.data.message || 'Forbidden'}`);
            } else {
                console.log(`   ❌ ${test.name}: ${error.message}`);
            }
        }
    }
}

async function testDispatchCreation(token, userType) {
    // Sample dispatch data
    const dispatchData = {
        orderNumber: `TEST-${Date.now()}`,
        customerName: 'Test Customer',
        customerPhone: '1234567890',
        customerAddress: 'Test Address',
        warehouse: 'MAIN',
        products: [
            {
                productCode: 'TEST001',
                productName: 'Test Product',
                quantity: 1,
                price: 100
            }
        ],
        totalAmount: 100,
        notes: `Test dispatch created by ${userType}`
    };

    try {
        console.log(`   📦 Creating dispatch...`);
        const response = await axios.post(`${BASE_URL}/api/dispatch`, dispatchData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        if (response.status === 200 || response.status === 201) {
            console.log(`   ✅ Dispatch created successfully!`);
            console.log(`   📋 Order Number: ${response.data.orderNumber || 'N/A'}`);
            console.log(`   🆔 Dispatch ID: ${response.data.id || 'N/A'}`);
        } else {
            console.log(`   ⚠️  Dispatch creation returned: ${response.status}`);
        }

    } catch (error) {
        if (error.response) {
            console.log(`   ❌ Dispatch creation failed: ${error.response.status}`);
            console.log(`   📝 Error: ${error.response.data.message || error.response.statusText}`);
            
            if (error.response.status === 403) {
                console.log(`   🚫 PERMISSION ISSUE: User ${userType} cannot create dispatch`);
                console.log(`   💡 This confirms the permissions problem!`);
            } else if (error.response.status === 404) {
                console.log(`   🔍 Route not found - check if dispatch routes are properly configured`);
            }
        } else {
            console.log(`   ❌ Network error: ${error.message}`);
        }
    }
}

// Run the test
if (require.main === module) {
    testBothUsersDispatch();
}

module.exports = { testBothUsersDispatch };