/**
 * SIMPLE AUDIT FIX TEST
 * Test the simplest audit operation - user creation
 */

const axios = require('axios');
const https = require('https');

const api = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    }),
    timeout: 10000
});

const API_BASE = 'https://16.171.5.50.nip.io';
const ADMIN_CREDENTIALS = {
    email: 'admin@company.com',
    password: 'admin@123'
};

console.log('🧪 SIMPLE AUDIT FIX TEST');
console.log('='.repeat(40));
console.log('🎯 Goal: Test if user_id and ip_address fixes are working');
console.log('='.repeat(40));

async function testSimpleAuditFix() {
    try {
        // Step 1: Login
        console.log('\n🔐 Step 1: Login');
        const loginResponse = await api.post(`${API_BASE}/api/auth/login`, ADMIN_CREDENTIALS);
        
        if (!loginResponse.data.token) {
            console.log('❌ Login failed');
            return;
        }
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful');
        
        // Step 2: Get current audit count
        console.log('\n📊 Step 2: Get Current Audit Count');
        const beforeAuditResponse = await api.get(`${API_BASE}/api/audit-logs`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        let beforeLogs = beforeAuditResponse.data.data?.logs || beforeAuditResponse.data.logs || beforeAuditResponse.data.data || beforeAuditResponse.data;
        const beforeCount = beforeLogs.length;
        console.log(`📈 Current audit entries: ${beforeCount}`);
        
        // Step 3: Create a test user (this should trigger audit)
        console.log('\n👤 Step 3: Creating Test User');
        const testUserData = {
            name: `Fix Test User ${Date.now()}`,
            email: `fixtest${Date.now()}@company.com`,
            password: 'test123',
            role_id: 2,
            is_active: true
        };
        
        const createUserResponse = await api.post(`${API_BASE}/api/users`, testUserData, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (createUserResponse.data.success) {
            console.log('✅ Test user created successfully');
            console.log(`👤 User ID: ${createUserResponse.data.user_id}`);
            
            // Wait for audit logging
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Step 4: Check for new audit entry
            console.log('\n📊 Step 4: Checking for New Audit Entry');
            const afterAuditResponse = await api.get(`${API_BASE}/api/audit-logs`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            let afterLogs = afterAuditResponse.data.data?.logs || afterAuditResponse.data.logs || afterAuditResponse.data.data || afterAuditResponse.data;
            const afterCount = afterLogs.length;
            
            console.log(`📈 New audit entries count: ${afterCount}`);
            console.log(`📊 New entries created: ${afterCount - beforeCount}`);
            
            if (afterCount > beforeCount) {
                console.log('✅ New audit entry created!');
                
                // Find the new entry
                const newEntry = afterLogs[0]; // Should be the most recent
                console.log('\n📋 Latest Audit Entry Analysis:');
                console.log(`   Action: ${newEntry.action}`);
                console.log(`   Resource: ${newEntry.resource}`);
                console.log(`   Resource ID: ${newEntry.resource_id}`);
                console.log(`   User ID: ${newEntry.user_id || 'NULL'}`);
                console.log(`   IP Address: ${newEntry.ip_address || 'NULL'}`);
                console.log(`   User Agent: ${newEntry.user_agent || 'NULL'}`);
                console.log(`   Created: ${newEntry.created_at}`);
                
                // Analyze the fix status
                console.log('\n🔍 FIX STATUS ANALYSIS:');
                
                if (newEntry.user_id !== null && newEntry.user_id !== 'NULL') {
                    console.log('🎉 SUCCESS: user_id is populated!');
                    console.log(`   ✅ user_id = ${newEntry.user_id} (FIXED!)`);
                } else {
                    console.log('❌ ISSUE: user_id is still NULL');
                    console.log('   💡 The req.user?.userId -> req.user?.id fix is not applied');
                }
                
                if (newEntry.ip_address !== null && newEntry.ip_address !== 'NULL') {
                    console.log('🎉 SUCCESS: ip_address is populated!');
                    console.log(`   ✅ ip_address = ${newEntry.ip_address} (FIXED!)`);
                } else {
                    console.log('❌ ISSUE: ip_address is still NULL');
                    console.log('   💡 The IP capture fix is not applied');
                }
                
                if (newEntry.user_agent !== null && newEntry.user_agent !== 'NULL') {
                    console.log('🎉 SUCCESS: user_agent is populated!');
                    console.log(`   ✅ user_agent = ${newEntry.user_agent.substring(0, 50)}... (FIXED!)`);
                } else {
                    console.log('❌ ISSUE: user_agent is still NULL');
                    console.log('   💡 The user agent capture fix is not applied');
                }
                
                // Overall status
                const userIdFixed = newEntry.user_id !== null && newEntry.user_id !== 'NULL';
                const ipFixed = newEntry.ip_address !== null && newEntry.ip_address !== 'NULL';
                const userAgentFixed = newEntry.user_agent !== null && newEntry.user_agent !== 'NULL';
                
                console.log('\n📊 OVERALL FIX STATUS:');
                if (userIdFixed && ipFixed && userAgentFixed) {
                    console.log('🎉 ALL FIXES WORKING! Audit system is now properly tracking users and IPs!');
                } else if (userIdFixed || ipFixed || userAgentFixed) {
                    console.log('⚠️  PARTIAL FIXES WORKING - Some issues remain');
                } else {
                    console.log('❌ NO FIXES APPLIED - Server needs to be updated and restarted');
                }
                
            } else {
                console.log('❌ No new audit entry created');
                console.log('💡 Audit logging might not be working at all');
            }
            
        } else {
            console.log('❌ User creation failed:', createUserResponse.data.message);
        }
        
        // Step 5: Instructions
        console.log('\n🚀 NEXT STEPS:');
        if (afterCount <= beforeCount || (afterLogs[0] && (afterLogs[0].user_id === null || afterLogs[0].ip_address === null))) {
            console.log('❌ Fixes are not applied. You need to:');
            console.log('   1. SSH: ssh -i "C:\\Users\\Admin\\awsconection.pem" ubuntu@16.171.5.50');
            console.log('   2. Navigate: cd /home/ubuntu/inventoryfullstack');
            console.log('   3. Pull: git pull origin main');
            console.log('   4. Restart: pm2 restart server');
            console.log('   5. Check logs: pm2 logs server');
            console.log('   6. Re-run this test');
        } else {
            console.log('✅ Fixes are working! Your audit system now properly tracks users and IPs!');
        }
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
        if (error.response) {
            console.log('📊 Response status:', error.response.status);
            console.log('📊 Response data:', error.response.data);
        }
    }
}

testSimpleAuditFix();