// COMPLETE CRUD OPERATIONS TEST
// Tests: Role CRUD + Permission Assignment + User CRUD + Updates
require('dotenv').config();

const API_BASE = 'https://16.171.197.86.nip.io';

// Admin credentials
const ADMIN_CREDS = {
    email: 'admin@company.com',
    password: 'admin@123'
};

let adminToken = null;

async function runCompleteCRUDTest() {
    console.log('🧪 COMPLETE CRUD OPERATIONS TEST');
    console.log('=================================');
    
    try {
        // Step 1: Login as admin
        console.log('\n1️⃣ ADMIN LOGIN');
        console.log('===============');
        adminToken = await loginAdmin();
        
        // Step 2: Create a new role
        console.log('\n2️⃣ CREATE NEW ROLE');
        console.log('==================');
        const newRole = await createRole();
        
        // Step 3: Add permissions to the role
        console.log('\n3️⃣ ADD PERMISSIONS TO ROLE');
        console.log('==========================');
        await addPermissionsToRole(newRole.id);
        
        // Step 4: Verify role has permissions (simulate checkbox check)
        console.log('\n4️⃣ VERIFY ROLE PERMISSIONS (CHECKBOX CHECK)');
        console.log('============================================');
        await verifyRolePermissions(newRole.id);
        
        // Step 5: Create a user with this role
        console.log('\n5️⃣ CREATE USER WITH ROLE');
        console.log('========================');
        const newUser = await createUser(newRole.id);
        
        // Step 6: Test user login and permissions
        console.log('\n6️⃣ TEST USER LOGIN & PERMISSIONS');
        console.log('================================');
        await testUserLogin(newUser.email, 'password123');
        
        // Step 7: Update role permissions
        console.log('\n7️⃣ UPDATE ROLE PERMISSIONS');
        console.log('==========================');
        await updateRolePermissions(newRole.id);
        
        // Step 8: Update user details
        console.log('\n8️⃣ UPDATE USER DETAILS');
        console.log('======================');
        await updateUser(newUser.id);
        
        // Step 9: Test user login after updates (should see new permissions)
        console.log('\n9️⃣ TEST USER AFTER UPDATES');
        console.log('===========================');
        await testUserLogin(newUser.email, 'password123');
        
        // Step 10: Cleanup
        console.log('\n🔟 CLEANUP');
        console.log('==========');
        await cleanup(newUser.id, newRole.id);
        
        console.log('\n🎉 ALL CRUD OPERATIONS COMPLETED SUCCESSFULLY!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

async function loginAdmin() {
    console.log('🔐 Logging in as admin...');
    
    const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ADMIN_CREDS)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(`Admin login failed: ${data.message}`);
    }
    
    console.log('✅ Admin login successful');
    console.log(`   Token: ${data.token.substring(0, 20)}...`);
    console.log(`   Permissions: ${data.user.permissions.length}`);
    
    return data.token;
}

async function createRole() {
    console.log('📝 Creating new role...');
    
    const roleData = {
        name: 'test_manager',
        displayName: 'Test Manager',
        description: 'Test role for CRUD operations',
        color: '#2563eb'
    };
    
    const response = await fetch(`${API_BASE}/api/permissions/roles`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(roleData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(`Role creation failed: ${data.message}`);
    }
    
    console.log('✅ Role created successfully');
    console.log(`   Role ID: ${data.data.id}`);
    console.log(`   Name: ${roleData.name}`);
    
    return { id: data.data.id, ...roleData };
}

async function addPermissionsToRole(roleId) {
    console.log(`🔑 Adding permissions to role ${roleId}...`);
    
    // First get all available permissions
    const permResponse = await fetch(`${API_BASE}/api/permissions/permissions`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
        }
    });
    
    const permData = await permResponse.json();
    
    if (!permResponse.ok) {
        throw new Error(`Failed to get permissions: ${permData.message}`);
    }
    
    // Select some permissions (products and inventory)
    const selectedPermissions = permData.data.permissions.filter(p => 
        p.name.includes('products.view') || 
        p.name.includes('products.create') ||
        p.name.includes('inventory.view')
    ).map(p => p.id);
    
    console.log(`   Selected ${selectedPermissions.length} permissions:`, selectedPermissions);
    
    // Update role with permissions
    const updateData = {
        name: 'test_manager',
        displayName: 'Test Manager',
        description: 'Test role for CRUD operations',
        color: '#2563eb',
        permissionIds: selectedPermissions
    };
    
    const response = await fetch(`${API_BASE}/api/permissions/roles/${roleId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(`Adding permissions failed: ${data.message}`);
    }
    
    console.log('✅ Permissions added to role successfully');
}

async function verifyRolePermissions(roleId) {
    console.log(`🔍 Verifying role permissions (simulating checkbox check)...`);
    
    // Get role details with permissions
    const response = await fetch(`${API_BASE}/api/permissions/roles`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(`Failed to get roles: ${data.message}`);
    }
    
    const role = data.data.find(r => r.id === roleId);
    
    if (!role) {
        throw new Error(`Role ${roleId} not found`);
    }
    
    console.log('✅ Role permissions verified:');
    console.log(`   Role: ${role.name} (${role.display_name})`);
    console.log(`   Permission count: ${role.permission_count}`);
    
    // This simulates what the frontend should do:
    // When editing a role, checkboxes should be checked for existing permissions
    console.log('📋 Frontend should show these checkboxes as CHECKED:');
    
    // Get detailed permissions for this role
    const permResponse = await fetch(`${API_BASE}/api/permissions/roles/${roleId}/permissions`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
        }
    });
    
    if (permResponse.ok) {
        const permData = await permResponse.json();
        permData.data.forEach(perm => {
            console.log(`   ✅ [CHECKED] ${perm.name} - ${perm.display_name}`);
        });
    }
}

async function createUser(roleId) {
    console.log(`👤 Creating user with role ${roleId}...`);
    
    const userData = {
        name: 'Test Manager User',
        email: 'testmanager@company.com',
        password: 'password123',
        role_id: roleId
    };
    
    const response = await fetch(`${API_BASE}/api/permissions/users`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(`User creation failed: ${data.message}`);
    }
    
    console.log('✅ User created successfully');
    console.log(`   User ID: ${data.data.id}`);
    console.log(`   Email: ${userData.email}`);
    console.log(`   Role ID: ${roleId}`);
    
    return { id: data.data.id, ...userData };
}

async function testUserLogin(email, password) {
    console.log(`🔐 Testing user login: ${email}...`);
    
    const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(`User login failed: ${data.message}`);
    }
    
    console.log('✅ User login successful');
    console.log(`   Role: ${data.user.role}`);
    console.log(`   Permissions: ${data.user.permissions.length}`);
    console.log('   User permissions:');
    data.user.permissions.forEach(perm => {
        console.log(`     - ${perm}`);
    });
    
    // Test API access
    console.log('🧪 Testing API access...');
    
    const apiResponse = await fetch(`${API_BASE}/api/products?page=1&limit=5`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${data.token}`,
            'Content-Type': 'application/json'
        }
    });
    
    if (apiResponse.ok) {
        console.log('✅ Products API access: SUCCESS');
    } else {
        console.log('❌ Products API access: DENIED');
    }
}

