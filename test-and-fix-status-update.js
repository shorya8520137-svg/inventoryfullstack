const https = require('https');
const mysql = require('mysql2/promise');

// Disable SSL verification
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const API_BASE = 'https://16.171.161.150.nip.io';
const BARCODE = '2460-3499';

// Database config
const dbConfig = {
    host: '127.0.0.1',
    user: 'inventory_user',
    password: 'StrongPass@123',
    database: 'inventory_db'
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
                    resolve({ status: res.statusCode, data: jsonBody });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
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

// Login
async function login() {
    console.log('================================================================================');
    console.log('COMPLETE STATUS UPDATE TEST AND FIX');
    console.log('================================================================================');
    console.log('API Base:', API_BASE);
    console.log('Barcode:', BARCODE);
    console.log('Start Time:', new Date().toISOString());
    console.log();
    
    console.log('STEP 1: Admin Login');
    console.log('--------------------------------------------------------------------------------');
    
    try {
        const response = await makeRequest('POST', '/api/auth/login', {
            email: 'admin@company.com',
            password: 'admin@123'
        });
        
        if (response.status === 200 && response.data.token) {
            authToken = response.data.token;
            console.log('✅ Login successful');
            console.log('Token:', authToken.substring(0, 30) + '...');
            return true;
        } else {
            console.log('❌ Login failed:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Login error:', error.message);
        return false;
    }
}

// Step 2: Check database for order
async function checkDatabaseForOrder() {
    console.log();
    console.log('STEP 2: Check Database for Order');
    console.log('--------------------------------------------------------------------------------');
    
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database');
        
        // Check warehouse_dispatch table
        const [rows] = await connection.execute(
            'SELECT id, order_ref, awb, product_name, barcode, status, warehouse, timestamp FROM warehouse_dispatch WHERE barcode = ?',
            [BARCODE]
        );
        
        if (rows.length > 0) {
            const order = rows[0];
            console.log('✅ FOUND in warehouse_dispatch table:');
            console.log('   ID:', order.id);
            console.log('   Order Ref:', order.order_ref);
            console.log('   AWB:', order.awb);
            console.log('   Product:', order.product_name);
            console.log('   Barcode:', order.barcode);
            console.log('   Current Status:', order.status);
            console.log('   Warehouse:', order.warehouse);
            console.log('   Timestamp:', order.timestamp);
            
            await connection.end();
            return order.id;
        } else {
            console.log('❌ NOT FOUND in warehouse_dispatch table');
            
            // Check warehouse_dispatch_items
            const [itemRows] = await connection.execute(
                'SELECT dispatch_id, product_name, barcode, qty FROM warehouse_dispatch_items WHERE barcode = ?',
                [BARCODE]
            );
            
            if (itemRows.length > 0) {
                console.log('✅ FOUND in warehouse_dispatch_items table:');
                console.log('   Dispatch ID:', itemRows[0].dispatch_id);
                console.log('   Product:', itemRows[0].product_name);
                console.log('   Barcode:', itemRows[0].barcode);
                
                await connection.end();
                return itemRows[0].dispatch_id;
            } else {
                console.log('❌ NOT FOUND in warehouse_dispatch_items table either');
                await connection.end();
                return null;
            }
        }
    } catch (error) {
        console.log('❌ Database error:', error.message);
        if (connection) await connection.end();
        return null;
    }
}

// Step 3: Update status directly in database
async function updateStatusInDatabase(orderId) {
    console.log();
    console.log('STEP 3: Update Status Directly in Database');
    console.log('--------------------------------------------------------------------------------');
    console.log('Order ID:', orderId);
    console.log('New Status: In Transit');
    
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        
        const [result] = await connection.execute(
            'UPDATE warehouse_dispatch SET status = ? WHERE id = ?',
            ['In Transit', orderId]
        );
        
        if (result.affectedRows > 0) {
            console.log('✅ Status updated in database');
            console.log('   Affected Rows:', result.affectedRows);
            
            // Verify update
            const [rows] = await connection.execute(
                'SELECT id, status FROM warehouse_dispatch WHERE id = ?',
                [orderId]
            );
            
            console.log('   Verified Status:', rows[0].status);
            await connection.end();
            return true;
        } else {
            console.log('❌ No rows updated');
            await connection.end();
            return false;
        }
    } catch (error) {
        console.log('❌ Database update error:', error.message);
        if (connection) await connection.end();
        return false;
    }
}

