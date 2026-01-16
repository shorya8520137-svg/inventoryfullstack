const https = require('https');
const http = require('http');

// Test data
const loginData = {
    email: 'admin@company.com',
    password: 'admin@123'
};

const postData = JSON.stringify(loginData);

// Test localhost first
const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log('🔐 Testing JWT Login API...');
console.log('Request data:', loginData);

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('Response:', data);
        try {
            const response = JSON.parse(data);
            if (response.success) {
                console.log('✅ Login successful!');
                console.log('Token:', response.token.substring(0, 50) + '...');
                console.log('User:', response.user.name);
                console.log('Role:', response.user.role);
                console.log('Permissions count:', response.user.permissions.length);
            } else {
                console.log('❌ Login failed:', response.message);
            }
        } catch (e) {
            console.log('❌ Failed to parse response:', e.message);
        }
    });
});

req.on('error', (e) => {
    console.error('❌ Request error:', e.message);
});

req.write(postData);
req.end();