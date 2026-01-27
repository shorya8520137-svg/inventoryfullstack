const axios = require('axios');
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

async function testExistingAuditSystem() {
    try {
        console.log('🔐 Logging in...');
        const loginResponse = await axios.post('https://13.60.36.159.nip.io/api/auth/login', {
            email: 'admin@company.com',
            password: 'admin@123'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful');
        console.log('👤 User info:', loginResponse.data.user);
        
        console.log('\n📦 Testing return creation with your existing audit system...');
        
        // Create a return to test audit logging
        const returnData = {
            order_ref: 'EXISTING-AUDIT-TEST-' + Date.now(),
            awb: 'AWB-EXISTING-' + Date.now(),
            product_type: 'Existing Audit Test Product',
            warehouse: 'GGM_WH',
            quantity: 1,
            barcode: '2460-3499',
            condition: 'good',
            return_reason: 'Testing existing audit system'
        };
        
        console.log('📡 Making return request...');
        const returnResponse = await axios.post('https://13.60.36.159.nip.io/api/returns', returnData, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'User-Agent': 'Existing-Audit-Test-Client/1.0'
            }
        });
        
        console.log('✅ Return response:', returnResponse.status, returnResponse.data);
        
        console.log('\n🏷️ Testing product creation...');
        const productData = {
            product_name: 'Existing Audit Test Product',
            barcode: 'EXISTING-AUDIT-' + Date.now(),
            description: 'Created to test existing audit system',
            price: 100.00
        };
        
        const productResponse = await axios.post('https://13.60.36.159.nip.io/api/products', productData, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'User-Agent': 'Existing-Audit-Test-Client/1.0'
            }
        });
        
        console.log('✅ Product response:', productResponse.status, productResponse.data);
        
        console.log('\n📊 Testing inventory add...');
        const inventoryData = {
            product_name: 'Existing Audit Test Inventory',
            barcode: 'EXISTING-INV-' + Date.now(),
            warehouse: 'GGM_WH',
            qty: 5,
            unit_cost: 50,
            source_type: 'OPENING'
        };
        
        const inventoryResponse = await axios.post('https://13.60.36.159.nip.io/api/inventory/add-stock', inventoryData, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'User-Agent': 'Existing-Audit-Test-Client/1.0'
            }
        });
        
        console.log('✅ Inventory response:', inventoryResponse.status, inventoryResponse.data);
        
        // Wait for audit logs to be written
        console.log('\n⏳ Waiting 5 seconds for audit logs...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        console.log('\n📋 Checking audit logs...');
        const auditResponse = await axios.get('https://13.60.36.159.nip.io/api/audit-logs?limit=10', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(`✅ Found ${auditResponse.data.data.logs.length} audit logs`);
        
        console.log('\n📊 Latest Audit Logs:');
        auditResponse.data.data.logs.forEach((log, i) => {
            console.log(`${i+1}. ACTION: "${log.action}" RESOURCE: "${log.resource}" USER: "${log.user_name || 'Unknown'}" TIME: ${log.created_at}`);
            
            // Check if this is one of our test logs
            if (log.details) {
                try {
                    const details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
                    if (details.user_name && (
                        details.product_name?.includes('Existing Audit Test') ||
                        details.order_ref?.includes('EXISTING-AUDIT-TEST')
                    )) {
                        console.log(`   🎯 THIS IS OUR TEST LOG!`);
                        console.log(`   Details: ${JSON.stringify(details).substring(0, 200)}...`);
                    }
                } catch (e) {
                    // Ignore parsing errors
                }
            }
        });
        
        // Look for specific audit types
        const returnLogs = auditResponse.data.data.logs.filter(log => 
            log.resource === 'RETURN' || 
            (log.details && log.details.includes('EXISTING-AUDIT-TEST'))
        );
        
        const productLogs = auditResponse.data.data.logs.filter(log => 
            log.resource === 'PRODUCT' || 
            (log.details && log.details.includes('Existing Audit Test Product'))
        );
        
        const inventoryLogs = auditResponse.data.data.logs.filter(log => 
            log.resource === 'INVENTORY' || 
            (log.details && log.details.includes('Existing Audit Test Inventory'))
        );
        
        console.log('\n🎯 AUDIT RESULTS:');
        console.log(`📦 Return logs found: ${returnLogs.length}`);
        console.log(`🏷️ Product logs found: ${productLogs.length}`);
        console.log(`📊 Inventory logs found: ${inventoryLogs.length}`);
        
        if (returnLogs.length > 0 || productLogs.length > 0 || inventoryLogs.length > 0) {
            console.log('\n🎉 SUCCESS! Your existing audit system is now tracking the requested operations!');
        } else {
            console.log('\n⚠️ No specific audit logs found yet - they may take a moment to appear');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testExistingAuditSystem();