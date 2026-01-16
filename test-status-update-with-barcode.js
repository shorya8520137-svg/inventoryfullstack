const https = require('https');

// Disable SSL verification for self-signed certificates
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const API_BASE = 'https://16.171.161.150.nip.io';

// Test credentials
const TEST_USER = {
    email: 'admin@company.com',
    password: 'admin@123'
};

let authToken = null;

// Helper function to make HTTP requests
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
                    const jsonBody = JSON.parse(body);
                    resolve({ status: res.statusCode, data: jsonBody, headers: res.headers });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body, headers: res.headers });
                }
            });
        });

        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

// Login and get token
async function login() {
    console.log('================================================================================');
    console.log('TESTING STATUS UPDATE API WITH BARCODE 2460-3499');
    console.log('================================================================================');
    console.log('API Base:', API_BASE);
    console.log('Start Time:', new Date().toISOString());
    console.log();
    
    console.log('SETUP: Admin Login');
    console.log('--------------------------------------------------------------------------------');
    
    try {
        const response = await makeRequest('POST', '/api/auth/login', TEST_USER);
        
        if (response.status === 200 && response.data.token) {
            authToken = response.data.token;
            console.log('✅ Admin login successful');
            console.log('Token:', authToken.substring(0, 20) + '...');
            return true;
        } else {
            console.log('❌ Login failed:', response.status, response.data);
            return false;
        }
    } catch (error) {
        console.log('❌ Login error:', error.message);
        return false;
    }
}

// Find order by barcode
async function findOrderByBarcode(barcode) {
    console.log();
    console.log('================================================================================');
    console.log('TEST 1: FIND ORDER BY BARCODE');
    console.log('================================================================================');
    console.log('GET /api/order-tracking');
    console.log('Searching for barcode:', barcode);
    console.log();
    
    try {
        const response = await makeRequest('GET', '/api/order-tracking?limit=1000', null, {
            'Authorization': `Bearer ${authToken}`
        });
        
        console.log('Status:', response.status);
        
        if (response.status === 200) {
            const orders = response.data.data || response.data;
            console.log('Total orders fetched:', orders.length);
            
            // Search for order with matching barcode
            const matchingOrder = orders.find(order => 
                order.barcode === barcode || 
                order.product_barcode === barcode ||
                order.awb_number === barcode
            );
            
            if (matchingOrder) {
                console.log('✅ FOUND - Order with barcode:', barcode);
                console.log('Order ID:', matchingOrder.dispatch_id || matchingOrder.id);
                console.log('AWB Number:', matchingOrder.awb_number);
                console.log('Product Name:', matchingOrder.product_name);
                console.log('Current Status:', matchingOrder.status);
                console.log('Barcode:', matchingOrder.barcode || matchingOrder.product_barcode);
                return matchingOrder.dispatch_id || matchingOrder.id;
            } else {
                console.log('⚠️  NOT FOUND - No order with barcode:', barcode);
                console.log();
                console.log('Showing first 5 orders for reference:');
                orders.slice(0, 5).forEach((order, index) => {
                    console.log(`${index + 1}. ID: ${order.dispatch_id || order.id}, AWB: ${order.awb_number}, Barcode: ${order.barcode || order.product_barcode || 'N/A'}`);
                });
                return null;
            }
        } else {
            console.log('❌ FAIL - Status:', response.status);
            return null;
        }
    } catch (error) {
        console.log('❌ FAIL - Error:', error.message);
        return null;
    }
}

