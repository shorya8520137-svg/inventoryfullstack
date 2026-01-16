/**
 * TEST ALL MISSING AUTH APIS
 * Tests the APIs that are still failing with 401
 */

// Disable SSL certificate validation
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const fs = require('fs');
const API_BASE = 'https://16.171.161.150.nip.io';

const logFile = 'ALL_AUTH_TEST_RESULTS.log';
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

async function runTests() {
    log('================================================================================');
    log('TESTING ALL MISSING AUTH APIS');
    log('================================================================================');
    log('API Base: ' + API_BASE);
    log('Start Time: ' + new Date().toISOString());
    log('');

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
        log('Token: ' + adminToken.substring(0, 20) + '...');
    } else {
        log('❌ Admin login failed - Cannot continue tests');
        process.exit(1);
    }

    log('');
    log('================================================================================');
    log('TESTING APIS FROM USER REPORT');
    log('================================================================================');
    log('');

    let passed = 0;
    let failed = 0;

    // Test 1: Bulk Upload Progress API
    log('1. Bulk Upload Progress API');
    log('   POST /api/bulk-upload/progress');
    const test1 = await makeRequest('/api/bulk-upload/progress', {
        method: 'POST',
        body: JSON.stringify({
            rows: [
                { barcode: 'TEST001', product_name: 'Test Product', warehouse: 'GGM_WH', qty: 1, unit_cost: 10 }
            ]
        })
    }, adminToken);
    
    if (test1.status === 200 || test1.status === 201) {
        log('   ✅ PASS - Status: ' + test1.status);
        passed++;
    } else {
        log('   ❌ FAIL - Status: ' + test1.status + ' - ' + (test1.error || JSON.stringify(test1.data)));
        failed++;
    }
    log('');

    // Test 2: Get Warehouses (Dispatch) - Multiple calls
    log('2. Get Warehouses API (Dispatch) - Call 1');
    log('   GET /api/dispatch/warehouses');
    const test2a = await makeRequest('/api/dispatch/warehouses', {
        method: 'GET'
    }, adminToken);
    
    if (test2a.status === 200) {
        log('   ✅ PASS - Status: ' + test2a.status);
        passed++;
    } else {
        log('   ❌ FAIL - Status: ' + test2a.status + ' - ' + (test2a.error || JSON.stringify(test2a.data)));
        failed++;
    }
    log('');

    log('3. Get Warehouses API (Dispatch) - Call 2');
    log('   GET /api/dispatch/warehouses');
    const test2b = await makeRequest('/api/dispatch/warehouses', {
        method: 'GET'
    }, adminToken);
    
    if (test2b.status === 200) {
        log('   ✅ PASS - Status: ' + test2b.status);
        passed++;
    } else {
        log('   ❌ FAIL - Status: ' + test2b.status + ' - ' + (test2b.error || JSON.stringify(test2b.data)));
        failed++;
    }
    log('');

    // Test 3: Get Logistics
    log('4. Get Logistics API');
    log('   GET /api/dispatch/logistics');
    const test3 = await makeRequest('/api/dispatch/logistics', {
        method: 'GET'
    }, adminToken);
    
    if (test3.status === 200) {
        log('   ✅ PASS - Status: ' + test3.status);
        passed++;
    } else {
        log('   ❌ FAIL - Status: ' + test3.status + ' - ' + (test3.error || JSON.stringify(test3.data)));
        failed++;
    }
    log('');

    // Test 4: Get Processed Persons
    log('5. Get Processed Persons API');
    log('   GET /api/dispatch/processed-persons');
    const test4 = await makeRequest('/api/dispatch/processed-persons', {
        method: 'GET'
    }, adminToken);
    
    if (test4.status === 200) {
        log('   ✅ PASS - Status: ' + test4.status);
        passed++;
    } else {
        log('   ❌ FAIL - Status: ' + test4.status + ' - ' + (test4.error || JSON.stringify(test4.data)));
        failed++;
    }
    log('');

    // Test 5-9: Product Search (Multiple calls)
    const searchQueries = ['cu', 'ct', 'cu', 'ct', 'cu', 'cut'];
    for (let i = 0; i < searchQueries.length; i++) {
        const query = searchQueries[i];
        log(`${6 + i}. Product Search API - Query: "${query}"`);
        log(`   GET /api/dispatch/search-products?query=${query}`);
        const testSearch = await makeRequest(`/api/dispatch/search-products?query=${query}`, {
            method: 'GET'
        }, adminToken);
        
        if (testSearch.status === 200) {
            log('   ✅ PASS - Status: ' + testSearch.status);
            passed++;
        } else {
            log('   ❌ FAIL - Status: ' + testSearch.status + ' - ' + (testSearch.error || JSON.stringify(testSearch.data)));
            failed++;
        }
        log('');
    }

    // Test 10: Bulk Upload Warehouses
    log(`${6 + searchQueries.length}. Bulk Upload Warehouses API`);
    log('   GET /api/bulk-upload/warehouses');
    const test10 = await makeRequest('/api/bulk-upload/warehouses', {
        method: 'GET'
    }, adminToken);
    
    if (test10.status === 200) {
        log('   ✅ PASS - Status: ' + test10.status);
        log('   Warehouses found: ' + (test10.data.warehouses?.length || 0));
        passed++;
    } else {
        log('   ❌ FAIL - Status: ' + test10.status + ' - ' + (test10.error || JSON.stringify(test10.data)));
        failed++;
    }
    log('');

    // FINAL RESULTS
    log('================================================================================');
    log('FINAL TEST RESULTS');
    log('================================================================================');
    log('Total Tests: ' + (passed + failed));
    log('Passed: ' + passed);
    log('Failed: ' + failed);
    log('Success Rate: ' + ((passed / (passed + failed)) * 100).toFixed(1) + '%');
    log('');

    if (failed === 0) {
        log('🎉 ALL APIS NOW WORKING WITH PROPER AUTHORIZATION!');
    } else {
        log('⚠️  ' + failed + ' APIs still failing. Review details above.');
    }

    log('');
    log('================================================================================');
    log('Test Complete - ' + new Date().toISOString());
    log('================================================================================');
    log('');
    log('✅ Log file saved to: ' + logFile);
}

runTests().catch(error => {
    log('FATAL ERROR: ' + error.message);
    console.error(error);
    process.exit(1);
});
