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

async function testTimelineIssues() {
    console.log('==============================================');
    console.log('TESTING TIMELINE ISSUES');
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

        // Step 2: Test Product Timeline (barcode 2005-999) - Check warehouse undefined issue
        console.log('STEP 2: Test Product Timeline - Warehouse Issue');
        console.log('-------------------------------------------');
        console.log('GET /api/timeline/2005-999');
        
        const timelineRes = await makeRequest(
            'GET',
            '/api/timeline/2005-999',
            null,
            { 'Authorization': `Bearer ${authToken}` }
        );
        
        console.log('Status Code:', timelineRes.status);
        
        if (timelineRes.status === 200) {
            console.log('✅ Timeline API working');
            console.log('Timeline entries:', timelineRes.data.data.timeline.length);
            
            // Check warehouse field in timeline entries
            console.log('\n📊 Checking warehouse field in timeline entries:');
            timelineRes.data.data.timeline.slice(0, 3).forEach((entry, idx) => {
                console.log(`Entry ${idx + 1}:`, {
                    type: entry.type,
                    warehouse: entry.warehouse,
                    direction: entry.direction,
                    quantity: entry.quantity
                });
            });
            
            // Check if warehouse is undefined
            const undefinedWarehouses = timelineRes.data.data.timeline.filter(e => !e.warehouse || e.warehouse === 'undefined');
            if (undefinedWarehouses.length > 0) {
                console.log(`\n⚠️  WARNING: ${undefinedWarehouses.length} entries have undefined warehouse!`);
            } else {
                console.log('\n✅ All entries have valid warehouse values');
            }
        } else {
            console.log('❌ Timeline API failed');
            console.log('Response:', timelineRes.data);
        }
        console.log();

        // Step 3: Test Dispatch Timeline for ID 20 - Check 404 issue
        console.log('STEP 3: Test Dispatch Timeline - 404 Issue');
        console.log('-------------------------------------------');
        console.log('GET /api/order-tracking/20/timeline');
        
        const dispatchTimelineRes = await makeRequest(
            'GET',
            '/api/order-tracking/20/timeline',
            null,
            { 'Authorization': `Bearer ${authToken}` }
        );
        
        console.log('Status Code:', dispatchTimelineRes.status);
        
        if (dispatchTimelineRes.status === 404) {
            console.log('❌ Dispatch ID 20 not found');
            console.log('Response:', dispatchTimelineRes.data);
        } else if (dispatchTimelineRes.status === 200) {
            console.log('✅ Dispatch timeline found');
            console.log('Timeline entries:', dispatchTimelineRes.data.data.timeline.length);
        } else {
            console.log('⚠️  Unexpected status:', dispatchTimelineRes.status);
            console.log('Response:', dispatchTimelineRes.data);
        }
        console.log();

        // Step 4: Try to find valid dispatch IDs
        console.log('STEP 4: Find Valid Dispatch IDs');
        console.log('-------------------------------------------');
        console.log('GET /api/order-tracking (get all dispatches)');
        
        const allDispatchesRes = await makeRequest(
            'GET',
            '/api/order-tracking?limit=10',
            null,
            { 'Authorization': `Bearer ${authToken}` }
        );
        
        if (allDispatchesRes.status === 200) {
            console.log('✅ Got dispatches list');
            const dispatches = allDispatchesRes.data.data || [];
            console.log(`Found ${dispatches.length} dispatches`);
            
            if (dispatches.length > 0) {
                console.log('\n📋 Available Dispatch IDs:');
                dispatches.slice(0, 5).forEach(d => {
                    console.log(`  - ID: ${d.id}, AWB: ${d.awb}, Barcode: ${d.barcode}, Status: ${d.status}`);
                });
                
                // Test with first valid dispatch ID
                const validDispatchId = dispatches[0].id;
                console.log(`\n🔍 Testing with valid dispatch ID: ${validDispatchId}`);
                console.log(`GET /api/order-tracking/${validDispatchId}/timeline`);
                
                const validTimelineRes = await makeRequest(
                    'GET',
                    `/api/order-tracking/${validDispatchId}/timeline`,
                    null,
                    { 'Authorization': `Bearer ${authToken}` }
                );
                
                console.log('Status Code:', validTimelineRes.status);
                if (validTimelineRes.status === 200) {
                    console.log('✅ Valid dispatch timeline working!');
                    console.log('Timeline entries:', validTimelineRes.data.data.timeline.length);
                } else {
                    console.log('❌ Failed even with valid ID');
                    console.log('Response:', validTimelineRes.data);
                }
            }
        }
        console.log();

        // Summary
        console.log('==============================================');
        console.log('SUMMARY');
        console.log('==============================================');
        console.log('1. Product Timeline (2005-999):', timelineRes.status === 200 ? '✅ WORKING' : '❌ FAILED');
        console.log('2. Dispatch Timeline (ID 20):', dispatchTimelineRes.status === 200 ? '✅ WORKING' : '❌ NOT FOUND (404)');
        console.log('3. Warehouse undefined issue:', 'Check logs above');
        console.log();

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
    }
}

// Run the test
testTimelineIssues();
