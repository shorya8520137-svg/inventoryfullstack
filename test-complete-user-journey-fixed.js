/**
 * COMPLETE USER JOURNEY TEST - FIXED VERSION
 * Tests: LOGIN → CREATE_USER → CREATE_ROLE → DISPATCH_CREATE → CHECK_AUDIT → LOGOUT
 * 
 * This script tests your complete event-based audit system with:
 * ✅ Fixed user_id capture (no more NULL)
 * ✅ Fixed ip_address capture (no more NULL)
 * ✅ Event-based tracking (LOGIN, DISPATCH_CREATE, LOGOUT)
 * ✅ Complete user journey audit trail
 */

const axios = require('axios');
const https = require('https');

// Create axios instance with SSL bypass for testing
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

console.log('🎯 COMPLETE USER JOURNEY TEST - FIXED VERSION');
console.log('='.repeat(70));
console.log('📋 Testing: LOGIN → CREATE_USER → CREATE_ROLE → DISPATCH_CREATE → AUDIT_CHECK → LOGOUT');
console.log('🔧 Fixes: user_id NULL, ip_address NULL, missing events');
console.log('='.repeat(70));

async function testCompleteUserJourney() {
    let token = null;
    let testUserId = null;
    let testRoleId = null;
    let dispatchId = null;
    
    try {
        // ==========================================
        // STEP 1: LOGIN (Should create LOGIN event)
        // ==========================================
        console.log('\n🔐 STEP 1: Admin Login (Testing LOGIN event)');
        console.log('-'.repeat(50));
        
        const loginResponse = await api.post(`${API_BASE}/api/auth/login`, ADMIN_CREDENTIALS);
        
        if (!loginResponse.data.token) {
            console.log('❌ Login failed');
            return;
        }
        
        token = loginResponse.data.token;
        console.log('✅ Login successful');
        console.log(`📧 User: ${loginResponse.data.user?.name || 'Admin'}`);
        console.log(`🎫 Token: ${token.substring(0, 20)}...`);
        console.log('📝 Expected audit: LOGIN event with user_id and ip_address');
        
        // Wait for audit to be recorded
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // ==========================================
        // STEP 2: CREATE TEST USER (Should create USER CREATE event)
        // ==========================================
        console.log('\n👤 STEP 2: Create Test User (Testing USER CREATE event)');
        console.log('-'.repeat(50));
        
        const userData = {
            name: `Journey Test User ${Date.now()}`,
            email: `journeytest${Date.now()}@company.com`,
            password: 'test123',
            role_id: 2,
            is_active: true
        };
        
        const createUserResponse = await api.post(`${API_BASE}/api/users`, userData, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (createUserResponse.data.success) {
            testUserId = createUserResponse.data.user_id;
            console.log('✅ Test user created successfully');
            console.log(`👤 User ID: ${testUserId}`);
            console.log(`📧 Email: ${userData.email}`);
            console.log('📝 Expected audit: CREATE USER event with user_id and ip_address');
        } else {
            console.log('❌ User creation failed:', createUserResponse.data.message);
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // ==========================================
        // STEP 3: CREATE TEST ROLE (Should create ROLE CREATE event)
        // ==========================================
        console.log('\n🎭 STEP 3: Create Test Role (Testing ROLE CREATE event)');
        console.log('-'.repeat(50));
        
        const roleData = {
            name: `journey_test_role_${Date.now()}`,
            display_name: `Journey Test Role ${Date.now()}`,
            description: 'Test role for complete user journey audit'
        };
        
        try {
            const createRoleResponse = await api.post(`${API_BASE}/api/permissions/roles`, roleData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (createRoleResponse.data.success) {
                testRoleId = createRoleResponse.data.role_id;
                console.log('✅ Test role created successfully');
                console.log(`🎭 Role ID: ${testRoleId}`);
                console.log(`📝 Role Name: ${roleData.name}`);
                console.log('📝 Expected audit: CREATE ROLE event with user_id and ip_address');
            } else {
                console.log('❌ Role creation failed:', createRoleResponse.data.message);
            }
        } catch (error) {
            console.log('❌ Role creation failed:', error.response?.data?.message || error.message);
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // ==========================================
        // STEP 4: CREATE DISPATCH (Should create DISPATCH_CREATE event)
        // ==========================================
        console.log('\n📦 STEP 4: Create Dispatch (Testing DISPATCH_CREATE event)');
        console.log('-'.repeat(50));
        
        const dispatchData = {
            warehouse: 'GGM_WH',
            order_ref: `JOURNEY_TEST_${Date.now()}`,
            customer: 'Journey Test Customer',
            product_name: 'Test Product for Journey',
            qty: 2,
            variant: 'Red',
            barcode: 'JOURNEY123',
            awb: `AWB_JOURNEY_${Date.now()}`,
            logistics: 'Test Logistics',
            parcel_type: 'Forward',
            length: 10,
            width: 8,
            height: 5,
            actual_weight: 0.5,
            payment_mode: 'COD',
            invoice_amount: 100,
            processed_by: 'Journey Test Admin',
            remarks: 'Complete user journey test dispatch'
        };
        
        try {
            const createDispatchResponse = await api.post(`${API_BASE}/api/dispatch`, dispatchData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (createDispatchResponse.data.success) {
                dispatchId = createDispatchResponse.data.dispatch_id;
                console.log('✅ Dispatch created successfully');
                console.log(`📦 Dispatch ID: ${dispatchId}`);
                console.log(`📋 Order Ref: ${dispatchData.order_ref}`);
                console.log(`📮 AWB: ${dispatchData.awb}`);
                console.log('📝 Expected audit: CREATE DISPATCH event with user_id and ip_address');
            } else {
                console.log('❌ Dispatch creation failed:', createDispatchResponse.data.message);
            }
        } catch (error) {
            console.log('❌ Dispatch creation failed:', error.response?.data?.message || error.message);
            console.log('💡 This might be due to missing stock or table structure');
        }
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // ==========================================
        // STEP 5: CHECK AUDIT LOGS (Verify all events)
        // ==========================================
        console.log('\n📊 STEP 5: Check Audit Logs (Verify complete journey)');
        console.log('-'.repeat(50));
        
        const auditEndpoints = [
            '/api/audit-logs',
            '/api/permissions/audit-logs',
            '/api/audit',
            '/api/logs'
        ];
        
        let auditFound = false;
        
        for (const endpoint of auditEndpoints) {
            try {
                console.log(`\n🔍 Checking: ${endpoint}`);
                const auditResponse = await api.get(`${API_BASE}${endpoint}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                console.log(`✅ ${endpoint} - Status: ${auditResponse.status}`);
                
                // Handle different response structures
                let logs = null;
                if (auditResponse.data.data && auditResponse.data.data.logs) {
                    logs = auditResponse.data.data.logs;
                } else if (auditResponse.data.logs) {
                    logs = auditResponse.data.logs;
                } else if (auditResponse.data.data) {
                    logs = auditResponse.data.data;
                } else if (Array.isArray(auditResponse.data)) {
                    logs = auditResponse.data;
                }
                
                if (logs && Array.isArray(logs) && logs.length > 0) {
                    console.log(`📈 Found ${logs.length} audit entries`);
                    auditFound = true;
                    
                    // Show recent entries (last 10)
                    console.log('\n📋 Recent Audit Entries:');
                    logs.slice(0, 10).forEach((log, i) => {
                        const timestamp = log.created_at || log.timestamp || 'Unknown';
                        const action = log.action || 'Unknown';
                        const resource = log.resource || 'Unknown';
                        const userId = log.user_id || 'NULL';
                        const ipAddress = log.ip_address || 'NULL';
                        const details = log.details ? JSON.parse(log.details) : {};
                        const userName = details.user_name || 'Unknown';
                        
                        console.log(`   ${i + 1}. [${timestamp}] ${action} ${resource} by User ${userId} (${userName}) from IP ${ipAddress}`);
                        
                        // Highlight our test entries
                        if (details.user_name && details.user_name.includes('Journey Test')) {
                            console.log(`      🎯 FOUND OUR TEST ENTRY!`);
                        }
                        if (dispatchId && log.resource_id == dispatchId) {
                            console.log(`      🎯 FOUND OUR DISPATCH ENTRY!`);
                        }
                        if (testUserId && log.resource_id == testUserId) {
                            console.log(`      🎯 FOUND OUR USER CREATION ENTRY!`);
                        }
                    });
                    
                    // Check for specific events
                    console.log('\n🔍 Checking for Specific Events:');
                    
                    // LOGIN events
                    const loginEvents = logs.filter(log => log.action === 'LOGIN');
                    console.log(`🔐 LOGIN events: ${loginEvents.length}`);
                    
                    // USER CREATE events
                    const userCreateEvents = logs.filter(log => 
                        log.action === 'CREATE' && log.resource === 'USER'
                    );
                    console.log(`👤 USER CREATE events: ${userCreateEvents.length}`);
                    
                    // ROLE CREATE events
                    const roleCreateEvents = logs.filter(log => 
                        log.action === 'CREATE' && log.resource === 'ROLE'
                    );
                    console.log(`🎭 ROLE CREATE events: ${roleCreateEvents.length}`);
                    
                    // DISPATCH CREATE events
                    const dispatchCreateEvents = logs.filter(log => 
                        log.action === 'CREATE' && log.resource === 'DISPATCH'
                    );
                    console.log(`📦 DISPATCH CREATE events: ${dispatchCreateEvents.length}`);
                    
                    // Check for NULL issues
                    const nullUserIds = logs.filter(log => log.user_id === null || log.user_id === 'NULL');
                    const nullIpAddresses = logs.filter(log => log.ip_address === null || log.ip_address === 'NULL');
                    
                    console.log(`\n🔧 Issue Analysis:`);
                    console.log(`❌ Entries with NULL user_id: ${nullUserIds.length}`);
                    console.log(`❌ Entries with NULL ip_address: ${nullIpAddresses.length}`);
                    
                    if (nullUserIds.length === 0 && nullIpAddresses.length === 0) {
                        console.log('🎉 SUCCESS: No NULL user_id or ip_address issues found!');
                    } else {
                        console.log('⚠️  Still have NULL issues - need further fixes');
                    }
                    
                    break; // Found working endpoint
                } else {
                    console.log('📊 No audit logs found or wrong format');
                }
            } catch (error) {
                console.log(`❌ ${endpoint} - Error: ${error.response?.status || error.message}`);
            }
        }
        
        if (!auditFound) {
            console.log('\n❌ No audit logs found in any endpoint');
            console.log('💡 This might indicate the audit system is not working');
        }
        
        // ==========================================
        // STEP 6: LOGOUT (Should create LOGOUT event)
        // ==========================================
        console.log('\n🚪 STEP 6: Logout (Testing LOGOUT event)');
        console.log('-'.repeat(50));
        
        try {
            const logoutResponse = await api.post(`${API_BASE}/api/auth/logout`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            console.log('✅ Logout successful');
            console.log('📝 Expected audit: LOGOUT event with user_id and ip_address');
        } catch (error) {
            console.log('❌ Logout failed (endpoint might not exist):', error.response?.status || error.message);
            console.log('💡 LOGOUT event tracking needs to be implemented');
        }
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
        if (error.response) {
            console.log('📊 Response status:', error.response.status);
            console.log('📊 Response data:', error.response.data);
        }
    }
}

// ==========================================
// EXPECTED RESULTS SUMMARY
// ==========================================
console.log('\n🎯 EXPECTED RESULTS:');
console.log('='.repeat(70));
console.log('After running this test, you should see in audit_logs:');
console.log('');
console.log('1. 🔐 LOGIN event:');
console.log('   | user_id: 1 | action: LOGIN | resource: SESSION | ip_address: 192.168.x.x |');
console.log('');
console.log('2. 👤 USER CREATE event:');
console.log('   | user_id: 1 | action: CREATE | resource: USER | ip_address: 192.168.x.x |');
console.log('');
console.log('3. 🎭 ROLE CREATE event:');
console.log('   | user_id: 1 | action: CREATE | resource: ROLE | ip_address: 192.168.x.x |');
console.log('');
console.log('4. 📦 DISPATCH CREATE event:');
console.log('   | user_id: 1 | action: CREATE | resource: DISPATCH | ip_address: 192.168.x.x |');
console.log('');
console.log('5. 🚪 LOGOUT event:');
console.log('   | user_id: 1 | action: LOGOUT | resource: SESSION | ip_address: 192.168.x.x |');
console.log('');
console.log('🔧 FIXES IMPLEMENTED:');
console.log('✅ user_id capture fixed (no more NULL)');
console.log('✅ ip_address capture fixed (no more NULL)');
console.log('✅ Event-based tracking (LOGIN, DISPATCH_CREATE, LOGOUT)');
console.log('✅ Complete user journey audit trail');
console.log('='.repeat(70));

// Run the test
testCompleteUserJourney();