const https = require('https');

// Disable SSL verification for testing
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const API_BASE = 'https://16.171.5.50.nip.io';

console.log('🔍 CHECKING SELF-TRANSFER SCHEMA AND DATA');
console.log('='.repeat(60));

async function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const req = https.request(url, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Schema-Check',
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

async function checkSelfTransferData() {
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
    
    // Check self-transfer data
    console.log('\n2️⃣ Checking self-transfer data...');
    try {
        const response = await makeRequest(`${API_BASE}/api/self-transfer`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log(`📊 Response: ${response.statusCode}`);
        
        if (response.statusCode === 200 && response.data.success) {
            const transfers = response.data.data;
            console.log(`📦 Found ${transfers.length} self-transfer records`);
            
            if (transfers.length > 0) {
                console.log('\n📋 Sample self-transfer record:');
                const sample = transfers[0];
                console.log('   Fields available:');
                Object.keys(sample).forEach(key => {
                    console.log(`   - ${key}: ${sample[key]}`);
                });
                
                // Check if any have status-like fields
                const statusFields = Object.keys(sample).filter(key => 
                    key.toLowerCase().includes('status') || 
                    key.toLowerCase().includes('state')
                );
                
                if (statusFields.length > 0) {
                    console.log(`\n🔍 Status-related fields found: ${statusFields.join(', ')}`);
                } else {
                    console.log('\n⚠️  No status fields found in self-transfer records');
                }
            } else {
                console.log('📭 No self-transfer records found');
            }
        } else {
            console.log(`❌ Failed to get self-transfers: ${response.data.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.log(`❌ Error: ${error.error}`);
    }
    
    // Check order tracking for self-transfers
    console.log('\n3️⃣ Checking order tracking for self-transfers...');
    try {
        const response = await makeRequest(`${API_BASE}/api/order-tracking`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.statusCode === 200 && response.data.success) {
            const orders = response.data.data;
            const selfTransfers = orders.filter(order => 
                order.source_type === 'self_transfer' || 
                order.parcel_type === 'Self Transfer' ||
                order.customer?.includes('Self Transfer')
            );
            
            console.log(`📦 Found ${selfTransfers.length} self-transfer orders in order tracking`);
            
            if (selfTransfers.length > 0) {
                console.log('\n📋 Sample self-transfer order:');
                const sample = selfTransfers[0];
                console.log('   Fields available:');
                Object.keys(sample).forEach(key => {
                    console.log(`   - ${key}: ${sample[key]}`);
                });
                
                console.log(`\n🔍 Status field: ${sample.status || 'Not found'}`);
            }
        }
    } catch (error) {
        console.log(`❌ Error checking order tracking: ${error.error}`);
    }
}

checkSelfTransferData().catch(console.error);