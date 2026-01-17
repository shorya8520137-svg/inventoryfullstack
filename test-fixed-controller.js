#!/usr/bin/env node

// Disable SSL certificate validation for testing
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const axios = require('axios');

const BASE_URL = 'https://16.171.161.150.nip.io';

// Helper function to make API requests
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

async function testFixedController() {
    console.log('🧪 Testing Fixed Controller APIs...\n');
    
    try {
        // Test 1: Login
        console.log('1️⃣ Testing Login...');
        const loginResult = await apiRequest('POST', '/api/auth/login', {
            email: 'admin@company.com',
            password: 'admin@123'
        });
        
        if (!loginResult.success) {
            console.log('❌ Login failed:', loginResult.error);
            return;
        }
        
        console.log('✅ Login successful');
        const token = loginResult.data.token;
        
        // Test 2: Get Users (this was causing the callback error)
        console.log('\n2️⃣ Testing Get Users...');
        const usersResult = await apiRequest('GET', '/api/users', null, token);
        
        if (usersResult.success) {
            console.log(`✅ Users API working: Found ${usersResult.data.data.length} users`);
        } else {
            console.log('❌ Users API failed:', usersResult.error);
        }
        
        // Test 3: Get Roles (this was also causing issues)
        console.log('\n3️⃣ Testing Get Roles...');
        const rolesResult = await apiRequest('GET', '/api/roles');
        
        if (rolesResult.success) {
            console.log(`✅ Roles API working: Found ${rolesResult.data.data.length} roles`);
        } else {
            console.log('❌ Roles API failed:', rolesResult.error);
        }
        
        // Test 4: Get Permissions
        console.log('\n4️⃣ Testing Get Permissions...');
        const permissionsResult = await apiRequest('GET', '/api/permissions');
        
        if (permissionsResult.success) {
            console.log(`✅ Permissions API working: Found ${permissionsResult.data.data.permissions.length} permissions`);
        } else {
            console.log('❌ Permissions API failed:', permissionsResult.error);
        }
        
        // Test 5: Create User (test audit logging)
        console.log('\n5️⃣ Testing Create User...');
        const createUserResult = await apiRequest('POST', '/api/users', {
            name: 'Test User Fix',
            email: 'testfix@example.com',
            password: 'password123',
            role_id: 2
        }, token);
        
        if (createUserResult.success) {
            console.log('✅ Create User API working');
            
            // Test 6: Delete the test user
            console.log('\n6️⃣ Testing Delete User...');
            const deleteResult = await apiRequest('DELETE', `/api/users/${createUserResult.data.data.id}`, null, token);
            
            if (deleteResult.success) {
                console.log('✅ Delete User API working');
            } else {
                console.log('❌ Delete User API failed:', deleteResult.error);
            }
        } else {
            console.log('❌ Create User API failed:', createUserResult.error);
        }
        
        console.log('\n🎉 Controller fix test completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testFixedController();