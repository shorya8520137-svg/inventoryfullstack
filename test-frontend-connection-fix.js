/**
 * TEST FRONTEND CONNECTION FIX
 * Verify that the frontend is now connecting to the correct API endpoint
 */

const https = require('https');

// Test both endpoints to compare
const OLD_API = 'https://16.171.196.15.nip.io';
const NEW_API = 'https://16.171.5.50.nip.io';
const FRONTEND_URL = 'https://stockiqfullstacktest.vercel.app';

// Disable SSL verification for testing
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

async function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        console.log(`🔗 Testing: ${url}`);
        
        const req = https.request(url, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            rejectUnauthorized: false,
            timeout: 10000
        }, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    data: data,
                    success: res.statusCode < 400
                });
            });
        });
        
        req.on('error', (error) => {
            resolve({
                statusCode: 0,
                error: error.message,
                success: false
            });
        });
        
        req.on('timeout', () => {
            req.destroy();
            resolve({
                statusCode: 0,
                error: 'Request timeout',
                success: false
            });
        });
        
        if (options.body) {
            req.write(JSON.stringify(options.body));
        }
        
        req.end();
    });
}

async function testFrontendConnectionFix() {
    console.log('🔧 Testing Frontend Connection Fix');
    console.log('=' .repeat(60));
    
    // Test 1: Check old API (should be unreachable or different)
    console.log('\n1️⃣ Testing OLD API endpoint...');
    const oldApiTest = await makeRequest(`${OLD_API}/api/auth/login`, {
        method: 'POST',
        body: { email: 'admin@company.com', password: 'admin@123' }
    });
    
    if (oldApiTest.success) {
        console.log('⚠️ Old API is still responding - this might cause confusion');
    } else {
        console.log('✅ Old API is not responding (expected)');
    }
    
    // Test 2: Check new API (should work)
    console.log('\n2️⃣ Testing NEW API endpoint...');
    const newApiTest = await makeRequest(`${NEW_API}/api/auth/login`, {
        method: 'POST',
        body: { email: 'admin@company.com', password: 'admin@123' }
    });
    
    if (newApiTest.success) {
        console.log('✅ New API is responding correctly');
        
        // Parse response to check for token
        try {
            const responseData = JSON.parse(newApiTest.data);
            if (responseData.success && responseData.token) {
                console.log('✅ Login successful with token');
            } else {
                console.log('⚠️ Login response format unexpected');
            }
        } catch (e) {
            console.log('⚠️ Could not parse login response');
        }
    } else {
        console.log('❌ New API is not responding');
        console.log(`   Error: ${newApiTest.error}`);
    }
    
    // Test 3: Check frontend accessibility
    console.log('\n3️⃣ Testing Frontend accessibility...');
    const frontendTest = await makeRequest(FRONTEND_URL);
    
    if (frontendTest.success) {
        console.log('✅ Frontend is accessible');
    } else {
        console.log('❌ Frontend is not accessible');
        console.log(`   Error: ${frontendTest.error}`);
    }
    
    // Test 4: Instructions for user
    console.log('\n4️⃣ User Instructions:');
    console.log('=' .repeat(60));
    
    if (newApiTest.success) {
        console.log('🎉 API Update Successful!');
        console.log('');
        console.log('📋 Next Steps:');
        console.log('1. Clear your browser cache (Ctrl+Shift+Delete)');
        console.log('2. Go to: https://stockiqfullstacktest.vercel.app');
        console.log('3. Try logging in with: admin@company.com / admin@123');
        console.log('4. If you still see the old IP error, try:');
        console.log('   - Hard refresh (Ctrl+F5)');
        console.log('   - Open in incognito/private mode');
        console.log('   - Wait 2-3 minutes for CDN cache to clear');
        console.log('');
        console.log('🔧 If SSL certificate error appears:');
        console.log('1. Click "Advanced" or "Show Details"');
        console.log('2. Click "Proceed to 16.171.5.50.nip.io (unsafe)"');
        console.log('3. Accept the certificate');
        console.log('4. Return to the login page and try again');
    } else {
        console.log('❌ API Update Failed!');
        console.log('');
        console.log('🔧 Troubleshooting:');
        console.log('1. Check if server is running on 16.171.5.50');
        console.log('2. Verify firewall/security group settings');
        console.log('3. Ensure HTTPS is properly configured');
        console.log('4. Check server logs for errors');
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('🏁 Frontend Connection Test Complete');
}

// Run the test
testFrontendConnectionFix();