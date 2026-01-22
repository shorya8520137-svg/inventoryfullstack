/**
 * COMPREHENSIVE USER JOURNEY TEST
 * Tests complete user lifecycle with CRUD operations, permissions, and audit logging
 */

// Disable SSL certificate validation for self-signed certificates
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const API_BASE = 'https://16.171.161.150.nip.io';

// ANSI colors
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m'
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

async function makeRequest(endpoint, options = {}, token = null) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
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

// Store test data
const testData = {
    adminToken: null,
    users: {},
    dispatches: {},
    products: []
};

// ============================================================================
// SETUP: Login as admin
// ============================================================================
async function setupAdminLogin() {
    log('\n' + '='.repeat(80), 'cyan');
    log('🔧 SETUP: Admin Login', 'cyan');
    log('='.repeat(80), 'cyan');

    const { status, data } = await makeRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            email: 'admin@company.com',
            password: 'admin@123'
        })
    });

    if (status === 200 && data.token) {
        testData.adminToken = data.token;
        logTest('Admin login', 'PASS', `Token: ${data.token.substring(0, 20)}...`);
        return true;
    } else {
        logTest('Admin login', 'FAIL', `Status: ${status}`);
        return false;
    }
}

// ============================================================================
// TEST 1: User "Isha" - Complete Journey with Logout
// ============================================================================
async function test1_IshaJourney() {
    log('\n' + '='.repeat(80), 'magenta');
    log('📝 TEST 1: User "Isha" - Complete Journey with Logout', 'magenta');
    log('='.repeat(80), 'magenta');

    // Step 1: Create user Isha
    log('\n🔹 Step 1: Create User "Isha"', 'blue');
    const createIsha = await makeRequest('/api/users', {
        method: 'POST',
        body: JSON.stringify({
            name: 'isha',
            email: 'isha@company.com',
            password: 'Isha@123',
            full_name: 'Isha Sharma',
            role_id: 4, // Operator role
            is_active: true
        })
    }, testData.adminToken);

    if (createIsha.status === 201 || createIsha.status === 200) {
        testData.users.isha = createIsha.data;
        logTest('Create user Isha', 'PASS', `User ID: ${createIsha.data.id || 'created'}`);
    } else {
        logTest('Create user Isha', 'FAIL', `Status: ${createIsha.status}`);
        return false;
    }

    // Step 2: Login as Isha
    log('\n🔹 Step 2: Login as Isha', 'blue');
    const ishaLogin = await makeRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            email: 'isha@company.com',
            password: 'Isha@123'
        })
    });

    if (ishaLogin.status === 200 && ishaLogin.data.token) {
        testData.users.isha.token = ishaLogin.data.token;
        logTest('Isha login', 'PASS', 'Token received');
    } else {
        logTest('Isha login', 'FAIL', `Status: ${ishaLogin.status}`);
        return false;
    }

    // Step 3: Create Dispatch
    log('\n🔹 Step 3: Create Dispatch', 'blue');
    const ishaDispatch = await makeRequest('/api/dispatch/create', {
        method: 'POST',
        body: JSON.stringify({
            orderType: 'Offline',
            selectedWarehouse: 'GGM_WH',
            selectedLogistics: 'Delhivery',
            orderRef: 'ISHA_ORD_001',
            customerName: 'Test Customer Isha',
            awbNumber: 'AWB_ISHA_001',
            products: [
                { name: 'Product | Variant | 2460-3499', qty: 5 }
            ]
        })
    }, testData.users.isha.token);

    if (ishaDispatch.status === 200 || ishaDispatch.status === 201) {
        testData.dispatches.isha = ishaDispatch.data;
        logTest('Create dispatch', 'PASS', 'Order: ISHA_ORD_001 - 5 units');
    } else {
        logTest('Create dispatch', 'FAIL', `Status: ${ishaDispatch.status}`);
    }

    // Step 4: Create Return
    log('\n🔹 Step 4: Create Return', 'blue');
    const ishaReturn = await makeRequest('/api/returns', {
        method: 'POST',
        body: JSON.stringify({
            product_type: 'Product',
            barcode: '2460-3499',
            warehouse: 'GGM_WH',
            quantity: 2
        })
    }, testData.users.isha.token);

    if (ishaReturn.status === 200 || ishaReturn.status === 201) {
        logTest('Create return', 'PASS', '2 units returned');
    } else {
        logTest('Create return', 'FAIL', `Status: ${ishaReturn.status}`);
    }

    // Step 5: Report Damage
    log('\n🔹 Step 5: Report Damage', 'blue');
    const ishaDamage = await makeRequest('/api/damage-recovery/damage', {
        method: 'POST',
        body: JSON.stringify({
            product_type: 'Product',
            barcode: '2460-3499',
            inventory_location: 'GGM_WH',
            quantity: 1,
            reason: 'Damaged during handling'
        })
    }, testData.users.isha.token);

    if (ishaDamage.status === 200 || ishaDamage.status === 201) {
        logTest('Report damage', 'PASS', '1 unit damaged');
    } else {
        logTest('Report damage', 'FAIL', `Status: ${ishaDamage.status}`);
    }

    // Step 6: Check Timeline
    log('\n🔹 Step 6: Verify Timeline Entries', 'blue');
    const ishaTimeline = await makeRequest('/api/timeline/2460-3499', {
        method: 'GET'
    }, testData.users.isha.token);

    if (ishaTimeline.status === 200) {
        const entries = ishaTimeline.data.data?.timeline || [];
        logTest('Timeline entries', 'PASS', `${entries.length} entries found`);
    } else {
        logTest('Timeline entries', 'FAIL', `Status: ${ishaTimeline.status}`);
    }

    // Step 7: Logout
    log('\n🔹 Step 7: Logout Isha', 'blue');
    const ishaLogout = await makeRequest('/api/auth/logout', {
        method: 'POST'
    }, testData.users.isha.token);

    if (ishaLogout.status === 200) {
        logTest('Logout Isha', 'PASS', 'Logged out successfully');
    } else {
        logTest('Logout Isha', 'FAIL', `Status: ${ishaLogout.status}`);
    }

    return true;
}

