const https = require('https');

// Disable SSL verification for testing
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const API_BASE = 'https://16.171.196.15.nip.io';

console.log('🔍 CHECKING ADMIN BULK UPLOAD PERMISSION');
console.log('='.repeat(50));

async function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const req = https.request(url, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Admin-Permission-Check',
                ...options.headers
            },
            timeout: 15000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const responseTime = Date.now() - startTime;
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ 
                        success: true, 
                        statusCode: res.statusCode, 
                        data: jsonData,
                        responseTime
                    });
                } catch (e) {
                    resolve({ 
                        success: true, 
                        statusCode: res.statusCode, 
                        data: data,
                        responseTime
                    });
                }
            });
        });
        
        req.on('error', error => {
            const responseTime = Date.now() - startTime;
            reject({ success: false, error: error.message, responseTime });
        });
        
        req.on('timeout', () => {
            req.destroy();
            reject({ success: false, error: 'Timeout', responseTime: 15000 });
        });
        
        if (options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
}

async function checkAdminPermissions() {
    try {
        // Get token
        console.log('1️⃣ Getting authentication token...');
        const loginResponse = await makeRequest(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            body: JSON.stringify({
                email: 'admin@company.com',
                password: 'admin@123'
            })
        });
        
        if (!loginResponse.data.success) {
            console.log('❌ Login failed');
            return;
        }
        
        const token = loginResponse.data.token;
        const user = loginResponse.data.user;
        console.log('✅ Token obtained');
        console.log(`👤 User: ${user.name} (${user.email})`);
        console.log(`🏷️  Role ID: ${user.role_id}`);
        
        // Get user's role details
        console.log('\n2️⃣ Getting user role details...');
        const roleResponse = await makeRequest(`${API_BASE}/api/roles/${user.role_id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (roleResponse.statusCode === 200 && roleResponse.data.success) {
            const role = roleResponse.data.data;
            console.log(`📋 Role: ${role.name} (${role.display_name})`);
            console.log(`🔑 Permissions: ${role.permissions.length}`);
            
            const bulkUploadPerm = role.permissions.find(p => p.name === 'inventory.bulk_upload');
            if (bulkUploadPerm) {
                console.log('✅ User HAS inventory.bulk_upload permission');
            } else {
                console.log('❌ User MISSING inventory.bulk_upload permission');
                console.log('\n📋 User\'s inventory permissions:');
                const inventoryPerms = role.permissions.filter(p => p.name.includes('inventory'));
                inventoryPerms.forEach(p => console.log(`   - ${p.name}`));
            }
        } else {
            console.log('❌ Failed to get role details');
        }
        
        // Test the endpoint directly
        console.log('\n3️⃣ Testing bulk upload endpoint directly...');
        const testResponse = await makeRequest(`${API_BASE}/api/bulk-upload/progress`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                warehouse: 'test',
                data: []
            })
        });
        
        console.log(`📊 Response: ${testResponse.statusCode}`);
        if (testResponse.data) {
            console.log(`📋 Message: ${testResponse.data.message || 'No message'}`);
        }
        
        if (testResponse.statusCode === 403) {
            console.log('\n💡 SOLUTION: Admin user needs inventory.bulk_upload permission');
            console.log('   This can be fixed by adding the permission to the admin role');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.error || error.message);
    }
}

checkAdminPermissions();