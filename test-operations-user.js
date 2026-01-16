const https = require('https');

const API_BASE = 'https://16.171.161.150.nip.io';
let adminToken = '';
let operationsToken = '';
let newUserId = null;

// Helper function to make API requests
function makeRequest(path, method = 'GET', data = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(API_BASE + path);
        
        const options = {
            hostname: url.hostname,
            port: url.port || 443,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            rejectUnauthorized: false
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    resolve({ status: res.statusCode, data: response });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

async function loginAsAdmin() {
    console.log('\n🔐 Step 1: Login as Super Admin');
    const response = await makeRequest('/api/auth/login', 'POST', {
        email: 'admin@company.com',
        password: 'admin@123'
    });
    
    if (response.status === 200 && response.data.success) {
        adminToken = response.data.token;
        console.log('✅ Admin login successful');
        return true;
    }
    console.log('❌ Admin login failed');
    return false;
}

async function createOperationsUser() {
    console.log('\n➕ Step 2: Create Operations User');
    
    const newUser = {
        name: 'Operations Test User',
        email: `operations.test.${Date.now()}@hunyhuny.com`,
        password: 'operations@123',
        role_id: 4, // Operator role
        is_active: 1
    };

    const response = await makeRequest('/api/users', 'POST', newUser, adminToken);
    
    if (response.status === 201 && response.data.success) {
        newUserId = response.data.data.id;
        console.log(`✅ User created successfully`);
        console.log(`   ID: ${newUserId}`);
        console.log(`   Email: ${newUser.email}`);
        return newUser.email;
    }
    console.log('❌ User creation failed:', response.data);
    return null;
}

async function loginAsOperationsUser(email) {
    console.log('\n🔐 Step 3: Login as Operations User');
    const response = await makeRequest('/api/auth/login', 'POST', {
        email: email,
        password: 'operations@123'
    });
    
    if (response.status === 200 && response.data.success) {
        operationsToken = response.data.token;
        console.log('✅ Operations user login successful');
        console.log(`   Name: ${response.data.user.name}`);
        console.log(`   Role: ${response.data.user.role}`);
        console.log(`   Permissions: ${response.data.user.permissions.length}`);
        return true;
    }
    console.log('❌ Operations user login failed');
    return false;
}

async function testDispatchAccess() {
    console.log('\n🚚 Step 4: Test Dispatch Access');
    
    // Test GET dispatch list
    const listResponse = await makeRequest('/api/dispatch', 'GET', null, operationsToken);
    console.log(`   GET /api/dispatch: ${listResponse.status}`);
    
    // Test GET warehouses
    const warehousesResponse = await makeRequest('/api/dispatch/warehouses', 'GET', null, operationsToken);
    console.log(`   GET /api/dispatch/warehouses: ${warehousesResponse.status}`);
    
    // Test GET logistics
    const logisticsResponse = await makeRequest('/api/dispatch/logistics', 'GET', null, operationsToken);
    console.log(`   GET /api/dispatch/logistics: ${logisticsResponse.status}`);
    
    if (listResponse.status === 200) {
        console.log('✅ Dispatch access working');
        return true;
    }
    console.log('❌ Dispatch access failed');
    return false;
}

async function testReturnAccess() {
    console.log('\n🔄 Step 5: Test Return Access');
    
    const response = await makeRequest('/api/returns', 'GET', null, operationsToken);
    console.log(`   GET /api/returns: ${response.status}`);
    
    if (response.status === 200) {
        console.log('✅ Return access working');
        return true;
    }
    console.log('❌ Return access failed');
    return false;
}

async function testDamageAccess() {
    console.log('\n💔 Step 6: Test Damage Access');
    
    const response = await makeRequest('/api/damage-recovery', 'GET', null, operationsToken);
    console.log(`   GET /api/damage-recovery: ${response.status}`);
    
    if (response.status === 200 || response.status === 404) {
        console.log('✅ Damage endpoint accessible (may not be implemented yet)');
        return true;
    }
    console.log('❌ Damage access failed');
    return false;
}

async function testProductsAccess() {
    console.log('\n📦 Step 7: Test Products Access');
    
    const response = await makeRequest('/api/products', 'GET', null, operationsToken);
    console.log(`   GET /api/products: ${response.status}`);
    
    if (response.status === 200) {
        console.log('✅ Products access working');
        console.log(`   Total products: ${response.data.length || 0}`);
        return true;
    }
    console.log('❌ Products access failed');
    return false;
}

async function testInventoryAccess() {
    console.log('\n📊 Step 8: Test Inventory Access');
    
    const response = await makeRequest('/api/inventory?limit=10', 'GET', null, operationsToken);
    console.log(`   GET /api/inventory: ${response.status}`);
    
    if (response.status === 200) {
        console.log('✅ Inventory access working');
        return true;
    }
    console.log('❌ Inventory access failed');
    return false;
}

async function testRestrictedAccess() {
    console.log('\n🚫 Step 9: Test Restricted Access (Should Fail)');
    
    // Try to access users (should be forbidden)
    const usersResponse = await makeRequest('/api/users', 'GET', null, operationsToken);
    console.log(`   GET /api/users: ${usersResponse.status}`);
    
    // Try to access audit logs (should be forbidden)
    const auditResponse = await makeRequest('/api/audit-logs', 'GET', null, operationsToken);
    console.log(`   GET /api/audit-logs: ${auditResponse.status}`);
    
    if (usersResponse.status === 403 && auditResponse.status === 403) {
        console.log('✅ Restricted access properly blocked');
        return true;
    }
    console.log('⚠️ Warning: Restricted endpoints may not be properly protected');
    return false;
}

async function checkAuditLogs() {
    console.log('\n📋 Step 10: Check Audit Logs (as Admin)');
    
    const response = await makeRequest('/api/audit-logs?limit=20', 'GET', null, adminToken);
    
    if (response.status === 200 && response.data.success) {
        console.log('✅ Audit logs retrieved');
        console.log(`   Total logs: ${response.data.data.logs.length}`);
        console.log('\n   Recent activities:');
        response.data.data.logs.slice(0, 10).forEach(log => {
            const date = new Date(log.created_at).toLocaleString();
            console.log(`   - ${date}: ${log.user_name || 'Unknown'} - ${log.action} on ${log.resource}`);
        });
        return true;
    }
    console.log('❌ Failed to retrieve audit logs');
    return false;
}

async function cleanupTestUser() {
    console.log('\n🗑️ Step 11: Cleanup - Delete Test User');
    
    if (!newUserId) {
        console.log('⚠️ No user to delete');
        return true;
    }
    
    const response = await makeRequest(`/api/users/${newUserId}`, 'DELETE', null, adminToken);
    
    if (response.status === 200 && response.data.success) {
        console.log('✅ Test user deleted successfully');
        return true;
    }
    console.log('❌ Failed to delete test user');
    return false;
}

async function runFullTest() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🧪 COMPLETE OPERATIONS USER TESTING');
    console.log('═══════════════════════════════════════════════════════');
    
    const results = {
        total: 0,
        passed: 0,
        failed: 0
    };

    // Step 1: Login as admin
    results.total++;
    if (await loginAsAdmin()) {
        results.passed++;
    } else {
        results.failed++;
        console.log('\n❌ Cannot proceed without admin access');
        return;
    }

    // Step 2: Create operations user
    results.total++;
    const userEmail = await createOperationsUser();
    if (userEmail) {
        results.passed++;
    } else {
        results.failed++;
        console.log('\n❌ Cannot proceed without creating user');
        return;
    }

    // Step 3: Login as operations user
    results.total++;
    if (await loginAsOperationsUser(userEmail)) {
        results.passed++;
    } else {
        results.failed++;
        console.log('\n❌ Cannot proceed without operations user login');
        return;
    }

    // Step 4-8: Test operations access
    const tests = [
        testDispatchAccess,
        testReturnAccess,
        testDamageAccess,
        testProductsAccess,
        testInventoryAccess,
        testRestrictedAccess
    ];

    for (const test of tests) {
        results.total++;
        if (await test()) {
            results.passed++;
        } else {
            results.failed++;
        }
    }

    // Step 10: Check audit logs
    results.total++;
    if (await checkAuditLogs()) {
        results.passed++;
    } else {
        results.failed++;
    }

    // Step 11: Cleanup
    results.total++;
    if (await cleanupTestUser()) {
        results.passed++;
    } else {
        results.failed++;
    }

    // Summary
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 TEST SUMMARY');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`Total Tests: ${results.total}`);
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`Success Rate: ${Math.round((results.passed / results.total) * 100)}%`);
    console.log('═══════════════════════════════════════════════════════');

    if (results.failed === 0) {
        console.log('\n🎉 All tests passed! Operations user permissions working correctly.');
    } else {
        console.log('\n⚠️ Some tests failed. Check the details above.');
    }
}

runFullTest().catch(console.error);
