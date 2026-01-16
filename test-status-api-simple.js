const https = require('https');

// Disable SSL verification
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const API_BASE = 'https://16.171.161.150.nip.io';
const ORDER_ID = 2762; // Order with barcode 2460-3499

let authToken = null;

// Helper function
function makeRequest(method, endpoint, data = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(API_BASE + endpoint);
        
        const options = {
            hostname: url.hostname,
            port: url.port || 443,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            rejectUnauthorized: false
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function runTest() {
    console.log('================================================================================');
    console.log('STATUS UPDATE API TEST');
    console.log('================================================================================');
    console.log('Order ID:', ORDER_ID);
    console.log('API Base:', API_BASE);
    console.log();
    
    // Login
    console.log('STEP 1: Login');
    console.log('--------------------------------------------------------------------------------');
    const loginRes = await makeRequest('POST', '/api/auth/login', {
        email: 'admin@company.com',
        password: 'admin@123'
    });
    
    if (loginRes.status === 200 && loginRes.data.token) {
        authToken = loginRes.data.token;
        console.log('✅ Login successful');
    } else {
        console.log('❌ Login failed');
        return;
    }
    
    // Test status update
    console.log();
    console.log('STEP 2: Test Status Update API');
    console.log('--------------------------------------------------------------------------------');
    console.log(`PATCH /api/order-tracking/${ORDER_ID}/status`);
    
    const statusRes = await makeRequest(
        'PATCH',
        `/api/order-tracking/${ORDER_ID}/status`,
        { status: 'Delivered', remarks: 'Test update' },
        { 'Authorization': `Bearer ${authToken}` }
    );
    
    console.log('Status Code:', statusRes.status);
    console.log('Response:', JSON.stringify(statusRes.data, null, 2));
    
    if (statusRes.status === 200) {
        console.log('✅ Status update successful!');
        console.log();
        console.log('✅ API IS WORKING - Now check frontend for Authorization headers');
    } else if (statusRes.status === 404) {
        console.log('❌ 404 - Order not found');
        console.log();
        console.log('ISSUE: The API query is not finding the order.');
        console.log('Possible reasons:');
        console.log('1. Order ID 2762 does not exist in warehouse_dispatch table');
        console.log('2. The UPDATE query has wrong WHERE clause');
        console.log('3. The route parameter is not being passed correctly');
    } else {
        console.log('❌ Failed with status:', statusRes.status);
    }
    
    console.log();
    console.log('================================================================================');
}

runTest();
