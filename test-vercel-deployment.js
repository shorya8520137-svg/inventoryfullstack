/**
 * TEST VERCEL DEPLOYMENT
 * Test if the production deployment is using the correct API endpoint
 */

const https = require('https');

console.log('🚀 TESTING VERCEL PRODUCTION DEPLOYMENT');
console.log('=' .repeat(60));

const PRODUCTION_URL = 'https://stockiqfullstacktest.vercel.app';

async function testProductionApiDebug() {
    console.log('1️⃣ Testing production API debug page...');
    
    return new Promise((resolve, reject) => {
        const req = https.request(`${PRODUCTION_URL}/api-debug`, {
            method: 'GET'
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                console.log(`   📊 Status: ${res.statusCode}`);
                
                if (data.includes('16.171.5.50.nip.io')) {
                    console.log('   ✅ Production shows NEW IP');
                    if (data.includes('✅ CORRECT - Using NEW IP')) {
                        console.log('   ✅ Status: CORRECT');
                        resolve(true);
                    } else {
                        console.log('   ⚠️ Status unclear');
                        resolve(false);
                    }
                } else if (data.includes('16.171.196.15')) {
                    console.log('   ❌ Production shows OLD IP');
                    console.log('   🔧 Need to update Vercel environment variables');
                    resolve(false);
                } else {
                    console.log('   ⚠️ Could not determine API from production');
                    console.log('   Raw response preview:', data.substring(0, 200));
                    resolve(false);
                }
            });
        });
        
        req.on('error', (error) => {
            console.log('   ❌ Could not reach production:', error.message);
            resolve(false);
        });
        
        req.setTimeout(10000, () => {
            console.log('   ❌ Production request timeout');
            req.destroy();
            resolve(false);
        });
        
        req.end();
    });
}

async function testProductionLogin() {
    console.log('\n2️⃣ Testing production login functionality...');
    
    // First, let's see what API the production is trying to use
    console.log('   🔍 Checking production login page...');
    
    return new Promise((resolve, reject) => {
        const req = https.request(`${PRODUCTION_URL}/login`, {
            method: 'GET'
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                console.log(`   📊 Login page status: ${res.statusCode}`);
                
                // Check if the page loads successfully
                if (res.statusCode === 200) {
                    console.log('   ✅ Production login page loads');
                    
                    // Look for any API references in the HTML
                    if (data.includes('16.171.5.50')) {
                        console.log('   ✅ Page contains NEW IP reference');
                    } else if (data.includes('16.171.196.15')) {
                        console.log('   ❌ Page contains OLD IP reference');
                    }
                    
                    resolve(true);
                } else {
                    console.log('   ❌ Production login page failed to load');
                    resolve(false);
                }
            });
        });
        
        req.on('error', (error) => {
            console.log('   ❌ Could not reach production login:', error.message);
            resolve(false);
        });
        
        req.setTimeout(10000, () => {
            console.log('   ❌ Production login request timeout');
            req.destroy();
            resolve(false);
        });
        
        req.end();
    });
}

async function runProductionTest() {
    console.log(`🌐 Production URL: ${PRODUCTION_URL}`);
    
    const apiDebugCorrect = await testProductionApiDebug();
    const loginPageWorks = await testProductionLogin();
    
    console.log('\n' + '=' .repeat(60));
    console.log('📊 PRODUCTION TEST RESULTS:');
    console.log(`   API Debug Page: ${apiDebugCorrect ? '✅ Correct' : '❌ Wrong'}`);
    console.log(`   Login Page: ${loginPageWorks ? '✅ Loads' : '❌ Failed'}`);
    
    if (apiDebugCorrect) {
        console.log('\n🎉 SUCCESS: Production is using the correct API endpoint!');
        console.log('\n📋 Manual Verification:');
        console.log(`1. Visit: ${PRODUCTION_URL}/api-debug`);
        console.log('2. Should show: https://16.171.5.50.nip.io');
        console.log(`3. Visit: ${PRODUCTION_URL}/login`);
        console.log('4. Try login: admin@company.com / admin@123');
        console.log('5. Should connect to new API server');
    } else {
        console.log('\n❌ ISSUE: Production might be using wrong API endpoint');
        console.log('\n🔧 FIX REQUIRED:');
        console.log('1. Go to Vercel Dashboard');
        console.log('2. Project: stockiqfullstacktest');
        console.log('3. Settings > Environment Variables');
        console.log('4. Update NEXT_PUBLIC_API_BASE to: https://16.171.5.50.nip.io');
        console.log('5. Redeploy the project');
    }
    
    console.log(`\n🔗 Production URLs:`);
    console.log(`   Main: ${PRODUCTION_URL}`);
    console.log(`   API Debug: ${PRODUCTION_URL}/api-debug`);
    console.log(`   Login: ${PRODUCTION_URL}/login`);
}

runProductionTest();