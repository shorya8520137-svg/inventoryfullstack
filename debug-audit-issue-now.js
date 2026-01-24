/**
 * DEBUG AUDIT ISSUE NOW
 * Find out why audit logging is not working
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

console.log('🔍 DEBUGGING AUDIT ISSUE');
console.log('='.repeat(50));

async function debugAuditIssue() {
    try {
        // Step 1: Login
        console.log('\n🔐 Step 1: Login');
        const loginResponse = await api.post(`${API_BASE}/api/auth/login`, ADMIN_CREDENTIALS);
        
        if (!loginResponse.data.token) {
            console.log('❌ Login failed');
            return;
        }
        
        const token = loginResponse.data.token;
        const user = loginResponse.data.user;
        console.log('✅ Login successful');
        console.log(`👤 User ID: ${user.id}`);
        console.log(`👤 User Name: ${user.name}`);
        console.log(`👤 User Role: ${user.role}`);
        
        // Step 2: Get current audit count
        console.log('\n📊 Step 2: Get Current Audit Count');
        const beforeAuditResponse = await api.get(`${API_BASE}/api/audit-logs?limit=5`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const beforeLogs = beforeAuditResponse.data.data.logs || beforeAuditResponse.data.data || [];
        const beforeCount = beforeLogs.length;
        console.log(`📈 Current audit entries (latest 5): ${beforeCount}`);
        
        if (beforeLogs.length > 0) {
            const latest = beforeLogs[0];
            console.log(`📋 Latest entry: ID ${latest.id}, Action: ${latest.action}, User ID: ${latest.user_id || 'NULL'}`);
        }
        
        // Step 3: Test user creation with detailed logging
        console.log('\n👤 Step 3: Creating Test User (with debug)');
        const testUserData = {
            name: `Debug Test User ${Date.now()}`,
            email: `debugtest${Date.now()}@company.com`,
            password: 'test123',
            role_id: 2,
            is_active: true
        };
        
        console.log('📤 Sending user creation request...');
        const createUserResponse = await api.post(`${API_BASE}/api/users`, testUserData, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📊 User creation response status:', createUserResponse.status);
        console.log('📊 User creation response:', createUserResponse.data);
        
        if (createUserResponse.data.success) {
            console.log('✅ Test user created successfully');
            const newUserId = createUserResponse.data.data?.id || 'unknown';
            console.log(`👤 New User ID: ${newUserId}`);
            
            // Wait for audit logging
            console.log('\n⏳ Waiting 5 seconds for audit logging...');
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // Step 4: Check for new audit entry
            console.log('\n📊 Step 4: Checking for New Audit Entry');
            const afterAuditResponse = await api.get(`${API_BASE}/api/audit-logs?limit=10`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const afterLogs = afterAuditResponse.data.data.logs || afterAuditResponse.data.data || [];
            console.log(`📈 New audit entries count (latest 10): ${afterLogs.length}`);
            
            // Look for the new entry
            const newEntries = afterLogs.filter(log => 
                log.action === 'CREATE' && 
                log.resource === 'USER' && 
                log.resource_id == newUserId
            );
            
            console.log(`🔍 Found ${newEntries.length} matching audit entries for new user`);
            
            if (newEntries.length > 0) {
                const newEntry = newEntries[0];
                console.log('\n📋 NEW AUDIT ENTRY ANALYSIS:');
                console.log(`   Entry ID: ${newEntry.id}`);
                console.log(`   Action: ${newEntry.action}`);
                console.log(`   Resource: ${newEntry.resource}`);
                console.log(`   Resource ID: ${newEntry.resource_id}`);
                console.log(`   User ID: ${newEntry.user_id || 'NULL'} ❌`);
                console.log(`   IP Address: ${newEntry.ip_address || 'NULL'}`);
                console.log(`   User Agent: ${newEntry.user_agent || 'NULL'}`);
                console.log(`   Created: ${newEntry.created_at}`);
                
                // Check if fixes are working
                if (newEntry.user_id !== null && newEntry.user_id !== 'NULL') {
                    console.log('🎉 SUCCESS: user_id fix is working!');
                } else {
                    console.log('❌ ISSUE: user_id is still NULL - fix not applied');
                }
                
                if (newEntry.ip_address !== null && newEntry.ip_address !== 'NULL') {
                    console.log('🎉 SUCCESS: ip_address fix is working!');
                } else {
                    console.log('❌ ISSUE: ip_address is still NULL - fix not applied');
                }
                
            } else {
                console.log('❌ No new audit entry found for the created user');
                console.log('💡 Audit logging is not working at all');
                
                // Show latest entries for comparison
                console.log('\n📋 LATEST AUDIT ENTRIES:');
                afterLogs.slice(0, 3).forEach((log, index) => {
                    console.log(`${index + 1}. ID: ${log.id}, Action: ${log.action}, Resource: ${log.resource}, User ID: ${log.user_id || 'NULL'}`);
                });
            }
            
        } else {
            console.log('❌ User creation failed:', createUserResponse.data.message);
        }
        
        // Step 5: Test direct audit log creation
        console.log('\n🧪 Step 5: Testing Direct Audit Log Creation');
        console.log('💡 This would require server-side debugging');
        
        console.log('\n🔧 DIAGNOSIS:');
        if (beforeLogs.length > 0 && beforeLogs[0].user_id === null) {
            console.log('❌ ISSUE: All existing audit entries have NULL user_id');
            console.log('💡 The req.user?.userId -> req.user?.id fix is not applied on server');
            console.log('💡 Server needs to pull latest changes and restart');
        }
        
        console.log('\n🚀 RECOMMENDED ACTIONS:');
        console.log('1. SSH to server and check if latest changes are pulled');
        console.log('2. Verify server is using the fixed code');
        console.log('3. Check server logs for any errors');
        console.log('4. Test audit logging manually on server');
        
    } catch (error) {
        console.log('❌ Debug failed:', error.message);
        if (error.response) {
            console.log('📊 Response status:', error.response.status);
            console.log('📊 Response data:', error.response.data);
        }
    }
}

debugAuditIssue();