const https = require('https');

// Disable SSL verification for testing
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const API_BASE = 'https://16.171.196.15.nip.io';

console.log('🔍 TESTING BULK UPLOAD PERMISSIONS');
console.log('='.repeat(50));

async function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const req = https.request(url, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Bulk-Upload-Permission-Test',
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

async function testBulkUploadPermissions() {
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
        console.log('✅ Token obtained');
        
        // Check user permissions
        console.log('\n2️⃣ Checking user permissions...');
        const permissionsResponse = await makeRequest(`${API_BASE}/api/auth/permissions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (permissionsResponse.statusCode === 200) {
            const permissions = permissionsResponse.data.permissions || [];
            console.log(`📋 User has ${permissions.length} permissions`);
            
            const bulkUploadPermission = permissions.find(p => p.includes('bulk_upload') || p.includes('inventory'));
            if (bulkUploadPermission) {
                console.log(`✅ Found bulk upload related permission: ${bulkUploadPermission}`);
            } else {
                console.log('❌ No bulk upload permissions found');
                console.log('📋 Available permissions:', permissions.slice(0, 10).join(', '));
            }
        } else {
            console.log('❌ Failed to get user permissions');
        }
        
        // Check all available permissions in system
        console.log('\n3️⃣ Checking all system permissions...');
        const allPermissionsResponse = await makeRequest(`${API_BASE}/api/permissions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (allPermissionsResponse.statusCode === 200) {
            const allPermissions = allPermissionsResponse.data.data || [];
            const inventoryPermissions = allPermissions.filter(p => 
                p.name && (p.name.includes('inventory') || p.name.includes('bulk'))
            );
            
            console.log(`📋 Found ${inventoryPermissions.length} inventory/bulk permissions:`);
            inventoryPermissions.forEach(p => {
                console.log(`   - ${p.name}: ${p.display_name}`);
            });
            
            const bulkUploadPerm = allPermissions.find(p => p.name === 'inventory.bulk_upload');
            if (bulkUploadPerm) {
                console.log(`✅ 'inventory.bulk_upload' permission exists`);
            } else {
                console.log(`❌ 'inventory.bulk_upload' permission NOT found`);
            }
        }
        
        // Test the actual bulk upload progress endpoint
        console.log('\n4️⃣ Testing bulk upload progress endpoint...');
        const progressResponse = await makeRequest(`${API_BASE}/api/bulk-upload/progress`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                test: true
            })
        });
        
        console.log(`   Response: ${progressResponse.statusCode}`);
        console.log(`   Data:`, progressResponse.data);
        
        if (progressResponse.statusCode === 403) {
            console.log('   ❌ 403 Forbidden - Permission issue confirmed');
        } else if (progressResponse.statusCode === 400) {
            console.log('   ✅ 400 Bad Request - Permission OK, just missing required data');
        } else {
            console.log(`   ❓ Unexpected status: ${progressResponse.statusCode}`);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.error || error.message);
    }
}

testBulkUploadPermissions();