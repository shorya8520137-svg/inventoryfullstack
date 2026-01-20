const axios = require('axios');

// Test configuration
const BASE_URL = 'http://16.171.197.86:3001';
const TEST_USER = {
    email: 'admin@company.com',
    password: 'admin123'
};

let authToken = '';

// Test results
const results = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
};

function logResult(testName, success, message = '') {
    results.total++;
    if (success) {
        results.passed++;
        console.log(`✅ ${testName}: PASSED ${message}`);
    } else {
        results.failed++;
        console.log(`❌ ${testName}: FAILED ${message}`);
    }
    results.tests.push({ name: testName, success, message });
}

async function testAPI() {
    console.log('🧪 COMPREHENSIVE API TEST STARTING');
    console.log('===================================');

    try {
        // Test 1: Login and get token
        console.log('\n1. Testing Login...');
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, TEST_USER);
        
        if (loginResponse.data.success && loginResponse.data.token) {
            authToken = loginResponse.data.token;
            logResult('Login', true, `Token: ${authToken.substring(0, 20)}...`);
        } else {
            logResult('Login', false, 'No token received');
            return;
        }

        // Set default headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

        // Test 2: Auth test endpoint
        console.log('\n2. Testing Auth Test Endpoint...');
        try {
            const authTest = await axios.get(`${BASE_URL}/api/auth/test`);
            logResult('Auth Test', authTest.status === 200, `Status: ${authTest.status}`);
        } catch (error) {
            logResult('Auth Test', false, `Error: ${error.response?.status || error.message}`);
        }

        // Test 3: User permissions
        console.log('\n3. Testing User Permissions...');
        try {
            const permissions = await axios.get(`${BASE_URL}/api/auth/permissions`);
            logResult('User Permissions', permissions.status === 200, `Permissions count: ${permissions.data.permissions?.length || 0}`);
        } catch (error) {
            logResult('User Permissions', false, `Error: ${error.response?.status || error.message}`);
        }

        // Test 4: Products API
        console.log('\n4. Testing Products API...');
        try {
            const products = await axios.get(`${BASE_URL}/api/products`);
            logResult('Products List', products.status === 200, `Products count: ${products.data.length || 0}`);
        } catch (error) {
            logResult('Products List', false, `Error: ${error.response?.status || error.message}`);
        }

        // Test 5: Inventory API
        console.log('\n5. Testing Inventory API...');
        try {
            const inventory = await axios.get(`${BASE_URL}/api/inventory`);
            logResult('Inventory List', inventory.status === 200, `Inventory items: ${inventory.data.length || 0}`);
        } catch (error) {
            logResult('Inventory List', false, `Error: ${error.response?.status || error.message}`);
        }

        // Test 6: Dispatch API
        console.log('\n6. Testing Dispatch API...');
        try {
            const dispatch = await axios.get(`${BASE_URL}/api/dispatch`);
            logResult('Dispatch List', dispatch.status === 200, `Dispatch items: ${dispatch.data.length || 0}`);
        } catch (error) {
            logResult('Dispatch List', false, `Error: ${error.response?.status || error.message}`);
        }

        // Test 7: Permissions Management
        console.log('\n7. Testing Permissions Management...');
        try {
            const permMgmt = await axios.get(`${BASE_URL}/api/permissions/users`);
            logResult('Permissions Management', permMgmt.status === 200, `Users count: ${permMgmt.data.length || 0}`);
        } catch (error) {
            logResult('Permissions Management', false, `Error: ${error.response?.status || error.message}`);
        }

        // Test 8: Bulk Upload
        console.log('\n8. Testing Bulk Upload API...');
        try {
            const bulkUpload = await axios.get(`${BASE_URL}/api/bulk-upload/status`);
            logResult('Bulk Upload Status', bulkUpload.status === 200, 'Status endpoint working');
        } catch (error) {
            logResult('Bulk Upload Status', false, `Error: ${error.response?.status || error.message}`);
        }

    } catch (error) {
        console.error('❌ Test suite failed:', error.message);
    }

    // Print summary
    console.log('\n📊 TEST SUMMARY');
    console.log('===============');
    console.log(`Total Tests: ${results.total}`);
    console.log(`Passed: ${results.passed} (${Math.round(results.passed/results.total*100)}%)`);
    console.log(`Failed: ${results.failed} (${Math.round(results.failed/results.total*100)}%)`);
    
    if (results.passed >= results.total * 0.8) {
        console.log('🎉 SERVER IS WORKING WELL! (80%+ success rate)');
    } else if (results.passed >= results.total * 0.5) {
        console.log('⚠️ SERVER HAS SOME ISSUES (50-80% success rate)');
    } else {
        console.log('🚨 SERVER HAS MAJOR ISSUES (<50% success rate)');
    }
}

// Run the test
testAPI().catch(console.error);