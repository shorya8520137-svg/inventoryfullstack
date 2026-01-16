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

async function testCompleteTimelineFlow() {
    console.log('==============================================');
    console.log('COMPLETE TIMELINE FLOW TEST');
    console.log('Testing Product Timeline + Nested Dispatch Timeline');
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

        // Step 2: Test Product Timeline - Get event data
        console.log('STEP 2: Product Timeline - Event Data');
        console.log('==============================================');
        const testBarcode = '2460-3499'; // From your screenshot
        console.log(`Testing barcode: ${testBarcode}`);
        console.log(`GET /api/timeline/${testBarcode}`);
        console.log();
        
        const timelineRes = await makeRequest(
            'GET',
            `/api/timeline/${testBarcode}`,
            null,
            { 'Authorization': `Bearer ${authToken}` }
        );
        
        console.log('Status Code:', timelineRes.status);
        
        if (timelineRes.status !== 200) {
            console.error('❌ Timeline API failed');
            console.log('Response:', timelineRes.data);
            return;
        }

        console.log('✅ Timeline API working\n');
        
        const timeline = timelineRes.data.data.timeline;
        const summary = timelineRes.data.data.summary;
        
        console.log('📊 TIMELINE SUMMARY:');
        console.log('-------------------------------------------');
        console.log('Total Events:', summary.total_entries);
        console.log('Opening Stock:', summary.opening_stock);
        console.log('Total IN:', summary.total_in);
        console.log('Total OUT:', summary.total_out);
        console.log('Final Stock:', summary.breakdown?.final_stock || summary.current_stock);
        console.log();
        
        console.log('📋 EVENT BREAKDOWN:');
        console.log('-------------------------------------------');
        console.log('Bulk Upload:', summary.breakdown?.bulk_upload || 0);
        console.log('Dispatch:', summary.breakdown?.dispatch || 0);
        console.log('Damage:', summary.breakdown?.damage || 0);
        console.log('Recovery:', summary.breakdown?.recovery || 0);
        console.log('Returns:', summary.breakdown?.returns || 0);
        console.log('Transfer IN:', summary.breakdown?.self_transfer_in || 0);
        console.log('Transfer OUT:', summary.breakdown?.self_transfer_out || 0);
        console.log();

        console.log('📝 TIMELINE EVENTS (First 10):');
        console.log('-------------------------------------------');
        timeline.slice(0, 10).forEach((event, idx) => {
            console.log(`\n${idx + 1}. ${event.type}`);
            console.log(`   Qty: ${event.quantity} | Direction: ${event.direction}`);
            console.log(`   Warehouse: ${event.warehouse}`);
            console.log(`   Reference: ${event.reference}`);
            console.log(`   Date: ${event.timestamp}`);
            console.log(`   Balance: ${event.balance}`);
        });
        console.log();

        // Step 3: Find DISPATCH events and extract dispatch IDs
        console.log('\nSTEP 3: Extract Dispatch IDs from Timeline');
        console.log('==============================================');
        
        const dispatchEvents = timeline.filter(e => e.type === 'DISPATCH');
        console.log(`Found ${dispatchEvents.length} DISPATCH events\n`);
        
        if (dispatchEvents.length === 0) {
            console.log('⚠️  No DISPATCH events found for this product');
            console.log('Trying with a different barcode that has dispatches...\n');
            
            // Try with barcode 2251-999 which we know has dispatches
            const altBarcode = '2251-999';
            console.log(`Trying alternate barcode: ${altBarcode}`);
            console.log(`GET /api/timeline/${altBarcode}`);
            
            const altTimelineRes = await makeRequest(
                'GET',
                `/api/timeline/${altBarcode}`,
                null,
                { 'Authorization': `Bearer ${authToken}` }
            );
            
            if (altTimelineRes.status === 200) {
                const altTimeline = altTimelineRes.data.data.timeline;
                const altDispatchEvents = altTimeline.filter(e => e.type === 'DISPATCH');
                
                console.log(`✅ Found ${altDispatchEvents.length} DISPATCH events for ${altBarcode}\n`);
                
                if (altDispatchEvents.length > 0) {
                    dispatchEvents.length = 0;
                    dispatchEvents.push(...altDispatchEvents);
                }
            }
        }

        if (dispatchEvents.length === 0) {
            console.log('❌ No DISPATCH events found to test nested timeline');
            return;
        }

        console.log('📦 DISPATCH EVENTS:');
        console.log('-------------------------------------------');
        dispatchEvents.forEach((event, idx) => {
            console.log(`${idx + 1}. Reference: ${event.reference}`);
            console.log(`   Qty: ${event.quantity} | Warehouse: ${event.warehouse}`);
            console.log(`   Date: ${event.timestamp}`);
        });
        console.log();

        // Step 4: Extract dispatch ID from reference and test nested timeline
        console.log('\nSTEP 4: Nested Timeline - Complete Dispatch Data');
        console.log('==============================================');
        
        const firstDispatch = dispatchEvents[0];
        console.log('Testing with first DISPATCH event:');
        console.log('Reference:', firstDispatch.reference);
        
        // Extract dispatch ID from reference (format: DISPATCH_22_898989 or DISPATCH_DELETE_22)
        let dispatchId = null;
        const refParts = firstDispatch.reference.split('_');
        
        if (refParts[0] === 'DISPATCH') {
            if (refParts[1] === 'DELETE') {
                dispatchId = refParts[2]; // DISPATCH_DELETE_22
            } else {
                dispatchId = refParts[1]; // DISPATCH_22_898989
            }
        }
        
        console.log('Extracted Dispatch ID:', dispatchId);
        console.log();

        if (!dispatchId) {
            console.error('❌ Could not extract dispatch ID from reference');
            return;
        }

        console.log(`GET /api/order-tracking/${dispatchId}/timeline`);
        console.log();
        
        const nestedTimelineRes = await makeRequest(
            'GET',
            `/api/order-tracking/${dispatchId}/timeline`,
            null,
            { 'Authorization': `Bearer ${authToken}` }
        );
        
        console.log('Status Code:', nestedTimelineRes.status);
        
        if (nestedTimelineRes.status === 404) {
            console.log('⚠️  Dispatch not found (404)');
            console.log('This dispatch may have been deleted or ID is invalid');
            console.log('Response:', nestedTimelineRes.data);
            
            // Try with another dispatch event
            if (dispatchEvents.length > 1) {
                console.log('\nTrying with second DISPATCH event...');
                const secondDispatch = dispatchEvents[1];
                const secondRefParts = secondDispatch.reference.split('_');
                const secondDispatchId = secondRefParts[1] === 'DELETE' ? secondRefParts[2] : secondRefParts[1];
                
                console.log(`GET /api/order-tracking/${secondDispatchId}/timeline`);
                
                const secondNestedRes = await makeRequest(
                    'GET',
                    `/api/order-tracking/${secondDispatchId}/timeline`,
                    null,
                    { 'Authorization': `Bearer ${authToken}` }
                );
                
                if (secondNestedRes.status === 200) {
                    console.log('✅ Second dispatch found!\n');
                    displayNestedTimeline(secondNestedRes.data.data);
                } else {
                    console.log('❌ Second dispatch also not found');
                }
            }
            return;
        }
        
        if (nestedTimelineRes.status !== 200) {
            console.error('❌ Nested timeline API failed');
            console.log('Response:', nestedTimelineRes.data);
            return;
        }

        console.log('✅ Nested Timeline API working\n');
        displayNestedTimeline(nestedTimelineRes.data.data);

        // Summary
        console.log('\n==============================================');
        console.log('TEST SUMMARY');
        console.log('==============================================');
        console.log('1. Product Timeline:', timelineRes.status === 200 ? '✅ WORKING' : '❌ FAILED');
        console.log('   - Shows event data (DISPATCH, DAMAGE, RETURN, etc.)');
        console.log('   - Displays quantities, warehouses, references');
        console.log('   - Calculates running balance');
        console.log();
        console.log('2. Nested Dispatch Timeline:', nestedTimelineRes.status === 200 ? '✅ WORKING' : '❌ FAILED');
        console.log('   - Shows complete dispatch order details');
        console.log('   - Displays customer, AWB, logistics info');
        console.log('   - Shows timeline for that specific dispatch');
        console.log();

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        console.error(error.stack);
    }
}

