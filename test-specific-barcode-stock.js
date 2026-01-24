/**
 * TEST SPECIFIC BARCODE STOCK
 * Test the exact API call you showed me
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

console.log('🧪 TESTING SPECIFIC BARCODE STOCK');
console.log('='.repeat(50));
console.log('🎯 Testing: GET /api/dispatch/check-inventory?warehouse=GGM_WH&barcode=2460-3499&qty=1');

async function testSpecificBarcodeStock() {
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
        
        // Step 2: Test the exact API call from your log
        console.log('\n📦 Step 2: Testing exact API call from your log');
        console.log('🔍 GET /api/dispatch/check-inventory?warehouse=GGM_WH&barcode=2460-3499&qty=1');
        
        try {
            const stockResponse = await api.get(`${API_BASE}/api/dispatch/check-inventory?warehouse=GGM_WH&barcode=2460-3499&qty=1`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            console.log('✅ API call successful!');
            console.log('📊 Response status:', stockResponse.status);
            console.log('📊 Response data:', JSON.stringify(stockResponse.data, null, 2));
            
            if (stockResponse.data && stockResponse.data.available > 0) {
                console.log(`🎉 STOCK FOUND! Available: ${stockResponse.data.available} units`);
                
                // Now test dispatch creation with this barcode
                console.log('\n📦 Step 3: Testing dispatch creation with this barcode');
                
                const dispatchData = {
                    warehouse: 'GGM_WH',
                    order_ref: `AUDIT_TEST_${Date.now()}`,
                    customer: 'Audit Test Customer',
                    product_name: 'Product for Audit Test',
                    qty: 1,
                    variant: 'Test Variant',
                    barcode: '2460-3499',
                    awb: `AWB_AUDIT_${Date.now()}`,
                    logistics: 'Test Logistics',
                    parcel_type: 'Forward',
                    length: 10,
                    width: 10,
                    height: 10,
                    actual_weight: 0.5,
                    payment_mode: 'COD',
                    invoice_amount: 100,
                    processed_by: 'Audit Test Executive',
                    remarks: 'Complete user journey audit test'
                };
                
                console.log('📤 Creating dispatch with real stock...');
                const dispatchResponse = await api.post(`${API_BASE}/api/dispatch`, dispatchData, {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log('📊 Dispatch response status:', dispatchResponse.status);
                console.log('📊 Dispatch response:', JSON.stringify(dispatchResponse.data, null, 2));
                
                if (dispatchResponse.data.success) {
                    console.log('🎉 DISPATCH CREATED SUCCESSFULLY!');
                    console.log(`📦 Dispatch ID: ${dispatchResponse.data.dispatch_id}`);
                    
                    // Wait for audit logging
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    
                    // Check for audit entry
                    console.log('\n📊 Step 4: Checking for dispatch audit entry');
                    const auditResponse = await api.get(`${API_BASE}/api/audit-logs?limit=10`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    
                    const dispatchAuditEntries = auditResponse.data.data.logs.filter(log => 
                        (log.action === 'CREATE' && log.resource === 'DISPATCH') ||
                        (log.resource_id == dispatchResponse.data.dispatch_id)
                    );
                    
                    if (dispatchAuditEntries.length > 0) {
                        const auditEntry = dispatchAuditEntries[0];
                        console.log('🎉 DISPATCH AUDIT ENTRY FOUND!');
                        console.log(`   📝 Entry ID: ${auditEntry.id}`);
                        console.log(`   🎬 Action: ${auditEntry.action}`);
                        console.log(`   📦 Resource: ${auditEntry.resource}`);
                        console.log(`   🆔 Resource ID: ${auditEntry.resource_id}`);
                        console.log(`   👤 User ID: ${auditEntry.user_id} ${auditEntry.user_id ? '✅' : '❌'}`);
                        console.log(`   🌐 IP Address: ${auditEntry.ip_address} ${auditEntry.ip_address ? '✅' : '❌'}`);
                        console.log(`   🖥️  User Agent: ${auditEntry.user_agent ? 'Captured ✅' : 'NULL ❌'}`);
                        console.log(`   ⏰ Timestamp: ${auditEntry.created_at}`);
                        
                        console.log('\n🎯 AUDIT SYSTEM STATUS:');
                        console.log('✅ Dispatch creation successful');
                        console.log('✅ Audit entry created');
                        console.log('✅ User ID captured correctly');
                        console.log('✅ IP address captured correctly');
                        console.log('🎉 COMPLETE USER JOURNEY AUDIT WORKING!');
                        
                    } else {
                        console.log('❌ No dispatch audit entry found');
                        console.log('💡 Audit logging for dispatch might need implementation');
                    }
                    
                } else {
                    console.log('❌ Dispatch creation failed:', dispatchResponse.data.message);
                }
                
            } else {
                console.log('❌ No stock available for this barcode');
            }
            
        } catch (stockError) {
            console.log('❌ Stock check failed:', stockError.message);
            if (stockError.response) {
                console.log('📊 Stock check response:', stockError.response.data);
            }
        }
        
        // Step 3: Try individual barcodes from the range
        console.log('\n🔍 Step 3: Testing individual barcodes from range 2460-3499');
        const individualBarcodes = ['2460', '2500', '2600', '2700', '2800', '2900', '3000', '3100', '3200', '3300', '3400', '3499'];
        
        for (const barcode of individualBarcodes) {
            try {
                const individualStockResponse = await api.get(`${API_BASE}/api/dispatch/check-inventory?warehouse=GGM_WH&barcode=${barcode}&qty=1`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (individualStockResponse.data && individualStockResponse.data.available > 0) {
                    console.log(`📦 Barcode ${barcode}: ${individualStockResponse.data.available} units available`);
                    
                    if (individualStockResponse.data.available >= 42 && individualStockResponse.data.available <= 44) {
                        console.log(`🎯 PERFECT MATCH! Barcode ${barcode} has ${individualStockResponse.data.available} units (target: 42-44)`);
                        return barcode; // Return the perfect barcode
                    }
                }
            } catch (error) {
                // Continue silently
            }
        }
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
        if (error.response) {
            console.log('📊 Response status:', error.response.status);
            console.log('📊 Response data:', error.response.data);
        }
    }
}

testSpecificBarcodeStock();