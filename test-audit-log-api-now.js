/**
 * TEST AUDIT LOG API - COMPREHENSIVE TEST
 * Tests the audit log API to verify:
 * 1. Current audit data (user_id, ip_address issues)
 * 2. LOGIN events (missing)
 * 3. DISPATCH events (missing)
 * 4. API endpoints functionality
 */

const axios = require('axios');
const https = require('https');

const api = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    }),
    timeout: 15000
});

const API_BASE = 'https://16.171.5.50.nip.io';
const ADMIN_CREDENTIALS = {
    email: 'admin@company.com',
    password: 'admin@123'
};

console.log('🧪 TESTING AUDIT LOG API - COMPREHENSIVE TEST');
console.log('='.repeat(70));
console.log('🎯 Goal: Test audit API and verify current issues');
console.log('📊 Expected Issues: user_id=NULL, ip_address=NULL, missing LOGIN/DISPATCH events');
console.log('='.repeat(70));

async function testAuditLogAPI() {
    let token = null;
    
    try {
        // ==========================================
        // STEP 1: LOGIN (Should create LOGIN event if fixed)
        // ==========================================
        console.log('\n🔐 STEP 1: Admin Login (Testing if LOGIN event is created)');
        console.log('-'.repeat(50));
        
        const loginResponse = await api.post(`${API_BASE}/api/auth/login`, ADMIN_CREDENTIALS);
        
        if (!loginResponse.data.token) {
            console.log('❌ Login failed');
            return;
        }
        
        token = loginResponse.data.token;
        console.log('✅ Login successful');
        console.log(`👤 User: ${loginResponse.data.user?.name || 'Admin'}`);
        console.log('📝 Expected: LOGIN event should be created in audit logs');
        
        // Wait for potential audit logging
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // ==========================================
        // STEP 2: TEST AUDIT LOG API ENDPOINTS
        // ==========================================
        console.log('\n📊 STEP 2: Testing Audit Log API Endpoints');
        console.log('-'.repeat(50));
        
        const auditEndpoints = [
            '/api/audit-logs',
            '/api/permissions/audit-logs',
            '/api/audit',
            '/api/logs',
            '/api/activities'
        ];
        
        let workingEndpoint = null;
        let auditData = null;
        
        for (const endpoint of auditEndpoints) {
            try {
                console.log(`\n🔍 Testing: ${endpoint}`);
                const response = await api.get(`${API_BASE}${endpoint}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                console.log(`✅ ${endpoint} - Status: ${response.status}`);
                
                // Handle different response structures
                let logs = null;
                if (response.data.data && response.data.data.logs) {
                    logs = response.data.data.logs;
                } else if (response.data.logs) {
                    logs = response.data.logs;
                } else if (response.data.data) {
                    logs = response.data.data;
                } else if (Array.isArray(response.data)) {
                    logs = response.data;
                }
                
                if (logs && Array.isArray(logs)) {
                    console.log(`📈 Found ${logs.length} audit entries`);
                    workingEndpoint = endpoint;
                    auditData = logs;
                    break;
                } else {
                    console.log('📊 Response structure:', Object.keys(response.data));
                }
                
            } catch (error) {
                console.log(`❌ ${endpoint} - Error: ${error.response?.status || error.message}`);
            }
        }
        
        if (!workingEndpoint) {
            console.log('\n❌ No working audit log endpoint found');
            return;
        }
        
        // ==========================================
        // STEP 3: ANALYZE CURRENT AUDIT DATA
        // ==========================================
        console.log(`\n📊 STEP 3: Analyzing Audit Data from ${workingEndpoint}`);
        console.log('-'.repeat(50));
        
        console.log(`📈 Total audit entries: ${auditData.length}`);
        
        // Show recent entries
        console.log('\n📋 Recent 10 audit entries:');
        auditData.slice(0, 10).forEach((log, i) => {
            const timestamp = log.created_at || log.timestamp || 'Unknown';
            const action = log.action || 'Unknown';
            const resource = log.resource || 'Unknown';
            const userId = log.user_id || 'NULL';
            const ipAddress = log.ip_address || 'NULL';
            const resourceId = log.resource_id || 'N/A';
            
            console.log(`   ${i + 1}. [${timestamp}] ${action} ${resource} (ID: ${resourceId}) by User ${userId} from IP ${ipAddress}`);
        });
        
        // ==========================================
        // STEP 4: ANALYZE ISSUES
        // ==========================================
        console.log('\n🔍 STEP 4: Issue Analysis');
        console.log('-'.repeat(50));
        
        // Check for NULL issues
        const nullUserIds = auditData.filter(log => log.user_id === null || log.user_id === 'NULL');
        const nullIpAddresses = auditData.filter(log => log.ip_address === null || log.ip_address === 'NULL');
        
        console.log(`❌ Entries with NULL user_id: ${nullUserIds.length}/${auditData.length}`);
        console.log(`❌ Entries with NULL ip_address: ${nullIpAddresses.length}/${auditData.length}`);
        
        if (nullUserIds.length === auditData.length) {
            console.log('🚨 CRITICAL: ALL entries have NULL user_id - req.user?.userId vs req.user.id issue');
        }
        
        if (nullIpAddresses.length === auditData.length) {
            console.log('🚨 CRITICAL: ALL entries have NULL ip_address - IP capture not implemented');
        }
        
        // Check event types
        console.log('\n📊 Event Type Analysis:');
        const eventTypes = {};
        auditData.forEach(log => {
            const key = `${log.action} ${log.resource}`;
            eventTypes[key] = (eventTypes[key] || 0) + 1;
        });
        
        Object.entries(eventTypes).forEach(([event, count]) => {
            console.log(`   ${event}: ${count} entries`);
        });
        
        // Check for missing events
        const hasLoginEvents = auditData.some(log => log.action === 'LOGIN');
        const hasDispatchEvents = auditData.some(log => log.action === 'CREATE' && log.resource === 'DISPATCH');
        const hasLogoutEvents = auditData.some(log => log.action === 'LOGOUT');
        
        console.log('\n🔍 Missing Event Analysis:');
        console.log(`   LOGIN events: ${hasLoginEvents ? '✅ Found' : '❌ Missing'}`);
        console.log(`   DISPATCH events: ${hasDispatchEvents ? '✅ Found' : '❌ Missing'}`);
        console.log(`   LOGOUT events: ${hasLogoutEvents ? '✅ Found' : '❌ Missing'}`);
        
        // ==========================================
        // STEP 5: CREATE TEST USER (Should create audit entry)
        // ==========================================
        console.log('\n👤 STEP 5: Creating Test User (Should create audit entry)');
        console.log('-'.repeat(50));
        
        const testUserData = {
            name: `API Test User ${Date.now()}`,
            email: `apitest${Date.now()}@company.com`,
            password: 'test123',
            role_id: 2,
            is_active: true
        };
        
        try {
            const createUserResponse = await api.post(`${API_BASE}/api/users`, testUserData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (createUserResponse.data.success) {
                console.log('✅ Test user created successfully');
                console.log(`👤 User ID: ${createUserResponse.data.user_id}`);
                console.log('📝 Expected: CREATE USER event should appear in audit logs');
                
                // Wait for audit logging
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                // Check if new audit entry was created
                const newAuditResponse = await api.get(`${API_BASE}${workingEndpoint}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                let newLogs = newAuditResponse.data.data?.logs || newAuditResponse.data.logs || newAuditResponse.data.data || newAuditResponse.data;
                
                if (newLogs.length > auditData.length) {
                    console.log(`✅ New audit entry created! (${newLogs.length - auditData.length} new entries)`);
                    
                    // Show the new entry
                    const newEntry = newLogs[0];
                    console.log('📋 New audit entry:');
                    console.log(`   Action: ${newEntry.action}`);
                    console.log(`   Resource: ${newEntry.resource}`);
                    console.log(`   User ID: ${newEntry.user_id || 'NULL'}`);
                    console.log(`   IP Address: ${newEntry.ip_address || 'NULL'}`);
                    console.log(`   Created: ${newEntry.created_at}`);
                    
                    if (newEntry.user_id === null) {
                        console.log('🚨 ISSUE CONFIRMED: New entry also has NULL user_id');
                    }
                    if (newEntry.ip_address === null) {
                        console.log('🚨 ISSUE CONFIRMED: New entry also has NULL ip_address');
                    }
                } else {
                    console.log('❌ No new audit entry created - audit logging may not be working');
                }
            } else {
                console.log('❌ User creation failed:', createUserResponse.data.message);
            }
        } catch (error) {
            console.log('❌ User creation failed:', error.response?.data?.message || error.message);
        }
        
        // ==========================================
        // STEP 6: CREATE TEST DISPATCH (Should create audit entry if implemented)
        // ==========================================
        console.log('\n📦 STEP 6: Testing Dispatch Creation (Should create audit entry)');
        console.log('-'.repeat(50));
        
        const testDispatchData = {
            warehouse: 'GGM_WH',
            order_ref: `API_TEST_${Date.now()}`,
            customer: 'API Test Customer',
            product_name: 'API Test Product',
            qty: 1,
            variant: 'Test',
            barcode: 'APITEST123',
            awb: `AWB_API_${Date.now()}`,
            logistics: 'Test Logistics',
            parcel_type: 'Forward',
            length: 10,
            width: 8,
            height: 5,
            actual_weight: 0.5,
            payment_mode: 'COD',
            invoice_amount: 50,
            processed_by: 'API Test Admin',
            remarks: 'API test dispatch for audit logging'
        };
        
        try {
            const dispatchResponse = await api.post(`${API_BASE}/api/dispatch`, testDispatchData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (dispatchResponse.data.success) {
                console.log('✅ Test dispatch created successfully');
                console.log(`📦 Dispatch ID: ${dispatchResponse.data.dispatch_id}`);
                console.log('📝 Expected: CREATE DISPATCH event should appear in audit logs');
                
                // Wait for audit logging
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                // Check for dispatch audit entry
                const finalAuditResponse = await api.get(`${API_BASE}${workingEndpoint}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                let finalLogs = finalAuditResponse.data.data?.logs || finalAuditResponse.data.logs || finalAuditResponse.data.data || finalAuditResponse.data;
                
                const dispatchAuditEntry = finalLogs.find(log => 
                    log.action === 'CREATE' && 
                    log.resource === 'DISPATCH' && 
                    log.resource_id == dispatchResponse.data.dispatch_id
                );
                
                if (dispatchAuditEntry) {
                    console.log('✅ DISPATCH audit entry found!');
                    console.log('📋 Dispatch audit entry:');
                    console.log(`   Action: ${dispatchAuditEntry.action}`);
                    console.log(`   Resource: ${dispatchAuditEntry.resource}`);
                    console.log(`   Resource ID: ${dispatchAuditEntry.resource_id}`);
                    console.log(`   User ID: ${dispatchAuditEntry.user_id || 'NULL'}`);
                    console.log(`   IP Address: ${dispatchAuditEntry.ip_address || 'NULL'}`);
                } else {
                    console.log('❌ No DISPATCH audit entry found - dispatch event tracking not implemented');
                }
            } else {
                console.log('❌ Dispatch creation failed:', dispatchResponse.data.message);
            }
        } catch (error) {
            console.log('❌ Dispatch creation failed:', error.response?.data?.message || error.message);
            console.log('💡 This might be due to missing stock or table structure');
        }
        
        // ==========================================
        // STEP 7: SUMMARY AND RECOMMENDATIONS
        // ==========================================
        console.log('\n📋 STEP 7: Test Summary and Recommendations');
        console.log('-'.repeat(50));
        
        console.log('🔍 CURRENT STATE:');
        console.log(`   📊 Total audit entries: ${auditData.length}`);
        console.log(`   ❌ NULL user_id entries: ${nullUserIds.length}/${auditData.length}`);
        console.log(`   ❌ NULL ip_address entries: ${nullIpAddresses.length}/${auditData.length}`);
        console.log(`   ${hasLoginEvents ? '✅' : '❌'} LOGIN events: ${hasLoginEvents ? 'Present' : 'Missing'}`);
        console.log(`   ${hasDispatchEvents ? '✅' : '❌'} DISPATCH events: ${hasDispatchEvents ? 'Present' : 'Missing'}`);
        console.log(`   ${hasLogoutEvents ? '✅' : '❌'} LOGOUT events: ${hasLogoutEvents ? 'Present' : 'Missing'}`);
        
        console.log('\n🔧 REQUIRED FIXES:');
        if (nullUserIds.length > 0) {
            console.log('   1. Fix user_id NULL issue: req.user?.userId -> req.user?.id');
        }
        if (nullIpAddresses.length > 0) {
            console.log('   2. Fix ip_address NULL issue: Add IP capture in audit logging');
        }
        if (!hasLoginEvents) {
            console.log('   3. Add LOGIN event tracking in authentication');
        }
        if (!hasDispatchEvents) {
            console.log('   4. Add DISPATCH event tracking in dispatch controller');
        }
        if (!hasLogoutEvents) {
            console.log('   5. Add LOGOUT event tracking');
        }
        
        console.log('\n🚀 NEXT STEPS:');
        console.log('   1. Deploy the fixed files from Git');
        console.log('   2. Restart server');
        console.log('   3. Re-run this test to verify fixes');
        console.log('   4. Expect to see proper user_id and ip_address values');
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
        if (error.response) {
            console.log('📊 Response status:', error.response.status);
            console.log('📊 Response data:', error.response.data);
        }
    }
}

console.log('\n🚀 Starting Audit Log API Test...');
testAuditLogAPI();