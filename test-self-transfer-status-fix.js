const https = require('https');

// Disable SSL verification for testing
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const API_BASE = 'https://16.171.196.15.nip.io';

console.log('🧪 TESTING SELF-TRANSFER STATUS UPDATE FIX');
console.log('='.repeat(60));

async function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const req = https.request(url, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Self-Transfer-Status-Test',
                ...options.headers
            },
            timeout: 15000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const responseTime = Date.now() - startTime;
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ 
                        success: true, 
                        statusCode: res.statusCode, 
                        data: jsonData,
                        responseTime
                    });
                } catch (e) {
                    resolve({ 
                        success: true, 
                        statusCode: res.statusCode, 
                        data: data,
                        responseTime
                    });
                }
            });
        });
        
        req.on('error', error => {
            const responseTime = Date.now() - startTime;
            reject({ success: false, error: error.message, responseTime });
        });
        
        req.on('timeout', () => {
            req.destroy();
            reject({ success: false, error: 'Timeout', responseTime: 15000 });
        });
        
        if (options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
}

async function testSelfTransferStatusUpdate() {
    try {
        // Step 1: Get authentication token
        console.log('1️⃣ Getting authentication token...');
        const loginResponse = await makeRequest(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            body: JSON.stringify({
                email: 'admin@company.com',
                password: 'admin@123'
            })
        });
        
        if (!loginResponse.data.success) {
            console.log('❌ Login failed:', loginResponse.data.message);
            return;
        }
        
        const token = loginResponse.data.token;
        console.log('✅ Token obtained');
        
        // Step 2: Get order tracking data to find self-transfers
        console.log('\n2️⃣ Finding self-transfer records...');
        const trackingResponse = await makeRequest(`${API_BASE}/api/order-tracking`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (trackingResponse.statusCode !== 200 || !trackingResponse.data.success) {
            console.log('❌ Failed to get order tracking data');
            return;
        }
        
        const orders = trackingResponse.data.data;
        const selfTransfers = orders.filter(order => 
            order.source_type === 'self_transfer' || 
            order.parcel_type === 'Self Transfer' ||
            (order.customer && order.customer.includes('Self Transfer'))
        );
        
        console.log(`📦 Found ${selfTransfers.length} self-transfer records`);
        
        if (selfTransfers.length === 0) {
            console.log('⚠️  No self-transfer records found to test');
            return;
        }
        
        // Step 3: Test status update on first self-transfer
        const testTransfer = selfTransfers[0];
        console.log(`\n3️⃣ Testing status update on self-transfer ID: ${testTransfer.id}`);
        console.log(`   Current status: ${testTransfer.status}`);
        console.log(`   Product: ${testTransfer.product_name}`);
        console.log(`   Barcode: ${testTransfer.barcode}`);
        
        // Test 1: Update without barcode (entire transfer)
        console.log('\n🧪 Test 1: Update entire self-transfer status to "Processing"');
        const updateResponse1 = await makeRequest(`${API_BASE}/api/order-tracking/${testTransfer.id}/status`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                status: 'Processing'
            })
        });
        
        console.log(`   Response: ${updateResponse1.statusCode}`);
        if (updateResponse1.data.success) {
            console.log('   ✅ SUCCESS: Self-transfer status updated');
            console.log(`   📋 Type: ${updateResponse1.data.type}`);
            console.log(`   📋 New Status: ${updateResponse1.data.new_status}`);
        } else {
            console.log('   ❌ FAILED:', updateResponse1.data.message);
        }
        
        // Test 2: Update with barcode (specific product)
        if (testTransfer.barcode) {
            console.log('\n🧪 Test 2: Update self-transfer status with barcode to "Confirmed"');
            const updateResponse2 = await makeRequest(`${API_BASE}/api/order-tracking/${testTransfer.id}/status`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    status: 'Confirmed',
                    barcode: testTransfer.barcode
                })
            });
            
            console.log(`   Response: ${updateResponse2.statusCode}`);
            if (updateResponse2.data.success) {
                console.log('   ✅ SUCCESS: Self-transfer status updated with barcode');
                console.log(`   📋 Type: ${updateResponse2.data.type}`);
                console.log(`   📋 New Status: ${updateResponse2.data.new_status}`);
                console.log(`   📋 Barcode: ${updateResponse2.data.barcode}`);
            } else {
                console.log('   ❌ FAILED:', updateResponse2.data.message);
            }
        }
        
        // Test 3: Test invalid status for self-transfer
        console.log('\n🧪 Test 3: Test invalid status for self-transfer');
        const updateResponse3 = await makeRequest(`${API_BASE}/api/order-tracking/${testTransfer.id}/status`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                status: 'Delivered' // This should be invalid for self-transfers
            })
        });
        
        console.log(`   Response: ${updateResponse3.statusCode}`);
        if (updateResponse3.statusCode === 400) {
            console.log('   ✅ SUCCESS: Invalid status correctly rejected');
            console.log(`   📋 Message: ${updateResponse3.data.message}`);
        } else {
            console.log('   ❌ UNEXPECTED: Invalid status was accepted');
        }
        
        // Step 4: Test regular dispatch still works
        const regularDispatches = orders.filter(order => 
            order.source_type === 'dispatch' || !order.source_type
        );
        
        if (regularDispatches.length > 0) {
            const testDispatch = regularDispatches[0];
            console.log(`\n4️⃣ Testing regular dispatch still works (ID: ${testDispatch.id})`);
            
            const dispatchUpdateResponse = await makeRequest(`${API_BASE}/api/order-tracking/${testDispatch.id}/status`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    status: 'Processing'
                })
            });
            
            console.log(`   Response: ${dispatchUpdateResponse.statusCode}`);
            if (dispatchUpdateResponse.data.success) {
                console.log('   ✅ SUCCESS: Regular dispatch status update still works');
                console.log(`   📋 Type: ${dispatchUpdateResponse.data.type}`);
            } else {
                console.log('   ❌ FAILED: Regular dispatch broken:', dispatchUpdateResponse.data.message);
            }
        }
        
        console.log('\n🎉 SELF-TRANSFER STATUS UPDATE TEST COMPLETED');
        console.log('='.repeat(60));
        
    } catch (error) {
        console.error('❌ Test failed with error:', error.error || error.message);
    }
}

testSelfTransferStatusUpdate();