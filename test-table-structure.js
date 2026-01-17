#!/usr/bin/env node

// Test to check actual table structure and update with minimal fields
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const axios = require('axios');

const BASE_URL = 'https://13.51.56.188.nip.io';

async function testTableStructure() {
    console.log('🔍 TESTING TABLE STRUCTURE AND MINIMAL UPDATE');
    console.log('='.repeat(50));
    
    try {
        // Login
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'admin@company.com',
            password: 'admin@123'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful');
        
        // Get a user to see the structure
        const usersResponse = await axios.get(`${BASE_URL}/api/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const users = usersResponse.data.data;
        const sampleUser = users.find(user => user.email !== 'admin@company.com');
        
        if (sampleUser) {
            console.log('\n📋 Sample user structure:');
            console.log(JSON.stringify(sampleUser, null, 2));
            
            console.log('\n🧪 Testing update with only name change...');
            
            // Try updating with just the name (most basic update)
            try {
                const updateResponse = await axios.put(`${BASE_URL}/api/users/${sampleUser.id}`, {
                    name: sampleUser.name + '_test'
                }, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                console.log('✅ Name-only update successful:', updateResponse.data);
            } catch (error) {
                console.log('❌ Name-only update failed:', error.response?.data || error.message);
            }
            
            console.log('\n🧪 Testing update with name and email...');
            
            // Try updating with name and email
            try {
                const updateResponse2 = await axios.put(`${BASE_URL}/api/users/${sampleUser.id}`, {
                    name: sampleUser.name,
                    email: sampleUser.email
                }, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                console.log('✅ Name+email update successful:', updateResponse2.data);
            } catch (error) {
                console.log('❌ Name+email update failed:', error.response?.data || error.message);
            }
            
        } else {
            console.log('❌ No test user found');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

testTableStructure();