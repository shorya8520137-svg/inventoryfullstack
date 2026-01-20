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

async function createCMSRole() {
    console.log('🎭 CREATING CMS-HUNYHUNYPRMESSION ROLE');
    console.log('=====================================');
    
    try {
        // Step 1: Login (we need admin permissions for this)
        console.log('🔐 Attempting login...');
        
        // Try different admin accounts
        const adminAccounts = [
            { email: 'admin@test.com', password: 'gfx998sd' },
            { email: 'admin@company.com', password: 'gfx998sd' },
            { email: 'superadmin@test.com', password: 'gfx998sd' },
            { email: 'tetstetstestdt@company.com', password: 'gfx998sd' } // fallback to test user
        ];
        
        let token = null;
        let loginUser = null;
        
        for (const account of adminAccounts) {
            console.log(`Trying ${account.email}...`);
            const loginResponse = await makeRequest(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(account)
            });
            
            if (loginResponse.status === 200 && loginResponse.data.success) {
                token = loginResponse.data.token;
                loginUser = loginResponse.data.user;
                console.log(`✅ Login successful with ${account.email}!`);
                console.log(`Role: ${loginUser.role}, Permissions: ${loginUser.permissions.length}`);
                break;
            } else {
                console.log(`❌ Failed: ${loginResponse.data?.message || 'Unknown error'}`);
            }
        }
        
        if (!token) {
            console.log('❌ Could not login with any admin account');
            return;
        }
        
        // Step 2: Get all permissions
        console.log('\n📋 Getting permissions...');
        const permissionsResponse = await makeRequest(`${API_BASE}/permissions`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (permissionsResponse.status !== 200) {
            console.log('❌ Failed to get permissions:', permissionsResponse.data);
            return;
        }
        
        const permissions = permissionsResponse.data.data.permissions;
        console.log(`✅ Found ${permissions.length} permissions`);
        
        // Step 3: Find the correct permissions for CMS role
        const requiredPermissions = [
            'inventory.view',      // ✅ Available
            'orders.view',         // ✅ Available  
            'operations.dispatch', // ✅ Available (instead of dispatch.view)
            'orders.status_update',// ✅ Available (instead of status.update)
            'products.view'        // ✅ Available (bonus)
        ];
        
        const permissionIds = [];
        console.log('\n🔍 Finding required permissions:');
        
        requiredPermissions.forEach(permName => {
            const perm = permissions.find(p => p.name === permName);
            if (perm) {
                permissionIds.push(perm.id);
                console.log(`✅ ${permName} (ID: ${perm.id}) - ${perm.display_name}`);
            } else {
                console.log(`❌ ${permName} - NOT FOUND`);
            }
        });
        
        if (permissionIds.length === 0) {
            console.log('❌ No permissions found, cannot create role');
            return;
        }
        
        // Step 4: Create the cms-hunyhunyprmession role
        console.log('\n🎭 Creating cms-hunyhunyprmession role...');
        const createRoleResponse = await makeRequest(`${API_BASE}/roles`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'cms-hunyhunyprmession',
                display_name: 'CMS Huny Huny Permission',
                description: 'Custom CMS role with inventory view, orders view, dispatch operations, and status update permissions',
                color: '#6b7280',
                permissionIds: permissionIds
            })
        });
        
        console.log(`Create Role Status: ${createRoleResponse.status}`);
        
        if (createRoleResponse.status === 201 && createRoleResponse.data.success) {
            const roleId = createRoleResponse.data.data.id;
            console.log('✅ Role created successfully!');
            console.log(`Role ID: ${roleId}`);
            
            // Step 5: Verify the role was created
            console.log('\n🔍 Verifying role creation...');
            const rolesResponse = await makeRequest(`${API_BASE}/roles`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (rolesResponse.status === 200) {
                const roles = rolesResponse.data.data;
                const cmsRole = roles.find(r => r.name === 'cms-hunyhunyprmession');
                if (cmsRole) {
                    console.log('✅ Role verification successful!');
                    console.log(`Role: ${cmsRole.display_name}`);
                    console.log(`Users: ${cmsRole.user_count || 0}`);
                    console.log(`Permissions: ${cmsRole.permission_count || 0}`);
                } else {
                    console.log('⚠️ Role created but not found in list');
                }
            }
            
            // Step 6: Create a test user with this role (if we have admin permissions)
            if (loginUser.permissions.includes('system.user_management')) {
                console.log('\n👤 Creating test user with cms-hunyhunyprmession role...');
                const createUserResponse = await makeRequest(`${API_BASE}/users`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: 'CMS Test User',
                        email: 'cmstest@company.com',
                        password: 'testpass123',
                        role_id: roleId,
                        is_active: true
                    })
                });
                
                console.log(`Create User Status: ${createUserResponse.status}`);
                if (createUserResponse.status === 201) {
                    console.log('✅ Test user created successfully!');
                    
                    // Test login with new user
                    console.log('\n🔐 Testing login with CMS user...');
                    const cmsLoginResponse = await makeRequest(`${API_BASE}/auth/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            email: 'cmstest@company.com',
                            password: 'testpass123'
                        })
                    });
                    
                    if (cmsLoginResponse.status === 200 && cmsLoginResponse.data.success) {
                        const cmsUser = cmsLoginResponse.data.user;
                        console.log('✅ CMS user login successful!');
                        console.log(`User: ${cmsUser.name} (${cmsUser.email})`);
                        console.log(`Role: ${cmsUser.role}`);
                        console.log(`Permissions: ${cmsUser.permissions.join(', ')}`);
                        
                        // Test API access
                        console.log('\n🧪 Testing API access...');
                        const cmsToken = cmsLoginResponse.data.token;
                        
                        const tests = [
                            { name: 'Inventory', url: `${API_BASE}/inventory?limit=5` },
                            { name: 'Orders', url: `${API_BASE}/orders?limit=5` },
                            { name: 'Dispatch', url: `${API_BASE}/dispatch?limit=5` },
                            { name: 'Products', url: `${API_BASE}/products?limit=5` }
                        ];
                        
                        for (const test of tests) {
                            const response = await makeRequest(test.url, {
                                method: 'GET',
                                headers: {
                                    'Authorization': `Bearer ${cmsToken}`,
                                    'Content-Type': 'application/json'
                                }
                            });
                            
                            console.log(`${test.name} API: ${response.status === 200 ? '✅ SUCCESS' : '❌ FAILED'} (${response.status})`);
                        }
                        
                    } else {
                        console.log('❌ CMS user login failed:', cmsLoginResponse.data);
                    }
                } else {
                    console.log('❌ Failed to create test user:', createUserResponse.data);
                }
            } else {
                console.log('⚠️ Cannot create test user - insufficient permissions');
            }
            
        } else {
            console.log('❌ Failed to create role:', createRoleResponse.data);
        }
        
        console.log('\n🎉 CMS ROLE CREATION COMPLETE!');
        
    } catch (error) {
        console.error('❌ Process failed with error:', error.message);
    }
}

createCMSRole();