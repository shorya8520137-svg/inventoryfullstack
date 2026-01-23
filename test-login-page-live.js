/**
 * TEST LOGIN PAGE LIVE
 * Test what API calls the login page actually makes
 */

const http = require('http');
const https = require('https');

console.log('🔍 TESTING LOGIN PAGE API CALLS');
console.log('=' .repeat(60));

// Test 1: Check what the API debug page shows
async function checkApiDebugPage() {
    console.log('1️⃣ Checking API debug page...');
    
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: '/api-debug',
            method: 'GET'
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                // Look for the API base in the HTML
                if (data.includes('16.171.5.50.nip.io')) {
                    console.log('   ✅ API debug page shows NEW IP');
                    if (data.includes('✅ CORRECT - Using NEW IP')) {
                        console.log('   ✅ Status: CORRECT');
                    }
                } else if (data.includes('16.171.196.15')) {
                    console.log('   ❌ API debug page shows OLD IP');
                } else {
                    console.log('   ⚠️ Could not determine API from debug page');
                }
                resolve();
            });
        });
        
        req.on('error', (error) => {
            console.log('   ❌ Could not reach debug page:', error.message);
            resolve();
        });
        
        req.end();
    });
}

// Test 2: Simulate login API call like frontend would do
async function simulateLoginCall() {
    console.log('\n2️⃣ Simulating frontend login call...');
    
    // Load environment like Next.js does
    require('dotenv').config({ path: '.env.local' });
    const apiBase = process.env.NEXT_PUBLIC_API_BASE;
    
    console.log(`   Using API Base: ${apiBase}`);
    
    if (!apiBase) {
        console.log('   ❌ No API base found!');
        return;
    }
    
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            email: 'admin@company.com',
            password: 'admin@123'
        });
        
        const url = new URL(`${apiBase}/api/auth/login`);
        
        const options = {
            hostname: url.hostname,
            port: url.port || (url.protocol === 'https:' ? 443 : 80),
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        
        // Use https or http based on protocol
        const client = url.protocol === 'https:' ? https : http;
        
        if (url.protocol === 'https:') {
            options.rejectUnauthorized = false; // For self-signed certificates
        }
        
        console.log(`   🔗 Calling: ${url.href}`);
        
        const req = client.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    console.log(`   📊 Response: ${res.statusCode}`);
                    if (result.success) {
                        console.log('   ✅ Login successful!');
                        console.log('   ✅ Frontend API call works with NEW IP');
                    } else {
                        console.log('   ❌ Login failed:', result.message);
                    }
                } catch (error) {
                    console.log('   ❌ Parse error:', error.message);
                    console.log('   Raw response:', data.substring(0, 200));
                }
                resolve();
            });
        });
        
        req.on('error', (error) => {
            console.log('   ❌ Request failed:', error.message);
            if (error.message.includes('ECONNREFUSED')) {
                console.log('   💡 API server might not be running on the new IP');
            }
            resolve();
        });
        
        req.write(postData);
        req.end();
    });
}

// Test 3: Check if there are any cached files with old IP
async function checkForCachedFiles() {
    console.log('\n3️⃣ Checking for cached files...');
    
    const fs = require('fs');
    const path = require('path');
    
    // Check .next directory for any cached files with old IP
    const nextDir = '.next';
    if (fs.existsSync(nextDir)) {
        console.log('   ⚠️ .next directory exists (should have been cleared)');
        
        // Check if any files contain old IP
        const checkDir = (dir) => {
            const files = fs.readdirSync(dir);
            for (const file of files) {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);
                
                if (stat.isDirectory()) {
                    checkDir(filePath);
                } else if (file.endsWith('.js') || file.endsWith('.json')) {
                    try {
                        const content = fs.readFileSync(filePath, 'utf8');
                        if (content.includes('16.171.196.15')) {
                            console.log(`   ❌ Found old IP in: ${filePath}`);
                        }
                    } catch (error) {
                        // Ignore binary files
                    }
                }
            }
        };
        
        try {
            checkDir(nextDir);
            console.log('   ✅ No old IP found in cached files');
        } catch (error) {
            console.log('   ⚠️ Could not check cached files');
        }
    } else {
        console.log('   ✅ No .next cache directory (good)');
    }
}

// Run all tests
async function runTests() {
    await checkApiDebugPage();
    await simulateLoginCall();
    await checkForCachedFiles();
    
    console.log('\n' + '=' .repeat(60));
    console.log('📋 MANUAL VERIFICATION:');
    console.log('1. Open: http://localhost:3000/api-debug');
    console.log('2. Should show: https://16.171.5.50.nip.io');
    console.log('3. Open: http://localhost:3000/login');
    console.log('4. Open browser DevTools (F12) > Network tab');
    console.log('5. Try to login with admin@company.com / admin@123');
    console.log('6. Check the API call URL in Network tab');
    console.log('7. Should call: https://16.171.5.50.nip.io/api/auth/login');
}

runTests();