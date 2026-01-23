/**
 * Simple API Connection Test
 */

const https = require('https');

const API_BASE = 'https://16.171.5.50.nip.io';

console.log('🔗 Testing API Connection...\n');

async function testConnection() {
    return new Promise((resolve, reject) => {
        const url = `${API_BASE}/api/health`;
        
        const req = https.request(url, {
            method: 'GET',
            rejectUnauthorized: false
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`Status: ${res.statusCode}`);
                console.log(`Response: ${data}`);
                resolve({ status: res.statusCode, data });
            });
        });

        req.on('error', (error) => {
            console.log('❌ Connection error:', error.message);
            reject(error);
        });
        
        req.setTimeout(10000, () => {
            console.log('❌ Request timeout');
            req.destroy();
            reject(new Error('Timeout'));
        });
        
        req.end();
    });
}

async function testLogin() {
    return new Promise((resolve, reject) => {
        const url = `${API_BASE}/api/login`;
        const postData = JSON.stringify({
            email: 'admin@company.com',
            password: 'admin@123'
        });
        
        const req = https.request(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            },
            rejectUnauthorized: false
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`Login Status: ${res.statusCode}`);
                console.log(`Login Response: ${data}`);
                resolve({ status: res.statusCode, data });
            });
        });

        req.on('error', (error) => {
            console.log('❌ Login error:', error.message);
            reject(error);
        });
        
        req.setTimeout(10000, () => {
            console.log('❌ Login timeout');
            req.destroy();
            reject(new Error('Timeout'));
        });
        
        req.write(postData);
        req.end();
    });
}

async function runTests() {
    console.log('🧪 Testing API Connection and Login\n');
    
    try {
        console.log('1. Testing basic connection...');
        await testConnection();
        console.log('✅ Connection test completed\n');
    } catch (error) {
        console.log('❌ Connection failed, trying login directly...\n');
    }
    
    try {
        console.log('2. Testing login endpoint...');
        await testLogin();
        console.log('✅ Login test completed');
    } catch (error) {
        console.log('❌ Login test failed:', error.message);
    }
}

runTests().catch(console.error);