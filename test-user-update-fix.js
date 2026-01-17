#!/usr/bin/env node

// Test the user update fix
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const axios = require('axios');

const BASE_URL = 'https://13.51.56.188.nip.io';

async function testUserUpdate() {
    console.log('🧪 Testing User Update Fix...');
    
    try {
        // Step 1: Login
        console.log('🔐 Logging in...');
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'admin@company.com',
            password: 'admin@123'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful');
        
        // Step 2: Get users to find a test user
        console.log('👥 Getting users...');
        const usersResponse = await axios.get(`${BASE_URL}/api/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const users = usersResponse.data.data;
        console.log(`✅ Found ${users.length} users`);
        
        // Find a user to update (not admin)
        const testUser = users.find(user => user.email !== 'admin@company.com');
        if (!testUser) {
            console.log('❌ No test user found');
            return;
        }
        
        console.log(`🎯 Testing update on user: ${testUser.name} (ID: ${testUser.id})`);
        
        // Step 3: Update user (this should work now)
        console.log('📝 Updating user...');
        const updateResponse = await axios.put(`${BASE_URL}/api/users/${testUser.id}`, {
            name: testUser.name + '_updated',
            email: testUser.email,
            roleId: testUser.role_id
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('✅ User update successful!');
        console.log('Response:', updateResponse.data);
        
        // Step 4: Verify the update
        console.log('🔍 Verifying update...');
        const verifyResponse = await axios.get(`${BASE_URL}/api/users/${testUser.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('✅ User verification successful!');
        console.log('Updated user:', verifyResponse.data.data);
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

testUserUpdate();