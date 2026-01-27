/**
 * Complete User Journey Test Script
 * Tests: Create Role → Create User → Login → Dispatch → Check Audit Logs
 * Expected Result: All activities should appear in audit logs
 */

const axios = require('axios');

// Configuration
const API_BASE = 'https://16.171.5.50.nip.io';
const ADMIN_CREDENTIALS = {
    email: 'admin@company.com',
    password: 'admin@123'
};

let adminToken = '';
let newUserToken = '';
let createdRoleId = '';
let createdUserId = '';

console.log('🧪 Complete User Journey Test');
console.log('='.repeat(60));
console.log(`🌐 API Base: ${API_BASE}`);
console.log('📋 Journey: Create Role → Create User → Login → Dispatch → Check Audit');
console.log('='.repeat(60));

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeRequest(method, endpoint, data = null, token = null) {
    try {
        const config = {
            method,
            url: `${API_BASE}${endpoint}`,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'AuditTestScript/1.0'
            }
        };

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        if (data) {
            config.data = data;
        }

        const response = await axios(config);
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message,
            status: error.response?.status
        };
    }
}

// Step 1: Admin Login
async function adminLogin() {
    console.log('\n🔐 Step 1: Admin Login');
    console.log('   Logging in as admin...');
    
    const result = await makeRequest('POST', '/api/auth/login', ADMIN_CREDENTIALS);
    
    if (result.success && result.data.token) {
        adminToken = result.data.token;
        console.log('   ✅ Admin login successful');
        console.log(`   👤 User: ${result.data.user?.name || 'Admin'}`);
        return true;
    } else {
        console.log('   ❌ Admin login failed:', result.error);
        return false;
    }
}

// Step 2: Create Role
async function createRole() {
    console.log('\n📋 Step 2: Create Test Role');
    console.log('   Creating role "Test Manager"...');
    
    const roleData = {
        name: 'test_manager',
        display_name: 'Test Manager',
        description: 'Test role for audit journey',
        color: '#3b82f6',
        permissionIds: [1, 2, 3] // Basic permissions
    };
    
    const result = await makeRequest('POST', '/api/roles', roleData, adminToken);
    
    if (result.success) {
        createdRoleId = result.data.role_id || result.data.id;
        console.log('   ✅ Role created successfully');
        console.log(`   🆔 Role ID: ${createdRoleId}`);
        return true;
    } else {
        console.log('   ❌ Role creation failed:', result.error);
        return false;
    }
}

// Step 3: Create User
async function createUser() {
    console.log('\n👤 Step 3: Create Test User');
    console.log('   Creating user "testuser"...');
    
    const userData = {
        name: 'Test User',
        email: 'testuser@company.com',
        password: 'test123',
        role_id: createdRoleId || 2, // Use created role or fallback
        is_active: true
    };
    
    const result = await makeRequest('POST', '/api/users', userData, adminToken);
    
    if (result.success) {
        createdUserId = result.data.user_id || result.data.id;
        console.log('   ✅ User created successfully');
        console.log(`   🆔 User ID: ${createdUserId}`);
        console.log(`   📧 Email: ${userData.email}`);
        return true;
    } else {
        console.log('   ❌ User creation failed:', result.error);
        return false;
    }
}

// Step 4: New User Login
async function newUserLogin() {
    console.log('\n🔑 Step 4: New User Login');
    console.log('   Logging in as new user...');
    
    const credentials = {
        email: 'testuser@company.com',
        password: 'test123'
    };
    
    const result = await makeRequest('POST', '/api/auth/login', credentials);
    
    if (result.success && result.data.token) {
        newUserToken = result.data.token;
        console.log('   ✅ New user login successful');
        console.log(`   👤 User: ${result.data.user?.name || 'Test User'}`);
        return true;
    } else {
        console.log('   ❌ New user login failed:', result.error);
        return false;
    }
}

// Step 5: Create Dispatch
async function createDispatch() {
    console.log('\n📤 Step 5: Create Dispatch');
    console.log('   Creating test dispatch...');
    
    const dispatchData = {
        warehouse: 'GGM_WH',
        order_ref: 'TEST_ORDER_001',
        customer: 'Test Customer',
        product_name: 'Test Product',
        qty: 5,
        barcode: 'TEST123',
        awb: 'AWB_TEST_001',
        logistics: 'BlueDart',
        parcel_type: 'Forward',
        processed_by: 'Test User',
        remarks: 'Test dispatch for audit journey'
    };
    
    const result = await makeRequest('POST', '/api/dispatch', dispatchData, newUserToken);
    
    if (result.success) {
        console.log('   ✅ Dispatch created successfully');
        console.log(`   🆔 Dispatch ID: ${result.data.dispatch_id}`);
        console.log(`   📦 AWB: ${result.data.awb || dispatchData.awb}`);
        return true;
    } else {
        console.log('   ❌ Dispatch creation failed:', result.error);
        console.log('   💡 This might be expected if dispatch requires specific setup');
        return false;
    }
}

