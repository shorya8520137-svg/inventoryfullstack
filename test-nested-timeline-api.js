const https = require('https');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const API_BASE = 'https://16.171.161.150.nip.io';
const DISPATCH_ID = 19; // Using the dispatch ID we tested earlier

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
    console.log('NESTED TIMELINE API TEST (Dispatch Details)');
    console.log('================================================================================');
    console.log('Dispatch ID:', DISPATCH_ID);
    console.log('API Base:', API_BASE);
    console.log();
    
    // Step 1: Login
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
    
    // Step 2: Test Nested Timeline API WITHOUT Auth
    console.log('STEP 2: Test Nested Timeline WITHOUT Authorization');
    console.log('-------------------------------------------');
    console.log(`GET /api/order-tracking/${DISPATCH_ID}/timeline`);
    
    const noAuthRes = await makeRequest('GET', `/api/order-tracking/${DISPATCH_ID}/timeline`);
    
    console.log('Status Code:', noAuthRes.status);
    if (noAuthRes.status === 401) {
        console.log('✅ EXPECTED - Returns 401 without auth (security working)');
    } else if (noAuthRes.status === 200) {
        console.log('⚠️  SECURITY ISSUE - Accessible without auth!');
    }
    console.log();
    
    // Step 3: Test Nested Timeline API WITH Auth
    console.log('STEP 3: Test Nested Timeline WITH Authorization');
    console.log('-------------------------------------------');
    console.log(`GET /api/order-tracking/${DISPATCH_ID}/timeline`);
    
    const timelineRes = await makeRequest(
        'GET',
        `/api/order-tracking/${DISPATCH_ID}/timeline`,
        null,
        { 'Authorization': `Bearer ${authToken}` }
    );
    
    console.log('Status Code:', timelineRes.status);
    
    if (timelineRes.status === 200) {
        console.log('✅ SUCCESS - Nested timeline API working!\n');
        
        const dispatchData = timelineRes.data.data;
        
        if (dispatchData) {
            console.log('Dispatch Details:');
            console.log('  ID:', dispatchData.id || 'N/A');
            console.log('  Customer:', dispatchData.customer || 'N/A');
            console.log('  Product:', dispatchData.product_name || 'N/A');
            console.log('  AWB:', dispatchData.awb || 'N/A');
            console.log('  Order Ref:', dispatchData.order_ref || 'N/A');
            console.log('  Quantity:', dispatchData.qty || dispatchData.quantity || 0);
            console.log('  Warehouse:', dispatchData.warehouse || 'N/A');
            console.log('  Status:', dispatchData.status || 'N/A');
            console.log('  Logistics:', dispatchData.logistics || 'N/A');
            console.log('  Payment Mode:', dispatchData.payment_mode || 'N/A');
            console.log('  Invoice Amount:', dispatchData.invoice_amount || 0);
            console.log('  Barcode:', dispatchData.barcode || 'N/A');
            console.log();
            
            // Check nested timeline
            const timeline = dispatchData.timeline || [];
            console.log('Nested Timeline:');
            console.log('  Total Events:', timeline.length);
            
            if (timeline.length > 0) {
                console.log();
                console.log('Timeline Events:');
                timeline.forEach((event, index) => {
                    console.log(`  ${index + 1}. ${event.type || 'Unknown'} - ${event.description || 'No description'}`);
                    console.log(`     Time: ${event.timestamp || 'N/A'}`);
                    console.log(`     Qty: ${event.quantity || 0}, Direction: ${event.direction || 'N/A'}`);
                    console.log(`     Warehouse: ${event.warehouse || 'N/A'}`);
                    if (event.reference) console.log(`     Reference: ${event.reference}`);
                    console.log();
                });
            } else {
                console.log('  ⚠️  No timeline events found');
            }
            
            // Check if items array exists (multi-product dispatch)
            if (dispatchData.items && dispatchData.items.length > 0) {
                console.log('Dispatch Items (Multi-Product):');
                dispatchData.items.forEach((item, index) => {
                    console.log(`  ${index + 1}. ${item.product_name} (${item.barcode})`);
                    console.log(`     Qty: ${item.qty}, Price: ₹${item.selling_price || 0}`);
                });
                console.log();
            }
        } else {
            console.log('⚠️  No dispatch data in response');
        }
    } else if (timelineRes.status === 404) {
        console.log('❌ FAIL - 404 Not Found');
        console.log('Response:', JSON.stringify(timelineRes.data, null, 2));
    } else if (timelineRes.status === 401) {
        console.log('❌ FAIL - 401 Unauthorized');
        console.log('Response:', JSON.stringify(timelineRes.data, null, 2));
    } else {
        console.log('❌ FAIL - Unexpected status:', timelineRes.status);
        console.log('Response:', JSON.stringify(timelineRes.data, null, 2).substring(0, 300));
    }
    console.log();
    
    // Step 4: Test with different dispatch ID
    console.log('STEP 4: Test with Another Dispatch ID');
    console.log('-------------------------------------------');
    
    // First get list of dispatches to find another ID
    const ordersRes = await makeRequest('GET', '/api/order-tracking?limit=5', null, {
        'Authorization': `Bearer ${authToken}`
    });
    
    if (ordersRes.status === 200) {
        const orders = ordersRes.data.data || ordersRes.data;
        console.log('Found', orders.length, 'orders');
        
        if (orders.length > 1) {
            const secondOrder = orders[1];
            const secondDispatchId = secondOrder.id || secondOrder.dispatch_id;
            
            console.log(`Testing dispatch ID: ${secondDispatchId}`);
            console.log(`GET /api/order-tracking/${secondDispatchId}/timeline`);
            
            const secondTimelineRes = await makeRequest(
                'GET',
                `/api/order-tracking/${secondDispatchId}/timeline`,
                null,
                { 'Authorization': `Bearer ${authToken}` }
            );
            
            console.log('Status Code:', secondTimelineRes.status);
            
            if (secondTimelineRes.status === 200) {
                const secondData = secondTimelineRes.data.data;
                console.log('✅ Second dispatch timeline loaded');
                console.log('  Product:', secondData?.product_name || 'N/A');
                console.log('  Timeline Events:', secondData?.timeline?.length || 0);
            } else {
                console.log('⚠️  Failed with status:', secondTimelineRes.status);
            }
        }
    }
    console.log();
    
    // Summary
    console.log('================================================================================');
    console.log('TEST SUMMARY');
    console.log('================================================================================');
    console.log();
    console.log('APIs Tested:');
    console.log('1. Login:', loginRes.status === 200 ? '✅ PASS' : '❌ FAIL');
    console.log('2. Nested Timeline (no auth):', noAuthRes.status === 401 ? '✅ PASS' : '❌ FAIL');
    console.log('3. Nested Timeline (with auth):', timelineRes.status === 200 ? '✅ PASS' : '❌ FAIL');
    console.log();
    
    if (timelineRes.status === 200) {
        const dispatchData = timelineRes.data.data;
        const hasTimeline = dispatchData?.timeline && dispatchData.timeline.length > 0;
        
        console.log('Data Quality:');
        console.log('  Dispatch Details:', dispatchData ? '✅ Present' : '❌ Missing');
        console.log('  Nested Timeline:', hasTimeline ? `✅ Present (${dispatchData.timeline.length} events)` : '⚠️  Empty');
        console.log();
        
        if (hasTimeline) {
            console.log('✅ NESTED TIMELINE API IS FULLY WORKING!');
            console.log('ProductTracker can successfully fetch and display dispatch details.');
        } else {
            console.log('⚠️  API works but no timeline events found for this dispatch.');
            console.log('This might be normal if the dispatch has no additional events.');
        }
    } else {
        console.log('❌ NESTED TIMELINE API HAS ISSUES');
        console.log('Check backend routes and data.');
    }
    
    console.log();
    console.log('================================================================================');
}

runTest();
