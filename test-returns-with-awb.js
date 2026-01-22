/**
 * TEST RETURNS WITH AWB FIELD
 * Test to verify returns can be created with AWB field
 */

const https = require('https');

// Test configuration
const API_BASE = 'https://16.171.196.15.nip.io';
const TEST_CREDENTIALS = {
    email: 'admin@company.com',
    password: 'admin@123'
};

// Disable SSL verification for testing
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

async function makeRequest(path, options = {}) {
    return new Promise((resolve, reject) => {
        const url = `${API_BASE}${path}`;
        console.log(`🔗 Making request to: ${url}`);
        
        const req = https.request(url, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            rejectUnauthorized: false
        }, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: jsonData
                    });
                } catch (error) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: data,
                        parseError: error.message
                    });
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        if (options.body) {
            req.write(JSON.stringify(options.body));
        }
        
        req.end();
    });
}

async function testReturnsWithAwb() {
    console.log('🧪 Testing Returns with AWB Field');
    console.log('=' .repeat(60));
    
    try {
        // Step 1: Login to get token
        console.log('1️⃣ Logging in...');
        const loginResponse = await makeRequest('/api/auth/login', {
            method: 'POST',
            body: TEST_CREDENTIALS
        });
        
        if (loginResponse.statusCode !== 200 || !loginResponse.data.success) {
            throw new Error(`Login failed: ${JSON.stringify(loginResponse.data)}`);
        }
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful');
        
        // Step 2: Create a return with AWB field
        console.log('\n2️⃣ Creating return with AWB field...');
        const returnData = {
            product_type: 'HH_BEDCOT-WBB707',
            barcode: '493-11471',
            warehouse: 'GGM_WH',
            quantity: 1,
            awb: 'AWB123456789', // Test AWB field
            order_ref: 'TEST_ORDER_001'
        };
        
        const createReturnResponse = await makeRequest('/api/returns', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: returnData
        });
        
        if (createReturnResponse.statusCode === 201 && createReturnResponse.data.success) {
            console.log('✅ Return created successfully with AWB field');
            console.log(`   Return ID: ${createReturnResponse.data.return_id}`);
            console.log(`   AWB: ${returnData.awb}`);
        } else {
            console.log('❌ Failed to create return');
            console.log(`   Status: ${createReturnResponse.statusCode}`);
            console.log(`   Response: ${JSON.stringify(createReturnResponse.data)}`);
        }
        
        // Step 3: Get all returns to verify AWB is stored
        console.log('\n3️⃣ Verifying AWB field in returns list...');
        const getReturnsResponse = await makeRequest('/api/returns', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (getReturnsResponse.statusCode === 200) {
            const returns = getReturnsResponse.data.data || [];
            console.log(`✅ Retrieved ${returns.length} returns`);
            
            // Find our test return
            const testReturn = returns.find(r => r.awb === 'AWB123456789');
            if (testReturn) {
                console.log('✅ Test return found with AWB field:');
                console.log(`   ID: ${testReturn.id}`);
                console.log(`   Product: ${testReturn.product_type}`);
                console.log(`   AWB: ${testReturn.awb}`);
                console.log(`   Warehouse: ${testReturn.warehouse}`);
            } else {
                console.log('❌ Test return with AWB not found in list');
            }
        } else {
            console.log('❌ Failed to get returns list');
        }
        
        console.log('\n' + '=' .repeat(60));
        console.log('🏁 Returns AWB Test Finished');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

// Run the test
testReturnsWithAwb();