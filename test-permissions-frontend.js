const https = require('https');

const API_BASE = 'https://16.171.161.150.nip.io';
let authToken = '';

// Test user credentials
const testUser = {
    email: 'admin@company.com',
    password: 'admin@123'
};

// Helper function to make API requests
function makeRequest(path, method = 'GET', data = null) {
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
            rejectUnauthorized: false // For self-signed certificates
        };

        if (authToken) {
            options.headers['Authorization'] = `Bearer ${authToken}`;
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

// Test functions
async function testLogin() {
    console.log('\n🔐 Testing Login...');
    try {
        const response = await makeRequest('/api/auth/login', 'POST', testUser);
        
        if (response.status === 200 && response.data.success) {
            authToken = response.data.token;
            console.log('✅ Login successful');
            console.log(`   User: ${response.data.user.name}`);
            console.log(`   Role: ${response.data.user.role}`);
            console.log(`   Permissions: ${response.data.user.permissions.length}`);
            return true;
        } else {
            console.log('❌ Login failed:', response.data.message);
            return false;
        }
    } catch (error) {
        console.log('❌ Login error:', error.message);
        return false;
    }
}

async function testGetUsers() {
    console.log('\n👥 Testing Get Users...');
    try {
        const response = await makeRequest('/api/users');
        
        if (response.status === 200 && response.data.success) {
            console.log(`✅ Get Users successful`);
            console.log(`   Total users: ${response.data.data.length}`);
            console.log(`   Sample users:`);
            response.data.data.slice(0, 3).forEach(user => {
                console.log(`   - ${user.name} (${user.email}) - ${user.role_display_name}`);
            });
            return true;
        } else {
            console.log('❌ Get Users failed:', response.status, response.data);
            return false;
        }
    } catch (error) {
        console.log('❌ Get Users error:', error.message);
        return false;
    }
}

async function testGetRoles() {
    console.log('\n🎭 Testing Get Roles...');
    try {
        const response = await makeRequest('/api/roles');
        
        if (response.status === 200 && response.data.success) {
            console.log(`✅ Get Roles successful`);
            console.log(`   Total roles: ${response.data.data.length}`);
            response.data.data.forEach(role => {
                console.log(`   - ${role.display_name} (${role.name})`);
                console.log(`     Users: ${role.user_count}, Permissions: ${role.permission_count}`);
            });
            return true;
        } else {
            console.log('❌ Get Roles failed:', response.status, response.data);
            return false;
        }
    } catch (error) {
        console.log('❌ Get Roles error:', error.message);
        return false;
    }
}

async function testGetPermissions() {
    console.log('\n🔑 Testing Get Permissions...');
    try {
        const response = await makeRequest('/api/permissions');
        
        if (response.status === 200 && response.data.success) {
            console.log(`✅ Get Permissions successful`);
            console.log(`   Total permissions: ${response.data.data.permissions.length}`);
            
            const grouped = response.data.data.grouped;
            console.log(`   Categories:`);
            Object.keys(grouped).forEach(category => {
                console.log(`   - ${category}: ${grouped[category].length} permissions`);
            });
            return true;
        } else {
            console.log('❌ Get Permissions failed:', response.status, response.data);
            return false;
        }
    } catch (error) {
        console.log('❌ Get Permissions error:', error.message);
        return false;
    }
}

async function testGetAuditLogs() {
    console.log('\n📋 Testing Get Audit Logs...');
    try {
        const response = await makeRequest('/api/audit-logs?limit=10');
        
        if (response.status === 200 && response.data.success) {
            console.log(`✅ Get Audit Logs successful`);
            console.log(`   Total logs: ${response.data.data.logs.length}`);
            console.log(`   Recent activities:`);
            response.data.data.logs.slice(0, 5).forEach(log => {
                const date = new Date(log.created_at).toLocaleString();
                console.log(`   - ${date}: ${log.user_name} - ${log.action} on ${log.resource}`);
            });
            return true;
        } else {
            console.log('❌ Get Audit Logs failed:', response.status, response.data);
            return false;
        }
    } catch (error) {
        console.log('❌ Get Audit Logs error:', error.message);
        return false;
    }
}

async function testCreateUser() {
    console.log('\n➕ Testing Create User...');
    try {
        const newUser = {
            name: 'Test User Frontend',
            email: `test.frontend.${Date.now()}@test.com`,
            password: 'test@123',
            role_id: 6, // Viewer role
            is_active: 1
        };

        const response = await makeRequest('/api/users', 'POST', newUser);
        
        if (response.status === 201 && response.data.success) {
            console.log(`✅ Create User successful`);
            console.log(`   User ID: ${response.data.data.id}`);
            console.log(`   Email: ${newUser.email}`);
            return response.data.data.id;
        } else {
            console.log('❌ Create User failed:', response.status, response.data);
            return null;
        }
    } catch (error) {
        console.log('❌ Create User error:', error.message);
        return null;
    }
}

async function testUpdateUser(userId) {
    console.log('\n✏️ Testing Update User...');
    try {
        const updateData = {
            name: 'Test User Updated',
            email: `test.frontend.updated.${Date.now()}@test.com`,
            role_id: 6,
            is_active: 1
        };

        const response = await makeRequest(`/api/users/${userId}`, 'PUT', updateData);
        
        if (response.status === 200 && response.data.success) {
            console.log(`✅ Update User successful`);
            console.log(`   Updated email: ${updateData.email}`);
            return true;
        } else {
            console.log('❌ Update User failed:', response.status, response.data);
            return false;
        }
    } catch (error) {
        console.log('❌ Update User error:', error.message);
        return false;
    }
}

async function testDeleteUser(userId) {
    console.log('\n🗑️ Testing Delete User...');
    try {
        const response = await makeRequest(`/api/users/${userId}`, 'DELETE');
        
        if (response.status === 200 && response.data.success) {
            console.log(`✅ Delete User successful`);
            return true;
        } else {
            console.log('❌ Delete User failed:', response.status, response.data);
            return false;
        }
    } catch (error) {
        console.log('❌ Delete User error:', error.message);
        return false;
    }
}

async function testGetSystemStats() {
    console.log('\n📊 Testing Get System Stats...');
    try {
        const response = await makeRequest('/api/system/stats');
        
        if (response.status === 200 && response.data.success) {
            console.log(`✅ Get System Stats successful`);
            const stats = response.data.data;
            console.log(`   Total Users: ${stats.users.total_users}`);
            console.log(`   Active Users: ${stats.users.active_users}`);
            console.log(`   Recent Activity (24h): ${stats.recentActivity}`);
            return true;
        } else {
            console.log('❌ Get System Stats failed:', response.status, response.data);
            return false;
        }
    } catch (error) {
        console.log('❌ Get System Stats error:', error.message);
        return false;
    }
}

// Main test runner
async function runTests() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🧪 PERMISSIONS FRONTEND API TESTING');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`API Base: ${API_BASE}`);
    console.log(`Test User: ${testUser.email}`);
    
    const results = {
        total: 0,
        passed: 0,
        failed: 0
    };

    // Test 1: Login
    results.total++;
    if (await testLogin()) {
        results.passed++;
    } else {
        results.failed++;
        console.log('\n❌ Cannot proceed without authentication');
        return;
    }

    // Test 2: Get Users
    results.total++;
    if (await testGetUsers()) results.passed++; else results.failed++;

    // Test 3: Get Roles
    results.total++;
    if (await testGetRoles()) results.passed++; else results.failed++;

    // Test 4: Get Permissions
    results.total++;
    if (await testGetPermissions()) results.passed++; else results.failed++;

    // Test 5: Get Audit Logs
    results.total++;
    if (await testGetAuditLogs()) results.passed++; else results.failed++;

    // Test 6: Get System Stats
    results.total++;
    if (await testGetSystemStats()) results.passed++; else results.failed++;

    // Test 7-9: CRUD Operations
    results.total++;
    const newUserId = await testCreateUser();
    if (newUserId) {
        results.passed++;
        
        results.total++;
        if (await testUpdateUser(newUserId)) results.passed++; else results.failed++;
        
        results.total++;
        if (await testDeleteUser(newUserId)) results.passed++; else results.failed++;
    } else {
        results.failed += 3;
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
        console.log('\n🎉 All tests passed! Permissions frontend APIs are working correctly.');
    } else {
        console.log('\n⚠️ Some tests failed. Please check the errors above.');
    }
}

// Run the tests
runTests().catch(console.error);
