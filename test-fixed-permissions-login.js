const https = require('https');

// Ignore SSL certificate errors for testing
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const API_BASE = 'https://13.48.248.180.nip.io/api';

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

async function testFixedPermissionsLogin() {
    console.log('🧪 TESTING FIXED PERMISSIONS LOGIN');
    console.log('==================================');
    
    try {
        // Test login with the CMS user
        console.log('🔐 Testing CMS user login...');
        const loginResponse = await makeRequest(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'nope@comp.com',
                password: 'admin123'
            })
        });
        
        if (loginResponse.status !== 200) {
            console.log('❌ Login failed:', loginResponse.data);
            return;
        }
        
        const user = loginResponse.data.user;
        console.log('✅ Login successful!');
        console.log('');
        console.log('📊 USER DETAILS:');
        console.log('================');
        console.log(`ID: ${user.id}`);
        console.log(`Name: ${user.name}`);
        console.log(`Email: ${user.email}`);
        console.log(`Role ID: ${user.role_id}`);
        console.log(`Role Name: ${user.role_name}`);
        console.log(`Role Display: ${user.role_display_name}`);
        console.log(`Permissions Count: ${user.permissions ? user.permissions.length : 0}`);
        
        if (user.permissions && user.permissions.length > 0) {
            console.log('');
            console.log('🔐 PERMISSIONS DETAILS:');
            console.log('=======================');
            user.permissions.forEach((perm, index) => {
                console.log(`${index + 1}. ${perm.name}`);
                console.log(`   Display: ${perm.display_name}`);
                console.log(`   Category: ${perm.category}`);
                console.log('');
            });
            
            console.log('✅ SUCCESS! Permissions are now properly loaded');
            console.log('The frontend should now show the correct permission count');
            
        } else {
            console.log('❌ STILL NO PERMISSIONS!');
            console.log('The fix did not work. Check the auth controller deployment.');
        }
        
        // Test API access with the token
        console.log('🧪 TESTING API ACCESS:');
        console.log('======================');
        
        const token = loginResponse.data.token;
        const apiTests = [
            { name: 'Products API', endpoint: '/products?limit=3' },
            { name: 'Inventory API', endpoint: '/inventory?limit=3' },
            { name: 'Dispatch API', endpoint: '/dispatch?limit=3' }
        ];
        
        for (const test of apiTests) {
            const response = await makeRequest(`${API_BASE}${test.endpoint}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const status = response.status === 200 ? '✅' : '❌';
            console.log(`${status} ${test.name}: ${response.status}`);
            
            if (response.status === 200 && response.data?.data) {
                const count = Array.isArray(response.data.data) ? response.data.data.length : 'N/A';
                console.log(`   Records: ${count}`);
            }
        }
        
        console.log('');
        console.log('🎯 SUMMARY:');
        console.log('===========');
        if (user.permissions && user.permissions.length > 0) {
            console.log('✅ PERMISSIONS FIX SUCCESSFUL!');
            console.log('The CMS user now has properly loaded permissions.');
            console.log('The frontend should show the correct permission count.');
            console.log('');
            console.log('🔑 Login credentials for testing:');
            console.log('Email: nope@comp.com');
            console.log('Password: admin123');
            console.log(`Permissions: ${user.permissions.length}`);
        } else {
            console.log('❌ PERMISSIONS FIX FAILED');
            console.log('The auth controller still needs fixing.');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testFixedPermissionsLogin();