
// Test admin login directly
const https = require('https');

const loginData = {
    email: 'admin@company.com',
    password: 'admin@123'
};

const options = {
    hostname: '16.171.161.150.nip.io',
    port: 443,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};

console.log('🔐 Testing admin login...');

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log('📊 Response Status:', res.statusCode);
        console.log('📋 Response:', JSON.parse(data));
    });
});

req.on('error', (error) => {
    console.error('❌ Request failed:', error);
});

req.write(JSON.stringify(loginData));
req.end();
