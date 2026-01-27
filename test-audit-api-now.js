/**
 * TEST AUDIT API NOW
 * Check if audit API is working and what data it returns
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

console.log('🧪 TESTING AUDIT API NOW');
console.log('='.repeat(50));

async function testAuditAPI() {
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
        
        // Step 2: Test audit API
        console.log('\n📊 Step 2: Testing Audit API');
        const auditResponse = await api.get(`${API_BASE}/api/audit-logs`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('📊 Audit API Response Status:', auditResponse.status);
        console.log('📊 Response Data Structure:', Object.keys(auditResponse.data));
        
        // Handle different response formats
        let logs = [];
        if (auditResponse.data.data) {
            if (auditResponse.data.data.logs) {
                logs = auditResponse.data.data.logs;
            } else if (Array.isArray(auditResponse.data.data)) {
                logs = auditResponse.data.data;
            }
        } else if (Array.isArray(auditResponse.data)) {
            logs = auditResponse.data;
        }
        
        console.log(`📈 Total audit entries found: ${logs.length}`);
        
        if (logs.length > 0) {
            console.log('\n📋 LATEST 5 AUDIT ENTRIES:');
            console.log('='.repeat(50));
            
            logs.slice(0, 5).forEach((log, index) => {
                console.log(`\n${index + 1}. Entry ID: ${log.id}`);
                console.log(`   Action: ${log.action}`);
                console.log(`   Resource: ${log.resource}`);
                console.log(`   Resource ID: ${log.resource_id}`);
                console.log(`   User ID: ${log.user_id || 'NULL'}`);
                console.log(`   IP Address: ${log.ip_address || 'NULL'}`);
                console.log(`   User Agent: ${log.user_agent ? log.user_agent.substring(0, 50) + '...' : 'NULL'}`);
                console.log(`   Created: ${log.created_at}`);
                
                if (log.details) {
                    try {
                        const details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
                        console.log(`   Details: ${Object.keys(details).join(', ')}`);
                    } catch (e) {
                        console.log(`   Details: ${log.details}`);
                    }
                }
            });
            
            // Analyze the NULL issue
            console.log('\n🔍 ANALYZING NULL ISSUES:');
            console.log('='.repeat(50));
            
            const nullUserIds = logs.filter(log => log.user_id === null || log.user_id === 'NULL').length;
            const nullIPs = logs.filter(log => log.ip_address === null || log.ip_address === 'NULL').length;
            const nullUserAgents = logs.filter(log => log.user_agent === null || log.user_agent === 'NULL').length;
            
            console.log(`❌ Entries with NULL user_id: ${nullUserIds}/${logs.length} (${((nullUserIds/logs.length)*100).toFixed(1)}%)`);
            console.log(`❌ Entries with NULL ip_address: ${nullIPs}/${logs.length} (${((nullIPs/logs.length)*100).toFixed(1)}%)`);
            console.log(`❌ Entries with NULL user_agent: ${nullUserAgents}/${logs.length} (${((nullUserAgents/logs.length)*100).toFixed(1)}%)`);
            
            if (nullUserIds === logs.length && nullIPs === logs.length) {
                console.log('\n🚨 CRITICAL ISSUE: ALL entries have NULL user_id and ip_address!');
                console.log('💡 This confirms the fixes are NOT applied on the server');
            } else if (nullUserIds > 0 || nullIPs > 0) {
                console.log('\n⚠️  PARTIAL ISSUE: Some entries have NULL values');
                console.log('💡 Fixes might be partially applied or old entries remain');
            } else {
                console.log('\n🎉 SUCCESS: No NULL issues found!');
                console.log('💡 The fixes are working correctly');
            }
            
        } else {
            console.log('\n📭 No audit entries found');
            console.log('💡 Either audit system is not working or database is empty');
        }
        
        // Step 3: Check database directly using MySQL
        console.log('\n🗄️  Step 3: Database Analysis Needed');
        console.log('='.repeat(50));
        console.log('💡 To get complete picture, run this on server:');
        console.log('   sudo mysql -u inventory_user -p inventory_db');
        console.log('   SELECT COUNT(*) as total, ');
        console.log('          SUM(CASE WHEN user_id IS NULL THEN 1 ELSE 0 END) as null_user_ids,');
        console.log('          SUM(CASE WHEN ip_address IS NULL THEN 1 ELSE 0 END) as null_ips');
        console.log('   FROM audit_logs;');
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
        if (error.response) {
            console.log('📊 Response status:', error.response.status);
            console.log('📊 Response data:', error.response.data);
        }
    }
}

testAuditAPI();