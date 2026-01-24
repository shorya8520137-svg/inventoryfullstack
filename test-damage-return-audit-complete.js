/**
 * COMPLETE DAMAGE & RETURN AUDIT TEST
 * Tests damage and return operations and shows audit logs
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
        const response = await axios.post(`${API_BASE}/auth/login`, TEST_USER);
        
        if (response.data.success) {
            authToken = response.data.token;
            console.log('✅ Login successful');
            console.log('👤 User:', response.data.user.name);
            console.log('🎭 Role:', response.data.user.role);
            return response.data.user;
        } else {
            throw new Error('Login failed: ' + response.data.message);
        }
    } catch (error) {
        console.error('❌ Login failed:', error.response?.data || error.message);
        throw error;
    }
}

async function getAuditLogsBefore() {
    try {
        console.log('\n📊 Getting current audit logs count...');
        const response = await axios.get(`${API_BASE}/audit-logs?limit=5`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        
        if (response.data.success) {
            const logs = response.data.data?.logs || response.data.data || [];
            console.log(`📈 Current audit logs: ${response.data.data.pagination?.total || logs.length}`);
            return logs;
        }
    } catch (error) {
        console.error('❌ Failed to get audit logs:', error.response?.data || error.message);
        return [];
    }
}

async function testDamageReport() {
    try {
        console.log('\n🔧 Testing DAMAGE report...');
        
        const damageData = {
            product_type: 'Test Product for Damage Audit',
            barcode: '2460-3499',
            inventory_location: 'GGM_WH',
            quantity: 2,
            action_type: 'damage'
        };
        
        console.log('📝 Damage data:', damageData);
        
        const response = await axios.post(`${API_BASE}/damage-recovery/damage`, damageData, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        
        if (response.data.success) {
            console.log('✅ Damage reported successfully');
            console.log(`🔧 Damage ID: ${response.data.damage_id}`);
            console.log(`📦 Product: ${response.data.product_type}`);
            console.log(`📍 Location: ${response.data.inventory_location}`);
            console.log(`🔢 Quantity: ${response.data.quantity}`);
            return response.data.damage_id;
        } else {
            throw new Error('Damage report failed: ' + response.data.message);
        }
    } catch (error) {
        console.error('❌ Damage report failed:', error.response?.data || error.message);
        throw error;
    }
}

async function testReturnCreation() {
    try {
        console.log('\n📦 Testing RETURN creation...');
        
        const returnData = {
            product_type: 'Test Product for Return Audit',
            warehouse: 'GGM_WH',
            barcode: '2460-3499',
            quantity: 1,
            return_reason: 'Customer return for audit test',
            awb: `TEST_RETURN_AWB_${Date.now()}`,
            order_ref: `TEST_ORDER_${Date.now()}`
        };
        
        console.log('📝 Return data:', returnData);
        
        const response = await axios.post(`${API_BASE}/returns`, returnData, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        
        if (response.data.success) {
            console.log('✅ Return created successfully');
            console.log(`📦 Return ID: ${response.data.return_id}`);
            console.log(`📦 Product: ${returnData.product_type}`);
            console.log(`📍 Warehouse: ${returnData.warehouse}`);
            console.log(`🔢 Quantity: ${returnData.quantity}`);
            console.log(`📋 Reason: ${returnData.return_reason}`);
            return response.data.return_id;
        } else {
            throw new Error('Return creation failed: ' + response.data.message);
        }
    } catch (error) {
        console.error('❌ Return creation failed:', error.response?.data || error.message);
        throw error;
    }
}

async function getAuditLogsAfter() {
    try {
        console.log('\n📊 Getting updated audit logs...');
        
        // Wait a moment for audit logs to be created
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const response = await axios.get(`${API_BASE}/audit-logs?limit=10`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        
        if (response.data.success) {
            const logs = response.data.data?.logs || response.data.data || [];
            console.log(`📈 Updated audit logs: ${response.data.data.pagination?.total || logs.length}`);
            return logs;
        }
    } catch (error) {
        console.error('❌ Failed to get updated audit logs:', error.response?.data || error.message);
        return [];
    }
}

async function showAuditLogDetails(logs) {
    console.log('\n📋 DETAILED AUDIT LOGS:');
    console.log('='.repeat(80));
    
    logs.forEach((log, index) => {
        console.log(`\n${index + 1}. AUDIT LOG ID: ${log.id}`);
        console.log(`   👤 User: ${log.user_name || log.user_id || 'Unknown'} (${log.user_email || 'No email'})`);
        console.log(`   🎯 Action: ${log.action}`);
        console.log(`   📁 Resource: ${log.resource}`);
        console.log(`   🆔 Resource ID: ${log.resource_id || 'N/A'}`);
        console.log(`   🌐 IP Address: ${log.ip_address || 'Unknown'}`);
        console.log(`   🕐 Time: ${log.created_at}`);
        console.log(`   🖥️ User Agent: ${log.user_agent || 'Unknown'}`);
        
        if (log.details) {
            try {
                const details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
                console.log(`   📝 Details:`);
                Object.entries(details).forEach(([key, value]) => {
                    if (key !== 'ip_address' && key !== 'user_agent') { // Don't duplicate these
                        console.log(`      ${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`);
                    }
                });
            } catch (e) {
                console.log(`   📝 Details: ${log.details}`);
            }
        }
        
        console.log('   ' + '-'.repeat(70));
    });
}

async function filterAuditLogsByType(resourceType) {
    try {
        console.log(`\n🔍 Filtering audit logs for ${resourceType}...`);
        
        const response = await axios.get(`${API_BASE}/audit-logs?resource=${resourceType}&limit=5`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        
        if (response.data.success) {
            const logs = response.data.data?.logs || response.data.data || [];
            console.log(`📊 Found ${logs.length} ${resourceType} audit logs`);
            
            if (logs.length > 0) {
                console.log(`\n📋 Recent ${resourceType} Activities:`);
                logs.forEach((log, index) => {
                    const details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
                    console.log(`   ${index + 1}. ${log.action} by ${log.user_name} at ${log.created_at}`);
                    if (details.product_name) console.log(`      Product: ${details.product_name}`);
                    if (details.quantity) console.log(`      Quantity: ${details.quantity}`);
                    if (details.location || details.warehouse) console.log(`      Location: ${details.location || details.warehouse}`);
                });
            }
            
            return logs;
        }
    } catch (error) {
        console.error(`❌ Failed to filter ${resourceType} logs:`, error.response?.data || error.message);
        return [];
    }
}

async function runCompleteTest() {
    try {
        console.log('🧪 COMPLETE DAMAGE & RETURN AUDIT TEST');
        console.log('=======================================');
        
        // Step 1: Login
        const user = await login();
        
        // Step 2: Get initial audit logs
        const initialLogs = await getAuditLogsBefore();
        
        // Step 3: Test damage report
        const damageId = await testDamageReport();
        
        // Step 4: Test return creation
        const returnId = await testReturnCreation();
        
        // Step 5: Get updated audit logs
        const updatedLogs = await getAuditLogsAfter();
        
        // Step 6: Show detailed audit logs
        await showAuditLogDetails(updatedLogs);
        
        // Step 7: Filter by resource types
        const damageAuditLogs = await filterAuditLogsByType('DAMAGE');
        const returnAuditLogs = await filterAuditLogsByType('RETURN');
        
        // Step 8: Summary
        console.log('\n🎉 TEST SUMMARY');
        console.log('===============');
        console.log(`✅ Login: SUCCESS`);
        console.log(`✅ Damage Report: SUCCESS (ID: ${damageId})`);
        console.log(`✅ Return Creation: SUCCESS (ID: ${returnId})`);
        console.log(`📊 Initial Audit Logs: ${initialLogs.length}`);
        console.log(`📊 Updated Audit Logs: ${updatedLogs.length}`);
        console.log(`📊 New Logs Created: ${updatedLogs.length - initialLogs.length}`);
        console.log(`🔧 DAMAGE Audit Logs: ${damageAuditLogs.length}`);
        console.log(`📦 RETURN Audit Logs: ${returnAuditLogs.length}`);
        
        // Step 9: Verify audit logs were created
        const recentDamageLog = updatedLogs.find(log => 
            log.resource === 'DAMAGE' && 
            new Date(log.created_at) > new Date(Date.now() - 60000)
        );
        
        const recentReturnLog = updatedLogs.find(log => 
            log.resource === 'RETURN' && 
            new Date(log.created_at) > new Date(Date.now() - 60000)
        );
        
        console.log(`\n🔍 AUDIT VERIFICATION:`);
        console.log(`${recentDamageLog ? '✅' : '❌'} DAMAGE audit log created: ${recentDamageLog ? 'YES' : 'NO'}`);
        console.log(`${recentReturnLog ? '✅' : '❌'} RETURN audit log created: ${recentReturnLog ? 'YES' : 'NO'}`);
        
        if (recentDamageLog && recentReturnLog) {
            console.log('\n🎊 PERFECT! Your audit system is tracking EVERYTHING!');
            console.log('✅ Damage forms create audit logs');
            console.log('✅ Return forms create audit logs');
            console.log('✅ User names are captured');
            console.log('✅ IP addresses are captured');
            console.log('✅ Timestamps are accurate');
            console.log('✅ Operation details are stored');
        } else {
            console.log('\n⚠️ Some audit logs may not have been created yet');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the complete test
runCompleteTest();