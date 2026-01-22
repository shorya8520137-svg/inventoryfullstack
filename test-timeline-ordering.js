/**
 * TEST: Check timeline ordering for product 2788-500
 */

const https = require('https');

const API_BASE = 'https://16.171.196.15.nip.io';

// Admin credentials
const adminCredentials = {
    username: 'admin@company.com',
    password: 'admin@123'
};

console.log('🔍 Testing Timeline Ordering for Product 2788-500...\n');

// Step 1: Login to get JWT token
function login() {
    return new Promise((resolve, reject) => {
        const loginData = JSON.stringify(adminCredentials);
        
        const options = {
            hostname: '16.171.196.15.nip.io',
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

// Step 2: Test timeline API for product 2788-500
function testTimeline(token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: '16.171.196.15.nip.io',
            port: 443,
            path: '/api/timeline/2788-500?warehouse=GGM_WH',
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
        
        console.log('📊 Step 2: Testing timeline API for product 2788-500...');
        const result = await testTimeline(token);
        
        console.log(`📈 Status Code: ${result.status}`);
        
        if (result.status === 200 && result.data.success) {
            const timeline = result.data.data?.timeline || [];
            const summary = result.data.data?.summary || {};
            
            console.log(`✅ Timeline API Success`);
            console.log(`📊 Timeline entries: ${timeline.length}`);
            console.log(`📋 Summary:`, summary);
            
            if (timeline.length > 0) {
                console.log('\n🕒 Timeline Entries (should be latest first):');
                timeline.forEach((entry, index) => {
                    console.log(`${index + 1}. ${entry.timestamp} - ${entry.type} - ${entry.direction} - Qty: ${entry.quantity} - Balance: ${entry.balance_after}`);
                });
                
                // Check if entries are in DESC order (latest first)
                let isDescOrder = true;
                for (let i = 1; i < timeline.length; i++) {
                    const prev = new Date(timeline[i-1].timestamp);
                    const curr = new Date(timeline[i].timestamp);
                    if (prev < curr) {
                        isDescOrder = false;
                        break;
                    }
                }
                
                console.log(`\n📅 Order Check: ${isDescOrder ? '✅ DESC (Latest First)' : '❌ ASC (Oldest First)'}`);
                
                if (!isDescOrder) {
                    console.log('🔧 ISSUE: Timeline entries are not in DESC order');
                    console.log('💡 SOLUTION: Need to fix ORDER BY in timeline controller');
                }
            } else {
                console.log('⚠️  No timeline entries found for this product');
            }
            
        } else {
            console.log('❌ Timeline API Error:', result.data);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
runTest();