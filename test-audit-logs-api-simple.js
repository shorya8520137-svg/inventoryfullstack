/**
 * SIMPLE AUDIT LOGS API TEST
 * Tests if the audit logs API endpoint is working
 */

const axios = require('axios');
const https = require('https');

// Ignore SSL certificate errors for testing
const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});

axios.defaults.httpsAgent = httpsAgent;

const API_BASE = 'https://13.60.36.159.nip.io/api';

// Test credentials
const TEST_USER = {
    email: 'admin@company.com',
    password: 'admin@123'
};

async function testAuditLogsAPI() {
    try {
        console.log('🧪 AUDIT LOGS API TEST');
        console.log('======================');
        
        // Step 1: Login to get token
        console.log('🔐 Logging in...');
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, TEST_USER);
        
        if (!loginResponse.data.success) {
            throw new Error('Login failed: ' + loginResponse.data.message);
        }
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful');
        console.log('👤 User:', loginResponse.data.user.name);
        console.log('🎭 Role:', loginResponse.data.user.role);
        
        // Step 2: Test audit logs API
        console.log('\n📊 Testing audit logs API...');
        const auditResponse = await axios.get(`${API_BASE}/audit-logs?limit=5`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📡 Response status:', auditResponse.status);
        console.log('📊 Response data:', JSON.stringify(auditResponse.data, null, 2));
        
        if (auditResponse.data.success) {
            const logs = auditResponse.data.data?.logs || auditResponse.data.data || [];
            console.log(`✅ API working! Found ${logs.length} audit logs`);
            
            if (logs.length > 0) {
                console.log('\n📝 Sample audit log:');
                const sampleLog = logs[0];
                console.log(`   ID: ${sampleLog.id}`);
                console.log(`   Action: ${sampleLog.action}`);
                console.log(`   Resource: ${sampleLog.resource}`);
                console.log(`   User: ${sampleLog.user_name || sampleLog.user_id || 'Unknown'}`);
                console.log(`   IP: ${sampleLog.ip_address || 'Unknown'}`);
                console.log(`   Time: ${sampleLog.created_at}`);
            }
        } else {
            console.log('❌ API returned error:', auditResponse.data.message);
        }
        
        // Step 3: Test with filters
        console.log('\n🔍 Testing with filters...');
        const filteredResponse = await axios.get(`${API_BASE}/audit-logs?action=LOGIN&limit=3`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (filteredResponse.data.success) {
            const filteredLogs = filteredResponse.data.data?.logs || filteredResponse.data.data || [];
            console.log(`✅ Filtered API working! Found ${filteredLogs.length} LOGIN logs`);
        }
        
        console.log('\n🎉 AUDIT LOGS API TEST COMPLETED SUCCESSFULLY');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        
        if (error.response) {
            console.error('📡 Response status:', error.response.status);
            console.error('📡 Response data:', error.response.data);
        }
        
        console.log('\n🔧 TROUBLESHOOTING:');
        console.log('1. Check if server is running');
        console.log('2. Verify API endpoint exists');
        console.log('3. Check authentication token');
        console.log('4. Verify database connection');
        console.log('5. Check audit_logs table exists');
    }
}

// Run the test
testAuditLogsAPI();