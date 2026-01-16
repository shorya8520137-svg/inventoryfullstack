const https = require('https');
const fs = require('fs');
const path = require('path');

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

// Helper function to upload file with multipart/form-data
function uploadFile(endpoint, filePath, token) {
    return new Promise((resolve, reject) => {
        const url = new URL(API_BASE + endpoint);
        const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
        
        // Read file
        const fileContent = fs.readFileSync(filePath);
        const fileName = path.basename(filePath);
        
        // Build multipart body
        let body = '';
        body += `--${boundary}\r\n`;
        body += `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n`;
        body += `Content-Type: text/csv\r\n\r\n`;
        
        const bodyBuffer = Buffer.concat([
            Buffer.from(body, 'utf8'),
            fileContent,
            Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8')
        ]);
        
        const options = {
            hostname: url.hostname,
            port: url.port || 443,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': bodyBuffer.length,
                'Authorization': `Bearer ${token}`
            },
            rejectUnauthorized: false
        };

        const req = https.request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => responseBody += chunk);
            res.on('end', () => {
                try {
                    const jsonBody = JSON.parse(responseBody);
                    resolve({ status: res.statusCode, data: jsonBody });
                } catch (e) {
                    resolve({ status: res.statusCode, data: responseBody });
                }
            });
        });

        req.on('error', reject);
        req.write(bodyBuffer);
        req.end();
    });
}

