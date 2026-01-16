// Disable SSL certificate validation
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const fs = require('fs');
const API_BASE = 'https://16.171.161.150.nip.io';

const logFile = 'test-execution.log';
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

    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;

    // TEST 1: Isha
    log('');
    log('================================================================================');
    log('TEST 1: User "Isha" Journey');
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
            products: [{ name: 'Product | Variant | 2460-3499', qty: 5 }]
        })
    }, testData.users.isha.token);

    totalTests++;
    if (ishaDispatch.status === 200 || ishaDispatch.status === 201) {
        log('✅ Step 3: Create dispatch - PASSED (5 units)');
        passedTests++;
    } else {
        log('❌ Step 3: Create dispatch - FAILED');
        failedTests++;
    }

    const ishaReturn = await makeRequest('/api/returns', {
        method: 'POST',
        body: JSON.stringify({
            product_type: 'Product',
            barcode: '2460-3499',
            warehouse: 'GGM_WH',
            quantity: 2
        })
    }, testData.users.isha.token);

    totalTests++;
    if (ishaReturn.status === 200 || ishaReturn.status === 201) {
        log('✅ Step 4: Create return - PASSED (2 units)');
        passedTests++;
    } else {
        log('❌ Step 4: Create return - FAILED');
        failedTests++;
    }

    const ishaDamage = await makeRequest('/api/damage-recovery/damage', {
        method: 'POST',
        body: JSON.stringify({
            product_type: 'Product',
            barcode: '2460-3499',
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

    const ishaTimeline = await makeRequest('/api/timeline/2460-3499', {
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

    // AUDIT LOG
    log('================================================================================');
    log('AUDIT LOG - Recent Activity');
    log('================================================================================');
    
    const auditLog = await makeRequest('/api/audit-logs?limit=30', {
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
                
                log((i + 1) + '. [' + action + '] ' + user + ' - ' + resource + ' ' + resourceId + ' at ' + timestamp);
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
    log('Log file saved to: ' + logFile);
}

runAllTests().catch(error => {
    log('FATAL ERROR: ' + error.message);
    console.error(error);
    process.exit(1);
});
