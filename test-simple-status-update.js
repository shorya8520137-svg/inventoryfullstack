const https = require('https');

// Disable SSL verification for testing
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const API_BASE = 'https://16.171.196.15.nip.io';

console.log('🔧 SIMPLE STATUS UPDATE TEST');
console.log('='.repeat(50));

async function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const req = https.request(url, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Simple-Test',
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

async function testSimpleStatusUpdate() {
    // Get token
    console.log('1️⃣ Getting token...');
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
    
    // Test simple status update without barcode first
    console.log('\n2️⃣ Testing simple status update (no barcode)...');
    try {
        const response = await makeRequest(`${API_BASE}/api/order-tracking/38/status`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                status: 'Processing'
            })
        });
        
        console.log(`📊 Response: ${response.statusCode}`);
        console.log(`📄 Data:`, response.data);
        
        if (response.statusCode === 200) {
            console.log('✅ Simple update works!');
        } else {
            console.log('❌ Simple update failed');
        }
    } catch (error) {
        console.log(`❌ Error: ${error.error}`);
    }
    
    // Test with barcode
    console.log('\n3️⃣ Testing status update with barcode...');
    try {
        const response = await makeRequest(`${API_BASE}/api/order-tracking/38/status`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                status: 'Confirmed',
                barcode: '496-13291'
            })
        });
        
        console.log(`📊 Response: ${response.statusCode}`);
        console.log(`📄 Data:`, response.data);
        
        if (response.statusCode === 200) {
            console.log('✅ Barcode update works!');
        } else {
            console.log('❌ Barcode update failed');
        }
    } catch (error) {
        console.log(`❌ Error: ${error.error}`);
    }
}

testSimpleStatusUpdate().catch(console.error);