// Step 6: Check Audit Logs
async function checkAuditLogs() {
    console.log('\n📊 Step 6: Check Audit Logs');
    console.log('   Fetching recent audit logs...');
    
    // Wait a moment for audit logs to be written
    await sleep(2000);
    
    const result = await makeRequest('GET', '/api/audit-logs?limit=20', null, adminToken);
    
    if (result.success && result.data.logs) {
        console.log('   ✅ Audit logs retrieved successfully');
        console.log(`   📈 Total activities: ${result.data.logs.length}`);
        
        console.log('\n📋 Recent Audit Activities:');
        result.data.logs.slice(0, 10).forEach((log, i) => {
            const time = new Date(log.created_at).toLocaleTimeString();
            console.log(`   ${i + 1}. ${log.description} (${time})`);
        });
        
        // Look for our test activities
        const testActivities = result.data.logs.filter(log => 
            log.description.includes('Test User') || 
            log.description.includes('testuser') ||
            log.description.includes('Test Manager') ||
            log.description.includes('TEST_ORDER_001')
        );
        
        console.log(`\n🎯 Test Journey Activities Found: ${testActivities.length}`);
        testActivities.forEach((activity, i) => {
            console.log(`   ${i + 1}. ${activity.description}`);
        });
        
        return testActivities.length > 0;
    } else {
        console.log('   ❌ Failed to fetch audit logs:', result.error);
        return false;
    }
}

// Step 7: Check Alternative Audit Sources
async function checkAlternativeAudit() {
    console.log('\n🔍 Step 7: Check Alternative Audit Sources');
    console.log('   Checking permissions page audit logs...');
    
    // Try to access the audit logs from the permissions page
    const result = await makeRequest('GET', '/api/permissions/audit-logs', null, adminToken);
    
    if (result.success) {
        console.log('   ✅ Alternative audit source found');
        return true;
    } else {
        console.log('   ❌ Alternative audit source not accessible:', result.error);
        return false;
    }
}

// Main execution
async function runCompleteJourney() {
    console.log('🚀 Starting Complete User Journey Test...\n');
    
    const steps = [
        { name: 'Admin Login', fn: adminLogin },
        { name: 'Create Role', fn: createRole },
        { name: 'Create User', fn: createUser },
        { name: 'New User Login', fn: newUserLogin },
        { name: 'Create Dispatch', fn: createDispatch },
        { name: 'Check Audit Logs', fn: checkAuditLogs },
        { name: 'Check Alternative Audit', fn: checkAlternativeAudit }
    ];
    
    const results = [];
    
    for (const step of steps) {
        try {
            const success = await step.fn();
            results.push({ step: step.name, success });
            
            // Small delay between steps
            await sleep(1000);
        } catch (error) {
            console.log(`   ❌ ${step.name} failed with error:`, error.message);
            results.push({ step: step.name, success: false, error: error.message });
        }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 JOURNEY TEST SUMMARY');
    console.log('='.repeat(60));
    
    results.forEach((result, i) => {
        const status = result.success ? '✅' : '❌';
        console.log(`${i + 1}. ${status} ${result.step}`);
        if (result.error) {
            console.log(`   Error: ${result.error}`);
        }
    });
    
    const successCount = results.filter(r => r.success).length;
    console.log(`\n🎯 Success Rate: ${successCount}/${results.length} steps completed`);
    
    if (successCount === results.length) {
        console.log('🎉 COMPLETE SUCCESS: All audit activities should be visible!');
    } else {
        console.log('⚠️ PARTIAL SUCCESS: Some steps failed, audit may be incomplete');
    }
    
    console.log('\n💡 Expected Audit Log Entries:');
    console.log('   1. "Admin logged into the system"');
    console.log('   2. "Admin created role Test Manager"');
    console.log('   3. "Admin created user Test User with email testuser@company.com"');
    console.log('   4. "Test User logged into the system"');
    console.log('   5. "Test User dispatched 5 units of Test Product to GGM_WH warehouse"');
    
    console.log('='.repeat(60));
}

// Run the test
runCompleteJourney().catch(console.error);