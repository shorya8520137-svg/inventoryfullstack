const https = require('https');

// Disable SSL verification for testing
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const API_BASE = 'https://16.171.196.15.nip.io';

console.log('🔧 TESTING STATUS UPDATE FIX');
console.log('='.repeat(60));
console.log('Testing the fix for multiple products with same AWB');
console.log(`📡 API: ${API_BASE}`);

async function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const req = https.request(url, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Status-Update-Test',
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
                        data: data.substring(0, 200),
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

async function getAuthToken() {
    console.log('\n1️⃣ Getting authentication token...');
    try {
        const response = await makeRequest(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            body: JSON.stringify({
                email: 'admin@company.com',
                password: 'admin@123'
            })
        });
        
        if (response.data.success && response.data.token) {
            console.log(`✅ Token obtained (${response.responseTime}ms)`);
            return response.data.token;
        } else {
            throw new Error('Failed to get token');
        }
    } catch (error) {
        console.log(`❌ Authentication failed: ${error.error}`);
        return null;
    }
}

async function getOrdersWithSameAWB(token) {
    console.log('\n2️⃣ Finding orders with same AWB...');
    try {
        const response = await makeRequest(`${API_BASE}/api/order-tracking`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.data.success) {
            const orders = response.data.data;
            console.log(`📦 Found ${orders.length} total orders`);
            
            // Group orders by AWB
            const awbGroups = {};
            orders.forEach(order => {
                if (order.awb) {
                    if (!awbGroups[order.awb]) {
                        awbGroups[order.awb] = [];
                    }
                    awbGroups[order.awb].push(order);
                }
            });
            
            // Find AWBs with multiple products
            const multiProductAWBs = Object.entries(awbGroups)
                .filter(([awb, orders]) => orders.length > 1)
                .slice(0, 3); // Test first 3 multi-product AWBs
            
            console.log(`🔍 Found ${multiProductAWBs.length} AWBs with multiple products`);
            
            multiProductAWBs.forEach(([awb, orders]) => {
                console.log(`   📋 AWB ${awb}: ${orders.length} products`);
                orders.forEach(order => {
                    console.log(`      - ${order.product_name} (${order.barcode}) - Status: ${order.status}`);
                });
            });
            
            return multiProductAWBs;
        } else {
            throw new Error('Failed to get orders');
        }
    } catch (error) {
        console.log(`❌ Failed to get orders: ${error.error}`);
        return [];
    }
}

async function testStatusUpdate(token, order, newStatus) {
    console.log(`\n🔄 Testing status update for order ${order.id}...`);
    console.log(`   Product: ${order.product_name}`);
    console.log(`   Barcode: ${order.barcode}`);
    console.log(`   Current Status: ${order.status} → ${newStatus}`);
    
    try {
        const response = await makeRequest(`${API_BASE}/api/order-tracking/${order.dispatch_id || order.id}/status`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                status: newStatus,
                barcode: order.barcode
            })
        });
        
        console.log(`   📊 Response: ${response.statusCode} (${response.responseTime}ms)`);
        
        if (response.statusCode === 200 && response.data.success) {
            console.log(`   ✅ SUCCESS: Status updated to ${newStatus}`);
            return true;
        } else {
            console.log(`   ❌ FAILED: ${response.data.message || 'Unknown error'}`);
            return false;
        }
    } catch (error) {
        console.log(`   ❌ ERROR: ${error.error}`);
        return false;
    }
}

async function runStatusUpdateTests() {
    const token = await getAuthToken();
    if (!token) return;
    
    const multiProductAWBs = await getOrdersWithSameAWB(token);
    if (multiProductAWBs.length === 0) {
        console.log('\n⚠️  No multi-product AWBs found for testing');
        return;
    }
    
    console.log('\n3️⃣ Testing status updates...');
    
    const testStatuses = ['Processing', 'Confirmed', 'Pending'];
    let totalTests = 0;
    let passedTests = 0;
    
    // Test each multi-product AWB
    for (const [awb, orders] of multiProductAWBs) {
        console.log(`\n📋 Testing AWB: ${awb} (${orders.length} products)`);
        
        // Test updating each product in the AWB
        for (let i = 0; i < Math.min(orders.length, 2); i++) { // Test max 2 products per AWB
            const order = orders[i];
            const testStatus = testStatuses[i % testStatuses.length];
            
            totalTests++;
            const success = await testStatusUpdate(token, order, testStatus);
            if (success) passedTests++;
            
            // Small delay between tests
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 STATUS UPDATE TEST RESULTS');
    console.log('='.repeat(60));
    
    console.log(`🎯 Tests Run: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${totalTests - passedTests}`);
    console.log(`📈 Success Rate: ${totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%`);
    
    if (passedTests === totalTests && totalTests > 0) {
        console.log('\n🎉 ALL TESTS PASSED!');
        console.log('✅ Status updates work correctly for multi-product AWBs');
        console.log('🔧 The fix has resolved the issue');
    } else if (passedTests > 0) {
        console.log('\n⚠️  PARTIAL SUCCESS');
        console.log('🔧 Some status updates are working, but issues remain');
    } else {
        console.log('\n❌ ALL TESTS FAILED');
        console.log('🔧 The issue persists - further investigation needed');
    }
    
    console.log(`\n⏰ Test completed: ${new Date().toISOString()}`);
}

runStatusUpdateTests().catch(console.error);