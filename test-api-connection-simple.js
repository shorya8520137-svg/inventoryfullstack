/**
 * SIMPLE API CONNECTION TEST
 * Test basic connection to backend
 */

const http = require('http');

function testConnection(host, port) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: host,
            port: port,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }, (res) => {
            console.log(`✅ Connection successful to ${host}:${port}`);
            console.log(`📡 Status: ${res.statusCode}`);
            resolve(true);
        });

        req.on('error', (err) => {
            console.log(`❌ Connection failed to ${host}:${port}`);
            console.log(`🔥 Error: ${err.message}`);
            resolve(false);
        });

        req.write(JSON.stringify({
            email: 'admin@company.com',
            password: 'admin@123'
        }));
        
        req.end();
    });
}

async function testMultiplePorts() {
    console.log('🔍 Testing Backend Connection on Multiple Ports...\n');
    
    const testCases = [
        { host: '16.171.141.4', port: 5000 },
        { host: '16.171.141.4', port: 3001 },
        { host: '16.171.141.4', port: 3000 },
        { host: 'localhost', port: 5000 },
        { host: '127.0.0.1', port: 5000 }
    ];
    
    for (const testCase of testCases) {
        console.log(`Testing ${testCase.host}:${testCase.port}...`);
        await testConnection(testCase.host, testCase.port);
        console.log('');
    }
    
    console.log('💡 If all connections failed, the backend server might not be running');
    console.log('💡 Check if server is running with: ps aux | grep node');
}

testMultiplePorts();