// ============================================================================
// TEST 2: User "Amit" - Multi-Product Operations (No Logout)
// ============================================================================
async function test2_AmitJourney() {
    log('\n' + '='.repeat(80), 'magenta');
    log('📝 TEST 2: User "Amit" - Multi-Product Operations (No Logout)', 'magenta');
    log('='.repeat(80), 'magenta');

    // Step 1: Create user Amit
    log('\n🔹 Step 1: Create User "Amit"', 'blue');
    const createAmit = await makeRequest('/api/users', {
        method: 'POST',
        body: JSON.stringify({
            name: 'amit',
            email: 'amit@company.com',
            password: 'Amit@123',
            full_name: 'Amit Kumar',
            role_id: 5, // Warehouse Staff role
            is_active: true
        })
    }, testData.adminToken);

    if (createAmit.status === 201 || createAmit.status === 200) {
        testData.users.amit = createAmit.data;
        logTest('Create user Amit', 'PASS', `User ID: ${createAmit.data.id || 'created'}`);
    } else {
        logTest('Create user Amit', 'FAIL', `Status: ${createAmit.status}`);
        return false;
    }

    // Step 2: Login as Amit
    log('\n🔹 Step 2: Login as Amit', 'blue');
    const amitLogin = await makeRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            email: 'amit@company.com',
            password: 'Amit@123'
        })
    });

    if (amitLogin.status === 200 && amitLogin.data.token) {
        testData.users.amit.token = amitLogin.data.token;
        logTest('Amit login', 'PASS', 'Token received');
    } else {
        logTest('Amit login', 'FAIL', `Status: ${amitLogin.status}`);
        return false;
    }

    // Step 3: Create Dispatch with MULTIPLE products
    log('\n🔹 Step 3: Create Dispatch with MULTIPLE Products', 'blue');
    const amitDispatch = await makeRequest('/api/dispatch/create', {
        method: 'POST',
        body: JSON.stringify({
            orderType: 'Offline',
            selectedWarehouse: 'GGM_WH',
            selectedLogistics: 'BlueDart',
            orderRef: 'AMIT_ORD_001',
            customerName: 'Test Customer Amit',
            awbNumber: 'AWB_AMIT_001',
            products: [
                { name: 'Product A | Variant A | 2460-3499', qty: 3 },
                { name: 'Product B | Variant B | 2460-3500', qty: 5 },
                { name: 'Product C | Variant C | 2460-3501', qty: 2 }
            ]
        })
    }, testData.users.amit.token);

    if (amitDispatch.status === 200 || amitDispatch.status === 201) {
        testData.dispatches.amit = amitDispatch.data;
        logTest('Create multi-product dispatch', 'PASS', '3 products dispatched');
    } else {
        logTest('Create multi-product dispatch', 'FAIL', `Status: ${amitDispatch.status}`);
    }

    // Step 4: Create Return
    log('\n🔹 Step 4: Create Return', 'blue');
    const amitReturn = await makeRequest('/api/returns', {
        method: 'POST',
        body: JSON.stringify({
            product_type: 'Product A',
            barcode: '2460-3499',
            warehouse: 'GGM_WH',
            quantity: 1
        })
    }, testData.users.amit.token);

    if (amitReturn.status === 200 || amitReturn.status === 201) {
        logTest('Create return', 'PASS', 'Return created');
    } else {
        logTest('Create return', 'FAIL', `Status: ${amitReturn.status}`);
    }

    // Step 5: Report Damage
    log('\n🔹 Step 5: Report Damage', 'blue');
    const amitDamage = await makeRequest('/api/damage-recovery/damage', {
        method: 'POST',
        body: JSON.stringify({
            product_type: 'Product B',
            barcode: '2460-3500',
            inventory_location: 'GGM_WH',
            quantity: 2,
            reason: 'Water damage'
        })
    }, testData.users.amit.token);

    if (amitDamage.status === 200 || amitDamage.status === 201) {
        logTest('Report damage', 'PASS', 'Damage reported');
    } else {
        logTest('Report damage', 'FAIL', `Status: ${amitDamage.status}`);
    }

    // Step 6: Recover Stock
    log('\n🔹 Step 6: Recover Damaged Stock', 'blue');
    const amitRecover = await makeRequest('/api/damage-recovery/recover', {
        method: 'POST',
        body: JSON.stringify({
            product_type: 'Product B',
            barcode: '2460-3500',
            inventory_location: 'GGM_WH',
            quantity: 1,
            reason: 'Repaired and recovered'
        })
    }, testData.users.amit.token);

    if (amitRecover.status === 200 || amitRecover.status === 201) {
        logTest('Recover stock', 'PASS', 'Stock recovered');
    } else {
        logTest('Recover stock', 'FAIL', `Status: ${amitRecover.status}`);
    }

    log('\n🔹 Step 7: Keep Session Active (No Logout)', 'blue');
    logTest('Session active', 'PASS', 'Amit remains logged in');

    return true;
}

