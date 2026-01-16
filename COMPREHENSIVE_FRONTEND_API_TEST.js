/**
 * COMPREHENSIVE FRONTEND API TEST
 * Tests all API endpoints used across the frontend application
 */

// Disable SSL certificate validation
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const fs = require('fs');
const API_BASE = 'https://16.171.161.150.nip.io';

const logFile = 'FRONTEND_API_TEST_RESULTS.log';
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

let adminToken = null;

async function testAPI(name, endpoint, method = 'GET', body = null) {
    const { status, data, error } = await makeRequest(endpoint, {
        method,
        ...(body && { body: JSON.stringify(body) })
    }, adminToken);

    if (status >= 200 && status < 300) {
        log(`✅ ${name} - ${method} ${endpoint} - Status: ${status}`);
        return true;
    } else {
        log(`❌ ${name} - ${method} ${endpoint} - Status: ${status} - ${error || JSON.stringify(data)}`);
        return false;
    }
}

async function runAllTests() {
    log('================================================================================');
    log('COMPREHENSIVE FRONTEND API TEST');
    log('================================================================================');
    log('API Base: ' + API_BASE);
    log('Start Time: ' + new Date().toISOString());
    log('');

    let totalTests = 0;
    let passedTests = 0;

    // Login first
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
        adminToken = data.token;
        log('✅ Admin login successful');
    } else {
        log('❌ Admin login failed - Cannot continue tests');
        process.exit(1);
    }

    log('');
    log('================================================================================');
    log('TESTING ALL FRONTEND APIs');
    log('================================================================================');
    log('');

    // AUTH APIs
    log('📁 AUTH APIs');
    log('--------------------------------------------------------------------------------');
    totalTests++; if (await testAPI('Login', '/api/auth/login', 'POST', { email: 'admin@company.com', password: 'admin@123' })) passedTests++;
    totalTests++; if (await testAPI('Logout', '/api/auth/logout', 'POST')) passedTests++;
    log('');

    // USER MANAGEMENT APIs
    log('📁 USER MANAGEMENT APIs');
    log('--------------------------------------------------------------------------------');
    totalTests++; if (await testAPI('Get Users', '/api/users')) passedTests++;
    totalTests++; if (await testAPI('Get Roles', '/api/roles')) passedTests++;
    totalTests++; if (await testAPI('Get Permissions', '/api/permissions')) passedTests++;
    totalTests++; if (await testAPI('Get Audit Logs', '/api/audit-logs?limit=10')) passedTests++;
    log('');

    // PRODUCT APIs
    log('📁 PRODUCT APIs');
    log('--------------------------------------------------------------------------------');
    totalTests++; if (await testAPI('Get Products', '/api/products')) passedTests++;
    totalTests++; if (await testAPI('Search Products', '/api/products/search?query=test')) passedTests++;
    log('');

    // INVENTORY APIs
    log('📁 INVENTORY APIs');
    log('--------------------------------------------------------------------------------');
    totalTests++; if (await testAPI('Get Inventory', '/api/inventory?limit=10')) passedTests++;
    totalTests++; if (await testAPI('Get Inventory Summary', '/api/inventory/summary')) passedTests++;
    totalTests++; if (await testAPI('Get Inventory by Warehouse', '/api/inventory/warehouse/GGM_WH')) passedTests++;
    log('');

    // DISPATCH APIs
    log('📁 DISPATCH APIs');
    log('--------------------------------------------------------------------------------');
    totalTests++; if (await testAPI('Get Warehouses', '/api/dispatch/warehouses')) passedTests++;
    totalTests++; if (await testAPI('Get Logistics', '/api/dispatch/logistics')) passedTests++;
    totalTests++; if (await testAPI('Get Processed Persons', '/api/dispatch/processed-persons')) passedTests++;
    totalTests++; if (await testAPI('Search Products for Dispatch', '/api/dispatch/search-products?query=test')) passedTests++;
    totalTests++; if (await testAPI('Check Inventory', '/api/dispatch/check-inventory', 'POST', { barcode: '2459-3499', warehouse: 'GGM_WH', quantity: 1 })) passedTests++;
    log('');

    // ORDER TRACKING APIs
    log('📁 ORDER TRACKING APIs');
    log('--------------------------------------------------------------------------------');
    totalTests++; if (await testAPI('Get Orders', '/api/order-tracking')) passedTests++;
    totalTests++; if (await testAPI('Get Order Stats', '/api/order-tracking/stats')) passedTests++;
    log('');

    // RETURNS APIs
    log('📁 RETURNS APIs');
    log('--------------------------------------------------------------------------------');
    totalTests++; if (await testAPI('Get Returns', '/api/returns')) passedTests++;
    totalTests++; if (await testAPI('Get Returns Summary', '/api/returns/summary')) passedTests++;
    log('');

    // DAMAGE RECOVERY APIs
    log('📁 DAMAGE RECOVERY APIs');
    log('--------------------------------------------------------------------------------');
    totalTests++; if (await testAPI('Get Damage Recovery Log', '/api/damage-recovery/log')) passedTests++;
    totalTests++; if (await testAPI('Get Damage Recovery Summary', '/api/damage-recovery/summary')) passedTests++;
    totalTests++; if (await testAPI('Get Warehouses (Damage)', '/api/damage-recovery/warehouses')) passedTests++;
    totalTests++; if (await testAPI('Search Products (Damage)', '/api/damage-recovery/search-products?query=test')) passedTests++;
    log('');

    // TIMELINE APIs
    log('📁 TIMELINE APIs');
    log('--------------------------------------------------------------------------------');
    totalTests++; if (await testAPI('Get Timeline', '/api/timeline/2459-3499')) passedTests++;
    log('');

    // SELF TRANSFER APIs
    log('📁 SELF TRANSFER APIs');
    log('--------------------------------------------------------------------------------');
    totalTests++; if (await testAPI('Get Self Transfers', '/api/self-transfer')) passedTests++;
    totalTests++; if (await testAPI('Get Self Transfer Summary', '/api/self-transfer/summary')) passedTests++;
    log('');

    // BULK UPLOAD APIs
    log('📁 BULK UPLOAD APIs');
    log('--------------------------------------------------------------------------------');
    totalTests++; if (await testAPI('Get Upload History', '/api/bulk-upload/history')) passedTests++;
    log('');

    // FINAL RESULTS
    log('');
    log('================================================================================');
    log('FINAL TEST RESULTS');
    log('================================================================================');
    log('Total APIs Tested: ' + totalTests);
    log('Passed: ' + passedTests);
    log('Failed: ' + (totalTests - passedTests));
    log('Success Rate: ' + ((passedTests / totalTests) * 100).toFixed(1) + '%');
    log('');

    if (passedTests === totalTests) {
        log('🎉 ALL FRONTEND APIs WORKING!');
    } else {
        log('⚠️  Some APIs failed. Review details above.');
    }

    log('');
    log('================================================================================');
    log('Test Complete - ' + new Date().toISOString());
    log('================================================================================');
    log('');
    log('✅ Log file saved to: ' + logFile);
}

runAllTests().catch(error => {
    log('FATAL ERROR: ' + error.message);
    console.error(error);
    process.exit(1);
});
