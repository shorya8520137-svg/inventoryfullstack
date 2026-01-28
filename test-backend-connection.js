// Test Backend Connection
const https = require('https');

const backendUrl = 'https://54.169.107.64:8443';

console.log('🔧 Testing Backend Connection...');
console.log(`📡 Backend URL: ${backendUrl}`);

// Test 1: Basic connection
console.log('\n1️⃣ Testing basic connection...');
const testBasic = () => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: '54.169.107.64',
            port: 8443,
            path: '/',
            method: 'GET',
            rejectUnauthorized: false, // Accept self-signed certificates
            timeout: 10000
        };

        const req = https.request(options, (res) => {
            console.log(`✅ Connection successful! Status: ${res.statusCode}`);
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                console.log('📋 Response:', data.substring(0, 200));
                resolve(res.statusCode);
            });
        });

        req.on('error', (err) => {
            console.log(`❌ Connection failed: ${err.message}`);
            reject(err);
        });

        req.on('timeout', () => {
            console.log('❌ Connection timeout');
            req.destroy();
            reject(new Error('Timeout'));
        });

        req.end();
    });
};

// Test 2: Login API
console.log('\n2️⃣ Testing login API...');
const testLogin = () => {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            email: 'admin@company.com',
            password: 'Admin@123'
        });

        const options = {
            hostname: '54.169.107.64',
            port: 8443,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            },
            rejectUnauthorized: false,
            timeout: 10000
        };

        const req = https.request(options, (res) => {
            console.log(`✅ Login API Status: ${res.statusCode}`);
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    if (response.success) {
                        console.log('✅ Login successful!');
                        console.log('👤 User:', response.user.name);
                        console.log('🔑 Token received:', response.token ? 'Yes' : 'No');
                    } else {
                        console.log('❌ Login failed:', response.message);
                    }
                } catch (e) {
                    console.log('📋 Raw response:', data);
                }
                resolve(res.statusCode);
            });
        });

        req.on('error', (err) => {
            console.log(`❌ Login API failed: ${err.message}`);
            reject(err);
        });

        req.on('timeout', () => {
            console.log('❌ Login API timeout');
            req.destroy();
            reject(new Error('Timeout'));
        });

        req.write(postData);
        req.end();
    });
};

// Run tests
async function runTests() {
    try {
        await testBasic();
        await testLogin();
        console.log('\n✅ All tests completed!');
    } catch (error) {
        console.log('\n❌ Tests failed:', error.message);
        console.log('\n🔧 Possible solutions:');
        console.log('1. Check if backend server is running on port 8443');
        console.log('2. Check firewall settings for port 8443');
        console.log('3. Verify SSL certificate configuration');
        console.log('4. Try HTTP instead of HTTPS');
    }
}

runTests();