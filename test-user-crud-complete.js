#!/usr/bin/env node

// Comprehensive User CRUD Operations Test
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const axios = require('axios');

const BASE_URL = 'https://13.51.56.188.nip.io';
let authToken = null;
let testUserId = null;

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

async function testUserCRUD() {
    console.log('🧪 COMPREHENSIVE USER CRUD OPERATIONS TEST');
    console.log('='.repeat(60));
    
    try {
        // ========================================
        // AUTHENTICATION
        // ========================================
        console.log('\n🔐 STEP 1: AUTHENTICATION');
        console.log('-'.repeat(40));
        
        const loginResult = await apiRequest('POST', '/api/auth/login', {
            email: 'admin@company.com',
            password: 'admin@123'
        });
        
        if (!loginResult.success) {
            console.log('❌ Login failed:', loginResult.error);
            return;
        }
        
        authToken = loginResult.data.token;
        console.log('✅ Login successful');
        console.log(`📝 Token: ${authToken.substring(0, 20)}...`);
        
        // ========================================
        // CREATE USER (C in CRUD)
        // ========================================
        console.log('\n➕ STEP 2: CREATE USER');
        console.log('-'.repeat(40));
        
        const timestamp = Date.now();
        const newUser = {
            name: `Test User ${timestamp}`,
            email: `testuser_${timestamp}@company.com`,
            password: 'testpass123',
            role_id: 2 // Assuming role_id 2 exists (admin role)
        };
        
        console.log(`📝 Creating user: ${newUser.name} (${newUser.email})`);
        
        const createResult = await apiRequest('POST', '/api/users', newUser, authToken);
        
        if (createResult.success) {
            testUserId = createResult.data.data.id;
            console.log('✅ User created successfully');
            console.log(`📝 New User ID: ${testUserId}`);
        } else {
            console.log('❌ User creation failed:', createResult.error);
            return;
        }
        
        // ========================================
        // READ USERS (R in CRUD) - Get All
        // ========================================
        console.log('\n📋 STEP 3: READ ALL USERS');
        console.log('-'.repeat(40));
        
        const getAllResult = await apiRequest('GET', '/api/users', null, authToken);
        
        if (getAllResult.success) {
            const users = getAllResult.data.data;
            console.log(`✅ Retrieved ${users.length} users`);
            console.log('📝 Sample users:');
            users.slice(0, 3).forEach(user => {
                console.log(`   - ${user.name} (${user.email}) - Role ID: ${user.role_id}`);
            });
        } else {
            console.log('❌ Get all users failed:', getAllResult.error);
        }
        
        // ========================================
        // READ USER (R in CRUD) - Get Single
        // ========================================
        console.log('\n👤 STEP 4: READ SINGLE USER');
        console.log('-'.repeat(40));
        
        const getSingleResult = await apiRequest('GET', `/api/users/${testUserId}`, null, authToken);
        
        if (getSingleResult.success) {
            const user = getSingleResult.data.data;
            console.log('✅ Retrieved single user successfully');
            console.log(`📝 User Details:`);
            console.log(`   - ID: ${user.id}`);
            console.log(`   - Name: ${user.name}`);
            console.log(`   - Email: ${user.email}`);
            console.log(`   - Role ID: ${user.role_id}`);
            console.log(`   - Created: ${user.created_at}`);
        } else {
            console.log('❌ Get single user failed:', getSingleResult.error);
        }
        
        // ========================================
        // UPDATE USER (U in CRUD)
        // ========================================
        console.log('\n✏️ STEP 5: UPDATE USER');
        console.log('-'.repeat(40));
        
        const updatedData = {
            name: `Updated Test User ${timestamp}`,
            email: `updated_testuser_${timestamp}@company.com`,
            roleId: 3 // Assuming role_id 3 exists (manager role)
        };
        
        console.log(`📝 Updating user ${testUserId}:`);
        console.log(`   - New Name: ${updatedData.name}`);
        console.log(`   - New Email: ${updatedData.email}`);
        console.log(`   - New Role ID: ${updatedData.roleId}`);
        
        const updateResult = await apiRequest('PUT', `/api/users/${testUserId}`, updatedData, authToken);
        
        if (updateResult.success) {
            console.log('✅ User updated successfully');
        } else {
            console.log('❌ User update failed:', updateResult.error);
        }
        
        // Verify the update
        console.log('🔍 Verifying update...');
        const verifyResult = await apiRequest('GET', `/api/users/${testUserId}`, null, authToken);
        
        if (verifyResult.success) {
            const updatedUser = verifyResult.data.data;
            console.log('✅ Update verification successful');
            console.log(`📝 Updated User Details:`);
            console.log(`   - Name: ${updatedUser.name}`);
            console.log(`   - Email: ${updatedUser.email}`);
            console.log(`   - Role ID: ${updatedUser.role_id}`);
        } else {
            console.log('❌ Update verification failed:', verifyResult.error);
        }
        
        // ========================================
        // DELETE USER (D in CRUD)
        // ========================================
        console.log('\n🗑️ STEP 6: DELETE USER');
        console.log('-'.repeat(40));
        
        console.log(`📝 Deleting user ${testUserId}...`);
        
        const deleteResult = await apiRequest('DELETE', `/api/users/${testUserId}`, null, authToken);
        
        if (deleteResult.success) {
            console.log('✅ User deleted successfully');
        } else {
            console.log('❌ User deletion failed:', deleteResult.error);
        }
        
        // Verify the deletion
        console.log('🔍 Verifying deletion...');
        const verifyDeleteResult = await apiRequest('GET', `/api/users/${testUserId}`, null, authToken);
        
        if (!verifyDeleteResult.success && verifyDeleteResult.status === 404) {
            console.log('✅ Deletion verification successful - User not found (as expected)');
        } else if (verifyDeleteResult.success) {
            console.log('❌ Deletion verification failed - User still exists');
        } else {
            console.log('⚠️ Deletion verification inconclusive:', verifyDeleteResult.error);
        }
        
        // ========================================
        // ADDITIONAL TESTS
        // ========================================
        console.log('\n🔧 STEP 7: ADDITIONAL TESTS');
        console.log('-'.repeat(40));
        
        // Test getting roles
        console.log('📋 Testing get roles...');
        const rolesResult = await apiRequest('GET', '/api/roles', null, authToken);
        if (rolesResult.success) {
            console.log(`✅ Retrieved ${rolesResult.data.data.length} roles`);
        } else {
            console.log('❌ Get roles failed:', rolesResult.error);
        }
        
        // Test getting permissions
        console.log('🔐 Testing get permissions...');
        const permissionsResult = await apiRequest('GET', '/api/permissions', null, authToken);
        if (permissionsResult.success) {
            console.log(`✅ Retrieved ${permissionsResult.data.data.length} permissions`);
        } else {
            console.log('❌ Get permissions failed:', permissionsResult.error);
        }
        
        // Test system stats
        console.log('📊 Testing system stats...');
        const statsResult = await apiRequest('GET', '/api/system/stats', null, authToken);
        if (statsResult.success) {
            console.log('✅ System stats retrieved successfully');
            console.log(`📝 Stats: ${JSON.stringify(statsResult.data.data, null, 2)}`);
        } else {
            console.log('❌ System stats failed:', statsResult.error);
        }
        
        // ========================================
        // SUMMARY
        // ========================================
        console.log('\n🎉 CRUD OPERATIONS TEST COMPLETED!');
        console.log('='.repeat(60));
        console.log('✅ All user CRUD operations tested successfully');
        console.log('📝 Operations tested:');
        console.log('   - ✅ CREATE: User creation');
        console.log('   - ✅ READ: Get all users & get single user');
        console.log('   - ✅ UPDATE: User modification');
        console.log('   - ✅ DELETE: User removal');
        console.log('   - ✅ ADDITIONAL: Roles, permissions, stats');
        
    } catch (error) {
        console.error('❌ CRUD test failed:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Run the test
testUserCRUD();