#!/usr/bin/env node

/**
 * TEST CLEAN PERMISSIONS SYSTEM
 * Verifies that the permissions system is working correctly with clean 28 permissions
 */

const API_BASE = 'https://13.51.56.188.nip.io';

// Test credentials
const ADMIN_CREDENTIALS = {
    email: 'admin@company.com',
    password: 'admin@123'
};

let authToken = null;

// Helper function to make API requests
async function makeRequest(method, endpoint, data = null, headers = {}) {
    const url = `${API_BASE}${endpoint}`;
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers
        }
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        const result = await response.json();
        return { status: response.status, data: result };
    } catch (error) {
        return { status: 0, error: error.message };
    }
}

// Test functions
async function testLogin() {
    console.log('🔐 Testing admin login...');
    const { status, data } = await makeRequest('POST', '/api/auth/login', ADMIN_CREDENTIALS);
    
    if (status === 200 && data.success) {
        authToken = data.token;
        console.log('✅ Login successful');
        console.log(`   User: ${data.user.email}`);
        console.log(`   Role: ${data.user.role}`);
        return true;
    } else {
        console.log('❌ Login failed:', data.message);
        return false;
    }
}

async function testPermissionsAPI() {
    console.log('\n📋 Testing permissions API...');
    const { status, data } = await makeRequest('GET', '/api/permissions', null, {
        'Authorization': `Bearer ${authToken}`
    });
    
    if (status === 200 && data.success) {
        const permissions = data.data.permissions || [];
        console.log(`✅ Permissions API working - ${permissions.length} permissions found`);
        
        // Group by category
        const categories = {};
        permissions.forEach(perm => {
            const cat = perm.category || 'Other';
            if (!categories[cat]) categories[cat] = 0;
            categories[cat]++;
        });
        
        console.log('   Categories:');
        Object.entries(categories).forEach(([cat, count]) => {
            console.log(`     ${cat}: ${count} permissions`);
        });
        
        // Check for duplicates
        const names = permissions.map(p => p.name);
        const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
        
        if (duplicates.length > 0) {
            console.log('⚠️  Duplicate permissions found:', [...new Set(duplicates)]);
            return false;
        } else {
            console.log('✅ No duplicate permissions found');
        }
        
        // Verify expected count
        if (permissions.length === 28) {
            console.log('✅ Correct permission count (28)');
            return true;
        } else {
            console.log(`⚠️  Expected 28 permissions, found ${permissions.length}`);
            return false;
        }
    } else {
        console.log('❌ Permissions API failed:', data.message);
        return false;
    }
}

async function testRolesAPI() {
    console.log('\n👥 Testing roles API...');
    const { status, data } = await makeRequest('GET', '/api/roles', null, {
        'Authorization': `Bearer ${authToken}`
    });
    
    if (status === 200 && data.success) {
        const roles = data.data || [];
        console.log(`✅ Roles API working - ${roles.length} roles found`);
        
        // Find super_admin role
        const superAdmin = roles.find(r => r.name === 'super_admin');
        if (superAdmin) {
            console.log(`✅ Super admin role found (ID: ${superAdmin.id})`);
            console.log(`   Permission count: ${superAdmin.permission_count || 'Unknown'}`);
            return true;
        } else {
            console.log('⚠️  Super admin role not found');
            return false;
        }
    } else {
        console.log('❌ Roles API failed:', data.message);
        return false;
    }
}

async function testCreateRole() {
    console.log('\n🆕 Testing role creation with permissions...');
    
    // First get all permissions
    const { status: permStatus, data: permData } = await makeRequest('GET', '/api/permissions', null, {
        'Authorization': `Bearer ${authToken}`
    });
    
    if (permStatus !== 200) {
        console.log('❌ Could not fetch permissions for role test');
        return false;
    }
    
    const permissions = permData.data.permissions || [];
    
    // Create a test role with specific permissions
    const testPermissions = permissions.filter(p => 
        p.name.includes('products.view') || 
        p.name.includes('inventory.view') || 
        p.name.includes('orders.view')
    ).map(p => p.id);
    
    const roleData = {
        name: 'test_viewer',
        display_name: 'Test Viewer',
        description: 'Test role for permission verification',
        color: '#10b981',
        permissionIds: testPermissions
    };
    
    const { status, data } = await makeRequest('POST', '/api/roles', roleData, {
        'Authorization': `Bearer ${authToken}`
    });
    
    if (status === 201 && data.success) {
        console.log('✅ Test role created successfully');
        console.log(`   Role ID: ${data.data.id}`);
        console.log(`   Permissions assigned: ${testPermissions.length}`);
        
        // Clean up - delete the test role
        await makeRequest('DELETE', `/api/roles/${data.data.id}`, null, {
            'Authorization': `Bearer ${authToken}`
        });
        console.log('✅ Test role cleaned up');
        
        return true;
    } else {
        console.log('❌ Role creation failed:', data.message);
        return false;
    }
}

async function runTests() {
    console.log('🧪 CLEAN PERMISSIONS SYSTEM TEST');
    console.log('================================');
    
    const tests = [
        { name: 'Admin Login', fn: testLogin },
        { name: 'Permissions API', fn: testPermissionsAPI },
        { name: 'Roles API', fn: testRolesAPI },
        { name: 'Role Creation', fn: testCreateRole }
    ];
    
    let passed = 0;
    let total = tests.length;
    
    for (const test of tests) {
        try {
            const result = await test.fn();
            if (result) {
                passed++;
            }
        } catch (error) {
            console.log(`❌ ${test.name} test error:`, error.message);
        }
    }
    
    console.log('\n📊 TEST RESULTS');
    console.log('===============');
    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${total - passed}/${total}`);
    
    if (passed === total) {
        console.log('\n🎉 ALL TESTS PASSED! Permission system is working correctly.');
        console.log('✅ Database has clean 28 permissions');
        console.log('✅ No duplicate permissions');
        console.log('✅ APIs are working correctly');
        console.log('✅ Role creation with permissions works');
    } else {
        console.log('\n⚠️  Some tests failed. Please check the issues above.');
    }
}

// Run the tests
runTests().catch(console.error);