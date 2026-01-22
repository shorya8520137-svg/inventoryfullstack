const https = require('https');

// Disable SSL verification for testing
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const API_BASE = 'https://16.171.196.15.nip.io';

console.log('🧪 TESTING ROLE DELETION FIX');
console.log('='.repeat(50));

async function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const req = https.request(url, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Role-Deletion-Test',
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

async function testRoleDeletion() {
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
        
        // Get all roles first
        console.log('\n2️⃣ Getting all roles...');
        const rolesResponse = await makeRequest(`${API_BASE}/api/roles`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (rolesResponse.statusCode !== 200) {
            console.log('❌ Failed to get roles');
            return;
        }
        
        const roles = rolesResponse.data.data || [];
        console.log(`📋 Found ${roles.length} roles`);
        
        // Find a test role to delete (avoid deleting system roles)
        const testRole = roles.find(role => 
            role.name && 
            !['Super Admin', 'Admin', 'Manager', 'Operations', 'Viewer'].includes(role.name) &&
            role.name.toLowerCase().includes('test')
        );
        
        if (!testRole) {
            console.log('⚠️  No test role found to delete safely');
            
            // Create a test role first
            console.log('\n3️⃣ Creating a test role for deletion...');
            const createResponse = await makeRequest(`${API_BASE}/api/roles`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    name: 'Test Role Delete',
                    display_name: 'Test Role for Deletion',
                    description: 'Temporary role for testing deletion',
                    color: '#ff0000',
                    permissions: []
                })
            });
            
            if (createResponse.statusCode === 201 && createResponse.data.success) {
                const newRoleId = createResponse.data.role_id;
                console.log(`✅ Test role created with ID: ${newRoleId}`);
                
                // Now test deletion
                await testRoleDeletionById(newRoleId, token);
            } else {
                console.log('❌ Failed to create test role:', createResponse.data.message);
            }
        } else {
            console.log(`\n3️⃣ Testing deletion of role: ${testRole.name} (ID: ${testRole.id})`);
            await testRoleDeletionById(testRole.id, token);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.error || error.message);
    }
}

async function testRoleDeletionById(roleId, token) {
    console.log(`\n🗑️  Attempting to delete role ID: ${roleId}`);
    
    const deleteResponse = await makeRequest(`${API_BASE}/api/roles/${roleId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log(`   Response: ${deleteResponse.statusCode}`);
    console.log(`   Data:`, deleteResponse.data);
    
    if (deleteResponse.statusCode === 200 && deleteResponse.data.success) {
        console.log('   ✅ SUCCESS: Role deleted successfully!');
        console.log('   🎉 Role deletion fix is working');
    } else if (deleteResponse.statusCode === 400) {
        console.log('   ⚠️  Expected error: Role has assigned users (this is correct behavior)');
    } else if (deleteResponse.statusCode === 500) {
        console.log('   ❌ FAILED: Server error - fix not working');
        console.log('   💡 The "not iterable" error might still be present');
    } else {
        console.log(`   ❓ Unexpected response: ${deleteResponse.statusCode}`);
    }
}

testRoleDeletion();