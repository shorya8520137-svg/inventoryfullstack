const https = require('https');

// Disable SSL verification for testing
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const API_BASE = 'https://16.171.5.50.nip.io';

console.log('🔍 DEBUGGING SELF-TRANSFER IDs');
console.log('='.repeat(50));

async function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const req = https.request(url, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Debug-Self-Transfer',
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

async function debugSelfTransferIds() {
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
        
        // Get self-transfers from dedicated endpoint
        console.log('\n2️⃣ Getting self-transfers from /api/self-transfer...');
        const selfTransferResponse = await makeRequest(`${API_BASE}/api/self-transfer`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (selfTransferResponse.statusCode === 200 && selfTransferResponse.data.success) {
            const transfers = selfTransferResponse.data.data;
            console.log(`📦 Found ${transfers.length} self-transfer records from dedicated endpoint`);
            
            if (transfers.length > 0) {
                console.log('\n📋 Self-transfer IDs from /api/self-transfer:');
                transfers.slice(0, 3).forEach((transfer, index) => {
                    console.log(`   ${index + 1}. ID: ${transfer.id}, Reference: ${transfer.reference}, Product: ${transfer.product_name}`);
                });
            }
        } else {
            console.log('❌ Failed to get self-transfers from dedicated endpoint');
        }
        
        // Get from order tracking
        console.log('\n3️⃣ Getting self-transfers from /api/order-tracking...');
        const trackingResponse = await makeRequest(`${API_BASE}/api/order-tracking`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (trackingResponse.statusCode === 200 && trackingResponse.data.success) {
            const orders = trackingResponse.data.data;
            const selfTransfers = orders.filter(order => 
                order.source_type === 'self_transfer' || 
                order.parcel_type === 'Self Transfer' ||
                (order.customer && order.customer.includes('Self Transfer'))
            );
            
            console.log(`📦 Found ${selfTransfers.length} self-transfer records from order tracking`);
            
            if (selfTransfers.length > 0) {
                console.log('\n📋 Self-transfer IDs from /api/order-tracking:');
                selfTransfers.slice(0, 3).forEach((transfer, index) => {
                    console.log(`   ${index + 1}. ID: ${transfer.id}, Status: ${transfer.status}, Product: ${transfer.product_name}, Barcode: ${transfer.barcode}`);
                });
                
                // Test status update on first one
                const testId = selfTransfers[0].id;
                console.log(`\n4️⃣ Testing status update on ID: ${testId}`);
                
                const updateResponse = await makeRequest(`${API_BASE}/api/order-tracking/${testId}/status`, {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({
                        status: 'Processing'
                    })
                });
                
                console.log(`   Response: ${updateResponse.statusCode}`);
                console.log(`   Data:`, updateResponse.data);
            }
        } else {
            console.log('❌ Failed to get order tracking data');
        }
        
    } catch (error) {
        console.error('❌ Debug failed:', error.error || error.message);
    }
}

debugSelfTransferIds();