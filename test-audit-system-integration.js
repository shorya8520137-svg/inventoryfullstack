/**
 * TEST AUDIT SYSTEM INTEGRATION
 * Tests if all controllers are properly logging audit events
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

let authToken = null;

async function login() {
    try {
        console.log('🔐 Logging in...');
        const response = await axios.post(`${API_BASE}/login`, TEST_USER);
        
        if (response.data.success) {
            authToken = response.data.token;
            console.log('✅ Login successful');
            return response.data.user;
        } else {
            throw new Error('Login failed: ' + response.data.message);
        }
    } catch (error) {
        console.error('❌ Login failed:', error.response?.data || error.message);
        throw error;
    }
}

async function testAuditLogs() {
    try {
        console.log('\n📊 Testing audit logs API...');
        const response = await axios.get(`${API_BASE}/audit-logs?limit=10`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        
        if (response.data.success) {
            const logs = response.data.data?.logs || response.data.data || [];
            console.log(`✅ Found ${logs.length} audit logs`);
            
            // Show recent logs
            logs.slice(0, 5).forEach(log => {
                console.log(`📝 ${log.action} ${log.resource} by user ${log.user_name || log.user_id} at ${log.created_at}`);
                if (log.details) {
                    const details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
                    console.log(`   Details: ${Object.keys(details).join(', ')}`);
                }
            });
            
            return logs;
        } else {
            throw new Error('Failed to fetch audit logs: ' + response.data.message);
        }
    } catch (error) {
        console.error('❌ Audit logs test failed:', error.response?.data || error.message);
        throw error;
    }
}

async function testDispatchCreation() {
    try {
        console.log('\n🚚 Testing dispatch creation (should create audit log)...');
        
        const dispatchData = {
            order_ref: `TEST_${Date.now()}`,
            customer: 'Test Customer',
            customer_phone: '1234567890',
            customer_address: 'Test Address',
            warehouse: 'GGM_WH',
            logistics: 'Test Logistics',
            payment_mode: 'COD',
            invoice_amount: 100,
            items: [{
                barcode: '2460-3499',
                product_name: 'Test Product',
                qty: 1,
                selling_price: 100
            }]
        };
        
        const response = await axios.post(`${API_BASE}/dispatch`, dispatchData, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        
        if (response.data.success) {
            console.log('✅ Dispatch created successfully');
            console.log(`📦 Dispatch ID: ${response.data.dispatch_id}`);
            return response.data.dispatch_id;
        } else {
            throw new Error('Dispatch creation failed: ' + response.data.message);
        }
    } catch (error) {
        console.error('❌ Dispatch creation failed:', error.response?.data || error.message);
        throw error;
    }
}

async function testReturnCreation() {
    try {
        console.log('\n📦 Testing return creation (should create audit log)...');
        
        const returnData = {
            product_type: 'Test Product',
            warehouse: 'GGM_WH',
            barcode: '2460-3499',
            quantity: 1,
            return_reason: 'Test return',
            awb: `TEST_AWB_${Date.now()}`
        };
        
        const response = await axios.post(`${API_BASE}/returns`, returnData, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        
        if (response.data.success) {
            console.log('✅ Return created successfully');
            console.log(`📦 Return ID: ${response.data.return_id}`);
            return response.data.return_id;
        } else {
            throw new Error('Return creation failed: ' + response.data.message);
        }
    } catch (error) {
        console.error('❌ Return creation failed:', error.response?.data || error.message);
        throw error;
    }
}

async function testDamageReport() {
    try {
        console.log('\n🔧 Testing damage report (should create audit log)...');
        
        const damageData = {
            product_type: 'Test Product',
            barcode: '2460-3499',
            inventory_location: 'GGM_WH',
            quantity: 1,
            action_type: 'damage'
        };
        
        const response = await axios.post(`${API_BASE}/damage-recovery/damage`, damageData, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        
        if (response.data.success) {
            console.log('✅ Damage reported successfully');
            console.log(`🔧 Damage ID: ${response.data.damage_id}`);
            return response.data.damage_id;
        } else {
            throw new Error('Damage report failed: ' + response.data.message);
        }
    } catch (error) {
        console.error('❌ Damage report failed:', error.response?.data || error.message);
        throw error;
    }
}

async function waitAndCheckAuditLogs(actionType, resourceType) {
    console.log(`\n⏳ Waiting 2 seconds for audit log to be created...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
        const response = await axios.get(`${API_BASE}/audit-logs?action=${actionType}&resource=${resourceType}&limit=5`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        
        if (response.data.success) {
            const logs = response.data.data?.logs || response.data.data || [];
            const recentLog = logs.find(log => 
                log.action === actionType && 
                log.resource === resourceType &&
                new Date(log.created_at) > new Date(Date.now() - 60000) // Within last minute
            );
            
            if (recentLog) {
                console.log(`✅ Found recent ${actionType} ${resourceType} audit log`);
                console.log(`📝 User: ${recentLog.user_name || recentLog.user_id}`);
                console.log(`📝 IP: ${recentLog.ip_address}`);
                console.log(`📝 Time: ${recentLog.created_at}`);
                return true;
            } else {
                console.log(`❌ No recent ${actionType} ${resourceType} audit log found`);
                return false;
            }
        }
    } catch (error) {
        console.error('❌ Error checking audit logs:', error.response?.data || error.message);
        return false;
    }
}

async function runTests() {
    try {
        console.log('🧪 AUDIT SYSTEM INTEGRATION TEST');
        console.log('================================');
        
        // Step 1: Login
        const user = await login();
        
        // Step 2: Check existing audit logs
        const initialLogs = await testAuditLogs();
        
        // Step 3: Test dispatch creation and audit
        await testDispatchCreation();
        const dispatchAuditFound = await waitAndCheckAuditLogs('CREATE', 'DISPATCH');
        
        // Step 4: Test return creation and audit
        await testReturnCreation();
        const returnAuditFound = await waitAndCheckAuditLogs('CREATE', 'RETURN');
        
        // Step 5: Test damage report and audit
        await testDamageReport();
        const damageAuditFound = await waitAndCheckAuditLogs('CREATE', 'DAMAGE');
        
        // Step 6: Final audit logs check
        console.log('\n📊 Final audit logs check...');
        const finalLogs = await testAuditLogs();
        
        // Summary
        console.log('\n📋 TEST SUMMARY');
        console.log('===============');
        console.log(`✅ Login: SUCCESS`);
        console.log(`${dispatchAuditFound ? '✅' : '❌'} Dispatch audit: ${dispatchAuditFound ? 'FOUND' : 'NOT FOUND'}`);
        console.log(`${returnAuditFound ? '✅' : '❌'} Return audit: ${returnAuditFound ? 'FOUND' : 'NOT FOUND'}`);
        console.log(`${damageAuditFound ? '✅' : '❌'} Damage audit: ${damageAuditFound ? 'FOUND' : 'NOT FOUND'}`);
        console.log(`📊 Initial logs: ${initialLogs.length}`);
        console.log(`📊 Final logs: ${finalLogs.length}`);
        console.log(`📊 New logs created: ${finalLogs.length - initialLogs.length}`);
        
        const allTestsPassed = dispatchAuditFound && returnAuditFound && damageAuditFound;
        console.log(`\n${allTestsPassed ? '🎉' : '⚠️'} Overall result: ${allTestsPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
        
    } catch (error) {
        console.error('❌ Test suite failed:', error.message);
        process.exit(1);
    }
}

// Run the tests
runTests();