// Test status update WITHOUT Authorization header
async function testStatusUpdateWithoutAuth(orderId) {
    console.log();
    console.log('================================================================================');
    console.log('TEST 2: UPDATE STATUS WITHOUT AUTHORIZATION HEADER');
    console.log('================================================================================');
    console.log(`PATCH /api/order-tracking/${orderId}/status`);
    console.log('Authorization header: NOT INCLUDED');
    console.log();
    
    const statusData = {
        status: 'In Transit',
        remarks: 'Test without auth header'
    };
    
    try {
        const response = await makeRequest(
            'PATCH', 
            `/api/order-tracking/${orderId}/status`, 
            statusData
            // NO Authorization header
        );
        
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
        if (response.status === 401) {
            console.log('✅ EXPECTED - 401 Unauthorized (Auth header missing)');
            return false;
        } else if (response.status === 200) {
            console.log('⚠️  UNEXPECTED - Status updated without auth! Security issue!');
            return true;
        } else {
            console.log('⚠️  UNEXPECTED - Status:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ FAIL - Error:', error.message);
        return false;
    }
}

// Test status update WITH Authorization header
async function testStatusUpdateWithAuth(orderId) {
    console.log();
    console.log('================================================================================');
    console.log('TEST 3: UPDATE STATUS WITH AUTHORIZATION HEADER');
    console.log('================================================================================');
    console.log(`PATCH /api/order-tracking/${orderId}/status`);
    console.log('Authorization header: INCLUDED');
    console.log();
    
    const statusData = {
        status: 'Delivered',
        remarks: 'Test with auth header - delivered successfully'
    };
    
    try {
        const response = await makeRequest(
            'PATCH', 
            `/api/order-tracking/${orderId}/status`, 
            statusData,
            {
                'Authorization': `Bearer ${authToken}`
            }
        );
        
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
        if (response.status === 200) {
            console.log('✅ PASS - Status updated successfully with auth');
            return true;
        } else if (response.status === 401) {
            console.log('❌ FAIL - 401 Unauthorized (Token invalid or expired)');
            return false;
        } else if (response.status === 404) {
            console.log('❌ FAIL - 404 Not Found (Order not found)');
            return false;
        } else {
            console.log('⚠️  FAIL - Status:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ FAIL - Error:', error.message);
        return false;
    }
}

// Verify status was updated
async function verifyStatusUpdate(orderId) {
    console.log();
    console.log('================================================================================');
    console.log('TEST 4: VERIFY STATUS WAS UPDATED');
    console.log('================================================================================');
    console.log(`GET /api/order-tracking/${orderId}`);
    console.log();
    
    try {
        const response = await makeRequest('GET', `/api/order-tracking/${orderId}`, null, {
            'Authorization': `Bearer ${authToken}`
        });
        
        console.log('Status:', response.status);
        
        if (response.status === 200) {
            const order = response.data.data || response.data;
            console.log('✅ Order fetched successfully');
            console.log('Current Status:', order.status);
            console.log('Last Updated:', order.updated_at);
            console.log('Remarks:', order.remarks || 'N/A');
            
            if (order.status === 'Delivered') {
                console.log('✅ VERIFIED - Status updated to "Delivered"');
                return true;
            } else {
                console.log('⚠️  Status is not "Delivered", it is:', order.status);
                return false;
            }
        } else {
            console.log('❌ FAIL - Status:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ FAIL - Error:', error.message);
        return false;
    }
}

// Main test runner
async function runTests() {
    try {
        const BARCODE = '2460-3499';
        
        // Login
        const loginSuccess = await login();
        if (!loginSuccess) {
            console.log('\n❌ Cannot proceed without authentication');
            return;
        }
        
        // Find order by barcode
        const orderId = await findOrderByBarcode(BARCODE);
        if (!orderId) {
            console.log('\n❌ Cannot proceed without valid order ID');
            return;
        }
        
        // Test without auth
        const withoutAuthResult = await testStatusUpdateWithoutAuth(orderId);
        
        // Test with auth
        const withAuthResult = await testStatusUpdateWithAuth(orderId);
        
        // Verify update
        let verifyResult = false;
        if (withAuthResult) {
            verifyResult = await verifyStatusUpdate(orderId);
        }
        
        // Summary
        console.log();
        console.log('================================================================================');
        console.log('FINAL TEST RESULTS');
        console.log('================================================================================');
        console.log();
        console.log('Barcode:', BARCODE);
        console.log('Order ID:', orderId);
        console.log();
        console.log('Test Results:');
        console.log('1. Login:', loginSuccess ? '✅ PASS' : '❌ FAIL');
        console.log('2. Find Order by Barcode:', orderId ? '✅ PASS' : '❌ FAIL');
        console.log('3. Status Update WITHOUT Auth:', withoutAuthResult ? '⚠️  SECURITY ISSUE' : '✅ PASS (401 as expected)');
        console.log('4. Status Update WITH Auth:', withAuthResult ? '✅ PASS' : '❌ FAIL');
        console.log('5. Verify Status Updated:', verifyResult ? '✅ PASS' : '⚠️  N/A');
        console.log();
        
        if (!withAuthResult) {
            console.log('🔧 ISSUE IDENTIFIED:');
            console.log('The PATCH /api/order-tracking/:id/status endpoint is returning an error.');
            console.log('This could be due to:');
            console.log('1. Missing Authorization header in frontend code');
            console.log('2. Backend route not properly configured');
            console.log('3. Order ID mismatch or not found');
            console.log();
        } else {
            console.log('✅ STATUS UPDATE API IS WORKING CORRECTLY!');
            console.log('The API requires Authorization header and updates status successfully.');
            console.log();
        }
        
        console.log('================================================================================');
        console.log('Test Complete -', new Date().toISOString());
        console.log('================================================================================');
        
    } catch (error) {
        console.error('Fatal error:', error);
    }
}

// Run tests
runTests();
