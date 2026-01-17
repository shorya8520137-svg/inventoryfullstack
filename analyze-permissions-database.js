#!/usr/bin/env node

// Analyze the permissions database structure
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const axios = require('axios');

const BASE_URL = 'https://13.51.56.188.nip.io';

async function analyzePermissionsDatabase() {
    console.log('🔍 ANALYZING PERMISSIONS DATABASE STRUCTURE');
    console.log('='.repeat(60));
    
    try {
        // Step 1: Login
        console.log('\n🔐 Step 1: Authentication...');
        const loginResult = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'admin@company.com',
            password: 'admin@123'
        });
        
        const token = loginResult.data.token;
        console.log('✅ Login successful');
        
        // Step 2: Get all users to understand structure
        console.log('\n👥 Step 2: Analyzing Users Table...');
        const usersResult = await axios.get(`${BASE_URL}/api/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (usersResult.data.success) {
            const users = usersResult.data.data;
            console.log(`📊 Found ${users.length} users`);
            
            // Show sample user structure
            const sampleUser = users[0];
            console.log('\n📋 Sample User Structure:');
            console.log(JSON.stringify(sampleUser, null, 2));
            
            // Analyze user fields
            console.log('\n🔍 User Table Fields Analysis:');
            Object.keys(sampleUser).forEach(field => {
                console.log(`   - ${field}: ${typeof sampleUser[field]} (${sampleUser[field]})`);
            });
        }
        
        // Step 3: Get all roles
        console.log('\n🎭 Step 3: Analyzing Roles Table...');
        const rolesResult = await axios.get(`${BASE_URL}/api/roles`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (rolesResult.data.success) {
            const roles = rolesResult.data.data;
            console.log(`📊 Found ${roles.length} roles`);
            
            console.log('\n📋 All Roles:');
            roles.forEach(role => {
                console.log(`   - ID: ${role.id}, Name: ${role.name}, Display: ${role.display_name}, Priority: ${role.priority}`);
            });
        }
        
        // Step 4: Get all permissions
        console.log('\n🔐 Step 4: Analyzing Permissions Table...');
        const permissionsResult = await axios.get(`${BASE_URL}/api/permissions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (permissionsResult.data.success) {
            const permissions = permissionsResult.data.data;
            console.log(`📊 Found ${permissions.length} permissions`);
            
            // Group by category
            const categories = {};
            permissions.forEach(perm => {
                if (!categories[perm.category]) {
                    categories[perm.category] = [];
                }
                categories[perm.category].push(perm);
            });
            
            console.log('\n📋 Permissions by Category:');
            Object.keys(categories).forEach(category => {
                console.log(`   📁 ${category}: ${categories[category].length} permissions`);
                categories[category].slice(0, 3).forEach(perm => {
                    console.log(`      - ${perm.name}: ${perm.display_name}`);
                });
            });
        }
        
        // Step 5: Test specific user to understand role relationship
        console.log('\n🧪 Step 5: Testing User-Role Relationship...');
        const testUser = users.find(u => u.id == 143); // The user you were testing
        if (testUser) {
            console.log('\n📋 Test User (ID 143) Details:');
            console.log(`   - Name: ${testUser.name}`);
            console.log(`   - Email: ${testUser.email}`);
            console.log(`   - Role ID: ${testUser.role_id}`);
            console.log(`   - Role Name: ${testUser.role_name}`);
            console.log(`   - Role Display: ${testUser.role_display_name}`);
            console.log(`   - Role Color: ${testUser.role_color}`);
            
            // Check if role_id matches role data
            const userRole = roles.find(r => r.id == testUser.role_id);
            if (userRole) {
                console.log('\n✅ Role Relationship Working:');
                console.log(`   - Database Role ID: ${userRole.id}`);
                console.log(`   - Database Role Name: ${userRole.name}`);
                console.log(`   - User's Role ID: ${testUser.role_id}`);
                console.log(`   - User's Role Name: ${testUser.role_name}`);
            } else {
                console.log('\n❌ Role Relationship Issue:');
                console.log(`   - User role_id: ${testUser.role_id}`);
                console.log(`   - No matching role found in roles table`);
            }
        }
        
        // Step 6: Understand the update issue
        console.log('\n🔧 Step 6: Understanding Update Issue...');
        console.log('The update query shows:');
        console.log('   - affectedRows: 1 (row was found and processed)');
        console.log('   - changedRows: 0 (no actual data was changed)');
        console.log('   - This suggests the role_id field is not being updated properly');
        
        console.log('\n📝 Possible Issues:');
        console.log('   1. role_id field might not exist in users table');
        console.log('   2. Update query might not include role_id');
        console.log('   3. Role value being passed might be same as current value');
        console.log('   4. Database constraint preventing the update');
        
        console.log('\n🎉 ANALYSIS COMPLETED!');
        console.log('='.repeat(60));
        
    } catch (error) {
        console.error('❌ Analysis failed:', error.response?.data || error.message);
    }
}

analyzePermissionsDatabase();