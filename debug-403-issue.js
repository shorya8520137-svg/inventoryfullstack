// DEBUG 403 ISSUE - CHECK WHAT'S HAPPENING
const https = require('https');

const SERVER_URL = 'https://16.171.197.86.nip.io';

// Test credentials
const THEMS_CREDS = {
    email: 'thems@company.com',
    password: 'gfx998sd'
};

// Make HTTP request with detailed logging
function makeRequest(method, path, data = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, SERVER_URL);
        
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Debug-Script/1.0'
            },
            rejectUnauthorized: false
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        console.log(`🔍 Making ${method} request to: ${url}`);
        console.log(`📋 Headers:`, options.headers);

        const req = https.request(url, options, (res) => {
            let responseData = '';
            
            console.log(`📊 Response Status: ${res.statusCode}`);
            console.log(`📋 Response Headers:`, res.headers);
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(responseData);
                    console.log(`📦 Response Data:`, jsonData);
                    resolve({
                        status: res.statusCode,
                        data: jsonData,
                        headers: res.headers
                    });
                } catch (e) {
                    console.log(`📦 Raw Response:`, responseData);
                    resolve({
                        status: res.statusCode,
                        data: responseData,
                        headers: res.headers
                    });
                }
            });
        });

        req.on('error', (error) => {
            console.log(`❌ Request Error:`, error.message);
            reject(error);
        });

        if (data) {
            const jsonData = JSON.stringify(data);
            console.log(`📤 Request Body:`, jsonData);
            req.write(jsonData);
        }
        
        req.end();
    });
}

async function debugThemsUser() {
    console.log('🔍 DEBUGGING THEMS USER 403 ISSUE');
    console.log('==================================');
    
    try {
        // 1. Login
        console.log('\n1️⃣ STEP 1: LOGIN');
        console.log('------------------');
        const loginResponse = await makeRequest('POST', '/api/auth/login', THEMS_CREDS);
        
        if (loginResponse.status !== 200) {
            console.log(`❌ Login failed: ${loginResponse.status}`);
            return;
        }
        
        const token = loginResponse.data.token;
        console.log(`✅ Login successful - Token: ${token.substring(0, 20)}...`);
        
        // 2. Test Products API with detailed logging
        console.log('\n2️⃣ STEP 2: TEST PRODUCTS API');
        console.log('-----------------------------');
        const productsResponse = await makeRequest('GET', '/api/products?page=1&limit=5', null, token);
        
        if (productsResponse.status === 403) {
            console.log('🎯 FOUND THE 403 ERROR!');
            console.log('Error details:', productsResponse.data);
            
            // Check if it's a permission error
            if (productsResponse.data.message && productsResponse.data.message.includes('permission')) {
                console.log('🔒 This is a PERMISSION ERROR');
                console.log('Required permission:', productsResponse.data.required_permission);
                console.log('User role:', productsResponse.data.user_role);
            } else if (productsResponse.data.message && productsResponse.data.message.includes('token')) {
                console.log('🎫 This is a TOKEN ERROR');
            } else {
                console.log('❓ Unknown 403 error type');
            }
        } else {
            console.log(`✅ Products API: ${productsResponse.status}`);
        }
        
        // 3. Test Categories API
        console.log('\n3️⃣ STEP 3: TEST CATEGORIES API');
        console.log('-------------------------------');
        const categoriesResponse = await makeRequest('GET', '/api/products/categories/all', null, token);
        
        if (categoriesResponse.status === 403) {
            console.log('🎯 Categories API also returns 403');
            console.log('Error details:', categoriesResponse.data);
        } else {
            console.log(`✅ Categories API: ${categoriesResponse.status}`);
        }
        
        // 4. Test a different API to see if it's product-specific
        console.log('\n4️⃣ STEP 4: TEST INVENTORY API');
        console.log('------------------------------');
        const inventoryResponse = await makeRequest('GET', '/api/inventory?limit=5', null, token);
        
        if (inventoryResponse.status === 403) {
            console.log('🎯 Inventory API also returns 403 - This is a GLOBAL permission issue');
        } else {
            console.log(`✅ Inventory API works: ${inventoryResponse.status}`);
            console.log('🎯 This means the issue is SPECIFIC to product routes');
        }
        
    } catch (error) {
        console.log(`❌ Debug error:`, error.message);
    }
}

// Run the debug
if (require.main === module) {
    debugThemsUser().catch(console.error);
}

module.exports = { debugThemsUser };