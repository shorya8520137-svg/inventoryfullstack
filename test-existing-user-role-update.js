#!/usr/bin/env node

// Test role update on existing users (like what you see in frontend)
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

async function testExistingUserRoleUpdate() {
    console.log('👥 TESTING EXISTING USER ROLE UPDATES');
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
        
        // Step 2: Get all users
        console.log('\n👥 STEP 2: FETCH ALL USERS');
        console.log('-'.repeat(40));
        
        const usersResult = await apiRequest('GET', '/api/users', null, token);
        if (!usersResult.success) {
            console.log('❌ Failed to fetch users:', usersResult.error);
            return;
        }
        
        const users = usersResult.data.data;
        console.log(`✅ Found ${users.length} users`);
        
        // Find a test user (not the main admin)
        const testUser = users.find(u => 
            u.email !== 'admin@company.com' && 
            u.name.includes('Test') || u.name.includes('test') || u.name.includes('CRUD')
        );
        
        if (!testUser) {
            console.log('⚠️ No test user found, creating one...');
            
            // Create a test user
            const createResult = await apiRequest('POST', '/api/users', {
                name: `Role Test User ${Date.now()}`,
                email: `roletest_${Date.now()}@company.com`,
                password: 'testpass123',
                role_id: 2,
                is_active: true
            }, token);
            
            if (!createResult.success) {
                console.log('❌ Failed to create test user:', createResult.error);
                return;
            }
            
            const newUserId = createResult.data.data.id;
            const newUserResult = await apiRequest('GET', `/api/users/${newUserId}`, null, token);
            const newUser = newUserResult.data.data;
            
            console.log(`✅ Created test user: ${newUser.name} (ID: ${newUser.id})`);
            await testRoleUpdatesOnUser(newUser, token);
            
            // Clean up
            await apiRequest('DELETE', `/api/users/${newUserId}`, null, token);
            console.log('🗑️ Test user cleaned up');
            
        } else {
            console.log(`✅ Found test user: ${testUser.name} (ID: ${testUser.id})`);
            console.log(`   Current role: ${testUser.role_name} (ID: ${testUser.role_id})`);
            
            await testRoleUpdatesOnUser(testUser, token);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

async function testRoleUpdatesOnUser(user, token) {
    console.log(`\n🔄 STEP 3: TESTING ROLE UPDATES ON USER ${user.name}`);
    console.log('-'.repeat(40));
    
    const originalRoleId = user.role_id;
    const originalRoleName = user.role_name;
    
    console.log(`📊 Original role: ${originalRoleName} (ID: ${originalRoleId})`);
    
    // Test role changes
    const roleTests = [
        { id: 1, name: 'super_admin', display: 'Super Admin' },
        { id: 3, name: 'manager', display: 'Manager' },
        { id: 2, name: 'admin', display: 'Admin' },
        { id: 4, name: 'operator', display: 'Operator' }
    ];
    
    for (const roleTest of roleTests) {
        console.log(`\n🔄 Testing update to ${roleTest.display} (ID: ${roleTest.id})...`);
        
        // Update user role (exactly like frontend does)
        const updateData = {
            name: user.name,
            email: user.email,
            role_id: roleTest.id,
            is_active: user.is_active
        };
        
        const updateResult = await apiRequest('PUT', `/api/users/${user.id}`, updateData, token);
        
        if (updateResult.success) {
            console.log('✅ Update API call successful');
            
            // Verify the update
            const verifyResult = await apiRequest('GET', `/api/users/${user.id}`, null, token);
            if (verifyResult.success) {
                const updatedUser = verifyResult.data.data;
                console.log(`   Updated role: ${updatedUser.role_name} (ID: ${updatedUser.role_id})`);
                console.log(`   Expected: ${roleTest.name} (ID: ${roleTest.id})`);
                
                if (updatedUser.role_id == roleTest.id && updatedUser.role_name === roleTest.name) {
                    console.log(`   ✅ ${roleTest.display} role update SUCCESSFUL`);
                } else {
                    console.log(`   ❌ ${roleTest.display} role update FAILED`);
                    console.log(`      Got: ${updatedUser.role_name} (ID: ${updatedUser.role_id})`);
                    console.log(`      Expected: ${roleTest.name} (ID: ${roleTest.id})`);
                }
            } else {
                console.log('   ❌ Failed to verify update:', verifyResult.error);
            }
        } else {
            console.log(`   ❌ Update to ${roleTest.display} failed:`, updateResult.error);
        }
        
        // Small delay between updates
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Restore original role
    console.log(`\n🔄 Restoring original role: ${originalRoleName} (ID: ${originalRoleId})...`);
    const restoreData = {
        name: user.name,
        email: user.email,
        role_id: originalRoleId,
        is_active: user.is_active
    };
    
    const restoreResult = await apiRequest('PUT', `/api/users/${user.id}`, restoreData, token);
    if (restoreResult.success) {
        console.log('✅ Original role restored successfully');
    } else {
        console.log('❌ Failed to restore original role:', restoreResult.error);
    }
}

// Run the test
testExistingUserRoleUpdate();