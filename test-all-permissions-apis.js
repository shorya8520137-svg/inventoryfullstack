// Comprehensive Permissions API Test
const SERVER_URL = 'http://localhost:5000';

console.log('🔐 COMPREHENSIVE PERMISSIONS API TEST');
console.log('====================================');
console.log('Server:', SERVER_URL);
console.log('');

let authToken = null;

async function makeRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
                ...options.headers
            }
        });
        
        const data = await response.json();
        return { success: response.ok, status: response.status, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function testLogin() {
    console.log('🔑 AUTHENTICATION TEST');
    console.log('======================');
    
    // Try different login combinations
    const loginAttempts = [
        { email: 'admin@admin.com', password: 'admin123' },
        { email: 'admin', password: 'admin123' },
        { username: 'admin', password: 'admin123' },
        { email: 'admin@example.com', password: 'admin123' }
    ];
    
    for (const credentials of loginAttempts) {
        console.log(`Trying login with:`, Object.keys(credentials).join(', '));
        const result = await makeRequest(`${SERVER_URL}/api/auth/login`, {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        
        if (result.success && result.data.token) {
            authToken = result.data.token;
            console.log('✅ Login successful!');
            console.log('   User:', result.data.user?.username || result.data.user?.email);
            console.log('   Role:', result.data.user?.role);
            console.log('   Token:', authToken.substring(0, 30) + '...');
            console.log('');
            return true;
        } else {
            console.log('❌ Failed:', result.data?.message || result.error);
        }
    }
    
    console.log('❌ All login attempts failed!');
    console.log('');
    return false;
}

async function testUsersAPI() {
    console.log('👥 USERS API TESTS');
    console.log('==================');
    
    // 1. Get all users
    console.log('1️⃣ GET /api/users');
    const users = await makeRequest(`${SERVER_URL}/api/users`);
    if (users.success) {
        console.log('✅ Users list:', users.data?.length || 0, 'users');
        if (users.data?.length > 0) {
            console.log('   Sample user:', users.data[0]);
        }
    } else {
        console.log('❌ Users API failed:', users.status, users.data?.error || users.error);
    }
    console.log('');
    
    // 2. Create new user
    console.log('2️⃣ POST /api/users (Create User)');
    const newUser = {
        username: 'testuser_' + Date.now(),
        email: 'test_' + Date.now() + '@example.com',
        password: 'testpass123',
        role: 'user'
    };
    
    const createUser = await makeRequest(`${SERVER_URL}/api/users`, {
        method: 'POST',
        body: JSON.stringify(newUser)
    });
    
    if (createUser.success) {
        console.log('✅ User created:', createUser.data);
        
        // 3. Update user
        const userId = createUser.data.id || createUser.data.insertId;
        if (userId) {
            console.log('');
            console.log('3️⃣ PUT /api/users/:id (Update User)');
            const updateUser = await makeRequest(`${SERVER_URL}/api/users/${userId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    username: newUser.username + '_updated',
                    role: 'manager'
                })
            });
            
            if (updateUser.success) {
                console.log('✅ User updated:', updateUser.data);
            } else {
                console.log('❌ User update failed:', updateUser.status, updateUser.data?.error);
            }
            
            // 4. Delete user
            console.log('');
            console.log('4️⃣ DELETE /api/users/:id');
            const deleteUser = await makeRequest(`${SERVER_URL}/api/users/${userId}`, {
                method: 'DELETE'
            });
            
            if (deleteUser.success) {
                console.log('✅ User deleted successfully');
            } else {
                console.log('❌ User deletion failed:', deleteUser.status, deleteUser.data?.error);
            }
        }
    } else {
        console.log('❌ User creation failed:', createUser.status, createUser.data?.error || createUser.error);
    }
    console.log('');
}

async function testRolesAPI() {
    console.log('🎭 ROLES API TESTS');
    console.log('==================');
    
    // 1. Get all roles
    console.log('1️⃣ GET /api/roles');
    const roles = await makeRequest(`${SERVER_URL}/api/roles`);
    if (roles.success) {
        console.log('✅ Roles list:', roles.data?.length || 0, 'roles');
        if (roles.data?.length > 0) {
            console.log('   Sample role:', roles.data[0]);
        }
    } else {
        console.log('❌ Roles API failed:', roles.status, roles.data?.error || roles.error);
    }
    console.log('');
    
    // 2. Create new role
    console.log('2️⃣ POST /api/roles (Create Role)');
    const newRole = {
        name: 'test_role_' + Date.now(),
        description: 'Test role for API testing',
        permissions: ['read_products', 'read_inventory']
    };
    
    const createRole = await makeRequest(`${SERVER_URL}/api/roles`, {
        method: 'POST',
        body: JSON.stringify(newRole)
    });
    
    if (createRole.success) {
        console.log('✅ Role created:', createRole.data);
        
        // 3. Update role
        const roleId = createRole.data.id || createRole.data.insertId;
        if (roleId) {
            console.log('');
            console.log('3️⃣ PUT /api/roles/:id (Update Role)');
            const updateRole = await makeRequest(`${SERVER_URL}/api/roles/${roleId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    name: newRole.name + '_updated',
                    description: 'Updated test role',
                    permissions: ['read_products', 'write_products', 'read_inventory']
                })
            });
            
            if (updateRole.success) {
                console.log('✅ Role updated:', updateRole.data);
            } else {
                console.log('❌ Role update failed:', updateRole.status, updateRole.data?.error);
            }
            
            // 4. Delete role
            console.log('');
            console.log('4️⃣ DELETE /api/roles/:id');
            const deleteRole = await makeRequest(`${SERVER_URL}/api/roles/${roleId}`, {
                method: 'DELETE'
            });
            
            if (deleteRole.success) {
                console.log('✅ Role deleted successfully');
            } else {
                console.log('❌ Role deletion failed:', deleteRole.status, deleteRole.data?.error);
            }
        }
    } else {
        console.log('❌ Role creation failed:', createRole.status, createRole.data?.error || createRole.error);
    }
    console.log('');
}

async function testPermissionsAPI() {
    console.log('🔒 PERMISSIONS API TESTS');
    console.log('========================');
    
    // 1. Get all permissions
    console.log('1️⃣ GET /api/permissions');
    const permissions = await makeRequest(`${SERVER_URL}/api/permissions`);
    if (permissions.success) {
        console.log('✅ Permissions list:', permissions.data?.length || 0, 'permissions');
        if (permissions.data?.length > 0) {
            console.log('   Sample permissions:', permissions.data.slice(0, 3));
        }
    } else {
        console.log('❌ Permissions API failed:', permissions.status, permissions.data?.error || permissions.error);
    }
    console.log('');
    
    // 2. Get user permissions
    console.log('2️⃣ GET /api/user-permissions');
    const userPerms = await makeRequest(`${SERVER_URL}/api/user-permissions`);
    if (userPerms.success) {
        console.log('✅ User permissions:', userPerms.data?.length || 0, 'permissions');
        if (userPerms.data?.length > 0) {
            console.log('   User permissions:', userPerms.data.slice(0, 5));
        }
    } else {
        console.log('❌ User permissions failed:', userPerms.status, userPerms.data?.error || userPerms.error);
    }
    console.log('');
    
    // 3. Check specific permission
    console.log('3️⃣ POST /api/check-permission');
    const checkPerm = await makeRequest(`${SERVER_URL}/api/check-permission`, {
        method: 'POST',
        body: JSON.stringify({ permission: 'read_products' })
    });
    
    if (checkPerm.success) {
        console.log('✅ Permission check (read_products):', checkPerm.data);
    } else {
        console.log('❌ Permission check failed:', checkPerm.status, checkPerm.data?.error || checkPerm.error);
    }
    console.log('');
}

async function testAuditAPI() {
    console.log('📋 AUDIT LOG TESTS');
    console.log('==================');
    
    // 1. Get audit logs
    console.log('1️⃣ GET /api/audit-logs');
    const auditLogs = await makeRequest(`${SERVER_URL}/api/audit-logs`);
    if (auditLogs.success) {
        console.log('✅ Audit logs:', auditLogs.data?.length || 0, 'entries');
        if (auditLogs.data?.length > 0) {
            console.log('   Latest log:', auditLogs.data[0]);
        }
    } else {
        console.log('❌ Audit logs failed:', auditLogs.status, auditLogs.data?.error || auditLogs.error);
    }
    console.log('');
}

async function runAllTests() {
    console.log('Starting comprehensive permissions API test...');
    console.log('');
    
    // Step 1: Login
    const loginSuccess = await testLogin();
    if (!loginSuccess) {
        console.log('❌ Cannot proceed without authentication');
        return;
    }
    
    // Step 2: Test all APIs
    await testUsersAPI();
    await testRolesAPI();
    await testPermissionsAPI();
    await testAuditAPI();
    
    console.log('🎉 COMPREHENSIVE PERMISSIONS TEST COMPLETED!');
    console.log('============================================');
    console.log('');
    console.log('Summary:');
    console.log('- Authentication: ✅ Working');
    console.log('- Users API: Tested CRUD operations');
    console.log('- Roles API: Tested CRUD operations');
    console.log('- Permissions API: Tested read operations');
    console.log('- Audit Logs: Tested read operations');
}

// Run the tests
runAllTests().catch(error => {
    console.log('❌ Test execution failed:', error.message);
});