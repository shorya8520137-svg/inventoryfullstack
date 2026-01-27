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

        console.log(`📡 ${config.method} ${endpoint}`);
        const response = await axios(config);
        return { status: response.status, data: response.data };
    } catch (error) {
        console.error(`❌ ${options.method || 'GET'} ${endpoint} failed:`, error.response?.data || error.message);
        return { 
            status: error.response?.status || 500, 
            data: error.response?.data || { error: error.message } 
        };
    }
}

// Test functions
async function login() {
    console.log('\n🔐 Testing Login...');
    const response = await makeRequest('/api/auth/login', {
        method: 'POST',
        data: TEST_USER
    });
    
    if (response.status === 200 && response.data.token) {
        authToken = response.data.token;
        console.log('✅ Login successful');
        return true;
    } else {
        console.log('❌ Login failed:', response.data);
        return false;
    }
}

async function testDamageReporting() {
    console.log('\n🔧 Testing Damage Reporting...');
    const damageData = {
        product_type: 'Test Product',
        barcode: '2460-3499',
        inventory_location: 'GGM_WH',
        quantity: 1,
        action_type: 'damage'
    };
    
    const response = await makeRequest('/api/damage-recovery/damage', {
        method: 'POST',
        data: damageData
    });
    
    if (response.status === 201) {
        console.log('✅ Damage reported successfully');
        console.log('📝 Should create DAMAGE_CREATE audit log');
        return response.data.damage_id;
    } else {
        console.log('❌ Damage reporting failed:', response.data);
        return null;
    }
}

async function testStockRecovery() {
    console.log('\n🔄 Testing Stock Recovery...');
    const recoveryData = {
        product_type: 'Test Product',
        barcode: '2460-3499',
        inventory_location: 'GGM_WH',
        quantity: 1
    };
    
    const response = await makeRequest('/api/damage-recovery/recover', {
        method: 'POST',
        data: recoveryData
    });
    
    if (response.status === 201) {
        console.log('✅ Stock recovered successfully');
        console.log('📝 Should create RECOVERY_CREATE audit log');
        return response.data.recovery_id;
    } else {
        console.log('❌ Stock recovery failed:', response.data);
        return null;
    }
}

async function testReturnCreation() {
    console.log('\n📦 Testing Return Creation...');
    const returnData = {
        order_ref: 'TEST-ORDER-001',
        awb: 'AWB-TEST-001',
        product_type: 'Test Product',
        warehouse: 'GGM_WH',
        quantity: 1,
        barcode: '2460-3499',
        condition: 'good',
        return_reason: 'Customer return'
    };
    
    const response = await makeRequest('/api/returns', {
        method: 'POST',
        data: returnData
    });
    
    if (response.status === 201) {
        console.log('✅ Return created successfully');
        console.log('📝 Should create RETURN_CREATE audit log');
        return response.data.return_id;
    } else {
        console.log('❌ Return creation failed:', response.data);
        return null;
    }
}

async function testInventoryAdd() {
    console.log('\n📊 Testing Inventory Add...');
    const inventoryData = {
        product_name: 'Test Audit Product',
        barcode: 'TEST-AUDIT-001',
        warehouse: 'GGM_WH',
        qty: 10,
        unit_cost: 100,
        source_type: 'OPENING'
    };
    
    const response = await makeRequest('/api/inventory/add-stock', {
        method: 'POST',
        data: inventoryData
    });
    
    if (response.status === 201) {
        console.log('✅ Inventory added successfully');
        console.log('📝 Should create INVENTORY_ADD audit log');
        return true;
    } else {
        console.log('❌ Inventory add failed:', response.data);
        return false;
    }
}

async function testProductCreation() {
    console.log('\n🏷️ Testing Product Creation...');
    const productData = {
        product_name: 'Test Audit Product',
        barcode: 'AUDIT-PRODUCT-001',
        description: 'Product created for audit testing',
        price: 150.00,
        cost_price: 100.00
    };
    
    const response = await makeRequest('/api/products', {
        method: 'POST',
        data: productData
    });
    
    if (response.status === 200) {
        console.log('✅ Product created successfully');
        console.log('📝 Should create PRODUCT_CREATE audit log');
        return true;
    } else {
        console.log('❌ Product creation failed:', response.data);
        return false;
    }
}

