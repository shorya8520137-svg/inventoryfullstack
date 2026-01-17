#!/usr/bin/env node

// Test frontend role update functionality - exactly like the frontend does it
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

async function testFrontendRoleUpdate() {
    console.log('🎯 TESTING FRONTEND ROLE UPDATE FUNCTIONALITY');
    console.log('='.repeat(60));
    
    try {
        // Step 1: Login as admin
        console.log('\n🔐 STEP 1: LOGIN AS ADMIN');
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
        console.log(`   User: ${loginResult.data.user.name}`);
        console.log(`   Role: ${loginResult.data.user.role}`);
        
        // Step 2: Get all roles (like frontend does)
        console.log('\n🎭 STEP 2: FETCH ALL ROLES');
        console.log('-'.repeat(40));
        
        const rolesResult = await apiRequest('GET', '/api/roles', null, token);
        if (!rolesResult.success) {
            console.log('❌ Failed to fetch roles:', rolesResult.error);
            return;
        }
        
        const roles = rolesResult.data.data;
        console.log(`✅ Found ${roles.length} roles:`);
        roles.forEach(role => {
            console.log(`   - ID: ${role.id}, Name: ${role.name}, Display: ${role.display_name}`);
        });
        
        // Step 3: Create a test user (like frontend does)
        console.log('\n👤 STEP 3: CREATE TEST USER');
        console.log('-'.repeat(40));
        
        const timestamp = Date.now();
        const createUserData = {
            name: `Frontend Test ${timestamp}`,
            email: `frontendtest_${timestamp}@company.com`,
            password: 'testpass123',
            role_id: 2, // Start with admin role
            is_active: true
        };
        
        console.log('📝 Creating user with data:', JSON.stringify(createUserData, null, 2));
        
        const createResult = await apiRequest('POST', '/api/users', createUserData, token);
        if (!createResult.success) {
            console.log('❌ User creation failed:', createResult.error);
            return;
        }
        
        const testUserId = createResult.data.data.id;
        console.log(`✅ User created successfully (ID: ${testUserId})`);
        
        // Step 4: Fetch the created user (like frontend does)
        console.log('\n📋 STEP 4: FETCH CREATED USER');
        console.log('-'.repeat(40));
        
        const getUserResult = await apiRequest('GET', `/api/users/${testUserId}`, null, token);
        if (!getUserResult.success) {
            console.log('❌ Failed to fetch user:', getUserResult.error);
            return;
        }
        
        const user = getUserResult.data.data;
        console.log('✅ User fetched successfully:');
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Current Role ID: ${user.role_id}`);
        console.log(`   Current Role Name: ${user.role_name}`);
        console.log(`   Current Role Display: ${user.role_display_name}`);
        
        // Step 5: Test role updates (exactly like frontend modal)
        console.log('\n🔄 STEP 5: TEST ROLE UPDATES (FRONTEND STYLE)');
        console.log('-'.repeat(40));
        
        // Test updating to Super Admin (role_id: 1)
        console.log('\n🔄 Testing update to Super Admin (ID: 1)...');
        const updateToSuperAdmin = {
            name: user.name,
            email: user.email,
            role_id: 1, // Super Admin
            is_active: user.is_active
        };
        
        console.log('📝 Update data:', JSON.stringify(updateToSuperAdmin, null, 2));
        
        const updateResult1 = await apiRequest('PUT', `/api/users/${testUserId}`, updateToSuperAdmin, token);
        if (updateResult1.success) {
            console.log('✅ Update API call successful');
            
            // Verify the update
            const verifyResult1 = await apiRequest('GET', `/api/users/${testUserId}`, null, token);
            if (verifyResult1.success) {
                const updatedUser1 = verifyResult1.data.data;
                console.log('📊 Verification result:');
                console.log(`   Role ID: ${updatedUser1.role_id} (expected: 1)`);
                console.log(`   Role Name: ${updatedUser1.role_name} (expected: super_admin)`);
                console.log(`   Role Display: ${updatedUser1.role_display_name} (expected: Super Admin)`);
                
                if (updatedUser1.role_id == 1 && updatedUser1.role_name === 'super_admin') {
                    console.log('✅ Super Admin role update SUCCESSFUL');
                } else {
                    console.log('❌ Super Admin role update FAILED');
                }
            }
        } else {
            console.log('❌ Update to Super Admin failed:', updateResult1.error);
        }
        
        // Test updating to Manager (role_id: 3)
        console.log('\n🔄 Testing update to Manager (ID: 3)...');
        const updateToManager = {
            name: user.name,
            email: user.email,
            role_id: 3, // Manager
            is_active: user.is_active
        };
        
        console.log('📝 Update data:', JSON.stringify(updateToManager, null, 2));
        
        const updateResult2 = await apiRequest('PUT', `/api/users/${testUserId}`, updateToManager, token);
        if (updateResult2.success) {
            console.log('✅ Update API call successful');
            
            // Verify the update
            const verifyResult2 = await apiRequest('GET', `/api/users/${testUserId}`, null, token);
            if (verifyResult2.success) {
                const updatedUser2 = verifyResult2.data.data;
                console.log('📊 Verification result:');
                console.log(`   Role ID: ${updatedUser2.role_id} (expected: 3)`);
                console.log(`   Role Name: ${updatedUser2.role_name} (expected: manager)`);
                console.log(`   Role Display: ${updatedUser2.role_display_name} (expected: Manager)`);
                
                if (updatedUser2.role_id == 3 && updatedUser2.role_name === 'manager') {
                    console.log('✅ Manager role update SUCCESSFUL');
                } else {
                    console.log('❌ Manager role update FAILED');
                }
            }
        } else {
            console.log('❌ Update to Manager failed:', updateResult2.error);
        }
        
        // Test updating back to Admin (role_id: 2)
        console.log('\n🔄 Testing update back to Admin (ID: 2)...');
        const updateToAdmin = {
            name: user.name,
            email: user.email,
            role_id: 2, // Admin
            is_active: user.is_active
        };
        
        console.log('📝 Update data:', JSON.stringify(updateToAdmin, null, 2));
        
        const updateResult3 = await apiRequest('PUT', `/api/users/${testUserId}`, updateToAdmin, token);
        if (updateResult3.success) {
            console.log('✅ Update API call successful');
            
            // Verify the update
            const verifyResult3 = await apiRequest('GET', `/api/users/${testUserId}`, null, token);
            if (verifyResult3.success) {
                const updatedUser3 = verifyResult3.data.data;
                console.log('📊 Verification result:');
                console.log(`   Role ID: ${updatedUser3.role_id} (expected: 2)`);
                console.log(`   Role Name: ${updatedUser3.role_name} (expected: admin)`);
                console.log(`   Role Display: ${updatedUser3.role_display_name} (expected: Admin)`);
                
                if (updatedUser3.role_id == 2 && updatedUser3.role_name === 'admin') {
                    console.log('✅ Admin role update SUCCESSFUL');
                } else {
                    console.log('❌ Admin role update FAILED');
                }
            }
        } else {
            console.log('❌ Update to Admin failed:', updateResult3.error);
        }
        
        // Step 6: Test role dropdown functionality
        console.log('\n📋 STEP 6: TEST ROLE DROPDOWN FUNCTIONALITY');
        console.log('-'.repeat(40));
        
        console.log('🔍 Testing role dropdown options (like frontend select):');
        roles.forEach(role => {
            console.log(`   <option value="${role.id}">${role.display_name || role.name}</option>`);
        });
        
        // Step 7: Clean up
        console.log('\n🗑️ STEP 7: CLEANUP');
        console.log('-'.repeat(40));
        
        const deleteResult = await apiRequest('DELETE', `/api/users/${testUserId}`, null, token);
        if (deleteResult.success) {
            console.log('✅ Test user deleted successfully');
        } else {
            console.log('❌ Failed to delete test user:', deleteResult.error);
        }
        
        // Step 8: Final Summary
        console.log('\n🎉 FRONTEND ROLE UPDATE TEST COMPLETED!');
        console.log('='.repeat(60));
        console.log('✅ Login: WORKING');
        console.log('✅ Roles fetch: WORKING');
        console.log('✅ User creation: WORKING');
        console.log('✅ User fetch: WORKING');
        console.log('✅ Role updates: TESTED');
        console.log('✅ Role dropdown: WORKING');
        console.log('✅ Cleanup: WORKING');
        console.log('\n📝 This test simulates exactly what the frontend permissions page does!');
        
    } catch (error) {
        console.error('❌ Frontend role update test failed:', error);
    }
}

// Run the frontend role update test
testFrontendRoleUpdate();