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

async function checkCurrentUserPermissions() {
    console.log('🔍 CHECKING CURRENT USER PERMISSIONS');
    console.log('===================================');
    
    try {
        // Login with test user
        console.log('🔐 Logging in...');
        const loginResponse = await makeRequest(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'tetstetstestdt@company.com',
                password: 'gfx998sd'
            })
        });
        
        if (loginResponse.status !== 200 || !loginResponse.data.success) {
            console.log('❌ Login failed:', loginResponse.data);
            return;
        }
        
        const token = loginResponse.data.token;
        const user = loginResponse.data.user;
        
        console.log('✅ Login successful!');
        console.log(`   User ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role_name}`);
        console.log(`   Role ID: ${user.role_id}`);
        
        // Check user permissions
        console.log('\n🔐 USER PERMISSIONS:');
        console.log('===================');
        
        if (user.permissions && user.permissions.length > 0) {
            console.log(`Found ${user.permissions.length} permissions:`);
            user.permissions.forEach(perm => {
                console.log(`✅ ${perm.name} - ${perm.display_name} (${perm.category})`);
            });
        } else {
            console.log('❌ No permissions found in user object');
        }
        
        // Get user role permissions via API
        console.log('\n🎭 ROLE PERMISSIONS (via API):');
        console.log('=============================');
        
        const rolePermResponse = await makeRequest(`${API_BASE}/roles/${user.role_id}/permissions`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (rolePermResponse.status === 200) {
            const rolePerms = rolePermResponse.data.data || rolePermResponse.data;
            console.log(`Found ${rolePerms.length} role permissions:`);
            rolePerms.forEach(perm => {
                console.log(`✅ ${perm.name} - ${perm.display_name} (${perm.category})`);
            });
        } else {
            console.log(`❌ Failed to get role permissions: ${rolePermResponse.status}`);
        }
        
        // Check specific permissions needed for user management
        console.log('\n🔍 CHECKING USER MANAGEMENT PERMISSIONS:');
        console.log('=======================================');
        
        const requiredPerms = [
            'SYSTEM_USER_MANAGEMENT',
            'users.create',
            'users.update', 
            'users.delete',
            'users.view',
            'system.user_management'
        ];
        
        const hasUserManagement = requiredPerms.some(perm => 
            user.permissions?.some(p => p.name === perm) || false
        );
        
        console.log(`User Management Permission: ${hasUserManagement ? '✅ YES' : '❌ NO'}`);
        
        if (!hasUserManagement) {
            console.log('\n💡 SOLUTION: Need to use Super Admin account');
            console.log('The current test user cannot create other users.');
            console.log('We need to either:');
            console.log('1. Use a Super Admin account for user creation');
            console.log('2. Grant user management permissions to test user');
            console.log('3. Create user manually through UI');
        }
        
        // Test API endpoints with current permissions
        console.log('\n🧪 TESTING API ACCESS WITH CURRENT PERMISSIONS:');
        console.log('===============================================');
        
        const apiTests = [
            { name: 'Users API', endpoint: '/users' },
            { name: 'Roles API', endpoint: '/roles' },
            { name: 'Permissions API', endpoint: '/permissions' },
            { name: 'Inventory API', endpoint: '/inventory?limit=5' },
            { name: 'Orders API', endpoint: '/orders?limit=5' },
            { name: 'Products API', endpoint: '/products?limit=5' }
        ];
        
        for (const test of apiTests) {
            const response = await makeRequest(`${API_BASE}${test.endpoint}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const status = response.status === 200 ? '✅' : '❌';
            console.log(`${status} ${test.name}: ${response.status}`);
            
            if (response.status === 403) {
                console.log(`   Reason: ${response.data?.message || 'Forbidden'}`);
            }
        }
        
        console.log('\n📋 SUMMARY:');
        console.log('===========');
        console.log(`Current User: ${user.email} (${user.role_name})`);
        console.log(`Permissions: ${user.permissions?.length || 0}`);
        console.log(`Can Manage Users: ${hasUserManagement ? 'YES' : 'NO'}`);
        
        if (!hasUserManagement) {
            console.log('\n🎯 NEXT STEPS:');
            console.log('1. Use Super Admin credentials for user creation');
            console.log('2. Or manually create CMS test user through UI');
            console.log('3. Then test API access with that user');
        }
        
    } catch (error) {
        console.error('❌ Check failed with error:', error.message);
    }
}

checkCurrentUserPermissions();