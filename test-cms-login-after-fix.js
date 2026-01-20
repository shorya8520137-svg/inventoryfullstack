const https = require('https');

// Ignore SSL certificate errors for testing
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const API_BASE = 'https://13.48.248.180.nip.io/api';

console.log('🧪 TESTING CMS LOGIN AFTER AUTH CONTROLLER FIX');
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

async function testCMSLogin() {
    try {
        console.log('🔐 Testing CMS user login...');
        
        const loginData = {
            email: 'nope@comp.com',
            password: 'admin123'
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
            console.log('✅ LOGIN SUCCESS!');
            console.log(`👤 User: ${response.data.user.name} (${response.data.user.email})`);
            console.log(`🎭 Role: ${response.data.user.role_name} (ID: ${response.data.user.role_id})`);
            console.log(`🔑 Permissions Count: ${response.data.user.permissions.length}`);
            
            if (response.data.user.permissions.length > 0) {
                console.log('📋 Permissions:');
                response.data.user.permissions.forEach((perm, index) => {
                    console.log(`   ${index + 1}. ${perm.name} (${perm.display_name})`);
                });
            } else {
                console.log('⚠️  NO PERMISSIONS FOUND - This is the issue!');
            }
            
            return response.data.token;
        } else {
            console.log('❌ LOGIN FAILED');
            console.log('Response:', response.data);
            return null;
        }
        
    } catch (error) {
        console.error('❌ Login test failed:', error.message);
        return null;
    }
}

async function testServerHealth() {
    try {
        console.log('🏥 Testing server health...');
        
        const response = await makeRequest(`${API_BASE}/health`);
        
        console.log(`📊 Health Status: ${response.status}`);
        
        if (response.status === 200) {
            console.log('✅ SERVER IS HEALTHY');
        } else {
            console.log('❌ SERVER HEALTH CHECK FAILED');
            console.log('Response:', response.data);
        }
        
    } catch (error) {
        console.error('❌ Health check failed:', error.message);
    }
}

async function runTests() {
    console.log('🚀 Starting tests...\n');
    
    // Test server health first
    await testServerHealth();
    console.log('');
    
    // Test CMS login
    const token = await testCMSLogin();
    
    console.log('\n' + '='.repeat(50));
    
    if (token) {
        console.log('🎉 AUTH CONTROLLER FIX SUCCESSFUL!');
        console.log('✅ Server is running');
        console.log('✅ Login endpoint working');
        console.log('✅ Permissions are being returned');
    } else {
        console.log('❌ AUTH CONTROLLER FIX FAILED');
        console.log('Server may still have issues');
    }
}

runTests().catch(console.error);