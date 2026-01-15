// Test API Connection Script
const http = require('http');

const API_BASE = 'http://16.171.161.150:5000';

const endpoints = [
    '/',
    '/api/inventory?limit=10',
    '/api/products?page=1&limit=10',
    '/api/dispatch',
];

console.log('🔍 Testing API Connection...\n');
console.log(`API Base: ${API_BASE}\n`);

async function testEndpoint(endpoint) {
    return new Promise((resolve) => {
        const url = `${API_BASE}${endpoint}`;
        console.log(`Testing: ${url}`);
        
        const req = http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`✅ Status: ${res.statusCode}`);
                console.log(`Response: ${data.substring(0, 100)}...\n`);
                resolve({ success: true, status: res.statusCode });
            });
        });
        
        req.on('error', (err) => {
            console.log(`❌ Error: ${err.message}\n`);
            resolve({ success: false, error: err.message });
        });
        
        req.setTimeout(5000, () => {
            req.destroy();
            console.log(`❌ Timeout\n`);
            resolve({ success: false, error: 'Timeout' });
        });
    });
}

(async () => {
    for (const endpoint of endpoints) {
        await testEndpoint(endpoint);
    }
    console.log('✅ Test Complete');
})();
