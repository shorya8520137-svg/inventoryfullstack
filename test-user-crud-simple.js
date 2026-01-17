#!/usr/bin/env node

// Simple User CRUD Test to isolate issues
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const axios = require('axios');

const BASE_URL = 'https://13.51.56.188.nip.io';

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

async function testSimpleCRUD() {
    console.log('🧪 SIMPLE USER CRUD TEST');
    console.log('='.repeat(40));
    
    try {
        // Step 1: Login
        console.log('\n🔐 Step 1: Login...');
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
        console.log(`📝 Token: ${token.substring(0, 30)}...`);
        
        // Step 2: Create User
        console.log('\n➕ Step 2: Create User...');
        const timestamp = Date.now();
        const newUser = {
            name: `Simple Test ${timestamp}`,
            email: `simple_${timestamp}@company.com`,
            password: 'testpass123',
            role_id: 2
        };
        
        console.log(`📝 Creating: ${newUser.name} (${newUser.email})`);
        
        const createResult = await apiRequest('POST', '/api/users', newUser, token);
        
        if (createResult.success) {
            console.log('✅ User created successfully');
            console.log('📝 Response:', JSON.stringify(createResult.data, null, 2));
            
            // Extract user ID from response
            const userId = createResult.data.data?.id;
            console.log(`📝 User ID: ${userId}`);
            
            if (userId) {
                // Step 3: Read Single User
                console.log('\n👤 Step 3: Read Single User...');
                const readResult = await apiRequest('GET', `/api/users/${userId}`, null, token);
                
                if (readResult.success) {
                    console.log('✅ Read user successful');
                    console.log('📝 User data:', JSON.stringify(readResult.data.data, null, 2));
                } else {
                    console.log('❌ Read user failed:', readResult.error);
                }
                
                // Step 4: Update User
                console.log('\n✏️ Step 4: Update User...');
                const updateData = {
                    name: `Updated ${newUser.name}`,
                    email: newUser.email,
                    roleId: 3
                };
                
                const updateResult = await apiRequest('PUT', `/api/users/${userId}`, updateData, token);
                
                if (updateResult.success) {
                    console.log('✅ Update user successful');
                    console.log('📝 Response:', JSON.stringify(updateResult.data, null, 2));
                } else {
                    console.log('❌ Update user failed:', updateResult.error);
                }
                
                // Step 5: Delete User
                console.log('\n🗑️ Step 5: Delete User...');
                const deleteResult = await apiRequest('DELETE', `/api/users/${userId}`, null, token);
                
                if (deleteResult.success) {
                    console.log('✅ Delete user successful');
                    console.log('📝 Response:', JSON.stringify(deleteResult.data, null, 2));
                } else {
                    console.log('❌ Delete user failed:', deleteResult.error);
                }
            }
        } else {
            console.log('❌ User creation failed:', createResult.error);
        }
        
        // Step 6: Test Additional APIs
        console.log('\n🔧 Step 6: Additional API Tests...');
        
        // Test get all users
        const usersResult = await apiRequest('GET', '/api/users', null, token);
        if (usersResult.success) {
            console.log(`✅ Get all users: ${usersResult.data.data.length} users found`);
        } else {
            console.log('❌ Get all users failed:', usersResult.error);
        }
        
        // Test get roles
        const rolesResult = await apiRequest('GET', '/api/roles', null, token);
        if (rolesResult.success) {
            console.log(`✅ Get roles: ${rolesResult.data.data.length} roles found`);
        } else {
            console.log('❌ Get roles failed:', rolesResult.error);
        }
        
        // Test get permissions
        const permissionsResult = await apiRequest('GET', '/api/permissions', null, token);
        if (permissionsResult.success) {
            console.log(`✅ Get permissions: ${permissionsResult.data.data.length} permissions found`);
        } else {
            console.log('❌ Get permissions failed:', permissionsResult.error);
        }
        
        console.log('\n🎉 Simple CRUD test completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testSimpleCRUD();