async function testProductUpdate() {
    console.log('\n✏️ Testing Product Update...');
    
    // First, find a product to update
    const getResponse = await makeRequest('/api/products?limit=1');
    if (getResponse.status !== 200 || !getResponse.data.data.products.length) {
        console.log('❌ No products found to update');
        return false;
    }
    
    const product = getResponse.data.data.products[0];
    const updateData = {
        product_name: product.product_name + ' (Updated)',
        barcode: product.barcode,
        description: 'Updated for audit testing',
        price: 200.00
    };
    
    const response = await makeRequest(`/api/products/${product.p_id}`, {
        method: 'PUT',
        data: updateData
    });
    
    if (response.status === 200) {
        console.log('✅ Product updated successfully');
        console.log('📝 Should create PRODUCT_UPDATE audit log');
        return product.p_id;
    } else {
        console.log('❌ Product update failed:', response.data);
        return false;
    }
}

async function testOrderDeletion() {
    console.log('\n🗑️ Testing Order Deletion...');
    
    // First, get available orders
    const getResponse = await makeRequest('/api/order-tracking?limit=1');
    if (getResponse.status !== 200 || !getResponse.data.data.length) {
        console.log('❌ No orders found to delete');
        return false;
    }
    
    const order = getResponse.data.data[0];
    const response = await makeRequest(`/api/order-tracking/${order.id}`, {
        method: 'DELETE'
    });
    
    if (response.status === 200) {
        console.log('✅ Order deleted successfully');
        console.log('📝 Should create ORDER_DELETE audit log');
        return order.id;
    } else {
        console.log('❌ Order deletion failed:', response.data);
        return false;
    }
}

async function testLogout() {
    console.log('\n🚪 Testing Logout...');
    const response = await makeRequest('/api/auth/logout', {
        method: 'POST'
    });
    
    if (response.status === 200) {
        console.log('✅ Logout successful');
        console.log('📝 Should create LOGOUT audit log');
        return true;
    } else {
        console.log('❌ Logout failed:', response.data);
        return false;
    }
}

async function checkAuditLogs() {
    console.log('\n📋 Checking Audit Logs...');
    const response = await makeRequest('/api/audit-logs?limit=20');
    
    if (response.status === 200) {
        const logs = response.data.data.logs;
        console.log(`✅ Found ${logs.length} audit logs`);
        
        // Show recent logs
        console.log('\n📝 Recent Audit Logs:');
        logs.slice(0, 10).forEach(log => {
            console.log(`   ${log.action} ${log.resource} by ${log.user_name || 'Unknown'} at ${log.created_at}`);
        });
        
        return logs;
    } else {
        console.log('❌ Failed to fetch audit logs:', response.data);
        return [];
    }
}

// Main test function
async function runCompleteAuditTest() {
    console.log('🚀 Starting Complete Audit Tracking Test');
    console.log('=' .repeat(60));
    
    try {
        // Step 1: Login (should create LOGIN audit log)
        const loginSuccess = await login();
        if (!loginSuccess) {
            console.log('❌ Test failed at login step');
            return;
        }
        
        // Step 2: Test all operations that should create audit logs
        await testDamageReporting();
        await testStockRecovery();
        await testReturnCreation();
        await testInventoryAdd();
        await testProductCreation();
        await testProductUpdate();
        await testOrderDeletion();
        
        // Step 3: Check audit logs
        await checkAuditLogs();
        
        // Step 4: Logout (should create LOGOUT audit log)
        await testLogout();
        
        console.log('\n🎉 Complete Audit Tracking Test Finished');
        console.log('=' .repeat(60));
        console.log('✅ All operations tested for audit logging');
        console.log('📝 Check the audit logs page to verify all events were recorded');
        
    } catch (error) {
        console.error('❌ Test failed with error:', error);
    }
}

// Run the test
runCompleteAuditTest();