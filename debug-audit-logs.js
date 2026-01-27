const axios = require('axios');
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

async function debugAuditLogs() {
    try {
        console.log('🔐 Logging in...');
        const loginResponse = await axios.post('https://13.60.36.159.nip.io/api/auth/login', {
            email: 'admin@company.com',
            password: 'admin@123'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful');
        
        console.log('\n📦 Creating a return to test audit logging...');
        const returnResponse = await axios.post('https://13.60.36.159.nip.io/api/returns', {
            order_ref: 'DEBUG-TEST-' + Date.now(),
            awb: 'AWB-DEBUG-' + Date.now(),
            product_type: 'Debug Test Product',
            warehouse: 'GGM_WH',
            quantity: 1,
            barcode: '2460-3499',
            condition: 'good'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (returnResponse.status === 201) {
            console.log('✅ Return created successfully');
        } else {
            console.log('❌ Return creation failed');
        }
        
        console.log('\n⏳ Waiting 3 seconds for audit log to be written...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('\n📋 Fetching ALL recent audit logs...');
        const auditResponse = await axios.get('https://13.60.36.159.nip.io/api/audit-logs?limit=20', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(`✅ Found ${auditResponse.data.data.logs.length} audit logs`);
        
        console.log('\n📊 All Recent Audit Logs:');
        auditResponse.data.data.logs.forEach((log, i) => {
            console.log(`${i+1}. ACTION: "${log.action}" RESOURCE: "${log.resource}" USER: "${log.user_name || 'Unknown'}" TIME: ${log.created_at}`);
            
            // Try to parse details safely
            let details = 'No details';
            if (log.details) {
                try {
                    if (typeof log.details === 'string') {
                        const parsed = JSON.parse(log.details);
                        details = JSON.stringify(parsed).substring(0, 150);
                    } else {
                        details = JSON.stringify(log.details).substring(0, 150);
                    }
                } catch (e) {
                    details = log.details.toString().substring(0, 150);
                }
            }
            console.log(`   Details: ${details}...`);
            console.log(`   IP: ${log.ip_address || 'N/A'}, User Agent: ${log.user_agent || 'N/A'}`);
            console.log('');
        });
        
        // Look for specific patterns
        const returnLogs = auditResponse.data.data.logs.filter(log => 
            log.action.includes('RETURN') || 
            log.resource.includes('RETURN') ||
            (log.details && log.details.includes('return'))
        );
        
        console.log(`🔍 Found ${returnLogs.length} return-related logs`);
        
        const inventoryLogs = auditResponse.data.data.logs.filter(log => 
            log.action.includes('INVENTORY') || 
            log.resource.includes('INVENTORY') ||
            (log.details && log.details.includes('inventory'))
        );
        
        console.log(`🔍 Found ${inventoryLogs.length} inventory-related logs`);
        
        const productLogs = auditResponse.data.data.logs.filter(log => 
            log.action.includes('PRODUCT') || 
            log.resource.includes('PRODUCT') ||
            (log.details && log.details.includes('product'))
        );
        
        console.log(`🔍 Found ${productLogs.length} product-related logs`);
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

debugAuditLogs();