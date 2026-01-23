const https = require('https');

// Disable SSL verification for testing
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const API_BASE = 'https://16.171.5.50.nip.io';

console.log('🔍 TESTING FRONTEND FILTERS AND PAGINATION');
console.log('='.repeat(60));

async function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const req = https.request(url, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Frontend-Filter-Test',
                ...options.headers
            },
            timeout: 15000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const responseTime = Date.now() - startTime;
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ 
                        success: true, 
                        statusCode: res.statusCode, 
                        data: jsonData,
                        responseTime
                    });
                } catch (e) {
                    resolve({ 
                        success: true, 
                        statusCode: res.statusCode, 
                        data: data,
                        responseTime
                    });
                }
            });
        });
        
        req.on('error', error => {
            const responseTime = Date.now() - startTime;
            reject({ success: false, error: error.message, responseTime });
        });
        
        req.on('timeout', () => {
            req.destroy();
            reject({ success: false, error: 'Timeout', responseTime: 15000 });
        });
        
        if (options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
}

async function testFrontendFilters() {
    try {
        // Get token
        console.log('1️⃣ Getting authentication token...');
        const loginResponse = await makeRequest(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            body: JSON.stringify({
                email: 'admin@company.com',
                password: 'admin@123'
            })
        });
        
        if (!loginResponse.data.success) {
            console.log('❌ Login failed');
            return;
        }
        
        const token = loginResponse.data.token;
        console.log('✅ Token obtained');
        
        // Test different pagination and filter scenarios
        const testCases = [
            { name: 'Default (page 1, limit 20)', url: '/api/order-tracking' },
            { name: 'Page 1, limit 50', url: '/api/order-tracking?page=1&limit=50' },
            { name: 'Page 2, limit 20', url: '/api/order-tracking?page=2&limit=20' },
            { name: 'No pagination', url: '/api/order-tracking?limit=100' },
            { name: 'Search Test 01', url: '/api/order-tracking?search=Test%2001' },
            { name: 'Search Test 02', url: '/api/order-tracking?search=Test%2002' },
            { name: 'Filter Pending status', url: '/api/order-tracking?status=Pending' },
            { name: 'Filter GGM_WH warehouse', url: '/api/order-tracking?warehouse=GGM_WH' },
            { name: 'Filter MUM_WH warehouse', url: '/api/order-tracking?warehouse=MUM_WH' }
        ];
        
        for (const testCase of testCases) {
            console.log(`\n🧪 Testing: ${testCase.name}`);
            console.log(`   URL: ${testCase.url}`);
            
            const response = await makeRequest(`${API_BASE}${testCase.url}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.statusCode === 200 && response.data.success) {
                const records = response.data.data || [];
                const pagination = response.data.pagination || {};
                
                console.log(`   📊 Records: ${records.length}`);
                console.log(`   📄 Pagination: page ${pagination.page || 'N/A'}, total ${pagination.total || 'N/A'}`);
                
                // Check for Test 01 and Test 02
                const test01Count = records.filter(r => r.customer === 'Test 01').length;
                const test02Count = records.filter(r => r.customer === 'Test 02').length;
                
                console.log(`   🔍 Test 01: ${test01Count} records`);
                console.log(`   🔍 Test 02: ${test02Count} records`);
                
                if (test01Count > 0 || test02Count > 0) {
                    console.log(`   ✅ FOUND Test records in this query!`);
                }
            } else {
                console.log(`   ❌ Failed: ${response.statusCode} - ${response.data.message || 'Unknown error'}`);
            }
        }
        
        console.log('\n🎯 ANALYSIS:');
        console.log('   - Check which query returns Test 01 and Test 02');
        console.log('   - Verify frontend is using correct pagination parameters');
        console.log('   - Check if default filters are hiding the records');
        
    } catch (error) {
        console.error('❌ Test failed:', error.error || error.message);
    }
}

testFrontendFilters();