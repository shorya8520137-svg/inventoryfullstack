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

async function checkAndAddMissingPermissions() {
    console.log('🔍 CHECKING AND ADDING MISSING PERMISSIONS');
    console.log('==========================================');
    
    try {
        // Step 1: Login with test user to check current permissions
        console.log('🔐 Logging in...');
        const loginResponse = await makeRequest(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
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
        console.log('✅ Login successful!');
        
        // Step 2: Get all existing permissions
        console.log('\n📋 Getting all existing permissions...');
        const permissionsResponse = await makeRequest(`${API_BASE}/permissions`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (permissionsResponse.status !== 200) {
            console.log('❌ Failed to get permissions:', permissionsResponse.data);
            return;
        }
        
        const permissions = permissionsResponse.data.data.permissions;
        console.log(`✅ Found ${permissions.length} existing permissions`);
        
        // Step 3: List all permissions by category
        console.log('\n📊 EXISTING PERMISSIONS BY CATEGORY:');
        console.log('====================================');
        
        const categories = {};
        permissions.forEach(perm => {
            const cat = perm.category || 'Other';
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(perm);
        });
        
        Object.entries(categories).forEach(([category, perms]) => {
            console.log(`\n📁 ${category.toUpperCase()} (${perms.length} permissions):`);
            perms.forEach(perm => {
                console.log(`  ✅ ${perm.name} - ${perm.display_name}`);
            });
        });
        
        // Step 4: Check for missing permissions
        console.log('\n🔍 CHECKING FOR MISSING PERMISSIONS:');
        console.log('===================================');
        
        const requiredPermissions = [
            { name: 'dispatch.view', display_name: 'View Dispatch Orders', category: 'operations' },
            { name: 'dispatch.create', display_name: 'Create Dispatch Orders', category: 'operations' },
            { name: 'dispatch.update', display_name: 'Update Dispatch Orders', category: 'operations' },
            { name: 'status.update', display_name: 'Update Order Status', category: 'operations' },
            { name: 'status.view', display_name: 'View Order Status', category: 'operations' }
        ];
        
        const missingPermissions = [];
        requiredPermissions.forEach(reqPerm => {
            const exists = permissions.find(p => p.name === reqPerm.name);
            if (exists) {
                console.log(`✅ ${reqPerm.name} - EXISTS (ID: ${exists.id})`);
            } else {
                console.log(`❌ ${reqPerm.name} - MISSING`);
                missingPermissions.push(reqPerm);
            }
        });
        
        // Step 5: Show what dispatch-related permissions exist
        console.log('\n🚚 DISPATCH-RELATED PERMISSIONS FOUND:');
        console.log('=====================================');
        const dispatchPerms = permissions.filter(p => 
            p.name.includes('dispatch') || 
            p.display_name.toLowerCase().includes('dispatch') ||
            p.name.includes('status') ||
            p.display_name.toLowerCase().includes('status')
        );
        
        if (dispatchPerms.length > 0) {
            dispatchPerms.forEach(perm => {
                console.log(`✅ ${perm.name} - ${perm.display_name} (Category: ${perm.category})`);
            });
        } else {
            console.log('❌ No dispatch or status related permissions found');
        }
        
        // Step 6: Show operations category permissions
        console.log('\n⚙️ OPERATIONS CATEGORY PERMISSIONS:');
        console.log('==================================');
        const operationsPerms = permissions.filter(p => p.category === 'operations');
        if (operationsPerms.length > 0) {
            operationsPerms.forEach(perm => {
                console.log(`✅ ${perm.name} - ${perm.display_name}`);
            });
        } else {
            console.log('❌ No operations category permissions found');
        }
        
        // Step 7: Check if we can access dispatch API
        console.log('\n🧪 TESTING DISPATCH API ACCESS:');
        console.log('==============================');
        
        const dispatchTest = await makeRequest(`${API_BASE}/dispatch?limit=5`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`Dispatch API Status: ${dispatchTest.status}`);
        if (dispatchTest.status === 200) {
            console.log('✅ Dispatch API accessible - permission might exist with different name');
        } else if (dispatchTest.status === 403) {
            console.log('❌ Dispatch API forbidden - missing permission');
        } else {
            console.log(`⚠️ Dispatch API returned: ${dispatchTest.status}`);
            if (dispatchTest.data) {
                console.log('Response:', dispatchTest.data);
            }
        }
        
        console.log('\n💡 ANALYSIS COMPLETE!');
        console.log('=====================');
        
        if (missingPermissions.length > 0) {
            console.log(`❌ Found ${missingPermissions.length} missing permissions:`);
            missingPermissions.forEach(perm => {
                console.log(`   - ${perm.name}: ${perm.display_name}`);
            });
            console.log('\n📝 TO FIX: You need to add these permissions to the database');
            console.log('   Either through the admin panel or by running SQL commands');
        } else {
            console.log('✅ All required permissions exist!');
        }
        
    } catch (error) {
        console.error('❌ Analysis failed with error:', error.message);
    }
}

checkAndAddMissingPermissions();