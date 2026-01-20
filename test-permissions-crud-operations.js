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

async function testPermissionsCRUD() {
    console.log('🧪 TESTING PERMISSIONS CRUD OPERATIONS');
    console.log('=====================================');
    
    try {
        // Step 1: Login with admin user
        console.log('🔐 Logging in with test user (to check system)...');
        const loginResponse = await makeRequest(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'tetstetstestdt@company.com',
                password: 'gfx998sd'
            })
        });
        
        console.log(`Login Status: ${loginResponse.status}`);
        
        if (loginResponse.status !== 200 || !loginResponse.data.success) {
            console.log('❌ Test user login failed:', loginResponse.data);
            return;
        }
        
        const token = loginResponse.data.token;
        console.log('✅ Test user login successful! (Note: May need admin for role creation)');
        
        // Step 2: Get all permissions to find the ones we need
        console.log('\n📋 Getting available permissions...');
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
        
        // Find the permissions we need for the cms-hunyhunyprmession role
        const requiredPermissions = [
            'inventory.view',
            'orders.view', 
            'dispatch.view',
            'status.update'
        ];
        
        const permissionIds = [];
        requiredPermissions.forEach(permName => {
            const perm = permissions.find(p => p.name === permName);
            if (perm) {
                permissionIds.push(perm.id);
                console.log(`✅ Found permission: ${permName} (ID: ${perm.id})`);
            } else {
                console.log(`⚠️ Permission not found: ${permName}`);
            }
        });
        
        // Step 3: Create the cms-hunyhunyprmession role
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
                description: 'Custom role for CMS with inventory, orders, dispatch view and status update permissions',
                color: '#6b7280',
                permissionIds: permissionIds
            })
        });
        
        console.log(`Create Role Status: ${createRoleResponse.status}`);
        
        if (createRoleResponse.status === 201 && createRoleResponse.data.success) {
            console.log('✅ Role created successfully!');
            const roleId = createRoleResponse.data.data.id;
            
            // Step 4: Update the role to add status.update permission
            console.log('\n📝 Adding status.update permission to role...');
            const statusUpdatePerm = permissions.find(p => p.name === 'status.update');
            if (statusUpdatePerm) {
                const updatedPermissionIds = [...permissionIds, statusUpdatePerm.id];
                
                const updateRoleResponse = await makeRequest(`${API_BASE}/roles/${roleId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: 'cms-hunyhunyprmession',
                        display_name: 'CMS Huny Huny Permission',
                        description: 'Custom role for CMS with inventory, orders, dispatch view and status update permissions',
                        color: '#6b7280',
                        permissionIds: updatedPermissionIds
                    })
                });
                
                console.log(`Update Role Status: ${updateRoleResponse.status}`);
                if (updateRoleResponse.status === 200) {
                    console.log('✅ Role updated with status.update permission!');
                } else {
                    console.log('❌ Failed to update role:', updateRoleResponse.data);
                }
            } else {
                console.log('⚠️ status.update permission not found');
            }
            
            // Step 5: Create a test user with this role
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
                
                // Step 6: Test login with the new user
                console.log('\n🔐 Testing login with new CMS user...');
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
                
                console.log(`CMS User Login Status: ${cmsLoginResponse.status}`);
                if (cmsLoginResponse.status === 200 && cmsLoginResponse.data.success) {
                    const cmsToken = cmsLoginResponse.data.token;
                    const cmsUser = cmsLoginResponse.data.user;
                    
                    console.log('✅ CMS user login successful!');
                    console.log(`User: ${cmsUser.name} (${cmsUser.email})`);
                    console.log(`Role: ${cmsUser.role}`);
                    console.log(`Permissions: ${cmsUser.permissions.join(', ')}`);
                    
                    // Step 7: Test API access with CMS user
                    console.log('\n🧪 Testing API access with CMS user...');
                    
                    // Test inventory API
                    const inventoryTest = await makeRequest(`${API_BASE}/inventory?limit=5`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${cmsToken}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    console.log(`Inventory API: ${inventoryTest.status === 200 ? '✅ SUCCESS' : '❌ FAILED'} (${inventoryTest.status})`);
                    
                    // Test orders API (if exists)
                    const ordersTest = await makeRequest(`${API_BASE}/orders?limit=5`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${cmsToken}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    console.log(`Orders API: ${ordersTest.status === 200 ? '✅ SUCCESS' : '❌ FAILED'} (${ordersTest.status})`);
                    
                    // Test dispatch API
                    const dispatchTest = await makeRequest(`${API_BASE}/dispatch?limit=5`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${cmsToken}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    console.log(`Dispatch API: ${dispatchTest.status === 200 ? '✅ SUCCESS' : '❌ FAILED'} (${dispatchTest.status})`);
                    
                } else {
                    console.log('❌ CMS user login failed:', cmsLoginResponse.data);
                }
            } else {
                console.log('❌ Failed to create test user:', createUserResponse.data);
            }
            
        } else {
            console.log('❌ Failed to create role:', createRoleResponse.data);
        }
        
        // Step 8: Test CRUD operations on existing data
        console.log('\n📊 Testing CRUD operations...');
        
        // Get all roles
        const rolesResponse = await makeRequest(`${API_BASE}/roles`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`Get Roles: ${rolesResponse.status === 200 ? '✅ SUCCESS' : '❌ FAILED'} (${rolesResponse.status})`);
        if (rolesResponse.status === 200) {
            console.log(`Found ${rolesResponse.data.data.length} roles`);
        }
        
        // Get all users
        const usersResponse = await makeRequest(`${API_BASE}/users`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`Get Users: ${usersResponse.status === 200 ? '✅ SUCCESS' : '❌ FAILED'} (${usersResponse.status})`);
        if (usersResponse.status === 200) {
            console.log(`Found ${usersResponse.data.data.length} users`);
        }
        
        console.log('\n🎉 PERMISSIONS CRUD TEST COMPLETE!');
        
    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
    }
}

testPermissionsCRUD();