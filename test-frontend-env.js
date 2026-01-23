/**
 * TEST FRONTEND ENVIRONMENT VARIABLES
 * This test checks what environment variables the frontend is actually using
 */

// Simulate Next.js environment loading
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env.production' });
require('dotenv').config({ path: '.env' });

console.log('🔍 FRONTEND ENVIRONMENT VARIABLE TEST');
console.log('=' .repeat(60));

console.log('📁 Environment Files Check:');
console.log('   .env.local exists:', require('fs').existsSync('.env.local'));
console.log('   .env.production exists:', require('fs').existsSync('.env.production'));
console.log('   .env exists:', require('fs').existsSync('.env'));

console.log('\n🌐 Environment Variables:');
console.log('   NEXT_PUBLIC_API_BASE:', process.env.NEXT_PUBLIC_API_BASE);
console.log('   NODE_ENV:', process.env.NODE_ENV);

console.log('\n📋 All NEXT_PUBLIC_ variables:');
Object.keys(process.env)
    .filter(key => key.startsWith('NEXT_PUBLIC_'))
    .forEach(key => {
        console.log(`   ${key}: ${process.env[key]}`);
    });

console.log('\n🧪 Testing API Connection with detected endpoint...');
const apiBase = process.env.NEXT_PUBLIC_API_BASE;

if (apiBase) {
    console.log(`🔗 Using API Base: ${apiBase}`);
    
    // Test the API endpoint
    const https = require('https');
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    
    const testLogin = () => {
        return new Promise((resolve, reject) => {
            const postData = JSON.stringify({
                email: 'admin@company.com',
                password: 'admin@123'
            });
            
            const url = new URL(`${apiBase}/api/auth/login`);
            
            const options = {
                hostname: url.hostname,
                port: url.port || 443,
                path: url.pathname,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                },
                rejectUnauthorized: false
            };
            
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        const result = JSON.parse(data);
                        resolve({ status: res.statusCode, data: result });
                    } catch (error) {
                        resolve({ status: res.statusCode, data: data, error: error.message });
                    }
                });
            });
            
            req.on('error', reject);
            req.write(postData);
            req.end();
        });
    };
    
    testLogin()
        .then(result => {
            console.log(`✅ API Test Result: Status ${result.status}`);
            if (result.data.success) {
                console.log('   ✅ Login successful - API is working!');
                console.log(`   📍 Confirmed API endpoint: ${apiBase}`);
            } else {
                console.log('   ❌ Login failed:', result.data.message || result.data);
            }
        })
        .catch(error => {
            console.log('   ❌ API connection failed:', error.message);
        });
        
} else {
    console.log('❌ NEXT_PUBLIC_API_BASE not found!');
}

console.log('\n' + '=' .repeat(60));