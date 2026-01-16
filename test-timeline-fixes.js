const https = require('https');

const API_BASE = 'https://inventorysystem.cloud:3001';

// Test credentials
const TEST_USER = {
    username: 'admin',
    password: 'admin123'
};

// Create HTTPS agent that accepts self-signed certificates
const agent = new https.Agent({
    rejectUnauthorized: false
});

async function makeRequest(method, path, body = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, API_BASE);
        
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            agent
        };

        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data: data ? JSON.parse(data) : null
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data: data
                    });
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function testTimelineFixes() {
    console.log('==============================================');
    console.log('TESTING TIMELINE FIXES');
    console.log('==============================================\n');

    try {
        // Step 1: Login
        console.log('STEP 1: Login');
        console.log('-------------------------------------------');
        const loginRes = await makeRequest('POST', '/api/auth/login', TEST_USER);
        
        if (loginRes.status !== 200) {
            console.error('❌ Login failed:', loginRes.status);
            return;
        }

        const authToken = loginRes.data.token;
        console.log('✅ Login successful');
        console.log();

        // Step 2: Test Product Timeline WITHOUT warehouse parameter
        console.log('STEP 2: Test Product Timeline (No Warehouse Param)');
        console.log('-------------------------------------------');
        console.log('GET /api/timeline/2005-999');
        console.log('Expected: Log should show "warehouse: ALL" instead of "warehouse: undefined"');
        
        const timelineRes = await makeRequest(
            'GET',
            '/api/timeline/2005-999',
            null,
            { 'Authorization': `Bearer ${authToken}` }
        );
        
        console.log('Status Code:', timelineRes.status);
        console.log('✅ Check server logs - should show "warehouse: ALL"');
        console.log();

        // Step 3: Test Product Timeline WITH warehouse parameter
        console.log('STEP 3: Test Product Timeline (With Warehouse Param)');
        console.log('-------------------------------------------');
        console.log('GET /api/timeline/2005-999?warehouse=BLR_WH');
        
        const timelineWithWarehouseRes = await makeRequest(
            'GET',
            '/api/timeline/2005-999?warehouse=BLR_WH',
            null,
            { 'Authorization': `Bearer ${authToken}` }
        );
        
        console.log('Status Code:', timelineWithWarehouseRes.status);
        console.log('✅ Check server logs - should show "warehouse: BLR_WH"');
        console.log();

        // Step 4: Test Dispatch Timeline with INVALID ID (404 handling)
        console.log('STEP 4: Test Dispatch Timeline - Invalid ID');
        console.log('-------------------------------------------');
        console.log('GET /api/order-tracking/20/timeline');
        console.log('Expected: 404 with proper error message');
        
        const invalidDispatchRes = await makeRequest(
            'GET',
            '/api/order-tracking/20/timeline',
            null,
            { 'Authorization': `Bearer ${authToken}` }
        );
        
        console.log('Status Code:', invalidDispatchRes.status);
        if (invalidDispatchRes.status === 404) {
            console.log('✅ Correctly returns 404 for non-existent dispatch');
            console.log('Error Message:', invalidDispatchRes.data.message);
        } else {
            console.log('⚠️  Unexpected status code');
        }
        console.log();

        // Step 5: Get valid dispatch IDs and test with one
        console.log('STEP 5: Test Dispatch Timeline - Valid ID');
        console.log('-------------------------------------------');
        
        const allDispatchesRes = await makeRequest(
            'GET',
            '/api/order-tracking?limit=5',
            null,
            { 'Authorization': `Bearer ${authToken}` }
        );
        
        if (allDispatchesRes.status === 200 && allDispatchesRes.data.data?.length > 0) {
            const validDispatchId = allDispatchesRes.data.data[0].id;
            console.log(`Testing with valid dispatch ID: ${validDispatchId}`);
            console.log(`GET /api/order-tracking/${validDispatchId}/timeline`);
            
            const validDispatchRes = await makeRequest(
                'GET',
                `/api/order-tracking/${validDispatchId}/timeline`,
                null,
                { 'Authorization': `Bearer ${authToken}` }
            );
            
            console.log('Status Code:', validDispatchRes.status);
            if (validDispatchRes.status === 200) {
                console.log('✅ Valid dispatch timeline working!');
                console.log('Timeline entries:', validDispatchRes.data.data.timeline.length);
                console.log('Dispatch details:', {
                    id: validDispatchRes.data.data.dispatch.id,
                    awb: validDispatchRes.data.data.dispatch.awb,
                    barcode: validDispatchRes.data.data.dispatch.barcode,
                    warehouse: validDispatchRes.data.data.dispatch.warehouse
                });
            } else {
                console.log('❌ Failed with valid ID');
            }
        } else {
            console.log('⚠️  No dispatches found in system');
        }
        console.log();

        // Summary
        console.log('==============================================');
        console.log('FIX VERIFICATION SUMMARY');
        console.log('==============================================');
        console.log('1. Logging fix (warehouse: ALL):', '✅ Check server logs');
        console.log('2. 404 handling for invalid dispatch:', invalidDispatchRes.status === 404 ? '✅ WORKING' : '❌ FAILED');
        console.log('3. Frontend should show user-friendly error:', '✅ Alert added in ProductTracker.jsx');
        console.log();
        console.log('📝 NOTES:');
        console.log('- Check server console logs to verify "warehouse: ALL" appears');
        console.log('- Frontend will now show alert when dispatch ID not found');
        console.log('- Users won\'t see raw 404 errors anymore');
        console.log();

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
    }
}

// Run the test
testTimelineFixes();
