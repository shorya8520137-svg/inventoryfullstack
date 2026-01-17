
const https = require('https');
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

async function testNotificationEndpoints() {
    console.log('🔔 Testing Notification Endpoints');
    console.log('================================');
    
    // First get admin token
    const loginData = JSON.stringify({
        email: 'admin@company.com',
        password: 'admin@123'
    });
    
    const loginOptions = {
        hostname: '13.48.248.180.nip.io',
        port: 443,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': loginData.length
        },
        rejectUnauthorized: false
    };
    
    return new Promise((resolve) => {
        const req = https.request(loginOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    if (response.success && response.token) {
                        console.log('✅ Login successful');
                        testWithToken(response.token);
                    } else {
                        console.log('❌ Login failed:', response);
                    }
                } catch (e) {
                    console.log('❌ Login parse error:', e.message);
                }
                resolve();
            });
        });
        
        req.on('error', (error) => {
            console.log('❌ Login request error:', error.message);
            resolve();
        });
        
        req.write(loginData);
        req.end();
    });
}

function testWithToken(token) {
    const endpoints = [
        { path: '/api/notifications', method: 'GET', name: 'Get Notifications' },
        { path: '/api/notifications/stats?user_id=1', method: 'GET', name: 'Get Stats' },
        { path: '/api/notifications', method: 'POST', name: 'Create Notification', 
          data: { title: 'Test', message: 'Test message', type: 'system', user_id: 1 } }
    ];
    
    endpoints.forEach((endpoint, index) => {
        setTimeout(() => {
            testEndpoint(endpoint, token);
        }, index * 1000);
    });
}

function testEndpoint(endpoint, token) {
    const postData = endpoint.data ? JSON.stringify(endpoint.data) : null;
    
    const options = {
        hostname: '13.48.248.180.nip.io',
        port: 443,
        path: endpoint.path,
        method: endpoint.method,
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        rejectUnauthorized: false
    };
    
    if (postData) {
        options.headers['Content-Length'] = postData.length;
    }
    
    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            if (res.statusCode === 200 || res.statusCode === 201) {
                console.log(`✅ ${endpoint.name}: SUCCESS (${res.statusCode})`);
            } else {
                console.log(`❌ ${endpoint.name}: FAILED (${res.statusCode})`);
                console.log('   Response:', data.substring(0, 200));
            }
        });
    });
    
    req.on('error', (error) => {
        console.log(`❌ ${endpoint.name}: ERROR - ${error.message}`);
    });
    
    if (postData) {
        req.write(postData);
    }
    req.end();
}

testNotificationEndpoints();
