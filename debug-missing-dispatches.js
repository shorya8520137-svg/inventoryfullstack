const https = require('https');

// Disable SSL verification for testing
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const API_BASE = 'https://16.171.196.15.nip.io';

console.log('🔍 DEBUGGING MISSING DISPATCH RECORDS');
console.log('='.repeat(50));

async function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const req = https.request(url, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Debug-Missing-Dispatches',
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

async function debugMissingDispatches() {
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
        
        // Get all dispatches from /api/dispatch
        console.log('\n2️⃣ Getting all dispatches from /api/dispatch...');
        const dispatchResponse = await makeRequest(`${API_BASE}/api/dispatch`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (dispatchResponse.data.success) {
            const dispatches = dispatchResponse.data.data || [];
            console.log(`📦 Found ${dispatches.length} dispatches`);
            
            dispatches.forEach(dispatch => {
                console.log(`   - ID: ${dispatch.id}, Customer: ${dispatch.customer}, Status: ${dispatch.status}, Warehouse: ${dispatch.warehouse}`);
            });
        }
        
        // Get all from order tracking
        console.log('\n3️⃣ Getting all from /api/order-tracking...');
        const orderResponse = await makeRequest(`${API_BASE}/api/order-tracking?limit=50`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (orderResponse.data.success) {
            const orders = orderResponse.data.data || [];
            console.log(`📦 Found ${orders.length} order tracking records`);
            
            // Filter only dispatch type records
            const dispatchOrders = orders.filter(o => o.source_type === 'dispatch' || !o.source_type);
            console.log(`📦 Dispatch records in order tracking: ${dispatchOrders.length}`);
            
            dispatchOrders.forEach(order => {
                console.log(`   - ID: ${order.id}, Customer: ${order.customer}, Status: ${order.status}, Warehouse: ${order.warehouse}`);
            });
            
            // Check which dispatch IDs are missing
            const dispatchIds = dispatches.map(d => d.id);
            const orderIds = dispatchOrders.map(o => o.id);
            
            const missingIds = dispatchIds.filter(id => !orderIds.includes(id));
            
            console.log('\n🔍 ANALYSIS:');
            console.log(`   Dispatch IDs: [${dispatchIds.join(', ')}]`);
            console.log(`   Order Tracking IDs: [${orderIds.join(', ')}]`);
            console.log(`   Missing IDs: [${missingIds.join(', ')}]`);
            
            if (missingIds.length > 0) {
                console.log('\n❌ PROBLEM IDENTIFIED:');
                console.log(`   Dispatch IDs ${missingIds.join(', ')} are missing from order tracking`);
                console.log('   This suggests an issue with the getAllDispatches query');
            } else {
                console.log('\n✅ All dispatch records are present in order tracking');
            }
        }
        
    } catch (error) {
        console.error('❌ Debug failed:', error.error || error.message);
    }
}

debugMissingDispatches();