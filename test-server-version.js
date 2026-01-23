const https = require('https');

// Disable SSL verification for testing
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const API_BASE = 'https://16.171.5.50.nip.io';

console.log('🔍 TESTING SERVER VERSION - CHECKING IF UPDATED CODE IS DEPLOYED');
console.log('='.repeat(70));

async function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const req = https.request(url, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Server-Version-Test',
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

async function testServerVersion() {
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
        
        // Test with a non-existent ID to see the error message format
        console.log('\n2️⃣ Testing with non-existent ID (99999) to check error handling...');
        const testResponse = await makeRequest(`${API_BASE}/api/order-tracking/99999/status`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                status: 'Processing'
            })
        });
        
        console.log(`   Response: ${testResponse.statusCode}`);
        console.log(`   Message: ${testResponse.data.message}`);
        
        // Check if the error message indicates the new code
        if (testResponse.data.message === 'Record not found in dispatch or self-transfer tables') {
            console.log('   ✅ NEW CODE DETECTED: Server has updated orderTrackingController');
        } else if (testResponse.data.message === 'Dispatch not found') {
            console.log('   ❌ OLD CODE DETECTED: Server still has old orderTrackingController');
        } else {
            console.log(`   ❓ UNKNOWN: Unexpected message format`);
        }
        
        // Test with a real self-transfer ID
        console.log('\n3️⃣ Testing with real self-transfer ID (2819)...');
        const realTestResponse = await makeRequest(`${API_BASE}/api/order-tracking/2819/status`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                status: 'Processing'
            })
        });
        
        console.log(`   Response: ${realTestResponse.statusCode}`);
        console.log(`   Message: ${realTestResponse.data.message}`);
        
        if (realTestResponse.data.success) {
            console.log('   ✅ SUCCESS: Self-transfer status update working!');
            console.log(`   📋 Type: ${realTestResponse.data.type}`);
            console.log(`   📋 New Status: ${realTestResponse.data.new_status}`);
        } else {
            console.log('   ❌ FAILED: Self-transfer status update not working');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.error || error.message);
    }
}

testServerVersion();