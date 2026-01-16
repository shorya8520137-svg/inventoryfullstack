/**
 * Comprehensive JWT Authentication Test
 * Tests all API endpoints with JWT token authorization
 */

const API_BASE = 'https://16.171.161.150.nip.io';

// Test credentials
const TEST_USER = {
    email: 'admin@company.com',
    password: 'admin@123'
};

let authToken = null;

// ANSI color codes for better output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, status, details = '') {
    const symbol = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    const color = status === 'PASS' ? 'green' : status === 'FAIL' ? 'red' : 'yellow';
    log(`${symbol} ${name}`, color);
    if (details) log(`   ${details}`, 'cyan');
}

async function makeRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
            ...options.headers
        }
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();
        return { response, data, status: response.status };
    } catch (error) {
        return { error: error.message, status: 0 };
    }
}

// Test 1: Login and get JWT token
async function testLogin() {
    log('\n📝 TEST 1: Login and JWT Token Generation', 'blue');
    log('='.repeat(60), 'blue');
    
    const { response, data, status } = await makeRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(TEST_USER)
    });

    if (status === 200 && data.token) {
        authToken = data.token;
        logTest('Login successful', 'PASS', `Token received: ${authToken.substring(0, 20)}...`);
        logTest('User data received', 'PASS', `User: ${data.user?.email}, Role: ${data.user?.role_name}`);
        return true;
    } else {
        logTest('Login failed', 'FAIL', `Status: ${status}, Error: ${data.error || 'Unknown'}`);
        return false;
    }
}

// Test 2: Products API (should work - already fixed)
async function testProducts() {
    log('\n📦 TEST 2: Products API', 'blue');
    log('='.repeat(60), 'blue');
    
    const { status, data } = await makeRequest('/api/products?page=1&limit=5');
    
    if (status === 200) {
        logTest('GET /api/products', 'PASS', `Retrieved ${data.products?.length || 0} products`);
        return true;
    } else {
        logTest('GET /api/products', 'FAIL', `Status: ${status}`);
        return false;
    }
}

// Test 3: Dispatch API endpoints
async function testDispatch() {
    log('\n🚚 TEST 3: Dispatch API Endpoints', 'blue');
    log('='.repeat(60), 'blue');
    
    let passed = 0;
    let failed = 0;

    // Test warehouses
    const warehouses = await makeRequest('/api/dispatch/warehouses');
    if (warehouses.status === 200) {
        logTest('GET /api/dispatch/warehouses', 'PASS', `Retrieved ${Array.isArray(warehouses.data) ? warehouses.data.length : 0} warehouses`);
        passed++;
    } else {
        logTest('GET /api/dispatch/warehouses', 'FAIL', `Status: ${warehouses.status}`);
        failed++;
    }

    // Test logistics
    const logistics = await makeRequest('/api/dispatch/logistics');
    if (logistics.status === 200) {
        logTest('GET /api/dispatch/logistics', 'PASS', `Retrieved ${Array.isArray(logistics.data) ? logistics.data.length : 0} logistics`);
        passed++;
    } else {
        logTest('GET /api/dispatch/logistics', 'FAIL', `Status: ${logistics.status}`);
        failed++;
    }

    // Test processed persons
    const persons = await makeRequest('/api/dispatch/processed-persons');
    if (persons.status === 200) {
        logTest('GET /api/dispatch/processed-persons', 'PASS', `Retrieved ${Array.isArray(persons.data) ? persons.data.length : 0} persons`);
        passed++;
    } else {
        logTest('GET /api/dispatch/processed-persons', 'FAIL', `Status: ${persons.status}`);
        failed++;
    }

    // Test product search
    const search = await makeRequest('/api/dispatch/search-products?query=test');
    if (search.status === 200) {
        logTest('GET /api/dispatch/search-products', 'PASS', `Search working`);
        passed++;
    } else {
        logTest('GET /api/dispatch/search-products', 'FAIL', `Status: ${search.status}`);
        failed++;
    }

    log(`\nDispatch Tests: ${passed} passed, ${failed} failed`, failed === 0 ? 'green' : 'yellow');
    return failed === 0;
}

