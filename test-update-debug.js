#!/usr/bin/env node

// Debug the update user issue
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const axios = require('axios');

const BASE_URL = 'https://13.51.56.188.nip.io';

async function debugUpdate() {
    console.log('🔍 DEBUGGING USER UPDATE');
    console.log('='.repeat(30));
    
    try {
        // Login
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'admin@company.com',
            password: 'admin@123'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful');
        
        // Create a test user
        const timestamp = Date.now();
        const createResponse = await axios.post(`${BASE_URL}/api/users`, {
            name: `Debug User ${timestamp}`,
            email: `debug_${timestamp}@company.com`,
            password: 'testpass123',
            role_id: 2
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const userId = createResponse.data.data.id;
        console.log(`✅ User created with ID: ${userId}`);
        
        // Try to update with different payloads
        console.log('\n🧪 Testing different update payloads...');
        
        // Test 1: Original payload
        console.log('\n📝 Test 1: Original payload');
        try {
            const updateResponse1 = await axios.put(`${BASE_URL}/api/users/${userId}`, {
                name: `Updated Debug User ${timestamp}`,
                email: `updated_debug_${timestamp}@company.com`,
                roleId: 3
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('✅ Test 1 successful:', updateResponse1.data);
        } catch (error) {
            console.log('❌ Test 1 failed:', error.response?.data || error.message);
        }
        
        // Test 2: Using role_id instead of roleId
        console.log('\n📝 Test 2: Using role_id instead of roleId');
        try {
            const updateResponse2 = await axios.put(`${BASE_URL}/api/users/${userId}`, {
                name: `Updated Debug User ${timestamp}`,
                email: `updated_debug_${timestamp}@company.com`,
                role_id: 3
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('✅ Test 2 successful:', updateResponse2.data);
        } catch (error) {
            console.log('❌ Test 2 failed:', error.response?.data || error.message);
        }
        
        // Test 3: Minimal payload
        console.log('\n📝 Test 3: Minimal payload');
        try {
            const updateResponse3 = await axios.put(`${BASE_URL}/api/users/${userId}`, {
                name: `Minimal Update ${timestamp}`,
                email: `minimal_${timestamp}@company.com`
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('✅ Test 3 successful:', updateResponse3.data);
        } catch (error) {
            console.log('❌ Test 3 failed:', error.response?.data || error.message);
        }
        
        // Clean up - delete the test user
        await axios.delete(`${BASE_URL}/api/users/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('\n🧹 Test user cleaned up');
        
    } catch (error) {
        console.error('❌ Debug failed:', error.response?.data || error.message);
    }
}

debugUpdate();