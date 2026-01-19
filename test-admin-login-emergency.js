const https = require('https');

// Ignore SSL certificate errors for testing
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const API_BASE = 'https://13.48.248.180.nip.io/api';

console.log('🚨 EMERGENCY ADMIN LOGIN TEST');
console.log('='.repeat(50));

async function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });
        
        req.on('error', reject);
        
        if (options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
}

async function testAdminLogin() {
    try {
        console.log('🔐 Testing ADMIN login...');
        
        const loginData = {
            email: 'admin@company.com',
            password: 'admin@123'
        };

        const response = await makeRequest(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        console.log(`📊 Login Response Status: ${response.status}`);
        
        if (response.status === 200 && response.data.success) {
            console.log('✅ ADMIN LOGIN SUCCESS!');
            console.log(`👤 User: ${response.data.user.name} (${response.data.user.email})`);
            console.log(`🎭 Role: ${response.data.user.role_name} (ID: ${response.data.user.role_id})`);
            console.log(`🔑 Permissions Count: ${response.data.user.permissions.length}`);
            
            if (response.data.user.permissions.length > 0) {
                console.log('📋 First 10 Permissions:');
                response.data.user.permissions.slice(0, 10).forEach((perm, index) => {
                    console.log(`   ${index + 1}. ${perm.name} (${perm.display_name})`);
                });
                if (response.data.user.permissions.length > 10) {
                    console.log(`   ... and ${response.data.user.permissions.length - 10} more`);
                }
            } else {
                console.log('❌ STILL ZERO PERMISSIONS - DATABASE ISSUE!');
            }
            
            return response.data.token;
        } else {
            console.log('❌ ADMIN LOGIN FAILED');
            console.log('Response:', response.data);
            return null;
        }
        
    } catch (error) {
        console.error('❌ Admin login test failed:', error.message);
        return null;
    }
}

async function runTest() {
    console.log('🚀 Testing admin login...\n');
    
    const token = await testAdminLogin();
    
    console.log('\n' + '='.repeat(50));
    
    if (token) {
        console.log('🎉 ADMIN LOGIN WORKING!');
    } else {
        console.log('❌ ADMIN LOGIN STILL BROKEN');
        console.log('Need to fix database permissions');
    }
}

runTest().catch(console.error);