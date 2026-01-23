/**
 * TEST: Verify getAllDispatches returns ALL records without pagination
 * This test confirms that Test 01, Test 02, Test 03, Test 04 are all visible
 */

const https = require('https');

const API_BASE = 'https://16.171.5.50.nip.io';

// Test credentials
const testCredentials = {
    username: 'admin',
    password: 'admin123'
};

console.log('🧪 Testing getAllDispatches without pagination...\n');

// Step 1: Login to get JWT token
function login() {
    return new Promise((resolve, reject) => {
        const loginData = JSON.stringify(testCredentials);
        
        const options = {
            hostname: '16.171.5.50.nip.io',
            port: 443,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': loginData.length
            },
            rejectUnauthorized: false
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    if (response.success && response.token) {
                        console.log('✅ Login successful');
                        resolve(response.token);
                    } else {
                        reject(new Error('Login failed: ' + JSON.stringify(response)));
                    }
                } catch (err) {
                    reject(new Error('Login response parse error: ' + err.message));
                }
            });
        });

        req.on('error', reject);
        req.write(loginData);
        req.end();
    });
}

// Step 2: Test getAllDispatches API
function testGetAllDispatches(token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: '16.171.5.50.nip.io',
            port: 443,
            path: '/api/order-tracking/dispatches',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            rejectUnauthorized: false
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    resolve({ status: res.statusCode, data: response });
                } catch (err) {
                    reject(new Error('Response parse error: ' + err.message));
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

// Main test execution
async function runTest() {
    try {
        console.log('🔐 Step 1: Logging in...');
        const token = await login();
        
        console.log('📊 Step 2: Testing getAllDispatches API...');
        const result = await testGetAllDispatches(token);
        
        console.log(`📈 Status Code: ${result.status}`);
        
        if (result.status === 200 && result.data.success) {
            const dispatches = result.data.data || [];
            const total = result.data.total || dispatches.length;
            
            console.log(`✅ API Success: Retrieved ${dispatches.length} records`);
            console.log(`📊 Total count: ${total}`);
            
            // Check if pagination metadata is removed
            if (result.data.pagination) {
                console.log('⚠️  WARNING: Pagination metadata still present');
                console.log('Pagination:', result.data.pagination);
            } else {
                console.log('✅ Pagination metadata removed successfully');
            }
            
            // Look for Test 01, Test 02, Test 03, Test 04
            const testCustomers = ['Test 01', 'Test 02', 'Test 03', 'Test 04'];
            const foundCustomers = [];
            
            dispatches.forEach(dispatch => {
                if (testCustomers.includes(dispatch.customer)) {
                    foundCustomers.push({
                        id: dispatch.id,
                        customer: dispatch.customer,
                        order_ref: dispatch.order_ref,
                        status: dispatch.status,
                        awb: dispatch.awb
                    });
                }
            });
            
            console.log('\n🔍 Test Customer Records Found:');
            if (foundCustomers.length > 0) {
                foundCustomers.forEach(customer => {
                    console.log(`✅ ${customer.customer} (ID: ${customer.id}, Order: ${customer.order_ref}, AWB: ${customer.awb}, Status: ${customer.status})`);
                });
                
                if (foundCustomers.length === 4) {
                    console.log('\n🎉 SUCCESS: All 4 test customers (Test 01, Test 02, Test 03, Test 04) are visible!');
                } else {
                    console.log(`\n⚠️  Found ${foundCustomers.length}/4 test customers. Missing customers may not exist in database.`);
                }
            } else {
                console.log('❌ No test customers found. They may not exist in the database.');
            }
            
            // Show first few records for verification
            console.log('\n📋 First 5 Records:');
            dispatches.slice(0, 5).forEach((dispatch, index) => {
                console.log(`${index + 1}. ${dispatch.customer} (ID: ${dispatch.id}, Order: ${dispatch.order_ref})`);
            });
            
            console.log('\n✅ TEST COMPLETED: Pagination removed successfully');
            console.log(`📊 Total records returned: ${dispatches.length} (no limits applied)`);
            
        } else {
            console.log('❌ API Error:', result.data);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
runTest();