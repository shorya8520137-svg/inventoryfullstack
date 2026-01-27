/**
 * TEST: Check admin user permissions to see if ORDERS_EXPORT is available
 */

const https = require('https');

const API_BASE = 'https://16.171.5.50.nip.io';

// Test credentials
const testCredentials = {
    username: 'admin',
    password: 'admin123'
};

console.log('🔐 Testing admin user permissions...\n');

// Step 1: Login to get JWT token and user info
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
                        console.log('👤 User:', response.user?.username || 'Unknown');
                        console.log('🎭 Role:', response.user?.role || 'Unknown');
                        
                        if (response.user?.permissions) {
                            console.log('🔑 Permissions:', response.user.permissions.length, 'total');
                            console.log('📋 Permission List:');
                            response.user.permissions.forEach((perm, index) => {
                                console.log(`   ${index + 1}. ${perm}`);
                            });
                            
                            // Check for ORDERS_EXPORT specifically
                            const hasOrdersExport = response.user.permissions.includes('ORDERS_EXPORT');
                            console.log(`\n🎯 ORDERS_EXPORT permission: ${hasOrdersExport ? '✅ GRANTED' : '❌ MISSING'}`);
                            
                            if (!hasOrdersExport) {
                                console.log('💡 SOLUTION: Admin user needs ORDERS_EXPORT permission to use export functionality');
                            }
                        } else {
                            console.log('⚠️  No permissions found in login response');
                        }
                        
                        resolve(response);
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

// Step 2: Test if there's an export API endpoint
function testExportEndpoint(token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: '16.171.5.50.nip.io',
            port: 443,
            path: '/api/order-tracking/export',
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
                resolve({ status: res.statusCode, data });
            });
        });

        req.on('error', reject);
        req.end();
    });
}

// Main test execution
async function runTest() {
    try {
        console.log('🔐 Step 1: Checking admin permissions...');
        const loginResult = await login();
        
        console.log('\n📡 Step 2: Testing export API endpoint...');
        const exportResult = await testExportEndpoint(loginResult.token);
        
        console.log(`📈 Export API Status: ${exportResult.status}`);
        
        if (exportResult.status === 404) {
            console.log('❌ Export API endpoint does not exist');
            console.log('💡 SOLUTION: Need to create export API endpoint in orderTrackingController.js');
        } else if (exportResult.status === 403) {
            console.log('❌ Export API exists but permission denied');
            console.log('💡 SOLUTION: Admin user needs ORDERS_EXPORT permission');
        } else if (exportResult.status === 200) {
            console.log('✅ Export API works correctly');
        } else {
            console.log('⚠️  Unexpected response:', exportResult.status);
            console.log('Response:', exportResult.data.substring(0, 200));
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
runTest();