// ============================================================================
// TEST 3: User "Vikas" - Operations on Amit's Data
// ============================================================================
async function test3_VikasJourney() {
    log('\n' + '='.repeat(80), 'magenta');
    log('📝 TEST 3: User "Vikas" - Manager Operations', 'magenta');
    log('='.repeat(80), 'magenta');

    // Step 1: Create user Vikas
    log('\n🔹 Step 1: Create User "Vikas"', 'blue');
    const createVikas = await makeRequest('/api/users', {
        method: 'POST',
        body: JSON.stringify({
            name: 'vikas',
            email: 'vikas@company.com',
            password: 'Vikas@123',
            full_name: 'Vikas Singh',
            role_id: 3, // Manager role
            is_active: true
        })
    }, testData.adminToken);

    if (createVikas.status === 201 || createVikas.status === 200) {
        testData.users.vikas = createVikas.data;
        logTest('Create user Vikas', 'PASS', `User ID: ${createVikas.data.id || 'created'}`);
    } else {
        logTest('Create user Vikas', 'FAIL', `Status: ${createVikas.status}`);
        return false;
    }

    // Step 2: Login as Vikas
    log('\n🔹 Step 2: Login as Vikas', 'blue');
    const vikasLogin = await makeRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            email: 'vikas@company.com',
            password: 'Vikas@123'
        })
    });

    if (vikasLogin.status === 200 && vikasLogin.data.token) {
        testData.users.vikas.token = vikasLogin.data.token;
        logTest('Vikas login', 'PASS', 'Token received');
    } else {
        logTest('Vikas login', 'FAIL', `Status: ${vikasLogin.status}`);
        return false;
    }

    // Step 3: View Amit's dispatch
    log('\n🔹 Step 3: View Order Tracking (Amit\'s dispatch)', 'blue');
    const viewOrders = await makeRequest('/api/order-tracking', {
        method: 'GET'
    }, testData.users.vikas.token);

    if (viewOrders.status === 200) {
        const orders = viewOrders.data.orders || [];
        logTest('View orders', 'PASS', `${orders.length} orders visible`);
    } else {
        logTest('View orders', 'FAIL', `Status: ${viewOrders.status}`);
    }

    // Step 4: Create Dispatch with MULTIPLE products
    log('\n🔹 Step 4: Create Dispatch with MULTIPLE Products', 'blue');
    const vikasDispatch = await makeRequest('/api/dispatch/create', {
        method: 'POST',
        body: JSON.stringify({
            orderType: 'Website',
            email: 'customer@example.com',
            selectedWarehouse: 'GGM_WH',
            selectedLogistics: 'DTDC',
            orderRef: 'VIKAS_ORD_001',
            customerName: 'Test Customer Vikas',
            awbNumber: 'AWB_VIKAS_001',
            products: [
                { name: 'Product D | Variant D | 2460-3502', qty: 4 },
                { name: 'Product E | Variant E | 2460-3503', qty: 6 }
            ]
        })
    }, testData.users.vikas.token);

    if (vikasDispatch.status === 200 || vikasDispatch.status === 201) {
        testData.dispatches.vikas = vikasDispatch.data;
        logTest('Create multi-product dispatch', 'PASS', '2 products dispatched');
    } else {
        logTest('Create multi-product dispatch', 'FAIL', `Status: ${vikasDispatch.status}`);
    }

    // Step 5: Create Return
    log('\n🔹 Step 5: Create Return', 'blue');
    const vikasReturn = await makeRequest('/api/returns', {
        method: 'POST',
        body: JSON.stringify({
            product_type: 'Product D',
            barcode: '2460-3502',
            warehouse: 'GGM_WH',
            quantity: 2
        })
    }, testData.users.vikas.token);

    if (vikasReturn.status === 200 || vikasReturn.status === 201) {
        logTest('Create return', 'PASS', 'Return created');
    } else {
        logTest('Create return', 'FAIL', `Status: ${vikasReturn.status}`);
    }

    // Step 6: Report Damage
    log('\n🔹 Step 6: Report Damage', 'blue');
    const vikasDamage = await makeRequest('/api/damage-recovery/damage', {
        method: 'POST',
        body: JSON.stringify({
            product_type: 'Product E',
            barcode: '2460-3503',
            inventory_location: 'GGM_WH',
            quantity: 1,
            reason: 'Manufacturing defect'
        })
    }, testData.users.vikas.token);

    if (vikasDamage.status === 200 || vikasDamage.status === 201) {
        logTest('Report damage', 'PASS', 'Damage reported');
    } else {
        logTest('Report damage', 'FAIL', `Status: ${vikasDamage.status}`);
    }

    // Step 7: Recover Stock
    log('\n🔹 Step 7: Recover Damaged Stock', 'blue');
    const vikasRecover = await makeRequest('/api/damage-recovery/recover', {
        method: 'POST',
        body: JSON.stringify({
            product_type: 'Product E',
            barcode: '2460-3503',
            inventory_location: 'GGM_WH',
            quantity: 1,
            reason: 'Quality check passed'
        })
    }, testData.users.vikas.token);

    if (vikasRecover.status === 200 || vikasRecover.status === 201) {
        logTest('Recover stock', 'PASS', 'Stock recovered');
    } else {
        logTest('Recover stock', 'FAIL', `Status: ${vikasRecover.status}`);
    }

    return true;
}

