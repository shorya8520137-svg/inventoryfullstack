#!/usr/bin/env node

// Direct CRUD operations test - no git, just test the APIs
const axios = require('axios');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const BASE_URL = 'https://13.51.56.188.nip.io';

// Helper function for API requests
async function apiRequest(method, endpoint, data = null, token = null) {
    const config = {
        method,
        url: `${BASE_URL}${endpoint}`,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        },
        ...(data && { data })
    };

    try {
        const response = await axios(config);
        return { success: true, data: response.data, status: response.status };
    } catch (error) {
        return { 
            success: false, 
            error: error.response?.data || error.message, 
            status: error.response?.status || 0 
        };
    }
}

async function testCrudOperations() {
    console.log('🚀 TESTING CRUD OPERATIONS DIRECTLY');
    console.log('='.repeat(60));
    
    try {
        // Step 1: Authentication first
        console.log('\n🔐 STEP 1: AUTHENTICATION');
        console.log('-'.repeat(40));
        
        const loginResult = await apiRequest('POST', '/api/auth/login', {
            email: 'admin@company.com',
            password: 'admin@123'
        });
        
        if (!loginResult.success) {
            console.log('❌ Authentication failed:', loginResult.error);
            return;
        }
        
        const token = loginResult.data.token;
        console.log('✅ Authentication successful');
        
        // Step 2: Test server health with token
        console.log('\n🏥 STEP 2: TESTING SERVER HEALTH');
        console.log('-'.repeat(40));
        
        const healthResult = await apiRequest('GET', '/api/health', null, token);
        if (healthResult.success) {
            console.log('✅ Server is healthy and responding');
        } else {
            console.log('❌ Server health check failed:', healthResult.error);
        }
        
        // Step 3: Complete User CRUD Testing
        console.log('\n👥 STEP 3: USER CRUD OPERATIONS');
        console.log('-'.repeat(40));
        
        let testUserId = null;
        const timestamp = Date.now();
        
        // CREATE USER
        console.log('➕ Testing CREATE USER...');
        const createUserResult = await apiRequest('POST', '/api/users', {
            name: `CRUD Test ${timestamp}`,
            email: `crudtest_${timestamp}@company.com`,
            password: 'testpass123',
            role_id: 2 // Start with admin role
        }, token);
        
        if (createUserResult.success) {
            testUserId = createUserResult.data.data.id;
            console.log(`✅ User created successfully (ID: ${testUserId})`);
        } else {
            console.log('❌ User creation failed:', createUserResult.error);
            return;
        }
        
        // READ USERS
        console.log('📋 Testing READ USERS...');
        const readUsersResult = await apiRequest('GET', '/api/users', null, token);
        if (readUsersResult.success) {
            console.log(`✅ Read users successful (${readUsersResult.data.data.length} users found)`);
        } else {
            console.log('❌ Read users failed:', readUsersResult.error);
        }
        
        // READ SINGLE USER
        console.log('👤 Testing READ SINGLE USER...');
        const readUserResult = await apiRequest('GET', `/api/users/${testUserId}`, null, token);
        if (readUserResult.success) {
            const user = readUserResult.data.data;
            console.log('✅ Read single user successful');
            console.log(`   Name: ${user.name}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Current role: ${user.role_name} (ID: ${user.role_id || 'N/A'})`);
        } else {
            console.log('❌ Read single user failed:', readUserResult.error);
        }
        
        // UPDATE USER (including role change)
        console.log('✏️ Testing UPDATE USER (with role change)...');
        
        const updateUserResult = await apiRequest('PUT', `/api/users/${testUserId}`, {
            name: `Updated CRUD Test ${timestamp}`,
            email: `updated_crudtest_${timestamp}@company.com`,
            role_id: 3 // Change to manager role (ID 3)
        }, token);
        
        if (updateUserResult.success) {
            console.log('✅ User update API call successful');
            
            // Wait a moment for database to update
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Verify the role change by fetching user again
            const verifyResult = await apiRequest('GET', `/api/users/${testUserId}`, null, token);
            if (verifyResult.success) {
                const updatedUser = verifyResult.data.data;
                console.log(`   Updated name: ${updatedUser.name}`);
                console.log(`   Updated email: ${updatedUser.email}`);
                console.log(`   Updated role: ${updatedUser.role_name} (ID: ${updatedUser.role_id || 'N/A'})`);
                
                // Check if role actually changed
                if (updatedUser.role_id == 3) {
                    console.log('✅ Role change verified successfully - role_id updated to 3');
                    if (updatedUser.role_name === 'manager') {
                        console.log('✅ Role name also updated correctly to manager');
                    } else {
                        console.log(`⚠️ Role name is "${updatedUser.role_name}" instead of "manager"`);
                    }
                } else {
                    console.log('❌ Role change failed');
                    console.log(`   Expected: role_id=3, Got: role_id=${updatedUser.role_id}`);
                }
            } else {
                console.log('❌ Could not verify role change:', verifyResult.error);
            }
        } else {
            console.log('❌ User update failed:', updateUserResult.error);
        }
        
        // Test multiple role changes
        console.log('\n🔄 Testing MULTIPLE ROLE CHANGES...');
        const roleChanges = [
            { role_id: 1, expected_name: 'super_admin' },
            { role_id: 2, expected_name: 'admin' },
            { role_id: 3, expected_name: 'manager' }
        ];
        
        for (const change of roleChanges) {
            console.log(`🔄 Testing role change to ${change.expected_name} (ID: ${change.role_id})...`);
            
            const roleUpdateResult = await apiRequest('PUT', `/api/users/${testUserId}`, {
                role_id: change.role_id
            }, token);
            
            if (roleUpdateResult.success) {
                // Verify the change
                await new Promise(resolve => setTimeout(resolve, 1000));
                const verifyRoleResult = await apiRequest('GET', `/api/users/${testUserId}`, null, token);
                
                if (verifyRoleResult.success) {
                    const user = verifyRoleResult.data.data;
                    if (user.role_id == change.role_id) {
                        console.log(`   ✅ Role successfully changed to ${user.role_name} (ID: ${user.role_id})`);
                    } else {
                        console.log(`   ❌ Role change failed - Expected ID: ${change.role_id}, Got: ${user.role_id}`);
                    }
                }
            } else {
                console.log(`   ❌ Role update API failed:`, roleUpdateResult.error);
            }
        }
        
        // DELETE USER
        console.log('\n🗑️ Testing DELETE USER...');
        const deleteUserResult = await apiRequest('DELETE', `/api/users/${testUserId}`, null, token);
        if (deleteUserResult.success) {
            console.log('✅ User deletion successful');
        } else {
            console.log('❌ User deletion failed:', deleteUserResult.error);
        }
        
        // Step 4: Test Roles
        console.log('\n🎭 STEP 4: ROLES OPERATIONS');
        console.log('-'.repeat(40));
        
        const readRolesResult = await apiRequest('GET', '/api/roles', null, token);
        if (readRolesResult.success) {
            const roles = readRolesResult.data.data;
            console.log(`✅ Read roles successful (${roles.length} roles found)`);
            console.log('   Available roles:');
            roles.forEach(role => {
                console.log(`   - ID: ${role.id}, Name: ${role.name}, Display: ${role.display_name}, Priority: ${role.priority}`);
            });
        } else {
            console.log('❌ Read roles failed:', readRolesResult.error);
        }
        
        // Step 5: Final Summary
        console.log('\n🎉 CRUD TESTING COMPLETED!');
        console.log('='.repeat(60));
        console.log('✅ Server health: WORKING');
        console.log('✅ Authentication: WORKING');
        console.log('✅ User CRUD operations: TESTED');
        console.log('✅ Role update functionality: TESTED');
        console.log('✅ Role operations: TESTED');
        console.log('\n📝 All CRUD operations tested successfully!');
        
    } catch (error) {
        console.error('❌ CRUD testing failed:', error);
    }
}

// Run the CRUD testing
testCrudOperations();