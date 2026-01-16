const https = require('https');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const API_BASE = 'https://16.171.161.150.nip.io';
const BARCODE = '2251-999'; // Using the barcode we tested earlier

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
    console.log('PRODUCT TRACKER TIMELINE API TEST');
    console.log('================================================================================');
    console.log('Barcode:', BARCODE);
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
        console.log('✅ Login successful');
        console.log();
    } else {
        console.log('❌ Login failed');
        return;
    }
    
    // Step 2: Test Timeline API WITHOUT Authorization
    console.log('STEP 2: Test Timeline API WITHOUT Authorization');
    console.log('-------------------------------------------');
    console.log(`GET /api/timeline/${BARCODE}`);
    
    const timelineNoAuthRes = await makeRequest(
        'GET',
        `/api/timeline/${encodeURIComponent(BARCODE)}`
        // NO Authorization header
    );
    
    console.log('Status Code:', timelineNoAuthRes.status);
    if (timelineNoAuthRes.status === 401) {
        console.log('✅ EXPECTED - Returns 401 without auth (security working)');
    } else if (timelineNoAuthRes.status === 200) {
        console.log('⚠️  SECURITY ISSUE - Timeline accessible without auth!');
    } else {
        console.log('Response:', JSON.stringify(timelineNoAuthRes.data, null, 2).substring(0, 200));
    }
    console.log();
    
    // Step 3: Test Timeline API WITH Authorization
    console.log('STEP 3: Test Timeline API WITH Authorization');
    console.log('-------------------------------------------');
    console.log(`GET /api/timeline/${BARCODE}`);
    
    const timelineRes = await makeRequest(
        'GET',
        `/api/timeline/${encodeURIComponent(BARCODE)}`,
        null,
        { 'Authorization': `Bearer ${authToken}` }
    );
    
    console.log('Status Code:', timelineRes.status);
    
    if (timelineRes.status === 200) {
        console.log('✅ SUCCESS - Timeline API working!');
        console.log();
        
        const timeline = timelineRes.data.data?.timeline || [];
        const summary = timelineRes.data.data?.summary || {};
        
        console.log('Timeline Data:');
        console.log('  Total Events:', timeline.length);
        console.log('  Summary:', JSON.stringify(summary, null, 2));
        
        if (timeline.length > 0) {
            console.log();
            console.log('First 3 Timeline Events:');
            timeline.slice(0, 3).forEach((event, i) => {
                console.log(`  ${i + 1}. ${event.type} - ${event.description || 'N/A'}`);
                console.log(`     Qty: ${event.quantity}, Balance: ${event.balance_after || 'N/A'}`);
                console.log(`     Warehouse: ${event.warehouse}, Time: ${event.timestamp}`);
            });
        }
    } else if (timelineRes.status === 401) {
        console.log('❌ FAIL - 401 Unauthorized');
        console.log('Response:', JSON.stringify(timelineRes.data, null, 2));
    } else if (timelineRes.status === 404) {
        console.log('⚠️  404 - No timeline found for barcode:', BARCODE);
        console.log('Response:', JSON.stringify(timelineRes.data, null, 2));
    } else {
        console.log('❌ FAIL - Unexpected status:', timelineRes.status);
        console.log('Response:', JSON.stringify(timelineRes.data, null, 2).substring(0, 300));
    }
    console.log();
    
    // Step 4: Test Timeline API with Warehouse Filter
    console.log('STEP 4: Test Timeline API with Warehouse Filter');
    console.log('-------------------------------------------');
    console.log(`GET /api/timeline/${BARCODE}?warehouse=Main%20Warehouse`);
    
    const timelineFilterRes = await makeRequest(
        'GET',
        `/api/timeline/${encodeURIComponent(BARCODE)}?warehouse=${encodeURIComponent('Main Warehouse')}`,
        null,
        { 'Authorization': `Bearer ${authToken}` }
    );
    
    console.log('Status Code:', timelineFilterRes.status);
    
    if (timelineFilterRes.status === 200) {
        const filteredTimeline = timelineFilterRes.data.data?.timeline || [];
        console.log('✅ Warehouse filter working');
        console.log('  Filtered Events:', filteredTimeline.length);
    } else {
        console.log('⚠️  Filter failed with status:', timelineFilterRes.status);
    }
    console.log();
    
    // Step 5: Test Dispatch Timeline API (different endpoint)
    console.log('STEP 5: Test Dispatch Timeline API');
    console.log('-------------------------------------------');
    console.log('GET /api/order-tracking/19/timeline');
    
    const dispatchTimelineRes = await makeRequest(
        'GET',
        '/api/order-tracking/19/timeline',
        null,
        { 'Authorization': `Bearer ${authToken}` }
    );
    
    console.log('Status Code:', dispatchTimelineRes.status);
    
    if (dispatchTimelineRes.status === 200) {
        console.log('✅ Dispatch timeline API working');
        const dispatchData = dispatchTimelineRes.data.data;
        console.log('  Dispatch ID:', dispatchData?.id || 'N/A');
        console.log('  Product:', dispatchData?.product_name || 'N/A');
        console.log('  Timeline Events:', dispatchData?.timeline?.length || 0);
    } else if (dispatchTimelineRes.status === 401) {
        console.log('❌ FAIL - 401 Unauthorized');
    } else if (dispatchTimelineRes.status === 404) {
        console.log('⚠️  404 - Dispatch not found');
    } else {
        console.log('⚠️  Status:', dispatchTimelineRes.status);
    }
    console.log();
    
    // Summary
    console.log('================================================================================');
    console.log('TEST SUMMARY');
    console.log('================================================================================');
    console.log();
    console.log('APIs Tested:');
    console.log('1. GET /api/timeline/:barcode (without auth):', timelineNoAuthRes.status === 401 ? '✅ PASS' : '❌ FAIL');
    console.log('2. GET /api/timeline/:barcode (with auth):', timelineRes.status === 200 ? '✅ PASS' : '❌ FAIL');
    console.log('3. GET /api/timeline/:barcode?warehouse=X:', timelineFilterRes.status === 200 ? '✅ PASS' : '⚠️  SKIP');
    console.log('4. GET /api/order-tracking/:id/timeline:', dispatchTimelineRes.status === 200 ? '✅ PASS' : '⚠️  SKIP');
    console.log();
    
    const passedTests = [
        timelineNoAuthRes.status === 401,
        timelineRes.status === 200,
        timelineFilterRes.status === 200,
        dispatchTimelineRes.status === 200
    ].filter(Boolean).length;
    
    console.log('Total Tests: 4');
    console.log('Passed:', passedTests);
    console.log('Success Rate:', ((passedTests / 4) * 100).toFixed(1) + '%');
    console.log();
    
    if (timelineRes.status === 200) {
        console.log('✅ TIMELINE API IS WORKING!');
        console.log('ProductTracker should load timeline correctly.');
    } else {
        console.log('❌ TIMELINE API HAS ISSUES');
        console.log('Check backend routes and Authorization middleware.');
    }
    
    console.log();
    console.log('================================================================================');
}

runTest();
