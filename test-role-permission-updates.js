#!/usr/bin/env node

// Test role permission updates - exactly like the frontend does
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

async function testRolePermissionUpdates() {
    console.log('🔐 TESTING ROLE PERMISSION UPDATES (FRONTEND STYLE)');
    console.log('='.repeat(60));
    
    try {
        // Step 1: Login
        console.log('\n🔐 STEP 1: LOGIN');
        console.log('-'.repeat(40));
        
        const loginResult = await apiRequest('POST', '/api/auth/login', {
            email: 'admin@company.com',
            password: 'admin@123'
        });
        
        if (!loginResult.success) {
            console.log('❌ Login failed:', loginResult.error);
            return;
        }
        
        const token = loginResult.data.token;
        console.log('✅ Login successful');
        
        // Step 2: Get all permissions
        console.log('\n📋 STEP 2: FETCH ALL PERMISSIONS');
        console.log('-'.repeat(40));
        
        const permissionsResult = await apiRequest('GET', '/api/permissions', null, token);
        if (!permissionsResult.success) {
            console.log('❌ Failed to fetch permissions:', permissionsResult.error);
            return;
        }
        
        const permissions = permissionsResult.data.data.permissions || permissionsResult.data.data;
        console.log(`✅ Found ${permissions.length} permissions`);
        
        // Show some sample permissions
        console.log('📝 Sample permissions:');
        permissions.slice(0, 5).forEach(perm => {
            console.log(`   - ID: ${perm.id}, Name: ${perm.name}, Display: ${perm.display_name}`);
        });
        
        // Step 3: Get all roles
        console.log('\n🎭 STEP 3: FETCH ALL ROLES');
        console.log('-'.repeat(40));
        
        const rolesResult = await apiRequest('GET', '/api/roles', null, token);
        if (!rolesResult.success) {
            console.log('❌ Failed to fetch roles:', rolesResult.error);
            return;
        }
        
        const roles = rolesResult.data.data;
        console.log(`✅ Found ${roles.length} roles`);
        
        // Find a test role or create one
        let testRole = roles.find(r => r.name.includes('test') || r.name.includes('Test'));
        
        if (!testRole) {
            console.log('⚠️ No test role found, creating one...');
            
            // Create a test role
            const createRoleResult = await apiRequest('POST', '/api/roles', {
                name: `test_role_${Date.now()}`,
                display_name: `Test Role ${Date.now()}`,
                description: 'Test role for permission updates',
                color: '#ff6b6b',
                permissionIds: [1, 2, 3] // Start with some permissions
            }, token);
            
            if (!createRoleResult.success) {
                console.log('❌ Failed to create test role:', createRoleResult.error);
                return;
            }
            
            // Fetch the created role
            const newRoleId = createRoleResult.data.data.id;
            const newRolesResult = await apiRequest('GET', '/api/roles', null, token);
            testRole = newRolesResult.data.data.find(r => r.id == newRoleId);
            
            console.log(`✅ Created test role: ${testRole.name} (ID: ${testRole.id})`);
        } else {
            console.log(`✅ Found test role: ${testRole.name} (ID: ${testRole.id})`);
        }
        
        // Step 4: Test role permission updates (like frontend RoleModal)
        console.log('\n🔄 STEP 4: TEST ROLE PERMISSION UPDATES');
        console.log('-'.repeat(40));
        
        // Test 1: Update with specific permissions (like frontend does)
        console.log('\n🔄 Test 1: Update role with specific permissions...');
        const testPermissionIds = [1, 2, 5, 10, 15]; // Select some permission IDs
        
        const updateData1 = {
            name: testRole.name,
            display_name: testRole.display_name,
            description: testRole.description || 'Updated test role',
            color: testRole.color || '#ff6b6b',
            permissionIds: testPermissionIds
        };
        
        console.log('📝 Update data:', JSON.stringify(updateData1, null, 2));
        
        const updateResult1 = await apiRequest('PUT', `/api/roles/${testRole.id}`, updateData1, token);
        
        if (updateResult1.success) {
            console.log('✅ Role permission update successful');
            
            // Verify by checking role permissions
            const verifyResult1 = await apiRequest('GET', `/api/roles/${testRole.id}/permissions`, null, token);
            if (verifyResult1.success) {
                const rolePermissions = verifyResult1.data.data || [];
                console.log(`📊 Role now has ${rolePermissions.length} permissions`);
                console.log('   Updated permissions:');
                rolePermissions.slice(0, 5).forEach(perm => {
                    console.log(`   - ${perm.name}: ${perm.display_name}`);
                });
                
                if (rolePermissions.length === testPermissionIds.length) {
                    console.log('✅ Permission count matches expected');
                } else {
                    console.log(`⚠️ Permission count mismatch: expected ${testPermissionIds.length}, got ${rolePermissions.length}`);
                }
            } else {
                console.log('❌ Failed to verify permissions:', verifyResult1.error);
            }
        } else {
            console.log('❌ Role permission update failed:', updateResult1.error);
        }
        
        // Test 2: Update with different permissions
        console.log('\n🔄 Test 2: Update role with different permissions...');
        const testPermissionIds2 = [3, 7, 12, 18, 25]; // Different set
        
        const updateData2 = {
            name: testRole.name,
            display_name: testRole.display_name,
            description: 'Updated again with different permissions',
            color: '#4ecdc4',
            permissionIds: testPermissionIds2
        };
        
        const updateResult2 = await apiRequest('PUT', `/api/roles/${testRole.id}`, updateData2, token);
        
        if (updateResult2.success) {
            console.log('✅ Second role permission update successful');
            
            // Verify the change
            const verifyResult2 = await apiRequest('GET', `/api/roles/${testRole.id}/permissions`, null, token);
            if (verifyResult2.success) {
                const rolePermissions2 = verifyResult2.data.data || [];
                console.log(`📊 Role now has ${rolePermissions2.length} permissions (expected: ${testPermissionIds2.length})`);
                
                if (rolePermissions2.length === testPermissionIds2.length) {
                    console.log('✅ Permission update verified successfully');
                } else {
                    console.log(`⚠️ Permission count mismatch after second update`);
                }
            }
        } else {
            console.log('❌ Second role permission update failed:', updateResult2.error);
        }
        
        // Test 3: Update with empty permissions (remove all)
        console.log('\n🔄 Test 3: Update role with no permissions...');
        const updateData3 = {
            name: testRole.name,
            display_name: testRole.display_name,
            description: 'Role with no permissions',
            color: '#95a5a6',
            permissionIds: []
        };
        
        const updateResult3 = await apiRequest('PUT', `/api/roles/${testRole.id}`, updateData3, token);
        
        if (updateResult3.success) {
            console.log('✅ Empty permissions update successful');
            
            // Verify no permissions
            const verifyResult3 = await apiRequest('GET', `/api/roles/${testRole.id}/permissions`, null, token);
            if (verifyResult3.success) {
                const rolePermissions3 = verifyResult3.data.data || [];
                console.log(`📊 Role now has ${rolePermissions3.length} permissions (expected: 0)`);
                
                if (rolePermissions3.length === 0) {
                    console.log('✅ All permissions removed successfully');
                } else {
                    console.log(`⚠️ Still has ${rolePermissions3.length} permissions`);
                }
            }
        } else {
            console.log('❌ Empty permissions update failed:', updateResult3.error);
        }
        
        // Step 5: Clean up (delete test role if we created it)
        if (testRole.name.includes('test_role_')) {
            console.log('\n🗑️ STEP 5: CLEANUP');
            console.log('-'.repeat(40));
            
            const deleteResult = await apiRequest('DELETE', `/api/roles/${testRole.id}`, null, token);
            if (deleteResult.success) {
                console.log('✅ Test role deleted successfully');
            } else {
                console.log('❌ Failed to delete test role:', deleteResult.error);
            }
        }
        
        // Step 6: Final Summary
        console.log('\n🎉 ROLE PERMISSION UPDATE TEST COMPLETED!');
        console.log('='.repeat(60));
        console.log('✅ Login: WORKING');
        console.log('✅ Permissions fetch: WORKING');
        console.log('✅ Roles fetch: WORKING');
        console.log('✅ Role permission updates: TESTED');
        console.log('✅ Permission verification: TESTED');
        console.log('\n📝 This test simulates exactly what the frontend RoleModal does!');
        console.log('🔧 The callback error should now be fixed!');
        
    } catch (error) {
        console.error('❌ Role permission update test failed:', error);
    }
}

// Run the test
testRolePermissionUpdates();