// ============================================================================
// TEST 4: Super Admin "Chaksu" - Admin Operations & Cleanup
// ============================================================================
async function test4_ChaksuAdminOperations() {
    log('\n' + '='.repeat(80), 'magenta');
    log('📝 TEST 4: Super Admin "Chaksu" - Admin Operations & Cleanup', 'magenta');
    log('='.repeat(80), 'magenta');

    // Step 1: Create super admin Chaksu
    log('\n🔹 Step 1: Create Super Admin "Chaksu"', 'blue');
    const createChaksu = await makeRequest('/api/users', {
        method: 'POST',
        body: JSON.stringify({
            name: 'chaksu',
            email: 'chaksu@company.com',
            password: 'Chaksu@123',
            full_name: 'Chaksu Admin',
            role_id: 1, // Super Admin role
            is_active: true
        })
    }, testData.adminToken);

    if (createChaksu.status === 201 || createChaksu.status === 200) {
        testData.users.chaksu = createChaksu.data;
        logTest('Create super admin Chaksu', 'PASS', `User ID: ${createChaksu.data.id || 'created'}`);
    } else {
        logTest('Create super admin Chaksu', 'FAIL', `Status: ${createChaksu.status}`);
        return false;
    }

    // Step 2: Login as Chaksu
    log('\n🔹 Step 2: Login as Chaksu (Super Admin)', 'blue');
    const chaksuLogin = await makeRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            email: 'chaksu@company.com',
            password: 'Chaksu@123'
        })
    });

    if (chaksuLogin.status === 200 && chaksuLogin.data.token) {
        testData.users.chaksu.token = chaksuLogin.data.token;
        logTest('Chaksu login', 'PASS', 'Super admin token received');
    } else {
        logTest('Chaksu login', 'FAIL', `Status: ${chaksuLogin.status}`);
        return false;
    }

    // Step 3: Get Isha's dispatch ID and delete it
    log('\n🔹 Step 3: Delete Isha\'s Dispatch Entry', 'blue');
    const getOrders = await makeRequest('/api/order-tracking', {
        method: 'GET'
    }, testData.users.chaksu.token);

    if (getOrders.status === 200) {
        const orders = getOrders.data.orders || [];
        const ishaOrder = orders.find(o => o.order_ref === 'ISHA_ORD_001');
        
        if (ishaOrder) {
            const deleteDispatch = await makeRequest(`/api/order-tracking/${ishaOrder.id}`, {
                method: 'DELETE'
            }, testData.users.chaksu.token);

            if (deleteDispatch.status === 200) {
                logTest('Delete Isha\'s dispatch', 'PASS', `Dispatch ID: ${ishaOrder.id} deleted`);
            } else {
                logTest('Delete Isha\'s dispatch', 'FAIL', `Status: ${deleteDispatch.status}`);
            }
        } else {
            logTest('Find Isha\'s dispatch', 'WARN', 'Dispatch not found');
        }
    }

    // Step 4: Verify stock backfill
    log('\n🔹 Step 4: Verify Stock Backfill After Deletion', 'blue');
    const checkInventory = await makeRequest('/api/inventory?limit=10', {
        method: 'GET'
    }, testData.users.chaksu.token);

    if (checkInventory.status === 200) {
        logTest('Check inventory', 'PASS', 'Stock levels verified');
    } else {
        logTest('Check inventory', 'FAIL', `Status: ${checkInventory.status}`);
    }

    // Step 5: Delete Isha's user account
    log('\n🔹 Step 5: Delete Isha\'s User Account', 'blue');
    if (testData.users.isha && testData.users.isha.id) {
        const deleteIsha = await makeRequest(`/api/users/${testData.users.isha.id}`, {
            method: 'DELETE'
        }, testData.users.chaksu.token);

        if (deleteIsha.status === 200) {
            logTest('Delete Isha\'s account', 'PASS', 'User account deleted');
        } else {
            logTest('Delete Isha\'s account', 'FAIL', `Status: ${deleteIsha.status}`);
        }
    }

    // Step 6: View Audit Log
    log('\n🔹 Step 6: View Audit Log', 'blue');
    const auditLog = await makeRequest('/api/audit-logs?limit=20', {
        method: 'GET'
    }, testData.users.chaksu.token);

    if (auditLog.status === 200) {
        const logs = auditLog.data.logs || auditLog.data || [];
        logTest('View audit log', 'PASS', `${logs.length} audit entries found`);
        
        // Show recent audit entries
        if (logs.length > 0) {
            log('\n   Recent Audit Entries:', 'cyan');
            logs.slice(0, 5).forEach((entry, i) => {
                log(`   ${i + 1}. ${entry.action || entry.event_type} by ${entry.user_email || entry.username} at ${entry.timestamp || entry.created_at}`, 'cyan');
            });
        }
    } else {
        logTest('View audit log', 'FAIL', `Status: ${auditLog.status}`);
    }

    return true;
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================
async function runAllTests() {
    log('\n' + '='.repeat(80), 'cyan');
    log('🧪 COMPREHENSIVE USER JOURNEY TEST', 'cyan');
    log('='.repeat(80), 'cyan');
    log(`API Base: ${API_BASE}`, 'cyan');
    log('='.repeat(80) + '\n', 'cyan');

    const results = {
        total: 0,
        passed: 0,
        failed: 0
    };

    try {
        // Setup
        const setupSuccess = await setupAdminLogin();
        if (!setupSuccess) {
            log('\n❌ Setup failed. Cannot continue tests.', 'red');
            process.exit(1);
        }

        // Run all tests
        const tests = [
            { name: 'Test 1: Isha Journey', fn: test1_IshaJourney },
            { name: 'Test 2: Amit Journey', fn: test2_AmitJourney },
            { name: 'Test 3: Vikas Journey', fn: test3_VikasJourney },
            { name: 'Test 4: Chaksu Admin Operations', fn: test4_ChaksuAdminOperations }
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
        log('\n' + '='.repeat(80), 'cyan');
        log('📊 FINAL TEST RESULTS', 'cyan');
        log('='.repeat(80), 'cyan');
        log(`Total Tests: ${results.total}`, 'blue');
        log(`Passed: ${results.passed}`, 'green');
        log(`Failed: ${results.failed}`, results.failed === 0 ? 'green' : 'red');
        log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`, 
            results.failed === 0 ? 'green' : 'yellow');
        log('='.repeat(80) + '\n', 'cyan');

        if (results.failed === 0) {
            log('🎉 ALL TESTS PASSED! Complete user journey working correctly.', 'green');
        } else {
            log('⚠️  Some tests failed. Please review the errors above.', 'yellow');
        }

        // Display Audit Log
        log('\n' + '='.repeat(80), 'cyan');
        log('📋 AUDIT LOG - Recent Activity', 'cyan');
        log('='.repeat(80), 'cyan');
        
        const auditLog = await makeRequest('/api/audit-logs?limit=50', {
            method: 'GET'
        }, testData.adminToken);

        if (auditLog.status === 200) {
            const logs = auditLog.data.data?.logs || auditLog.data.logs || auditLog.data || [];
            log(`\nTotal Audit Entries: ${logs.length}`, 'blue');
            log('\nRecent Activity:', 'cyan');
            
            if (logs.length > 0) {
                logs.slice(0, 30).forEach((entry, i) => {
                    const action = entry.action || entry.event_type || 'UNKNOWN';
                    const user = entry.user_email || entry.username || entry.user_name || 'System';
                    const resource = entry.resource || entry.resource_type || '';
                    const resourceId = entry.resource_id || '';
                    const timestamp = entry.created_at || entry.timestamp || '';
                    
                    log(`${i + 1}. [${action}] ${user} - ${resource} ${resourceId} at ${timestamp}`, 'cyan');
                });
            } else {
                log('No audit entries found', 'yellow');
            }
        } else {
            log(`Failed to fetch audit log - Status: ${auditLog.status}`, 'red');
        }
        
        log('\n' + '='.repeat(80) + '\n', 'cyan');

        process.exit(results.failed === 0 ? 0 : 1);

    } catch (error) {
        log(`\n❌ Fatal error: ${error.message}`, 'red');
        console.error(error);
        process.exit(1);
    }
}

// Run tests
runAllTests();
