const https = require('https');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const API_BASE = 'https://16.171.161.150.nip.io';
const BARCODE = '2251-999';

let authToken = null;

function makeRequest(method, endpoint, data = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(API_BASE + endpoint);
        const options = {
            hostname: url.hostname,
            port: url.port || 443,
            path: url.pathname + url.search,
            method: method,
            headers: { 'Content-Type': 'application/json', ...headers },
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
    console.log('STATUS UPDATE TEST - BARCODE:', BARCODE);
    console.log('================================================================================\n');
    
    // Login
    console.log('STEP 1: Login');
    console.log('-------------------------------------------');
    const loginRes = await makeRequest('POST', '/api/auth/login', {
        email: 'admin@company.com',
        password: 'admin@123'
    });
    
    if (loginRes.status === 200 && loginRes.data.token) {
        authToken = loginRes.data.token;
        console.log('✅ Login successful\n');
    } else {
        console.log('❌ Login failed\n');
        return;
    }
    
    // Find order by barcode
    console.log('STEP 2: Find Order by Barcode');
    console.log('-------------------------------------------');
    const ordersRes = await makeRequest('GET', '/api/order-tracking?limit=1000', null, {
        'Authorization': `Bearer ${authToken}`
    });
    
    if (ordersRes.status !== 200) {
        console.log('❌ Failed to fetch orders\n');
        return;
    }
    
    const orders = ordersRes.data.data || ordersRes.data;
    const order = orders.find(o => o.barcode === BARCODE || o.product_barcode === BARCODE);
    
    if (!order) {
        console.log('❌ Order not found with barcode:', BARCODE);
        console.log('Showing first 5 orders:');
        orders.slice(0, 5).forEach((o, i) => {
            console.log(`  ${i+1}. ID: ${o.id || o.dispatch_id}, Barcode: ${o.barcode || o.product_barcode || 'N/A'}`);
        });
        return;
    }
    
    const orderId = order.id || order.dispatch_id;
    console.log('✅ Found Order:');
    console.log('   ID:', orderId);
    console.log('   Product:', order.product_name);
    console.log('   Barcode:', order.barcode || order.product_barcode);
    console.log('   Current Status:', order.status);
    console.log();
    
    // Test status update
    console.log('STEP 3: Update Status via API');
    console.log('-------------------------------------------');
    console.log(`PATCH /api/order-tracking/${orderId}/status`);
    
    const statusRes = await makeRequest(
        'PATCH',
        `/api/order-tracking/${orderId}/status`,
        { status: 'Delivered', remarks: 'Test status update' },
        { 'Authorization': `Bearer ${authToken}` }
    );
    
    console.log('Status Code:', statusRes.status);
    console.log('Response:', JSON.stringify(statusRes.data, null, 2));
    console.log();
    
    if (statusRes.status === 200) {
        console.log('✅ SUCCESS - Status update API is working!');
        console.log();
        console.log('Next Step: Check frontend for Authorization headers');
        console.log('Files to check:');
        console.log('  - src/app/order/OrderSheet.jsx');
        console.log('  - src/app/inventory/ProductTracker.jsx');
    } else if (statusRes.status === 404) {
        console.log('❌ FAIL - 404 Not Found');
        console.log();
        console.log('Issue: Order exists in GET response but not found in UPDATE query');
        console.log('This means:');
        console.log('  1. GET reads from one table (warehouse_dispatch + items)');
        console.log('  2. UPDATE writes to different table or wrong WHERE clause');
        console.log();
        console.log('Backend Fix Required:');
        console.log('  File: controllers/orderTrackingController.js');
        console.log('  Check the UPDATE query WHERE clause');
    } else if (statusRes.status === 401) {
        console.log('❌ FAIL - 401 Unauthorized');
        console.log('Authorization header issue');
    } else {
        console.log('❌ FAIL - Unexpected status:', statusRes.status);
    }
    
    console.log();
    console.log('================================================================================');
}

runTest();