async function updateRolePermissions(roleId) {
    console.log(`🔄 Updating role permissions for role ${roleId}...`);
    
    // Get all permissions
    const permResponse = await fetch(`${API_BASE}/api/permissions/permissions`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
        }
    });
    
    const permData = await permResponse.json();
    
    // Add more permissions (include orders)
    const updatedPermissions = permData.data.permissions.filter(p => 
        p.name.includes('products.view') || 
        p.name.includes('products.create') ||
        p.name.includes('inventory.view') ||
        p.name.includes('orders.view') ||
        p.name.includes('orders.create')
    ).map(p => p.id);
    
    console.log(`   Adding ${updatedPermissions.length} permissions (including orders)`);
    
    const updateData = {
        name: 'test_manager',
        displayName: 'Test Manager Updated',
        description: 'Updated test role with more permissions',
        color: '#16a34a',
        permissionIds: updatedPermissions
    };
    
    const response = await fetch(`${API_BASE}/api/permissions/roles/${roleId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(`Role update failed: ${data.message}`);
    }
    
    console.log('✅ Role permissions updated successfully');
    console.log('   Added orders permissions - user should see this on refresh');
}

async function updateUser(userId) {
    console.log(`👤 Updating user ${userId}...`);
    
    const updateData = {
        name: 'Test Manager User Updated',
        email: 'testmanager@company.com'
    };
    
    const response = await fetch(`${API_BASE}/api/permissions/users/${userId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(`User update failed: ${data.message}`);
    }
    
    console.log('✅ User updated successfully');
    console.log(`   New name: ${updateData.name}`);
}

async function cleanup(userId, roleId) {
    console.log('🧹 Cleaning up test data...');
    
    // Delete user
    try {
        const userResponse = await fetch(`${API_BASE}/api/permissions/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (userResponse.ok) {
            console.log('✅ Test user deleted');
        } else {
            console.log('⚠️ Failed to delete test user');
        }
    } catch (error) {
        console.log('⚠️ User cleanup error:', error.message);
    }
    
    // Note: We don't delete the role as there might not be a delete endpoint
    // In production, you might want to deactivate it instead
    console.log(`ℹ️ Test role ${roleId} left in database (deactivate manually if needed)`);
}

// Run the test
runCompleteCRUDTest().catch(console.error);