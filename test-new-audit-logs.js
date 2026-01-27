const axios = require('axios');

// Bypass SSL certificate verification for testing
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

// Test configuration
const API_BASE = 'https://13.60.36.159.nip.io';
const TEST_USER = {
    email: 'admin@company.com',
    password: 'admin@123'
};

let authToken = '';

// Helper function to make API requests
async function makeRequest(endpoint, options = {}) {
    try {
        const config = {
            method: options.method || 'GET',
            url: `${API_BASE}${endpoint}`,
            headers: {
                'Content-Type': 'application/json',
                ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
                ...options.headers
            },
            ...(options.data && { data: options.data }),
            timeout: 10000
        };

        const response = await axios(config);
        return { status: response.status, data: response.data };
    } catch (error) {
        return { 
            status: error.response?.status || 500, 
            data: error.response?.data || { error: error.message } 
        };
    }
}

async function login() {
    console.log('🔐 Logging in...');
    const response = await makeRequest('/api/auth/login', {
        method: 'POST',
        data: TEST_USER
    });
    
    if (response.status === 200 && response.data.token) {
        authToken = response.data.token;
        console.log('✅ Login successful');
        return true;
    }
    return false;
}

async function checkSpecificAuditLogs() {
    console.log('\n📋 Checking for NEW Audit Log Types...');
    const response = await makeRequest('/api/audit-logs?limit=50');
    
    if (response.status === 200) {
        const logs = response.data.data.logs;
        console.log(`✅ Found ${logs.length} total audit logs`);
        
        // Check for specific audit log types we implemented
        const auditTypes = {
            'RETURN_CREATE': logs.filter(log => log.action === 'RETURN_CREATE'),
            'INVENTORY_ADD': logs.filter(log => log.action === 'INVENTORY_ADD'),
            'PRODUCT_CREATE': logs.filter(log => log.action === 'PRODUCT_CREATE'),
            'PRODUCT_UPDATE': logs.filter(log => log.action === 'PRODUCT_UPDATE'),
            'PRODUCT_DELETE': logs.filter(log => log.action === 'PRODUCT_DELETE'),
            'ORDER_DELETE': logs.filter(log => log.action === 'ORDER_DELETE'),
            'DAMAGE_CREATE': logs.filter(log => log.action === 'DAMAGE_CREATE'),
            'RECOVERY_CREATE': logs.filter(log => log.action === 'RECOVERY_CREATE'),
            'LOGIN': logs.filter(log => log.action === 'LOGIN'),
            'LOGOUT': logs.filter(log => log.action === 'LOGOUT')
        };
        
        console.log('\n📊 Audit Log Summary by Type:');
        console.log('=' .repeat(50));
        
        Object.entries(auditTypes).forEach(([type, entries]) => {
            const status = entries.length > 0 ? '✅' : '❌';
            console.log(`${status} ${type}: ${entries.length} entries`);
            
            if (entries.length > 0) {
                const latest = entries[0];
                console.log(`   Latest: ${latest.created_at} by ${latest.user_name || 'Unknown'}`);
                
                // Show details for the new audit types we implemented
                if (['RETURN_CREATE', 'INVENTORY_ADD', 'PRODUCT_CREATE', 'PRODUCT_UPDATE', 'ORDER_DELETE'].includes(type)) {
                    try {
                        const details = JSON.parse(latest.details);
                        console.log(`   Details: ${JSON.stringify(details).substring(0, 100)}...`);
                    } catch (e) {
                        console.log(`   Details: ${latest.details}`);
                    }
                }
            }
        });
        
        console.log('\n🎯 NEW AUDIT LOGGING STATUS:');
        console.log('=' .repeat(50));
        
        const newAuditTypes = ['RETURN_CREATE', 'INVENTORY_ADD', 'PRODUCT_CREATE', 'PRODUCT_UPDATE', 'ORDER_DELETE'];
        const implementedCount = newAuditTypes.filter(type => auditTypes[type].length > 0).length;
        
        console.log(`✅ Implemented: ${implementedCount}/${newAuditTypes.length} new audit types`);
        
        if (implementedCount === newAuditTypes.length) {
            console.log('🎉 ALL NEW AUDIT LOGGING IS WORKING!');
        } else {
            console.log('⚠️ Some audit types may need more testing');
        }
        
        return auditTypes;
    } else {
        console.log('❌ Failed to fetch audit logs');
        return {};
    }
}

async function testReturnAudit() {
    console.log('\n📦 Testing Return Audit Logging...');
    const returnData = {
        order_ref: 'AUDIT-TEST-' + Date.now(),
        awb: 'AWB-AUDIT-' + Date.now(),
        product_type: 'Audit Test Product',
        warehouse: 'GGM_WH',
        quantity: 1,
        barcode: '2460-3499',
        condition: 'good'
    };
    
    const response = await makeRequest('/api/returns', {
        method: 'POST',
        data: returnData
    });
    
    if (response.status === 201) {
        console.log('✅ Return created - should generate RETURN_CREATE audit log');
        return true;
    } else {
        console.log('❌ Return creation failed');
        return false;
    }
}

async function testInventoryAudit() {
    console.log('\n📊 Testing Inventory Audit Logging...');
    const inventoryData = {
        product_name: 'Audit Test Inventory',
        barcode: 'AUDIT-INV-' + Date.now(),
        warehouse: 'GGM_WH',
        qty: 5,
        unit_cost: 50,
        source_type: 'OPENING'
    };
    
    const response = await makeRequest('/api/inventory/add-stock', {
        method: 'POST',
        data: inventoryData
    });
    
    if (response.status === 201) {
        console.log('✅ Inventory added - should generate INVENTORY_ADD audit log');
        return true;
    } else {
        console.log('❌ Inventory add failed');
        return false;
    }
}

async function testProductAudit() {
    console.log('\n🏷️ Testing Product Audit Logging...');
    const productData = {
        product_name: 'Audit Test Product',
        barcode: 'AUDIT-PROD-' + Date.now(),
        description: 'Created for audit testing',
        price: 100.00
    };
    
    const response = await makeRequest('/api/products', {
        method: 'POST',
        data: productData
    });
    
    if (response.status === 200) {
        console.log('✅ Product created - should generate PRODUCT_CREATE audit log');
        return true;
    } else {
        console.log('❌ Product creation failed:', response.data.message);
        return false;
    }
}

// Main test function
async function runNewAuditTest() {
    console.log('🚀 Testing NEW Audit Logging Implementation');
    console.log('=' .repeat(60));
    
    try {
        // Login
        const loginSuccess = await login();
        if (!loginSuccess) {
            console.log('❌ Login failed');
            return;
        }
        
        // Check current audit logs
        console.log('\n📋 BEFORE: Current audit logs');
        await checkSpecificAuditLogs();
        
        // Perform operations that should create audit logs
        await testReturnAudit();
        await testInventoryAudit();
        await testProductAudit();
        
        // Wait a moment for audit logs to be written
        console.log('\n⏳ Waiting for audit logs to be written...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check audit logs again
        console.log('\n📋 AFTER: Updated audit logs');
        await checkSpecificAuditLogs();
        
        console.log('\n🎉 NEW Audit Logging Test Complete!');
        console.log('=' .repeat(60));
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
runNewAuditTest();