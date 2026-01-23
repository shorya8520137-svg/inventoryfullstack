/**
 * TEST PRODUCTION LOGIN PAGE
 * Check what's actually deployed on Vercel
 */

const https = require('https');

console.log('🔍 TESTING PRODUCTION LOGIN PAGE');
console.log('=' .repeat(60));

async function testProductionLogin() {
    return new Promise((resolve, reject) => {
        const req = https.request('https://stockiqfullstacktest.vercel.app/login', {
            method: 'GET'
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                console.log(`📊 Status: ${res.statusCode}`);
                
                // Check for SSL content
                if (data.includes('SSL Certificate Setup')) {
                    console.log('❌ FOUND: SSL Certificate Setup section');
                    console.log('🔍 This means the old code is still deployed');
                } else {
                    console.log('✅ CLEAN: No SSL Certificate Setup found');
                }
                
                // Check for demo credentials
                if (data.includes('admin@company.com')) {
                    console.log('❌ FOUND: Demo credentials still visible');
                } else {
                    console.log('✅ CLEAN: No demo credentials found');
                }
                
                // Check for nip.io references
                if (data.includes('nip.io')) {
                    console.log('❌ FOUND: nip.io references in HTML');
                } else {
                    console.log('✅ CLEAN: No nip.io references found');
                }
                
                console.log('\n📋 RECOMMENDATIONS:');
                if (data.includes('SSL Certificate Setup') || data.includes('admin@company.com')) {
                    console.log('1. Clear browser cache (Ctrl+F5)');
                    console.log('2. Try incognito/private browsing mode');
                    console.log('3. Check if you\'re on the correct URL');
                    console.log('4. Wait a few minutes for Vercel cache to clear');
                } else {
                    console.log('✅ Production login page is clean!');
                }
                
                resolve();
            });
        });
        
        req.on('error', (error) => {
            console.log('❌ Could not reach production:', error.message);
            resolve();
        });
        
        req.end();
    });
}

testProductionLogin();