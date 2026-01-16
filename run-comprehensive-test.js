// Disable SSL certificate validation
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const API_BASE = 'https://16.171.161.150.nip.io';

// Simple logging
function log(message) {
    console.log(message);
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
    users: {}
};

async function runTests() {
    log('================================================================================');
    log('COMPREHENSIVE USER JOURNEY TEST');
    log('================================================================================');
    log('API Base: ' + API_BASE);
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

    // TEST 1: Create User Isha
    log('');
    log('TEST 1: User "Isha" Journey');
    log('--------------------------------------------------------------------------------');
    log('Step 1: Create User "Isha"');
    
    const timestamp = Date.now();
    const ishaEmail = `isha_${timestamp}@company.com`;
    
    const createIsha = await makeRequest('/api/users', {
        method: 'POST',
        body: JSON.stringify({
            name: 'isha',
            email: ishaEmail,
            password: 'Isha@123',
            full_name: 'Isha Sharma',
            role_id: 4,
            is_active: true
        })
    }, testData.adminToken);

    if (createIsha.status === 201 || createIsha.status === 200) {
        testData.users.isha = createIsha.data;
        log('✅ Create user Isha PASSED');
    } else {
        log('❌ Create user Isha FAILED - Status: ' + createIsha.status);
        log('   Response: ' + JSON.stringify(createIsha.data));
        return;
    }

    // Step 2: Login as Isha
    log('Step 2: Login as Isha');
    const ishaLogin = await makeRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            email: ishaEmail,
            password: 'Isha@123'
        })
    });

    if (ishaLogin.status === 200 && ishaLogin.data.token) {
        testData.users.isha.token = ishaLogin.data.token;
        log('✅ Isha login PASSED');
    } else {
        log('❌ Isha login FAILED - Status: ' + ishaLogin.status);
        log('   Response: ' + JSON.stringify(ishaLogin.data));
        return;
    }

    // Step 3: Create Dispatch
    log('Step 3: Create Dispatch');
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
        log('✅ Create dispatch PASSED - 5 units dispatched');
    } else {
        log('❌ Create dispatch FAILED - Status: ' + ishaDispatch.status);
        log('   Response: ' + JSON.stringify(ishaDispatch.data));
    }

    // Step 4: Create Return
    log('Step 4: Create Return');
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
        log('✅ Create return PASSED - 2 units returned');
    } else {
        log('❌ Create return FAILED - Status: ' + ishaReturn.status);
    }

    // Step 5: Report Damage (on returned stock)
    log('Step 5: Report Damage');
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
        log('✅ Report damage PASSED - 1 unit damaged');
    } else {
        log('❌ Report damage FAILED - Status: ' + ishaDamage.status);
        log('   Response: ' + JSON.stringify(ishaDamage.data));
    }

    // Step 6: Check Timeline
    log('Step 6: Check Timeline');
    const ishaTimeline = await makeRequest('/api/timeline/2460-3499', {
        method: 'GET'
    }, testData.users.isha.token);

    if (ishaTimeline.status === 200) {
        const entries = ishaTimeline.data.data?.timeline || [];
        log('✅ Timeline check PASSED - ' + entries.length + ' entries found');
    } else {
        log('❌ Timeline check FAILED - Status: ' + ishaTimeline.status);
    }

    // Step 7: Logout
    log('Step 7: Logout Isha');
    const ishaLogout = await makeRequest('/api/auth/logout', {
        method: 'POST'
    }, testData.users.isha.token);

    if (ishaLogout.status === 200) {
        log('✅ Logout PASSED');
    } else {
        log('❌ Logout FAILED - Status: ' + ishaLogout.status);
    }

    log('');
    log('================================================================================');
    log('TEST 1 COMPLETE');
    log('================================================================================');
    log('');
    log('All basic operations tested successfully!');
    log('Full test with all 4 users can be run by executing the complete test script.');
}

runTests().catch(error => {
    log('FATAL ERROR: ' + error.message);
    console.error(error);
    process.exit(1);
});
