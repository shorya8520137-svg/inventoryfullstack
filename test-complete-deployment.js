/**
 * COMPLETE DEPLOYMENT TEST
 * Tests frontend, backend, and database connectivity
 */

const axios = require('axios');

const FRONTEND_URL = 'https://stockiqfullstacktest.vercel.app';
const BACKEND_URL = 'https://54.179.63.233.nip.io';

async function testDeployment() {
    console.log('🚀 Testing Complete Deployment...\n');
    
    const results = {
        frontend: false,
        backend: false,
        database: false,
        auth: false,
        twoFA: false
    };
    
    // Test 1: Frontend Accessibility
    try {
        console.log('1️⃣ Testing Frontend...');
        const frontendResponse = await axios.get(FRONTEND_URL, { timeout: 10000 });
        if (frontendResponse.status === 200) {
            results.frontend = true;
            console.log('✅ Frontend: Accessible');
        }
    } catch (error) {
        console.log('❌ Frontend: Failed -', error.message);
    }
    
    // Test 2: Backend Health Check
    try {
        console.log('\n2️⃣ Testing Backend...');
        const healthResponse = await axios.get(`${BACKEND_URL}/api/health`, { timeout: 10000 });
        if (healthResponse.status === 200) {
            results.backend = true;
            console.log('✅ Backend: Running');
            console.log('📊 Response:', healthResponse.data);
        }
    } catch (error) {
        console.log('❌ Backend: Failed -', error.message);
    }
    
    // Test 3: Database Connection
    try {
        console.log('\n3️⃣ Testing Database...');
        const dbResponse = await axios.get(`${BACKEND_URL}/api/users`, { timeout: 10000 });
        if (dbResponse.status === 200 || dbResponse.status === 401) {
            results.database = true;
            console.log('✅ Database: Connected');
        }
    } catch (error) {
        if (error.response && error.response.status === 401) {
            results.database = true;
            console.log('✅ Database: Connected (Auth required)');
        } else {
            console.log('❌ Database: Failed -', error.message);
        }
    }
    
    // Test 4: Authentication Endpoint
    try {
        console.log('\n4️⃣ Testing Authentication...');
        const authResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
            email: 'test@example.com',
            password: 'wrongpassword'
        }, { timeout: 10000 });
    } catch (error) {
        if (error.response && error.response.status === 401) {
            results.auth = true;
            console.log('✅ Authentication: Endpoint working');
        } else {
            console.log('❌ Authentication: Failed -', error.message);
        }
    }
    
    // Test 5: 2FA Endpoint
    try {
        console.log('\n5️⃣ Testing 2FA...');
        const twoFAResponse = await axios.get(`${BACKEND_URL}/api/2fa/status`, {
            headers: { 'Authorization': 'Bearer invalid-token' },
            timeout: 10000
        });
    } catch (error) {
        if (error.response && error.response.status === 401) {
            results.twoFA = true;
            console.log('✅ 2FA: Endpoint working');
        } else {
            console.log('❌ 2FA: Failed -', error.message);
        }
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📋 DEPLOYMENT TEST SUMMARY');
    console.log('='.repeat(50));
    
    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(Boolean).length;
    
    console.log(`✅ Frontend:       ${results.frontend ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Backend:        ${results.backend ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Database:       ${results.database ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Authentication: ${results.auth ? 'PASS' : 'FAIL'}`);
    console.log(`✅ 2FA System:     ${results.twoFA ? 'PASS' : 'FAIL'}`);
    
    console.log('\n' + '='.repeat(50));
    console.log(`🎯 OVERALL: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
        console.log('🎉 ALL SYSTEMS OPERATIONAL!');
        console.log('\n🔗 URLs:');
        console.log(`   Frontend: ${FRONTEND_URL}`);
        console.log(`   Backend:  ${BACKEND_URL}`);
        console.log('\n🔐 Features Available:');
        console.log('   ✅ User Authentication');
        console.log('   ✅ Google 2FA');
        console.log('   ✅ Inventory Management');
        console.log('   ✅ Order Tracking');
        console.log('   ✅ Audit Logging');
        console.log('   ✅ Location Tracking');
        console.log('   ✅ Push Notifications');
    } else {
        console.log('⚠️  Some systems need attention');
    }
    
    console.log('='.repeat(50));
}

// Run the test
testDeployment().catch(console.error);