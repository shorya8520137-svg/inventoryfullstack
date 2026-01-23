/**
 * FIX: Add ORDERS_EXPORT permission to admin user
 */

const https = require('https');

const API_BASE = 'https://16.171.5.50.nip.io';

// Admin credentials
const adminCredentials = {
    username: 'admin@company.com',
    password: 'admin@123'
};

console.log('🔧 Fixing admin ORDERS_EXPORT permission...\n');

// Step 1: Login to get JWT token
function login() {
    return new Promise((resolve, reject) => {
        const loginData = JSON.stringify(adminCredentials);
        
        const options = {
            hostname: '16.171.5.50.nip.io',
            port: 443,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': loginData.length
            },
            rejectUnauthorized: false
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    if (response.success && response.token) {
                        console.log('✅ Admin login successful');
                        resolve(response);
                    } else {
                        reject(new Error('Login failed: ' + JSON.stringify(response)));
                    }
                } catch (err) {
                    reject(new Error('Login response parse error: ' + err.message));
                }
            });
        });

        req.on('error', reject);
        req.write(loginData);
        req.end();
    });
}

// Step 2: Get all permissions to find ORDERS_EXPORT ID
function getPermissions(token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: '16.171.5.50.nip.io',
            port: 443,
            path: '/api/permissions',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            rejectUnauthorized: false
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    resolve({ status: res.statusCode, data: response });
                } catch (err) {
                    reject(new Error('Response parse error: ' + err.message));
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

// Step 3: Get all roles to find super_admin role ID
function getRoles(token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: '16.171.5.50.nip.io',
            port: 443,
            path: '/api/roles',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            rejectUnauthorized: false
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    resolve({ status: res.statusCode, data: response });
                } catch (err) {
                    reject(new Error('Response parse error: ' + err.message));
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

// Step 4: Get current role permissions
function getRolePermissions(token, roleId) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: '16.171.5.50.nip.io',
            port: 443,
            path: `/api/roles/${roleId}/permissions`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            rejectUnauthorized: false
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    resolve({ status: res.statusCode, data: response });
                } catch (err) {
                    reject(new Error('Response parse error: ' + err.message));
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

// Step 5: Update role permissions to include ORDERS_EXPORT
function updateRolePermissions(token, roleId, permissionIds) {
    return new Promise((resolve, reject) => {
        const updateData = JSON.stringify({ permissionIds });
        
        const options = {
            hostname: '16.171.5.50.nip.io',
            port: 443,
            path: `/api/roles/${roleId}/permissions`,
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Content-Length': updateData.length
            },
            rejectUnauthorized: false
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    resolve({ status: res.statusCode, data: response });
                } catch (err) {
                    reject(new Error('Response parse error: ' + err.message));
                }
            });
        });

        req.on('error', reject);
        req.write(updateData);
        req.end();
    });
}

// Main execution
async function fixPermission() {
    try {
        console.log('🔐 Step 1: Logging in as admin...');
        const loginResult = await login();
        const token = loginResult.token;
        
        console.log('📋 Step 2: Getting all permissions...');
        const permissionsResult = await getPermissions(token);
        
        if (permissionsResult.status !== 200) {
            throw new Error(`Failed to get permissions: ${permissionsResult.status}`);
        }
        
        const permissions = permissionsResult.data;
        const ordersExportPermission = permissions.find(p => p.name === 'ORDERS_EXPORT');
        
        if (!ordersExportPermission) {
            console.log('❌ ORDERS_EXPORT permission not found in database');
            console.log('💡 Available permissions:', permissions.map(p => p.name).join(', '));
            return;
        }
        
        console.log(`✅ Found ORDERS_EXPORT permission (ID: ${ordersExportPermission.id})`);
        
        console.log('🎭 Step 3: Getting all roles...');
        const rolesResult = await getRoles(token);
        
        if (rolesResult.status !== 200) {
            throw new Error(`Failed to get roles: ${rolesResult.status}`);
        }
        
        const roles = rolesResult.data;
        const superAdminRole = roles.find(r => r.name === 'super_admin');
        
        if (!superAdminRole) {
            console.log('❌ super_admin role not found');
            console.log('💡 Available roles:', roles.map(r => r.name).join(', '));
            return;
        }
        
        console.log(`✅ Found super_admin role (ID: ${superAdminRole.id})`);
        
        console.log('🔍 Step 4: Getting current role permissions...');
        const currentPermissionsResult = await getRolePermissions(token, superAdminRole.id);
        
        if (currentPermissionsResult.status !== 200) {
            throw new Error(`Failed to get role permissions: ${currentPermissionsResult.status}`);
        }
        
        const currentPermissions = currentPermissionsResult.data;
        const currentPermissionIds = currentPermissions.map(p => p.id);
        
        console.log(`📊 Current permissions: ${currentPermissions.length} total`);
        
        // Check if ORDERS_EXPORT is already included
        if (currentPermissionIds.includes(ordersExportPermission.id)) {
            console.log('✅ ORDERS_EXPORT permission already exists for super_admin role');
            return;
        }
        
        console.log('➕ Step 5: Adding ORDERS_EXPORT permission...');
        const newPermissionIds = [...currentPermissionIds, ordersExportPermission.id];
        
        const updateResult = await updateRolePermissions(token, superAdminRole.id, newPermissionIds);
        
        if (updateResult.status === 200) {
            console.log('✅ SUCCESS: ORDERS_EXPORT permission added to super_admin role');
            console.log(`📊 Total permissions now: ${newPermissionIds.length}`);
            console.log('🎉 Admin user should now be able to see and use the export button');
        } else {
            console.log('❌ Failed to update permissions:', updateResult.status);
            console.log('Response:', updateResult.data);
        }
        
    } catch (error) {
        console.error('❌ Fix failed:', error.message);
    }
}

// Run the fix
fixPermission();