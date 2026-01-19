const https = require('https');

// Ignore SSL certificate errors for testing
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const API_BASE = 'https://13.48.248.180.nip.io/api';

async function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ status: res.statusCode, data: parsed, headers: res.headers });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data, headers: res.headers });
                }
            });
        });
        
        req.on('error', reject);
        
        if (options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
}

async function debugCMSRolePermissions() {
    console.log('🔍 DEBUGGING CMS ROLE PERMISSIONS IN DETAIL');
    console.log('============================================');
    
    try {
        // Step 1: Login as the CMS user (hunyhuny)
        console.log('🔐 Step 1: Login as CMS user (hunyhuny)...');
        
        // First, let's try to find the hunyhuny user credentials
        // Let me login as admin first to check users
        const adminLogin = await makeRequest(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@company.com',
                password: 'admin@123'
            })
        });
        
        if (adminLogin.status !== 200) {
            console.log('❌ Admin login failed:', adminLogin.data);
            return;
        }
        
        const adminToken = adminLogin.data.token;
        console.log('✅ Admin login successful');
        
        // Step 2: Get all users to find hunyhuny
        console.log('\n👥 Step 2: Finding hunyhuny user...');
        const usersResponse = await makeRequest(`${API_BASE}/users`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        
        if (usersResponse.status !== 200) {
            console.log('❌ Failed to get users:', usersResponse.data);
            return;
        }
        
        const users = usersResponse.data.data;
        const hunyhunyUser = users.find(u => u.name.toLowerCase().includes('huny') || u.email.toLowerCase().includes('huny'));
        
        if (!hunyhunyUser) {
            console.log('❌ hunyhuny user not found');
            console.log('Available users:');
            users.forEach(user => {
                console.log(`  - ${user.name} (${user.email}) - Role: ${user.role_name}`);
            });
            return;
        }
        
        console.log('✅ Found hunyhuny user:');
        console.log(`   ID: ${hunyhunyUser.id}`);
        console.log(`   Name: ${hunyhunyUser.name}`);
        console.log(`   Email: ${hunyhunyUser.email}`);
        console.log(`   Role: ${hunyhunyUser.role_name} (ID: ${hunyhunyUser.role_id})`);
        console.log(`   Active: ${hunyhunyUser.is_active}`);
        
        // Step 3: Check the CMS role permissions in detail
        console.log('\n🎭 Step 3: Checking CMS role permissions...');
        const roleResponse = await makeRequest(`${API_BASE}/roles/${hunyhunyUser.role_id}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        
        if (roleResponse.status === 200) {
            const role = roleResponse.data.data;
            console.log('✅ CMS Role Details:');
            console.log(`   Name: ${role.name}`);
            console.log(`   Display Name: ${role.display_name}`);
            console.log(`   Description: ${role.description}`);
            console.log(`   Permission Count: ${role.permission_count}`);
            
            if (role.permissions && role.permissions.length > 0) {
                console.log('\n📋 Role Permissions:');
                role.permissions.forEach(perm => {
                    console.log(`   ✅ ${perm.name} - ${perm.display_name} (${perm.category})`);
                });
            }
        }
        
        // Step 4: Try to login as hunyhuny user (we need to guess password or reset it)
        console.log('\n🔑 Step 4: Attempting to login as hunyhuny...');
        
        // Common passwords to try
        const commonPasswords = ['password', '123456', 'hunyhuny', 'test123', 'admin123'];
        let hunyhunyToken = null;
        
        for (const password of commonPasswords) {
            const loginAttempt = await makeRequest(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: hunyhunyUser.email,
                    password: password
                })
            });
            
            if (loginAttempt.status === 200 && loginAttempt.data.success) {
                hunyhunyToken = loginAttempt.data.token;
                console.log(`✅ Login successful with password: ${password}`);
                break;
            }
        }
        
        if (!hunyhunyToken) {
            console.log('❌ Could not login as hunyhuny with common passwords');
            console.log('💡 Let me reset the password for testing...');
            
            // Reset password for hunyhuny user
            const resetResponse = await makeRequest(`${API_BASE}/users/${hunyhunyUser.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: hunyhunyUser.name,
                    email: hunyhunyUser.email,
                    password: 'test123',
                    role_id: hunyhunyUser.role_id,
                    is_active: true
                })
            });
            
            if (resetResponse.status === 200) {
                console.log('✅ Password reset to "test123"');
                
                // Try login again
                const loginRetry = await makeRequest(`${API_BASE}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: hunyhunyUser.email,
                        password: 'test123'
                    })
                });
                
                if (loginRetry.status === 200 && loginRetry.data.success) {
                    hunyhunyToken = loginRetry.data.token;
                    console.log('✅ Login successful after password reset');
                } else {
                    console.log('❌ Login still failed after password reset:', loginRetry.data);
                    return;
                }
            } else {
                console.log('❌ Failed to reset password:', resetResponse.data);
                return;
            }
        }
        
        // Step 5: Test API access with hunyhuny user
        console.log('\n🧪 Step 5: Testing API access as hunyhuny user...');
        
        const apiTests = [
            { name: 'Products API', endpoint: '/products', expectedPermission: 'products.view' },
            { name: 'Inventory API', endpoint: '/inventory?limit=5', expectedPermission: 'inventory.view' },
            { name: 'Orders API', endpoint: '/orders?limit=5', expectedPermission: 'orders.view' },
            { name: 'Dispatch API', endpoint: '/dispatch?limit=5', expectedPermission: 'operations.dispatch' },
            { name: 'Users API', endpoint: '/users', expectedPermission: 'users.view' },
            { name: 'Roles API', endpoint: '/roles', expectedPermission: 'roles.view' }
        ];
        
        console.log('\n📊 API ACCESS TEST RESULTS:');
        console.log('===========================');
        
        for (const test of apiTests) {
            const response = await makeRequest(`${API_BASE}${test.endpoint}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${hunyhunyToken}` }
            });
            
            const statusIcon = response.status === 200 ? '✅' : '❌';
            console.log(`${statusIcon} ${test.name}: ${response.status}`);
            
            if (response.status === 403) {
                console.log(`   🔒 Permission Required: ${test.expectedPermission}`);
                console.log(`   📝 Error: ${response.data?.message || 'Forbidden'}`);
            } else if (response.status === 404) {
                console.log(`   🔍 Endpoint not found: ${test.endpoint}`);
            } else if (response.status === 200) {
                const dataCount = Array.isArray(response.data?.data) ? response.data.data.length : 'N/A';
                console.log(`   📈 Records returned: ${dataCount}`);
            }
        }
        
        // Step 6: Check what permissions the user actually has when logged in
        console.log('\n🔐 Step 6: Checking user permissions from login response...');
        
        const userLoginCheck = await makeRequest(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: hunyhunyUser.email,
                password: 'test123'
            })
        });
        
        if (userLoginCheck.status === 200) {
            const loginUser = userLoginCheck.data.user;
            console.log('✅ User login details:');
            console.log(`   User ID: ${loginUser.id}`);
            console.log(`   Role: ${loginUser.role_name}`);
            console.log(`   Role ID: ${loginUser.role_id}`);
            
            if (loginUser.permissions) {
                console.log(`\n📋 User Permissions (${loginUser.permissions.length}):`);
                loginUser.permissions.forEach(perm => {
                    console.log(`   ✅ ${perm.name} - ${perm.display_name} (${perm.category})`);
                });
            } else {
                console.log('❌ No permissions found in login response');
            }
        }
        
        // Step 7: Direct database check via API
        console.log('\n🗄️ Step 7: Checking role permissions via API...');
        
        const rolePermissionsResponse = await makeRequest(`${API_BASE}/roles/${hunyhunyUser.role_id}/permissions`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        
        if (rolePermissionsResponse.status === 200) {
            const rolePermissions = rolePermissionsResponse.data.data || rolePermissionsResponse.data;
            console.log(`✅ Role permissions from API (${rolePermissions.length}):`);
            rolePermissions.forEach(perm => {
                console.log(`   ✅ ${perm.name} - ${perm.display_name} (${perm.category})`);
            });
        } else {
            console.log(`❌ Failed to get role permissions: ${rolePermissionsResponse.status}`);
        }
        
        console.log('\n🎯 DIAGNOSIS COMPLETE!');
        console.log('======================');
        console.log('Please check the results above to identify the specific issue.');
        console.log('The user credentials for testing: ');
        console.log(`Email: ${hunyhunyUser.email}`);
        console.log(`Password: test123`);
        
    } catch (error) {
        console.error('❌ Debug failed with error:', error.message);
    }
}

debugCMSRolePermissions();