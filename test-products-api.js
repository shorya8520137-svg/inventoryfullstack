// Test Products API
const https = require('https');

const API_BASE = 'https://16.171.161.150.nip.io';

console.log('🧪 Testing Products API...\n');

// Test 1: Get all products
https.get(`${API_BASE}/api/products?page=1&limit=20`, { rejectUnauthorized: false }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('📊 GET /api/products');
        console.log('Status:', res.statusCode);
        const json = JSON.parse(data);
        console.log('Response:', JSON.stringify(json, null, 2));
        console.log('\n✅ Products count:', json.data?.products?.length || 0);
        console.log('✅ Total in DB:', json.data?.pagination?.total || 0);
        
        if (json.data?.products?.length === 0) {
            console.log('\n⚠️  DATABASE IS EMPTY - No products found!');
            console.log('💡 You need to add products to the database first.');
        }
    });
}).on('error', (err) => {
    console.error('❌ Error:', err.message);
});