// Test 4: Order Tracking API
async function testOrderTracking() {
    log('\n📋 TEST 4: Order Tracking API', 'blue');
    log('='.repeat(60), 'blue');
    
    const { status, data } = await makeRequest('/api/order-tracking');
    
    if (status === 200) {
        logTest('GET /api/order-tracking', 'PASS', `Retrieved ${data.orders?.length || 0} orders`);
        return true;
    } else {
        logTest('GET /api/order-tracking', 'FAIL', `Status: ${status}`);
        return false;
    }
}

// Test 5: Inventory API
async function testInventory() {
    log('\n📊 TEST 5: Inventory API', 'blue');
    log('='.repeat(60), 'blue');
    
    const { status, data } = await makeRequest('/api/inventory?limit=10');
    
    if (status === 200) {
        logTest('GET /api/inventory', 'PASS', `Retrieved ${Array.isArray(data) ? data.length : 0} inventory items`);
        return true;
    } else {
        logTest('GET /api/inventory', 'FAIL', `Status: ${status}`);
        return false;
    }
}

// Test 6: Permissions API
async function testPermissions() {
    log('\n🔐 TEST 6: Permissions API', 'blue');
    log('='.repeat(60), 'blue');
    
    let passed = 0;
    let failed = 0;

    // Test users
    const users = await makeRequest('/api/users');
    if (users.status === 200) {
        logTest('GET /api/users', 'PASS', `Retrieved ${users.data?.length || 0} users`);
        passed++;
    } else {
        logTest('GET /api/users', 'FAIL', `Status: ${users.status}`);
        failed++;
    }

    // Test roles
    const roles = await makeRequest('/api/roles');
    if (roles.status === 200) {
        logTest('GET /api/roles', 'PASS', `Retrieved ${roles.data?.length || 0} roles`);
        passed++;
    } else {
        logTest('GET /api/roles', 'FAIL', `Status: ${roles.status}`);
        failed++;
    }

    // Test permissions
    const permissions = await makeRequest('/api/permissions');
    if (permissions.status === 200) {
        logTest('GET /api/permissions', 'PASS', `Retrieved ${permissions.data?.length || 0} permissions`);
        passed++;
    } else {
        logTest('GET /api/permissions', 'FAIL', `Status: ${permissions.status}`);
        failed++;
    }

    log(`\nPermissions Tests: ${passed} passed, ${failed} failed`, failed === 0 ? 'green' : 'yellow');
    return failed === 0;
}

// Test 7: Self Transfer / Inventory Ledger
async function testSelfTransfer() {
    log('\n🔄 TEST 7: Self Transfer / Inventory Ledger API', 'blue');
    log('='.repeat(60), 'blue');
    
    let passed = 0;
    let failed = 0;

    // Test ledger
    const ledger = await makeRequest('/api/inventory-ledger');
    if (ledger.status === 200) {
        logTest('GET /api/inventory-ledger', 'PASS', `Ledger accessible`);
        passed++;
    } else {
        logTest('GET /api/inventory-ledger', 'FAIL', `Status: ${ledger.status}`);
        failed++;
    }

    // Test summary
    const summary = await makeRequest('/api/inventory-ledger/summary');
    if (summary.status === 200) {
        logTest('GET /api/inventory-ledger/summary', 'PASS', `Summary accessible`);
        passed++;
    } else {
        logTest('GET /api/inventory-ledger/summary', 'FAIL', `Status: ${summary.status}`);
        failed++;
    }

    log(`\nSelf Transfer Tests: ${passed} passed, ${failed} failed`, failed === 0 ? 'green' : 'yellow');
    return failed === 0;
}

// Test 8: Returns API
async function testReturns() {
    log('\n↩️  TEST 8: Returns API', 'blue');
    log('='.repeat(60), 'blue');
    
    const { status, data } = await makeRequest('/api/returns');
    
    if (status === 200) {
        logTest('GET /api/returns', 'PASS', `Returns API accessible`);
        return true;
    } else {
        logTest('GET /api/returns', 'FAIL', `Status: ${status}`);
        return false;
    }
}

