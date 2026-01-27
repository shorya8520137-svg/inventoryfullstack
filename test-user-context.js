const axios = require('axios');
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

async function testUserContext() {
    try {
        console.log('🔐 Logging in...');
        const loginResponse = await axios.post('https://13.60.36.159.nip.io/api/auth/login', {
            email: 'admin@company.com',
            password: 'admin@123'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful');
        console.log('👤 User info:', loginResponse.data.user);
        
        console.log('\n📦 Testing return creation with detailed logging...');
        
        // Create a return and check if audit logging works
        const returnData = {
            order_ref: 'USER-CONTEXT-TEST-' + Date.now(),
            awb: 'AWB-USER-TEST-' + Date.now(),
            product_type: 'User Context Test Product',
            warehouse: 'GGM_WH',
            quantity: 1,
            barcode: '2460-3499',
            condition: 'good'
        };
        
        console.log('📡 Making return request...');
        const returnResponse = await axios.post('https://13.60.36.159.nip.io/api/returns', returnData, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'User-Agent': 'Audit-Test-Client/1.0'
            }
        });
        
        console.log('✅ Return response:', returnResponse.status, returnResponse.data);
        
        // Wait and check for audit logs
        console.log('\n⏳ Waiting 5 seconds for audit log...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        console.log('\n📋 Checking for new audit logs...');
        const auditResponse = await axios.get('https://13.60.36.159.nip.io/api/audit-logs?limit=5', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('📊 Latest 5 audit logs:');
        auditResponse.data.data.logs.forEach((log, i) => {
            console.log(`${i+1}. ${log.action} ${log.resource} by ${log.user_name} at ${log.created_at}`);
            console.log(`   User ID: ${log.user_id}, IP: ${log.ip_address}`);
        });
        
        // Check if any contain our test data
        const testLogs = auditResponse.data.data.logs.filter(log => {
            const details = typeof log.details === 'string' ? log.details : JSON.stringify(log.details);
            return details.includes('USER-CONTEXT-TEST') || details.includes('User Context Test Product');
        });
        
        if (testLogs.length > 0) {
            console.log('\n✅ Found audit log for our test!');
            testLogs.forEach(log => {
                console.log(`   Action: ${log.action}, Resource: ${log.resource}`);
                console.log(`   Details: ${log.details}`);
            });
        } else {
            console.log('\n❌ No audit log found for our test');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testUserContext();