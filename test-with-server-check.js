// TEST WITH SERVER CHECK - BOTH USERS DISPATCH
require('dotenv').config();
const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:5000';

const ADMIN_USER = {
    email: 'admin@company.com',
    password: 'admin@123'
};

const THEMS_USER = {
    email: 'thems@company.com',
    password: 'gfx998sd'
};

async function checkServerAndTest() {
    console.log('🔍 CHECKING SERVER STATUS');
    console.log('=========================');

    try {
        // Check if server is running
        const healthCheck = await axios.get(`${BASE_URL}/`, { timeout: 3000 });
        console.log('✅ Server is running');
        console.log(`📡 Response: ${healthCheck.data.service || 'OK'}`);
        
        // Now run the actual tests
        await testBothUsers();
        
    } catch (error) {
        console.log('❌ Server is not running or not accessible');
        console.log(`🔗 Trying to connect to: ${BASE_URL}`);
        console.log('💡 Please start your server first:');
        console.log('   npm start');
        console.log('   OR');
        console.log('   node server.js');
        return;
    }
}

async function testBothUsers() {
    console.log('\n🧪 TESTING BOTH USERS - DISPATCH CREATION');
    console.log('==========================================');

    // Test Admin
    console.log('\n1️⃣ TESTING ADMIN USER');
    console.log('=====================');
    const adminResult = await testUser(ADMIN_USER, 'ADMIN');

    // Test Thems
    console.log('\n2️⃣ TESTING THEMS USER');  
    console.log('=====================');
    const themsResult = await testUser(THEMS_USER, 'THEMS');

    // Summary
    console.log('\n📊 TEST SUMMARY');
    console.log('===============');
    console.log(`Admin Login: ${adminResult.login ? '✅' : '❌'}`);
    console.log(`Admin APIs: ${adminResult.apis ? '✅' : '❌'}`);
    console.log(`Admin Dispatch: ${adminResult.dispatch ? '✅' : '❌'}`);
    console.log('');
    console.log(`Thems Login: ${themsResult.login ? '✅' : '❌'}`);
    console.log(`Thems APIs: ${themsResult.apis ? '✅' : '❌'}`);
    console.log(`Thems Dispatch: ${themsResult.dispatch ? '✅' : '❌'}`);

    if (adminResult.login && !themsResult.apis) {
        console.log('\n🎯 ISSUE CONFIRMED: Admin works, Thems gets 403 errors');
        console.log('💡 This is a permissions system issue');
    }
}

async function testUser(credentials, userType) {
    const result = { login: false, apis: false, dispatch: false };
    let token = null;

    try {
        // Login test
        console.log(`🔐 Logging in ${userType}...`);
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, credentials);
        
        if (loginResponse.status === 200 && loginResponse.data.token) {
            result.login = true;
            token = loginResponse.data.token;
            console.log(`✅ ${userType} login successful`);
            console.log(`   Role: ${loginResponse.data.user.role}`);
            console.log(`   Permissions: ${loginResponse.data.user.permissions?.length || 0}`);
        } else {
            console.log(`❌ ${userType} login failed`);
            return result;
        }

        // API test
        console.log(`🔍 Testing APIs...`);
        try {
            const apiResponse = await axios.get(`${BASE_URL}/api/products?page=1&limit=5`, {
                headers: { 'Authorization': `Bearer ${token}` },
                timeout: 5000
            });
            
            if (apiResponse.status === 200) {
                result.apis = true;
                console.log(`✅ ${userType} APIs working`);
            }
        } catch (apiError) {
            console.log(`❌ ${userType} API failed: ${apiError.response?.status || apiError.message}`);
            if (apiError.response?.status === 403) {
                console.log(`   🚫 PERMISSION DENIED - This is the issue!`);
            }
        }

        // Dispatch test (only if APIs work)
        if (result.apis) {
            console.log(`📦 Testing dispatch creation...`);
            try {
                const dispatchData = {
                    orderNumber: `TEST-${userType}-${Date.now()}`,
                    customerName: 'Test Customer',
                    warehouse: 'MAIN',
                    products: [{ productCode: 'TEST001', quantity: 1 }]
                };

                const dispatchResponse = await axios.post(`${BASE_URL}/api/dispatch`, dispatchData, {
                    headers: { 'Authorization': `Bearer ${token}` },
                    timeout: 5000
                });

                if (dispatchResponse.status === 200 || dispatchResponse.status === 201) {
                    result.dispatch = true;
                    console.log(`✅ ${userType} dispatch created`);
                }
            } catch (dispatchError) {
                console.log(`❌ ${userType} dispatch failed: ${dispatchError.response?.status || dispatchError.message}`);
            }
        } else {
            console.log(`⏭️  Skipping dispatch test (APIs not working)`);
        }

    } catch (error) {
        console.log(`❌ ${userType} test error:`, error.message);
    }

    return result;
}

// Run the test
if (require.main === module) {
    checkServerAndTest();
}

module.exports = { checkServerAndTest };