// Test 9: Store Inventory
async function testStoreInventory() {
    log('\n🏪 TEST 9: Store Inventory API', 'blue');
    log('='.repeat(60), 'blue');
    
    const { status, data } = await makeRequest('/api/store-inventory/stores');
    
    if (status === 200) {
        logTest('GET /api/store-inventory/stores', 'PASS', `Store inventory accessible`);
        return true;
    } else {
        logTest('GET /api/store-inventory/stores', 'FAIL', `Status: ${status}`);
        return false;
    }
}

// Test 10: Website Orders
async function testWebsiteOrders() {
    log('\n🌐 TEST 10: Website Orders API', 'blue');
    log('='.repeat(60), 'blue');
    
    const { status, data } = await makeRequest('/api/website/orders?page=1&limit=10');
    
    if (status === 200) {
        logTest('GET /api/website/orders', 'PASS', `Website orders accessible`);
        return true;
    } else {
        logTest('GET /api/website/orders', 'FAIL', `Status: ${status}`);
        return false;
    }
}

// Test 11: Test without token (should fail with 401)
async function testUnauthorized() {
    log('\n🚫 TEST 11: Unauthorized Access (Should Fail)', 'blue');
    log('='.repeat(60), 'blue');
    
    const savedToken = authToken;
    authToken = null; // Remove token temporarily
    
    const { status } = await makeRequest('/api/products');
    
    authToken = savedToken; // Restore token
    
    if (status === 401) {
        logTest('Unauthorized access blocked', 'PASS', 'Correctly returned 401 without token');
        return true;
    } else {
        logTest('Unauthorized access NOT blocked', 'FAIL', `Expected 401, got ${status}`);
        return false;
    }
}

// Main test runner
async function runAllTests() {
    log('\n' + '='.repeat(60), 'cyan');
    log('🧪 JWT AUTHENTICATION - COMPREHENSIVE SYSTEM TEST', 'cyan');
    log('='.repeat(60), 'cyan');
    log(`API Base: ${API_BASE}`, 'cyan');
    log(`Test User: ${TEST_USER.email}`, 'cyan');
    log('='.repeat(60) + '\n', 'cyan');

    const results = {
        total: 0,
        passed: 0,
        failed: 0
    };

    const tests = [
        { name: 'Login', fn: testLogin },
        { name: 'Products', fn: testProducts },
        { name: 'Dispatch', fn: testDispatch },
        { name: 'Order Tracking', fn: testOrderTracking },
        { name: 'Inventory', fn: testInventory },
        { name: 'Permissions', fn: testPermissions },
        { name: 'Self Transfer', fn: testSelfTransfer },
        { name: 'Returns', fn: testReturns },
        { name: 'Store Inventory', fn: testStoreInventory },
        { name: 'Website Orders', fn: testWebsiteOrders },
        { name: 'Unauthorized Access', fn: testUnauthorized }
    ];

    for (const test of tests) {
        results.total++;
        try {
            const passed = await test.fn();
            if (passed) {
                results.passed++;
            } else {
                results.failed++;
            }
        } catch (error) {
            log(`\n❌ Test "${test.name}" threw an error: ${error.message}`, 'red');
            results.failed++;
        }
    }

    // Final summary
    log('\n' + '='.repeat(60), 'cyan');
    log('📊 FINAL TEST RESULTS', 'cyan');
    log('='.repeat(60), 'cyan');
    log(`Total Tests: ${results.total}`, 'blue');
    log(`Passed: ${results.passed}`, 'green');
    log(`Failed: ${results.failed}`, results.failed === 0 ? 'green' : 'red');
    log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`, 
        results.failed === 0 ? 'green' : 'yellow');
    log('='.repeat(60) + '\n', 'cyan');

    if (results.failed === 0) {
        log('🎉 ALL TESTS PASSED! JWT authentication is working correctly.', 'green');
        log('✅ Frontend is ready to deploy to Vercel.', 'green');
    } else {
        log('⚠️  Some tests failed. Please review the errors above.', 'yellow');
    }

    process.exit(results.failed === 0 ? 0 : 1);
}

// Run tests
runAllTests().catch(error => {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
});
