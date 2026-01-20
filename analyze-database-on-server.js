const https = require('https');

// Ignore SSL certificate errors for testing
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const API_BASE = 'https://13.48.248.180.nip.io/api';

console.log('🔍 ANALYZING DATABASE STRUCTURE');
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

async function testLogin(email, password, userType) {
    try {
        console.log(`\n🔐 Testing ${userType} login: ${email}`);
        
        const loginData = { email, password };

        const response = await makeRequest(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        console.log(`📊 Status: ${response.status}`);
        
        if (response.status === 200 && response.data.success) {
            const user = response.data.user;
            console.log(`✅ LOGIN SUCCESS`);
            console.log(`👤 User: ${user.name} (${user.email})`);
            console.log(`🎭 Role: ${user.role_name} (ID: ${user.role_id})`);
            console.log(`🔑 Permissions Count: ${user.permissions.length}`);
            
            if (user.permissions.length > 0) {
                console.log('📋 Permissions by Category:');
                const byCategory = {};
                user.permissions.forEach(perm => {
                    if (!byCategory[perm.category]) byCategory[perm.category] = [];
                    byCategory[perm.category].push(perm.name);
                });
                
                Object.keys(byCategory).forEach(category => {
                    console.log(`   ${category}: ${byCategory[category].join(', ')}`);
                });
            } else {
                console.log('❌ ZERO PERMISSIONS - This is the problem!');
            }
            
            return { token: response.data.token, user: user };
        } else {
            console.log('❌ LOGIN FAILED');
            console.log('Response:', response.data);
            return null;
        }
        
    } catch (error) {
        console.error(`❌ ${userType} login failed:`, error.message);
        return null;
    }
}

async function testPermissionsAPI(token, userType) {
    if (!token) return;
    
    try {
        console.log(`\n🔍 Testing ${userType} permissions API access...`);
        
        const response = await makeRequest(`${API_BASE}/permissions/roles`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`📊 Permissions API Status: ${response.status}`);
        
        if (response.status === 200) {
            console.log(`✅ Can access permissions API`);
            console.log(`📋 Roles found: ${response.data.roles ? response.data.roles.length : 0}`);
        } else {
            console.log(`❌ Cannot access permissions API`);
            console.log('Response:', response.data);
        }
        
    } catch (error) {
        console.error(`❌ ${userType} permissions API test failed:`, error.message);
    }
}

async function analyzeDatabase() {
    console.log('🚀 Starting database analysis...\n');
    
    // Test all three users
    const adminResult = await testLogin('admin@company.com', 'admin@123', 'ADMIN');
    const cmsResult = await testLogin('nope@comp.com', 'admin123', 'CMS');
    const testResult = await testLogin('tetstetstestdt@company.com', 'gfx998sd', 'TEST');
    
    // Test API access for each user
    if (adminResult) await testPermissionsAPI(adminResult.token, 'ADMIN');
    if (cmsResult) await testPermissionsAPI(cmsResult.token, 'CMS');
    if (testResult) await testPermissionsAPI(testResult.token, 'TEST');
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 DATABASE ANALYSIS SUMMARY');
    console.log('='.repeat(50));
    
    console.log(`👤 ADMIN (admin@company.com):`);
    if (adminResult) {
        console.log(`   ✅ Login: SUCCESS`);
        console.log(`   🎭 Role: ${adminResult.user.role_name} (ID: ${adminResult.user.role_id})`);
        console.log(`   🔑 Permissions: ${adminResult.user.permissions.length}`);
    } else {
        console.log(`   ❌ Login: FAILED`);
    }
    
    console.log(`\n👤 CMS (nope@comp.com):`);
    if (cmsResult) {
        console.log(`   ✅ Login: SUCCESS`);
        console.log(`   🎭 Role: ${cmsResult.user.role_name} (ID: ${cmsResult.user.role_id})`);
        console.log(`   🔑 Permissions: ${cmsResult.user.permissions.length}`);
    } else {
        console.log(`   ❌ Login: FAILED`);
    }
    
    console.log(`\n👤 TEST (tetstetstestdt@company.com):`);
    if (testResult) {
        console.log(`   ✅ Login: SUCCESS`);
        console.log(`   🎭 Role: ${testResult.user.role_name} (ID: ${testResult.user.role_id})`);
        console.log(`   🔑 Permissions: ${testResult.user.permissions.length}`);
    } else {
        console.log(`   ❌ Login: FAILED`);
    }
    
    console.log('\n🎯 NEXT STEPS:');
    if (!adminResult || adminResult.user.permissions.length === 0) {
        console.log('1. Admin has no permissions - need to check role_permissions table');
    }
    if (!cmsResult || cmsResult.user.permissions.length === 0) {
        console.log('2. CMS user has no permissions - need to check role assignment');
    }
    if (!testResult || testResult.user.permissions.length === 0) {
        console.log('3. Test user has no permissions - need to check role assignment');
    }
}

analyzeDatabase().catch(console.error);