// Step 4: Test API status update
async function testAPIStatusUpdate(orderId) {
    console.log();
    console.log('STEP 4: Test API Status Update');
    console.log('--------------------------------------------------------------------------------');
    console.log(`PATCH /api/order-tracking/${orderId}/status`);
    
    const statusData = {
        status: 'Delivered',
        remarks: 'Test API status update'
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
        
        console.log('Status Code:', response.status);
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
        if (response.status === 200) {
            console.log('✅ API status update successful');
            return true;
        } else if (response.status === 404) {
            console.log('❌ API returns 404 - Order not found');
            console.log('⚠️  This means the API query is wrong or looking in wrong table');
            return false;
        } else if (response.status === 401) {
            console.log('❌ API returns 401 - Authorization issue');
            return false;
        } else {
            console.log('❌ API failed with status:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ API error:', error.message);
        return false;
    }
}

// Step 5: Check frontend code for auth headers
async function checkFrontendCode() {
    console.log();
    console.log('STEP 5: Check Frontend Code for Authorization Headers');
    console.log('--------------------------------------------------------------------------------');
    
    const fs = require('fs');
    const filesToCheck = [
        'src/app/order/OrderSheet.jsx',
        'src/app/inventory/ProductTracker.jsx'
    ];
    
    const issues = [];
    
    for (const file of filesToCheck) {
        if (fs.existsSync(file)) {
            const content = fs.readFileSync(file, 'utf8');
            
            // Check for status update functions
            const hasStatusUpdate = content.match(/status.*update|updateStatus|handleStatusUpdate/gi);
            const hasPatchRequest = content.match(/method.*PATCH|PATCH.*method/gi);
            const hasAuthHeader = content.match(/Authorization.*Bearer|Bearer.*token/gi);
            
            console.log(`\nFile: ${file}`);
            console.log('  Has status update:', hasStatusUpdate ? '✅ Yes' : '❌ No');
            console.log('  Has PATCH request:', hasPatchRequest ? '✅ Yes' : '❌ No');
            console.log('  Has Auth header:', hasAuthHeader ? '✅ Yes' : '❌ No');
            
            if ((hasStatusUpdate || hasPatchRequest) && !hasAuthHeader) {
                issues.push({
                    file,
                    issue: 'Status update function found but missing Authorization header'
                });
            }
        } else {
            console.log(`\n⚠️  File not found: ${file}`);
        }
    }
    
    return issues;
}

// Main test runner
async function runTests() {
    try {
        // Step 1: Login
        const loginSuccess = await login();
        if (!loginSuccess) {
            console.log('\n❌ Cannot proceed without authentication');
            return;
        }
        
        // Step 2: Check database
        const orderId = await checkDatabaseForOrder();
        if (!orderId) {
            console.log('\n❌ Cannot proceed - order not found in database');
            return;
        }
        
        // Step 3: Update status in database
        const dbUpdateSuccess = await updateStatusInDatabase(orderId);
        
        // Step 4: Test API
        const apiUpdateSuccess = await testAPIStatusUpdate(orderId);
        
        // Step 5: Check frontend code
        const frontendIssues = await checkFrontendCode();
        
        // Summary
        console.log();
        console.log('================================================================================');
        console.log('FINAL RESULTS AND RECOMMENDATIONS');
        console.log('================================================================================');
        console.log();
        console.log('Test Results:');
        console.log('1. Login:', loginSuccess ? '✅ PASS' : '❌ FAIL');
        console.log('2. Database Check:', orderId ? `✅ PASS (Order ID: ${orderId})` : '❌ FAIL');
        console.log('3. Database Update:', dbUpdateSuccess ? '✅ PASS' : '❌ FAIL');
        console.log('4. API Update:', apiUpdateSuccess ? '✅ PASS' : '❌ FAIL');
        console.log('5. Frontend Check:', frontendIssues.length === 0 ? '✅ PASS' : `⚠️  ${frontendIssues.length} issues found`);
        console.log();
        
        if (!apiUpdateSuccess && dbUpdateSuccess) {
            console.log('🔧 ISSUE IDENTIFIED:');
            console.log('The database update works, but the API fails.');
            console.log('This means the API is looking for the order incorrectly.');
            console.log();
            console.log('BACKEND FIX REQUIRED:');
            console.log('File: controllers/orderTrackingController.js');
            console.log('Function: Status update (around line 960)');
            console.log();
            console.log('Current query:');
            console.log('  UPDATE warehouse_dispatch SET status = ? WHERE id = ?');
            console.log();
            console.log('The query is correct, but the API might be receiving wrong ID.');
            console.log('Check the route parameter mapping in routes/orderTrackingRoutes.js');
            console.log();
        }
        
        if (frontendIssues.length > 0) {
            console.log('🔧 FRONTEND ISSUES FOUND:');
            frontendIssues.forEach((issue, index) => {
                console.log(`${index + 1}. ${issue.file}`);
                console.log(`   Issue: ${issue.issue}`);
            });
            console.log();
            console.log('FIX: Add Authorization header to status update fetch calls');
            console.log('Example:');
            console.log('```javascript');
            console.log('const token = localStorage.getItem("token");');
            console.log('fetch(`${API_BASE}/api/order-tracking/${id}/status`, {');
            console.log('    method: "PATCH",');
            console.log('    headers: {');
            console.log('        "Content-Type": "application/json",');
            console.log('        "Authorization": `Bearer ${token}`');
            console.log('    },');
            console.log('    body: JSON.stringify({ status, remarks })');
            console.log('});');
            console.log('```');
        }
        
        console.log();
        console.log('================================================================================');
        console.log('Test Complete -', new Date().toISOString());
        console.log('================================================================================');
        
    } catch (error) {
        console.error('Fatal error:', error);
    }
}

// Run tests
runTests();