// Login and get token
async function login() {
    console.log('================================================================================');
    console.log('TESTING BULK UPLOAD AND STATUS UPDATE APIS');
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

// Test 1: Create CSV file with test data
function createTestCSV() {
    console.log();
    console.log('================================================================================');
    console.log('TEST 1: CREATE TEST CSV FILE');
    console.log('================================================================================');
    
    const csvContent = `Product Name,Variant,Barcode,Category,Description,Price,Cost Price,Total Stock,Warehouse Locations,Weight,Dimensions
Test Product 1,Size M,TEST001,baby_wear,Test product description 1,299.99,199.99,100,Main Warehouse,0.5,10x8x2
Test Product 2,Size L,TEST002,baby_wear,Test product description 2,399.99,249.99,50,Main Warehouse,0.6,12x10x3
Test Product 3,Color Red,TEST003,baby_wear,Test product description 3,499.99,299.99,75,Main Warehouse,0.7,15x12x4`;

    const filePath = 'test_products_bulk_upload.csv';
    fs.writeFileSync(filePath, csvContent);
    
    console.log('✅ Test CSV file created:', filePath);
    console.log('Columns:', 'Product Name, Variant, Barcode, Category, Description, Price, Cost Price, Total Stock, Warehouse Locations, Weight, Dimensions');
    console.log('Rows:', 3);
    console.log();
    
    return filePath;
}

// Test 2: Bulk Upload Products
async function testBulkUpload(filePath) {
    console.log('================================================================================');
    console.log('TEST 2: BULK UPLOAD PRODUCTS API');
    console.log('================================================================================');
    console.log('POST /api/products/bulk/import');
    console.log();
    
    try {
        const response = await uploadFile('/api/products/bulk/import', filePath, authToken);
        
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
        if (response.status === 200 || response.status === 201) {
            console.log('✅ PASS - Bulk upload successful');
            return true;
        } else if (response.status === 401) {
            console.log('❌ FAIL - 401 Unauthorized (Missing or invalid token)');
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

// Test 3: Get order tracking list to find a valid ID
async function getOrderTrackingList() {
    console.log();
    console.log('================================================================================');
    console.log('TEST 3: GET ORDER TRACKING LIST');
    console.log('================================================================================');
    console.log('GET /api/order-tracking');
    console.log();
    
    try {
        const response = await makeRequest('GET', '/api/order-tracking', null, {
            'Authorization': `Bearer ${authToken}`
        });
        
        console.log('Status:', response.status);
        
        if (response.status === 200) {
            const orders = response.data.data || response.data;
            console.log('✅ PASS - Found', orders.length, 'orders');
            
            if (orders.length > 0) {
                const firstOrder = orders[0];
                console.log('First Order ID:', firstOrder.dispatch_id || firstOrder.id);
                console.log('AWB:', firstOrder.awb_number);
                console.log('Status:', firstOrder.status);
                return firstOrder.dispatch_id || firstOrder.id;
            } else {
                console.log('⚠️  No orders found to test status update');
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

// Test 4: Update Order Status
async function testStatusUpdate(orderId) {
    console.log();
    console.log('================================================================================');
    console.log('TEST 4: UPDATE ORDER STATUS API');
    console.log('================================================================================');
    console.log(`PATCH /api/order-tracking/${orderId}/status`);
    console.log();
    
    const statusData = {
        status: 'In Transit',
        remarks: 'Test status update from API test'
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
            console.log('✅ PASS - Status updated successfully');
            return true;
        } else if (response.status === 401) {
            console.log('❌ FAIL - 401 Unauthorized');
            console.log('Issue: Authorization header missing or invalid');
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

// Test 5: Check if OrderSheet.jsx has Authorization header for status update
async function checkOrderSheetCode() {
    console.log();
    console.log('================================================================================');
    console.log('TEST 5: CHECK ORDERSHEET.JSX FOR AUTH HEADER');
    console.log('================================================================================');
    
    try {
        const orderSheetPath = 'src/app/order/OrderSheet.jsx';
        if (fs.existsSync(orderSheetPath)) {
            const content = fs.readFileSync(orderSheetPath, 'utf8');
            
            // Check for status update function
            const hasStatusUpdate = content.includes('handleStatusUpdate') || content.includes('updateStatus');
            const hasAuthHeader = content.includes('Authorization') && content.includes('Bearer');
            
            console.log('File found:', orderSheetPath);
            console.log('Has status update function:', hasStatusUpdate ? '✅' : '❌');
            console.log('Has Authorization header:', hasAuthHeader ? '✅' : '❌');
            
            if (hasStatusUpdate && !hasAuthHeader) {
                console.log();
                console.log('⚠️  ISSUE FOUND: Status update function exists but missing Authorization header!');
                console.log('This is why PATCH /api/order-tracking/:id/status returns 401');
                return false;
            } else if (hasStatusUpdate && hasAuthHeader) {
                console.log();
                console.log('✅ Authorization header is present in status update function');
                return true;
            } else {
                console.log();
                console.log('⚠️  Could not find status update function');
                return null;
            }
        } else {
            console.log('❌ File not found:', orderSheetPath);
            return null;
        }
    } catch (error) {
        console.log('❌ Error reading file:', error.message);
        return null;
    }
}

// Main test runner
async function runTests() {
    try {
        // Login
        const loginSuccess = await login();
        if (!loginSuccess) {
            console.log('\n❌ Cannot proceed without authentication');
            return;
        }
        
        // Test 1: Create CSV
        const csvFile = createTestCSV();
        
        // Test 2: Bulk Upload
        const bulkUploadSuccess = await testBulkUpload(csvFile);
        
        // Test 3: Get order list
        const orderId = await getOrderTrackingList();
        
        // Test 4: Update status
        let statusUpdateSuccess = false;
        if (orderId) {
            statusUpdateSuccess = await testStatusUpdate(orderId);
        } else {
            console.log('\n⚠️  Skipping status update test - no orders found');
        }
        
        // Test 5: Check code
        const codeCheckResult = await checkOrderSheetCode();
        
        // Summary
        console.log();
        console.log('================================================================================');
        console.log('FINAL TEST RESULTS');
        console.log('================================================================================');
        console.log();
        console.log('Test Results:');
        console.log('1. Login:', loginSuccess ? '✅ PASS' : '❌ FAIL');
        console.log('2. Bulk Upload Products:', bulkUploadSuccess ? '✅ PASS' : '❌ FAIL');
        console.log('3. Get Order List:', orderId ? '✅ PASS' : '⚠️  SKIP');
        console.log('4. Update Order Status:', statusUpdateSuccess ? '✅ PASS' : '❌ FAIL');
        console.log('5. Code Check:', codeCheckResult === true ? '✅ PASS' : codeCheckResult === false ? '❌ FAIL' : '⚠️  N/A');
        console.log();
        
        const totalTests = 4; // Login, Bulk Upload, Get Orders, Status Update
        const passedTests = [loginSuccess, bulkUploadSuccess, orderId !== null, statusUpdateSuccess].filter(Boolean).length;
        const successRate = ((passedTests / totalTests) * 100).toFixed(1);
        
        console.log('Total Tests:', totalTests);
        console.log('Passed:', passedTests);
        console.log('Failed:', totalTests - passedTests);
        console.log('Success Rate:', successRate + '%');
        console.log();
        
        if (!statusUpdateSuccess && codeCheckResult === false) {
            console.log('🔧 FIX REQUIRED:');
            console.log('Add Authorization header to status update function in OrderSheet.jsx');
            console.log();
            console.log('Example fix:');
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
        
        console.log('================================================================================');
        console.log('Test Complete -', new Date().toISOString());
        console.log('================================================================================');
        
        // Cleanup
        if (fs.existsSync(csvFile)) {
            fs.unlinkSync(csvFile);
            console.log('✅ Cleaned up test CSV file');
        }
        
    } catch (error) {
        console.error('Fatal error:', error);
    }
}

// Run tests
runTests();