function displayNestedTimeline(data) {
    console.log('🎯 COMPLETE DISPATCH ORDER DETAILS:');
    console.log('==============================================');
    
    const dispatch = data.dispatch;
    
    console.log('\n📦 DISPATCH INFORMATION:');
    console.log('-------------------------------------------');
    console.log('Dispatch ID:', dispatch.id);
    console.log('Status:', dispatch.status);
    console.log('Warehouse:', dispatch.warehouse);
    console.log('Order Reference:', dispatch.order_ref || 'N/A');
    console.log('Customer:', dispatch.customer || 'N/A');
    console.log('AWB Number:', dispatch.awb);
    console.log('Logistics:', dispatch.logistics || 'N/A');
    console.log('Payment Mode:', dispatch.payment_mode || 'N/A');
    console.log('Invoice Amount:', dispatch.invoice_amount || 'N/A');
    console.log('Timestamp:', dispatch.timestamp);
    
    console.log('\n📋 PRODUCT DETAILS:');
    console.log('-------------------------------------------');
    console.log('Product Name:', dispatch.product_name);
    console.log('Barcode:', dispatch.barcode);
    console.log('Quantity:', dispatch.qty);
    
    if (dispatch.items && dispatch.items.length > 0) {
        console.log('\n📦 DISPATCH ITEMS:');
        console.log('-------------------------------------------');
        dispatch.items.forEach((item, idx) => {
            console.log(`\n${idx + 1}. ${item.product_name}`);
            console.log(`   Variant: ${item.variant || 'N/A'}`);
            console.log(`   Barcode: ${item.barcode}`);
            console.log(`   Qty: ${item.qty}`);
            console.log(`   Price: ${item.selling_price}`);
        });
    }
    
    console.log('\n\n📊 DISPATCH TIMELINE:');
    console.log('-------------------------------------------');
    const timeline = data.timeline;
    console.log(`Total Events: ${timeline.length}\n`);
    
    timeline.forEach((event, idx) => {
        console.log(`${idx + 1}. ${event.type}`);
        console.log(`   Source: ${event.source}`);
        console.log(`   Qty: ${event.quantity} | Direction: ${event.direction}`);
        console.log(`   Warehouse: ${event.warehouse}`);
        console.log(`   Reference: ${event.reference}`);
        console.log(`   Description: ${event.description}`);
        console.log(`   Date: ${event.timestamp}`);
        if (event.awb) console.log(`   AWB: ${event.awb}`);
        if (event.logistics) console.log(`   Logistics: ${event.logistics}`);
        console.log();
    });
    
    console.log('\n📈 SUMMARY:');
    console.log('-------------------------------------------');
    const summary = data.summary;
    console.log('Total Movements:', summary.total_movements);
    console.log('Dispatched:', summary.dispatched);
    console.log('Damaged:', summary.damaged);
    console.log('Recovered:', summary.recovered);
    console.log('Self Transfer IN:', summary.self_transfer_in);
    console.log('Self Transfer OUT:', summary.self_transfer_out);
    console.log('Current Stock:', summary.current_stock);
}

// Run the test
testCompleteTimelineFlow();
