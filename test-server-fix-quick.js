/**
 * QUICK SERVER FIX TEST
 * Tests if the requirePermission error is fixed and basic functionality works
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

console.log('🔧 QUICK SERVER FIX TEST');
console.log('='.repeat(40));
console.log('🎯 Goal: Verify requirePermission error is fixed');
console.log('='.repeat(40));

async function testServerFix() {
    try {
        // Step 1: Test login
        console.log('\n🔐 Step 1: Testing Login');
        const loginResponse = await api.post(`${API_BASE}/api/auth/login`, ADMIN_CREDENTIALS);
        
        if (!loginResponse.data.token) {
            console.log('❌ Login failed');
            return;
        }
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful');
        
        // Step 2: Test users endpoint (this was failing with requirePermission error)
        console.log('\n👥 Step 2: Testing Users Endpoint (was failing before)');
        try {
            const usersResponse = await api.get(`${API_BASE}/api/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            console.log('✅ Users endpoint working - requirePermission error FIXED!');
            console.log(`📊 Found ${usersResponse.data.data?.length || 0} users`);
        } catch (error) {
            if (error.response?.status === 500 && error.response?.data?.message?.includes('requirePermission')) {
                console.log('❌ requirePermission error still exists');
                console.log('💡 Need to deploy the fixed auth.js file');
            } else {
                console.log('❌ Users endpoint error:', error.response?.data?.message || error.message);
            }
        }
        
        // Step 3: Test dispatch endpoint
        console.log('\n📦 Step 3: Testing Dispatch Endpoint');
        try {
            const dispatchResponse = await api.get(`${API_BASE}/api/dispatch`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            console.log('✅ Dispatch endpoint accessible');
            console.log(`📊 Found ${dispatchResponse.data.data?.length || 0} dispatches`);
        } catch (error) {
            console.log('❌ Dispatch endpoint error:', error.response?.data?.message || error.message);
        }
        
        // Step 4: Test audit logs endpoint
        console.log('\n📋 Step 4: Testing Audit Logs');
        const auditEndpoints = ['/api/audit-logs', '/api/permissions/audit-logs'];
        
        for (const endpoint of auditEndpoints) {
            try {
                const auditResponse = await api.get(`${API_BASE}${endpoint}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                console.log(`✅ ${endpoint} working`);
                
                // Check for audit data
                let logs = auditResponse.data.data?.logs || auditResponse.data.logs || auditResponse.data.data || auditResponse.data;
                if (Array.isArray(logs) && logs.length > 0) {
                    console.log(`📊 Found ${logs.length} audit entries`);
                    
                    // Check for NULL issues
                    const nullUserIds = logs.filter(log => log.user_id === null);
                    const nullIpAddresses = logs.filter(log => log.ip_address === null);
                    
                    console.log(`🔍 Analysis:`);
                    console.log(`   - Entries with NULL user_id: ${nullUserIds.length}`);
                    console.log(`   - Entries with NULL ip_address: ${nullIpAddresses.length}`);
                    
                    if (nullUserIds.length === 0 && nullIpAddresses.length === 0) {
                        console.log('🎉 No NULL issues found!');
                    } else {
                        console.log('⚠️  Still have NULL issues');
                    }
                } else {
                    console.log('📊 No audit logs found');
                }
                break;
            } catch (error) {
                console.log(`❌ ${endpoint} error: ${error.response?.status || error.message}`);
            }
        }
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
    }
}

console.log('\n🚀 Starting Quick Fix Test...');
testServerFix();