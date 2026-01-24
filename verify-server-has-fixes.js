/**
 * VERIFY SERVER HAS FIXES
 * This script checks if the server has the latest audit fixes
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

console.log('🔍 VERIFYING SERVER HAS LATEST AUDIT FIXES');
console.log('='.repeat(50));
console.log('🎯 Goal: Check if server has the req.user?.id fixes');
console.log('='.repeat(50));

async function verifyServerFixes() {
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
        
        // Step 2: Create a test role (this should trigger audit logging)
        console.log('\n🎭 Step 2: Creating Test Role (to trigger audit)');
        const testRoleData = {
            name: `verify_fix_role_${Date.now()}`,
            displayName: `Verify Fix Role ${Date.now()}`,
            description: 'Test role to verify audit fixes',
            color: '#FF0000',
            permissionIds: []
        };
        
        try {
            const createRoleResponse = await api.post(`${API_BASE}/api/permissions/roles`, testRoleData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (createRoleResponse.data.success) {
                console.log('✅ Test role created successfully');
                console.log(`🎭 Role ID: ${createRoleResponse.data.roleId}`);
                console.log('📝 This should create an audit entry with proper user_id if fixes are applied');
                
                // Wait for audit logging
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                // Step 3: Check the latest audit entry
                console.log('\n📊 Step 3: Checking Latest Audit Entry');
                const auditResponse = await api.get(`${API_BASE}/api/audit-logs`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                let logs = auditResponse.data.data?.logs || auditResponse.data.logs || auditResponse.data.data || auditResponse.data;
                
                if (logs && logs.length > 0) {
                    const latestEntry = logs[0];
                    console.log('📋 Latest audit entry:');
                    console.log(`   Action: ${latestEntry.action}`);
                    console.log(`   Resource: ${latestEntry.resource}`);
                    console.log(`   Resource ID: ${latestEntry.resource_id}`);
                    console.log(`   User ID: ${latestEntry.user_id || 'NULL'}`);
                    console.log(`   IP Address: ${latestEntry.ip_address || 'NULL'}`);
                    console.log(`   User Agent: ${latestEntry.user_agent || 'NULL'}`);
                    console.log(`   Created: ${latestEntry.created_at}`);
                    
                    // Check if this is our test role
                    if (latestEntry.resource_id == createRoleResponse.data.roleId) {
                        console.log('\n🎯 FOUND OUR TEST ROLE ENTRY!');
                        
                        if (latestEntry.user_id !== null && latestEntry.user_id !== 'NULL') {
                            console.log('🎉 SUCCESS: user_id is populated! Fix is working!');
                            console.log(`   User ID: ${latestEntry.user_id}`);
                        } else {
                            console.log('❌ ISSUE: user_id is still NULL - fix not applied or server not restarted');
                        }
                        
                        if (latestEntry.ip_address !== null && latestEntry.ip_address !== 'NULL') {
                            console.log('🎉 SUCCESS: ip_address is populated! Fix is working!');
                            console.log(`   IP Address: ${latestEntry.ip_address}`);
                        } else {
                            console.log('❌ ISSUE: ip_address is still NULL - fix not applied or server not restarted');
                        }
                        
                        if (latestEntry.user_agent !== null && latestEntry.user_agent !== 'NULL') {
                            console.log('🎉 SUCCESS: user_agent is populated! Fix is working!');
                        } else {
                            console.log('❌ ISSUE: user_agent is still NULL - fix not applied or server not restarted');
                        }
                    } else {
                        console.log('⚠️  Latest entry is not our test role - checking older entries...');
                        
                        // Look for our test role in recent entries
                        const ourEntry = logs.find(log => log.resource_id == createRoleResponse.data.roleId);
                        if (ourEntry) {
                            console.log('🎯 Found our test role entry:');
                            console.log(`   User ID: ${ourEntry.user_id || 'NULL'}`);
                            console.log(`   IP Address: ${ourEntry.ip_address || 'NULL'}`);
                        } else {
                            console.log('❌ Could not find our test role entry in audit logs');
                        }
                    }
                } else {
                    console.log('❌ No audit logs found');
                }
                
            } else {
                console.log('❌ Role creation failed:', createRoleResponse.data.message);
            }
        } catch (error) {
            console.log('❌ Role creation failed:', error.response?.data?.message || error.message);
        }
        
        // Step 4: Summary
        console.log('\n📋 VERIFICATION SUMMARY');
        console.log('-'.repeat(30));
        
        console.log('🔧 If you see NULL values above, the fixes are not applied. You need to:');
        console.log('   1. SSH into server: ssh -i "C:\\Users\\Admin\\awsconection.pem" ubuntu@16.171.5.50');
        console.log('   2. Navigate: cd /home/ubuntu/inventoryfullstack');
        console.log('   3. Pull changes: git pull origin main');
        console.log('   4. Restart server: pm2 restart server');
        console.log('   5. Check server logs: pm2 logs server');
        
        console.log('\n✅ If you see populated values above, the fixes are working!');
        
    } catch (error) {
        console.log('❌ Verification failed:', error.message);
    }
}

verifyServerFixes();