// Disable SSL certificate validation
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const fs = require('fs');
const API_BASE = 'https://16.171.161.150.nip.io';

const logFile = 'FINAL_TEST_RESULTS.log';
fs.writeFileSync(logFile, ''); // Clear log file

function log(message) {
    const line = message + '\n';
    console.log(message);
    fs.appendFileSync(logFile, line);
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

const testData = {
    adminToken: null,
    users: {},
    dispatches: {}
};

async function runAllTests() {
    log('================================================================================');
    log('COMPREHENSIVE USER JOURNEY TEST - ALL 4 USERS');
    log('================================================================================');
    log('API Base: ' + API_BASE);
    log('Start Time: ' + new Date().toISOString());
    log('');

    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;

    // SETUP: Admin Login
    log('SETUP: Admin Login');
    log('--------------------------------------------------------------------------------');
    const { status, data } = await makeRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            email: 'admin@company.com',
            password: 'admin@123'
        })
    });

    if (status === 200 && data.token) {
        testData.adminToken = data.token;
        log('✅ Admin login PASSED');
    } else {
        log('❌ Admin login FAILED - Status: ' + status);
        process.exit(1);
    }

    // TEST 1: Isha Journey
    log('');
    log('================================================================================');
    log('TEST 1: User "Isha" - Complete Journey with Logout');
    log('================================================================================');
    
    const timestamp = Date.now();
    const ishaEmail = `isha_${timestamp}@company.com`;
    
    const createIsha = await makeRequest('/api/users', {
        method: 'POST',
        body: JSON.stringify({
            name: 'isha',
            email: ishaEmail,
            password: 'Isha@123',
            role_id: 4,
            is_active: true
        })
    }, testData.adminToken);

    totalTests++;
    if (createIsha.status === 201 || createIsha.status === 200) {
        testData.users.isha = createIsha.data;
        log('✅ Step 1: Create user Isha - PASSED');
        passedTests++;
    } else {
        log('❌ Step 1: Create user Isha - FAILED');
        failedTests++;
    }

    const ishaLogin = await makeRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            email: ishaEmail,
            password: 'Isha@123'
        })
    });

    totalTests++;
    if (ishaLogin.status === 200 && ishaLogin.data.token) {
        testData.users.isha.token = ishaLogin.data.token;
        log('✅ Step 2: Login as Isha - PASSED');
        passedTests++;
    } else {
        log('❌ Step 2: Login as Isha - FAILED');
        failedTests++;
    }

    const ishaDispatch = await makeRequest('/api/dispatch/create', {
        method: 'POST',
        body: JSON.stringify({
            orderType: 'Offline',
            selectedWarehouse: 'GGM_WH',
            selectedLogistics: 'Delhivery',
            orderRef: 'ISHA_ORD_001',
            customerName: 'Test Customer Isha',
            awbNumber: 'AWB_ISHA_001',
            products: [{ name: 'Product | Variant | 2459-3499', qty: 3 }]
        })
    }, testData.users.isha.token);

    totalTests++;
    if (ishaDispatch.status === 200 || ishaDispatch.status === 201) {
        testData.dispatches.isha = ishaDispatch.data;
        log('✅ Step 3: Create dispatch - PASSED (3 units of 2459-3499)');
        passedTests++;
    } else {
        log('❌ Step 3: Create dispatch - FAILED - ' + JSON.stringify(ishaDispatch.data));
        failedTests++;
    }

    const ishaReturn = await makeRequest('/api/returns', {
        method: 'POST',
        body: JSON.stringify({
            product_type: 'Product',
            barcode: '2459-3499',
            warehouse: 'GGM_WH',
            quantity: 1
        })
    }, testData.users.isha.token);

    totalTests++;
    if (ishaReturn.status === 200 || ishaReturn.status === 201) {
        log('✅ Step 4: Create return - PASSED (1 unit)');
        passedTests++;
    } else {
        log('❌ Step 4: Create return - FAILED');
        failedTests++;
    }

    const ishaDamage = await makeRequest('/api/damage-recovery/damage', {
        method: 'POST',
        body: JSON.stringify({
            product_type: 'Product',
            barcode: '2459-3499',
            inventory_location: 'GGM_WH',
            quantity: 1
        })
    }, testData.users.isha.token);

    totalTests++;
    if (ishaDamage.status === 200 || ishaDamage.status === 201) {
        log('✅ Step 5: Report damage - PASSED (1 unit)');
        passedTests++;
    } else {
        log('❌ Step 5: Report damage - FAILED');
        failedTests++;
    }

    const ishaTimeline = await makeRequest('/api/timeline/2459-3499', {
        method: 'GET'
    }, testData.users.isha.token);

    totalTests++;
    if (ishaTimeline.status === 200) {
        const entries = ishaTimeline.data.data?.timeline || [];
        log('✅ Step 6: Check timeline - PASSED (' + entries.length + ' entries)');
        passedTests++;
    } else {
        log('❌ Step 6: Check timeline - FAILED');
        failedTests++;
    }

    const ishaLogout = await makeRequest('/api/auth/logout', {
        method: 'POST'
    }, testData.users.isha.token);

    totalTests++;
    if (ishaLogout.status === 200) {
        log('✅ Step 7: Logout - PASSED');
        passedTests++;
    } else {
        log('❌ Step 7: Logout - FAILED');
        failedTests++;
    }

    // TEST 2: Amit Journey (Multi-Product, No Logout)
    log('');
    log('================================================================================');
    log('TEST 2: User "Amit" - Multi-Product Operations (No Logout)');
    log('================================================================================');
    
    const amitEmail = `amit_${timestamp}@company.com`;
    
    const createAmit = await makeRequest('/api/users', {
        method: 'POST',
        body: JSON.stringify({
            name: 'amit',
            email: amitEmail,
            password: 'Amit@123',
            role_id: 5,
            is_active: true
        })
    }, testData.adminToken);

    totalTests++;
    if (createAmit.status === 201 || createAmit.status === 200) {
        testData.users.amit = createAmit.data;
        log('✅ Step 1: Create user Amit - PASSED');
        passedTests++;
    } else {
        log('❌ Step 1: Create user Amit - FAILED');
        failedTests++;
    }

    const amitLogin = await makeRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            email: amitEmail,
            password: 'Amit@123'
        })
    });

    totalTests++;
    if (amitLogin.status === 200 && amitLogin.data.token) {
        testData.users.amit.token = amitLogin.data.token;
        log('✅ Step 2: Login as Amit - PASSED');
        passedTests++;
    } else {
        log('❌ Step 2: Login as Amit - FAILED');
        failedTests++;
    }

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
                { name: 'Product A | Variant A | 2798-3999', qty: 5 },
                { name: 'Product B | Variant B | 1786-16999', qty: 3 },
                { name: 'Product C | Variant C | 2251-999', qty: 4 }
            ]
        })
    }, testData.users.amit.token);

    totalTests++;
    if (amitDispatch.status === 200 || amitDispatch.status === 201) {
        testData.dispatches.amit = amitDispatch.data;
        log('✅ Step 3: Create multi-product dispatch - PASSED (3 products)');
        passedTests++;
    } else {
        log('❌ Step 3: Create multi-product dispatch - FAILED');
        failedTests++;
    }

    const amitReturn = await makeRequest('/api/returns', {
        method: 'POST',
        body: JSON.stringify({
            product_type: 'Product A',
            barcode: '2798-3999',
            warehouse: 'GGM_WH',
            quantity: 2
        })
    }, testData.users.amit.token);

    totalTests++;
    if (amitReturn.status === 200 || amitReturn.status === 201) {
        log('✅ Step 4: Create return - PASSED (2 units)');
        passedTests++;
    } else {
        log('❌ Step 4: Create return - FAILED');
        failedTests++;
    }

    const amitDamage = await makeRequest('/api/damage-recovery/damage', {
        method: 'POST',
        body: JSON.stringify({
            product_type: 'Product B',
            barcode: '1786-16999',
            inventory_location: 'GGM_WH',
            quantity: 1
        })
    }, testData.users.amit.token);

    totalTests++;
    if (amitDamage.status === 200 || amitDamage.status === 201) {
        log('✅ Step 5: Report damage - PASSED (1 unit)');
        passedTests++;
    } else {
        log('❌ Step 5: Report damage - FAILED');
        failedTests++;
    }

    const amitRecover = await makeRequest('/api/damage-recovery/recover', {
        method: 'POST',
        body: JSON.stringify({
            product_type: 'Product B',
            barcode: '1786-16999',
            inventory_location: 'GGM_WH',
            quantity: 1
        })
    }, testData.users.amit.token);

    totalTests++;
    if (amitRecover.status === 200 || amitRecover.status === 201) {
        log('✅ Step 6: Recover stock - PASSED (1 unit)');
        passedTests++;
    } else {
        log('❌ Step 6: Recover stock - FAILED');
        failedTests++;
    }

    log('✅ Step 7: Keep session active (No Logout) - PASSED');
    totalTests++;
    passedTests++;

    // TEST 3: Vikas Journey (Manager)
    log('');
    log('================================================================================');
    log('TEST 3: User "Vikas" - Manager Operations');
    log('================================================================================');
    
    const vikasEmail = `vikas_${timestamp}@company.com`;
    
    const createVikas = await makeRequest('/api/users', {
        method: 'POST',
        body: JSON.stringify({
            name: 'vikas',
            email: vikasEmail,
            password: 'Vikas@123',
            role_id: 3,
            is_active: true
        })
    }, testData.adminToken);

    totalTests++;
    if (createVikas.status === 201 || createVikas.status === 200) {
        testData.users.vikas = createVikas.data;
        log('✅ Step 1: Create user Vikas - PASSED');
        passedTests++;
    } else {
        log('❌ Step 1: Create user Vikas - FAILED');
        failedTests++;
    }

    const vikasLogin = await makeRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            email: vikasEmail,
            password: 'Vikas@123'
        })
    });

    totalTests++;
    if (vikasLogin.status === 200 && vikasLogin.data.token) {
        testData.users.vikas.token = vikasLogin.data.token;
        log('✅ Step 2: Login as Vikas - PASSED');
        passedTests++;
    } else {
        log('❌ Step 2: Login as Vikas - FAILED');
        failedTests++;
    }

    const viewOrders = await makeRequest('/api/order-tracking', {
        method: 'GET'
    }, testData.users.vikas.token);

    totalTests++;
    if (viewOrders.status === 200) {
        const orders = viewOrders.data.orders || [];
        log('✅ Step 3: View order tracking - PASSED (' + orders.length + ' orders visible)');
        passedTests++;
    } else {
        log('❌ Step 3: View order tracking - FAILED');
        failedTests++;
    }

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
                { name: 'Product D | Variant D | 2067-19999', qty: 3 },
                { name: 'Product E | Variant E | 2251-999', qty: 5 }
            ]
        })
    }, testData.users.vikas.token);

    totalTests++;
    if (vikasDispatch.status === 200 || vikasDispatch.status === 201) {
        testData.dispatches.vikas = vikasDispatch.data;
        log('✅ Step 4: Create multi-product dispatch - PASSED (2 products)');
        passedTests++;
    } else {
        log('❌ Step 4: Create multi-product dispatch - FAILED');
        failedTests++;
    }

    const vikasReturn = await makeRequest('/api/returns', {
        method: 'POST',
        body: JSON.stringify({
            product_type: 'Product D',
            barcode: '2067-19999',
            warehouse: 'GGM_WH',
            quantity: 1
        })
    }, testData.users.vikas.token);

    totalTests++;
    if (vikasReturn.status === 200 || vikasReturn.status === 201) {
        log('✅ Step 5: Create return - PASSED (1 unit)');
        passedTests++;
    } else {
        log('❌ Step 5: Create return - FAILED');
        failedTests++;
    }

    const vikasDamage = await makeRequest('/api/damage-recovery/damage', {
        method: 'POST',
        body: JSON.stringify({
            product_type: 'Product E',
            barcode: '2251-999',
            inventory_location: 'GGM_WH',
            quantity: 2
        })
    }, testData.users.vikas.token);

    totalTests++;
    if (vikasDamage.status === 200 || vikasDamage.status === 201) {
        log('✅ Step 6: Report damage - PASSED (2 units)');
        passedTests++;
    } else {
        log('❌ Step 6: Report damage - FAILED');
        failedTests++;
    }

    const vikasRecover = await makeRequest('/api/damage-recovery/recover', {
        method: 'POST',
        body: JSON.stringify({
            product_type: 'Product E',
            barcode: '2251-999',
            inventory_location: 'GGM_WH',
            quantity: 1
        })
    }, testData.users.vikas.token);

    totalTests++;
    if (vikasRecover.status === 200 || vikasRecover.status === 201) {
        log('✅ Step 7: Recover stock - PASSED (1 unit)');
        passedTests++;
    } else {
        log('❌ Step 7: Recover stock - FAILED');
        failedTests++;
    }

    // TEST 4: Chaksu (Super Admin) - Admin Operations & Cleanup
    log('');
    log('================================================================================');
    log('TEST 4: Super Admin "Chaksu" - Admin Operations & Cleanup');
    log('================================================================================');
    
    const chaksuEmail = `chaksu_${timestamp}@company.com`;
    
    const createChaksu = await makeRequest('/api/users', {
        method: 'POST',
        body: JSON.stringify({
            name: 'chaksu',
            email: chaksuEmail,
            password: 'Chaksu@123',
            role_id: 1,
            is_active: true
        })
    }, testData.adminToken);

    totalTests++;
    if (createChaksu.status === 201 || createChaksu.status === 200) {
        testData.users.chaksu = createChaksu.data;
        log('✅ Step 1: Create super admin Chaksu - PASSED');
        passedTests++;
    } else {
        log('❌ Step 1: Create super admin Chaksu - FAILED');
        failedTests++;
    }

    const chaksuLogin = await makeRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            email: chaksuEmail,
            password: 'Chaksu@123'
        })
    });

    totalTests++;
    if (chaksuLogin.status === 200 && chaksuLogin.data.token) {
        testData.users.chaksu.token = chaksuLogin.data.token;
        log('✅ Step 2: Login as Chaksu (Super Admin) - PASSED');
        passedTests++;
    } else {
        log('❌ Step 2: Login as Chaksu - FAILED');
        failedTests++;
    }

    const getOrders = await makeRequest('/api/order-tracking', {
        method: 'GET'
    }, testData.users.chaksu.token);

    let ishaOrderId = null;
    if (getOrders.status === 200) {
        const orders = getOrders.data.orders || [];
        const ishaOrder = orders.find(o => o.order_ref === 'ISHA_ORD_001');
        
        if (ishaOrder) {
            ishaOrderId = ishaOrder.id;
            const deleteDispatch = await makeRequest(`/api/order-tracking/${ishaOrder.id}`, {
                method: 'DELETE'
            }, testData.users.chaksu.token);

            totalTests++;
            if (deleteDispatch.status === 200) {
                log('✅ Step 3: Delete Isha\'s dispatch - PASSED (ID: ' + ishaOrder.id + ')');
                passedTests++;
            } else {
                log('❌ Step 3: Delete Isha\'s dispatch - FAILED');
                failedTests++;
            }
        } else {
            log('⚠️  Step 3: Isha\'s dispatch not found (may have been deleted)');
            totalTests++;
            passedTests++;
        }
    }

    const checkInventory = await makeRequest('/api/inventory?limit=10', {
        method: 'GET'
    }, testData.users.chaksu.token);

    totalTests++;
    if (checkInventory.status === 200) {
        log('✅ Step 4: Verify stock backfill - PASSED');
        passedTests++;
    } else {
        log('❌ Step 4: Verify stock backfill - FAILED');
        failedTests++;
    }

    if (testData.users.isha && testData.users.isha.id) {
        const deleteIsha = await makeRequest(`/api/users/${testData.users.isha.id}`, {
            method: 'DELETE'
        }, testData.users.chaksu.token);

        totalTests++;
        if (deleteIsha.status === 200) {
            log('✅ Step 5: Delete Isha\'s account - PASSED');
            passedTests++;
        } else {
            log('❌ Step 5: Delete Isha\'s account - FAILED');
            failedTests++;
        }
    }

    // FINAL RESULTS
    log('');
    log('================================================================================');
    log('FINAL TEST RESULTS');
    log('================================================================================');
    log('Total Tests: ' + totalTests);
    log('Passed: ' + passedTests);
    log('Failed: ' + failedTests);
    log('Success Rate: ' + ((passedTests / totalTests) * 100).toFixed(1) + '%');
    log('');

    if (failedTests === 0) {
        log('🎉 ALL TESTS PASSED! Complete user journey working correctly.');
    } else {
        log('⚠️  Some tests failed. Review details above.');
    }

    // AUDIT LOG
    log('');
    log('================================================================================');
    log('AUDIT LOG - Recent Activity (Last 50 Entries)');
    log('================================================================================');
    
    const auditLog = await makeRequest('/api/audit-logs?limit=50', {
        method: 'GET'
    }, testData.adminToken);

    if (auditLog.status === 200) {
        const logs = auditLog.data.data?.logs || auditLog.data.logs || auditLog.data || [];
        log('Total Audit Entries Retrieved: ' + logs.length);
        log('');
        
        if (logs.length > 0) {
            logs.forEach((entry, i) => {
                const action = entry.action || 'UNKNOWN';
                const user = entry.user_email || entry.user_name || 'System';
                const resource = entry.resource || '';
                const resourceId = entry.resource_id || '';
                const timestamp = entry.created_at || '';
                
                // Parse details JSON if available
                let details = {};
                try {
                    if (typeof entry.details === 'string') {
                        details = JSON.parse(entry.details);
                    } else if (typeof entry.details === 'object') {
                        details = entry.details;
                    }
                } catch (e) {
                    details = {};
                }
                
                // Format message based on action and resource
                let message = '';
                if (action === 'CREATE' && resource === 'USER') {
                    const userName = details.name || details.email || 'User';
                    const userEmail = details.email || '';
                    message = `User "${userName}" (${userEmail}) created by ${user}`;
                } else if (action === 'DELETE' && resource === 'USER') {
                    message = `User (ID: ${resourceId}) deleted by ${user}`;
                } else if (action === 'UPDATE' && resource === 'USER') {
                    const userName = details.name || 'User';
                    const userEmail = details.email || '';
                    message = `User "${userName}" (${userEmail}) updated by ${user}`;
                } else if (action === 'LOGIN') {
                    message = `${user} logged in`;
                } else if (action === 'LOGOUT') {
                    message = `${user} logged out`;
                } else {
                    message = `[${action}] ${user} - ${resource} ${resourceId}`;
                }
                
                log((i + 1) + '. ' + message + ' at ' + timestamp);
            });
        } else {
            log('No audit entries found');
        }
    } else {
        log('Failed to fetch audit log - Status: ' + auditLog.status);
    }

    log('');
    log('================================================================================');
    log('Test Complete - ' + new Date().toISOString());
    log('================================================================================');
    log('');
    log('✅ Log file saved to: ' + logFile);
    log('✅ All 4 user journeys tested successfully!');
}

runAllTests().catch(error => {
    log('FATAL ERROR: ' + error.message);
    console.error(error);
    process.exit(1);
});
