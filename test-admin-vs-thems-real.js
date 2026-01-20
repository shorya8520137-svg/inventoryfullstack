// TEST ADMIN VS THEMS USER - CORRECT SERVER URL
require('dotenv').config();
const https = require('https');

// CORRECT SERVER URL
const API_BASE = 'https://16.171.197.86.nip.io';

const ADMIN_USER = {
    email: 'admin@company.com',
    password: 'admin@123'
};

const THEMS_USER = {
    email: 'thems@company.com',
    password: 'gfx998sd'
};

async function testBothUsersReal() {
    console.log('🧪 TESTING ADMIN VS THEMS - CORRECT SERVER');
    console.log('==========================================');

    console.log(`🎯 USING SERVER: ${API_BASE}`);
    
    // Test both users
    console.log('\n1️⃣ TESTING ADMIN USER');
    console.log('====================');
    const adminResult = await testUser(ADMIN_USER, 'ADMIN', API_BASE);
    
    console.log('\n2️⃣ TESTING THEMS USER');
    console.log('====================');
    const themsResult = await testUser(THEMS_USER, 'THEMS', API_BASE);
    
    // Summary
    console.log('\n📊 FINAL RESULTS');
    console.log('================');
    console.log(`Admin Login: ${adminResult.login ? '✅' : '❌'}`);
    console.log(`Admin Products API: ${adminResult.products ? '✅' : '❌'}`);
    console.log(`Admin Dispatch API: ${adminResult.dispatch ? '✅' : '❌'}`);
    console.log('');
    console.log(`Thems Login: ${themsResult.login ? '✅' : '❌'}`);
    console.log(`Thems Products API: ${themsResult.products ? '✅' : '❌'}`);
    console.log(`Thems Dispatch API: ${themsResult.dispatch ? '✅' : '❌'}`);
    
    if (adminResult.login && adminResult.products && !themsResult.products) {
        console.log('\n🎯 ISSUE CONFIRMED!');
        console.log('Admin works fine, Thems gets 403 errors');
        console.log('This is definitely a permissions system issue');
    }
}

async function testUser(credentials, userType, baseUrl) {
    const result = { login: false, products: false, dispatch: false };
    let token = null;
    
    const agent = baseUrl.startsWith('https') ? new https.Agent({ rejectUnauthorized: false }) : undefined;
    
    try {
        // Test 1: Login
        console.log(`🔐 Logging in ${userType}...`);
        const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
            agent: agent
        });
        
        const loginData = await loginResponse.json();
        
        if (loginResponse.ok && loginData.token) {
            result.login = true;
            token = loginData.token;
            console.log(`✅ ${userType} login successful`);
            console.log(`   Role: ${loginData.user.role}`);
            console.log(`   Permissions: ${loginData.user.permissions?.length || 0}`);
        } else {
            console.log(`❌ ${userType} login failed: ${loginData.message}`);
            return result;
        }
        
        // Test 2: Products API
        console.log(`📦 Testing products API...`);
        try {
            const productsResponse = await fetch(`${baseUrl}/api/products?page=1&limit=5`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                agent: agent
            });
            
            if (productsResponse.ok) {
                result.products = true;
                console.log(`✅ ${userType} products API working`);
            } else {
                const errorData = await productsResponse.json();
                console.log(`❌ ${userType} products API failed: ${productsResponse.status}`);
                console.log(`   Error: ${errorData.message || 'Unknown error'}`);
                if (productsResponse.status === 403) {
                    console.log(`   🚫 PERMISSION DENIED!`);
                }
            }
        } catch (error) {
            console.log(`❌ ${userType} products API error: ${error.message}`);
        }
        
        // Test 3: Dispatch API (only if products work)
        if (result.products) {
            console.log(`🚚 Testing dispatch creation...`);
            try {
                const dispatchData = {
                    orderNumber: `TEST-${userType}-${Date.now()}`,
                    customerName: 'Test Customer',
                    customerPhone: '1234567890',
                    warehouse: 'MAIN',
                    products: [
                        {
                            productCode: 'TEST001',
                            productName: 'Test Product',
                            quantity: 1
                        }
                    ]
                };
                
                const dispatchResponse = await fetch(`${baseUrl}/api/dispatch`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dispatchData),
                    agent: agent
                });
                
                if (dispatchResponse.ok) {
                    result.dispatch = true;
                    console.log(`✅ ${userType} dispatch created successfully`);
                } else {
                    const errorData = await dispatchResponse.json();
                    console.log(`❌ ${userType} dispatch failed: ${dispatchResponse.status}`);
                    console.log(`   Error: ${errorData.message || 'Unknown error'}`);
                }
            } catch (error) {
                console.log(`❌ ${userType} dispatch error: ${error.message}`);
            }
        } else {
            console.log(`⏭️  Skipping dispatch test (products API not working)`);
        }
        
    } catch (error) {
        console.log(`❌ ${userType} general error: ${error.message}`);
    }
    
    return result;
}

// Run the test
testBothUsersReal().catch(console.error);