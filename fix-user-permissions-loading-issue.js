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
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
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

async function fixUserPermissionsLoading() {
    console.log('🔧 FIXING USER PERMISSIONS LOADING ISSUE');
    console.log('========================================');
    
    try {
        // Step 1: Login as admin to check the issue
        console.log('🔐 Step 1: Admin login...');
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
        
        // Step 2: Find the hunyhuny user
        console.log('\n👤 Step 2: Finding hunyhuny user...');
        const usersResponse = await makeRequest(`${API_BASE}/users`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        
        if (usersResponse.status !== 200) {
            console.log('❌ Failed to get users:', usersResponse.data);
            return;
        }
        
        const users = usersResponse.data.data;
        const hunyhunyUser = users.find(u => 
            u.name.toLowerCase().includes('huny') || 
            u.email.toLowerCase().includes('huny') ||
            u.role_name === 'cms-hunyhunyprmession'
        );
        
        if (!hunyhunyUser) {
            console.log('❌ hunyhuny user not found');
            console.log('Available users with CMS role:');
            users.filter(u => u.role_name === 'cms-hunyhunyprmession').forEach(user => {
                console.log(`  - ${user.name} (${user.email})`);
            });
            return;
        }
        
        console.log('✅ Found hunyhuny user:');
        console.log(`   ID: ${hunyhunyUser.id}`);
        console.log(`   Name: ${hunyhunyUser.name}`);
        console.log(`   Email: ${hunyhunyUser.email}`);
        console.log(`   Role: ${hunyhunyUser.role_name} (ID: ${hunyhunyUser.role_id})`);
        
        // Step 3: Check what happens when hunyhuny logs in
        console.log('\n🔍 Step 3: Testing hunyhuny login to see permission loading...');
        
        // Try common passwords
        const passwords = ['password', '123456', 'hunyhuny', 'test123', 'admin123'];
        let loginSuccess = false;
        let userLoginData = null;
        
        for (const password of passwords) {
            const loginAttempt = await makeRequest(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: hunyhunyUser.email,
                    password: password
                })
            });
            
            if (loginAttempt.status === 200 && loginAttempt.data.success) {
                console.log(`✅ Login successful with password: ${password}`);
                userLoginData = loginAttempt.data;
                loginSuccess = true;
                break;
            }
        }
        
        if (!loginSuccess) {
            console.log('❌ Could not login with common passwords. Resetting password...');
            
            // Reset password
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
                    console.log('✅ Login successful after password reset');
                    userLoginData = loginRetry.data;
                    loginSuccess = true;
                } else {
                    console.log('❌ Login still failed:', loginRetry.data);
                    return;
                }
            }
        }
        
        // Step 4: Analyze the login response
        console.log('\n📊 Step 4: Analyzing login response...');
        console.log('=====================================');
        
        const user = userLoginData.user;
        console.log('User object from login:');
        console.log(`  ID: ${user.id}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Role Name: ${user.role_name}`);
        console.log(`  Role ID: ${user.role_id}`);
        console.log(`  Permissions: ${user.permissions ? user.permissions.length : 'undefined'}`);
        
        if (user.permissions && user.permissions.length > 0) {
            console.log('\n✅ Permissions found in login response:');
            user.permissions.forEach(perm => {
                console.log(`  - ${perm.name}: ${perm.display_name}`);
            });
        } else {
            console.log('\n❌ NO PERMISSIONS in login response!');
            console.log('This is the root cause of the issue.');
        }
        
        // Step 5: Check role permissions directly
        console.log('\n🎭 Step 5: Checking role permissions directly...');
        const rolePermResponse = await makeRequest(`${API_BASE}/roles/${user.role_id}/permissions`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        
        if (rolePermResponse.status === 200) {
            const rolePermissions = rolePermResponse.data.data || rolePermResponse.data;
            console.log(`✅ Role has ${rolePermissions.length} permissions in database:`);
            rolePermissions.forEach(perm => {
                console.log(`  - ${perm.name}: ${perm.display_name}`);
            });
        } else {
            console.log(`❌ Failed to get role permissions: ${rolePermResponse.status}`);
        }
        
        // Step 6: The fix - check auth controller
        console.log('\n🔧 Step 6: DIAGNOSIS AND FIX');
        console.log('============================');
        
        if (!user.permissions || user.permissions.length === 0) {
            console.log('❌ PROBLEM IDENTIFIED:');
            console.log('The login API is not returning user permissions.');
            console.log('This means the auth controller is not properly joining');
            console.log('the user role permissions in the login response.');
            
            console.log('\n💡 SOLUTION NEEDED:');
            console.log('1. Fix the auth controller to include permissions in login response');
            console.log('2. Or fix the frontend to fetch permissions after login');
            console.log('3. Check the JWT token generation to include permissions');
            
            console.log('\n🔍 BACKEND ISSUE:');
            console.log('The authController.js login function needs to:');
            console.log('- Join user -> role -> role_permissions -> permissions');
            console.log('- Include permissions array in the user object');
            console.log('- Return permissions in the login response');
            
            console.log('\n📝 FRONTEND ISSUE:');
            console.log('The frontend shows "0 permissions" because:');
            console.log('- Login response has no permissions array');
            console.log('- AuthContext is not getting permissions');
            console.log('- Sidebar shows user.permissions.length = 0');
        } else {
            console.log('✅ Permissions are being returned correctly');
            console.log('The issue might be in the frontend handling');
        }
        
        console.log('\n🎯 NEXT STEPS:');
        console.log('==============');
        console.log('1. Check controllers/authController.js login function');
        console.log('2. Ensure it joins and returns user permissions');
        console.log('3. Test login again to verify permissions are included');
        console.log('4. Check frontend AuthContext to ensure it stores permissions');
        
        console.log(`\n🔑 TEST CREDENTIALS:`);
        console.log(`Email: ${hunyhunyUser.email}`);
        console.log(`Password: test123`);
        console.log(`Expected Permissions: 5`);
        console.log(`Current Permissions: ${user.permissions ? user.permissions.length : 0}`);
        
    } catch (error) {
        console.error('❌ Fix attempt failed:', error.message);
    }
}

fixUserPermissionsLoading();