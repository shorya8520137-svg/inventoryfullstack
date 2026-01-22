const https = require('https');

// Disable SSL verification for testing
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const API_BASE = 'https://16.171.196.15.nip.io';

console.log('🔍 TESTING DISPATCH FRONTEND DATA ISSUE');
console.log('='.repeat(60));

async function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const req = https.request(url, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Dispatch-Frontend-Test',
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

async function testDispatchData() {
    try {
        // Get token
        console.log('1️⃣ Getting authentication token...');
        const loginResponse = await makeRequest(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            body: JSON.stringify({
                email: 'admin@company.com',
                password: 'admin@123'
            })
        });
        
        if (!loginResponse.data.success) {
            console.log('❌ Login failed');
            return;
        }
        
        const token = loginResponse.data.token;
        console.log('✅ Token obtained');
        
        // Test different dispatch endpoints
        console.log('\n2️⃣ Testing /api/dispatch endpoint...');
        const dispatchResponse = await makeRequest(`${API_BASE}/api/dispatch`, {
            headers: { 'Authorization': `Bearer ${token}` }
   
        });
        
        console.log(`   Response: ${dispatchResponse.statusCode}`);
        if (dispatchResponse.data.success) {
            const dispatches = dispatchResponse.data.data || [];
            console.log(`   📦 Found ${dispatches.length} dispatch records`);
            
            if (dispatches.length > 0) {
                console.log('\n   📋 Sample dispatch records:');
                dispatches.slice(0, 3).forEach((dispatch, index) => {
                    console.log(`      ${index + 1}. ID: ${dispatch.id}, Status: ${dispatch.status}, Customer: ${dispatch.customer}, Warehouse: ${dispatch.warehouse}`);
                });
            } else {
                console.log('   ⚠️  No dispatch records returned by API');
            }
        } else {
            console.log(`   ❌ API Error: ${dispatchResponse.data.message}`);
        }
        
        // Test order tracking endpoint
        console.log('\n3️⃣ Testing /api/order-tracking endpoint...');
        const orderResponse = await makeRequest(`${API_BASE}/api/order-tracking`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log(`   Response: ${orderResponse.statusCode}`);
        if (orderResponse.data.success) {
            const orders = orderResponse.data.data || [];
            console.log(`   📦 Found ${orders.length} order tracking records`);
            
            if (orders.length > 0) {
                console.log('\n   📋 Sample order records:');
                orders.slice(0, 3).forEach((order, index) => {
                    console.log(`      ${index + 1}. ID: ${order.id}, Status: ${order.status}, Customer: ${order.customer}, Type: ${order.source_type || 'dispatch'}`);
                });
                
                // Check for Test 01 and Test 02 specifically
                const test01 = orders.find(o => o.customer === 'Test 01');
                const test02 = orders.find(o => o.customer === 'Test 02');
                
                console.log('\n   🔍 Checking for specific test records:');
                console.log(`      Test 01: ${test01 ? '✅ Found' : '❌ Missing'}`);
                console.log(`      Test 02: ${test02 ? '✅ Found' : '❌ Missing'}`);
                
                if (test01) console.log(`         - ID: ${test01.id}, Status: ${test01.status}, Warehouse: ${test01.warehouse}`);
                if (test02) console.log(`         - ID: ${test02.id}, Status: ${test02.status}, Warehouse: ${test02.warehouse}`);
            } else {
                console.log('   ⚠️  No order tracking records returned by API');
            }
        } else {
            console.log(`   ❌ API Error: ${orderResponse.data.message}`);
        }
        
        // Test with specific filters
        console.log('\n4️⃣ Testing with warehouse filter (GGM_WH)...');
        const filteredResponse = await makeRequest(`${API_BASE}/api/order-tracking?warehouse=GGM_WH`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log(`   Response: ${filteredResponse.statusCode}`);
        if (filteredResponse.data.success) {
            const filtered = filteredResponse.data.data || [];
            console.log(`   📦 Found ${filtered.length} records for GGM_WH`);
        }
        
        // Test with status filter
        console.log('\n5️⃣ Testing with status filter (Pending)...');
        const statusResponse = await makeRequest(`${API_BASE}/api/order-tracking?status=Pending`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log(`   Response: ${statusResponse.statusCode}`);
        if (statusResponse.data.success) {
            const pending = statusResponse.data.data || [];
            console.log(`   📦 Found ${pending.length} pending records`);
        }
        
        console.log('\n🎯 DIAGNOSIS:');
        console.log('   - Check if API returns all 4 database records');
        console.log('   - Verify frontend filtering logic');
        console.log('   - Check if warehouse/status filters are applied');
        
    } catch (error) {
        console.error('❌ Test failed:', error.error || error.message);
    }
}

testDispatchData();