// COMPLETE PERMISSIONS SYSTEM FIX
// This script addresses the core issue: thems user sees Products tab but gets 403 errors

const mysql = require('mysql2');
require('dotenv').config();

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'inventory_user',
    password: process.env.DB_PASSWORD || 'StrongPass@123',
    database: process.env.DB_NAME || 'inventory_db'
});

async function fixPermissionsSystem() {
    console.log('🔧 FIXING PERMISSIONS SYSTEM');
    console.log('============================');
    
    try {
        // 1. Check current thems user permissions
        console.log('\n1️⃣ CHECKING THEMS USER CURRENT STATE');
        const themsUser = await query(`
            SELECT u.id, u.name, u.email, u.role_id, u.role,
                   r.name as role_name, r.display_name as role_display_name
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE u.email = 'thems@company.com'
        `);
        
        if (themsUser.length === 0) {
            console.log('❌ Thems user not found!');
            return;
        }
        
        const user = themsUser[0];
        console.log(`✅ Found user: ${user.name} (${user.email})`);
        console.log(`   Role ID: ${user.role_id}`);
        console.log(`   Role Name: ${user.role_name || 'NULL'}`);
        console.log(`   Role Column: ${user.role || 'NULL'}`);
        
        // 2. Check current permissions for this role
        console.log('\n2️⃣ CHECKING CURRENT PERMISSIONS');
        const currentPermissions = await query(`
            SELECT p.name, p.display_name, p.category
            FROM permissions p
            JOIN role_permissions rp ON p.id = rp.permission_id
            WHERE rp.role_id = ?
        `, [user.role_id]);
        
        console.log(`   Current permissions count: ${currentPermissions.length}`);
        currentPermissions.forEach(perm => {
            console.log(`   - ${perm.name} (${perm.display_name})`);
        });
        
        // 3. Check if products.view permission exists
        const hasProductsView = currentPermissions.some(p => p.name === 'products.view');
        console.log(`   Has products.view: ${hasProductsView ? '✅' : '❌'}`);
        
        // 4. Check what role this should be
        console.log('\n3️⃣ ANALYZING ROLE STRUCTURE');
        const allRoles = await query(`
            SELECT r.*, COUNT(rp.permission_id) as permission_count
            FROM roles r
            LEFT JOIN role_permissions rp ON r.id = rp.role_id
            GROUP BY r.id
            ORDER BY r.id
        `);
        
        console.log('   Available roles:');
        allRoles.forEach(role => {
            console.log(`   - ID ${role.id}: ${role.name} (${role.display_name}) - ${role.permission_count} permissions`);
        });
        
        // 5. Determine the correct fix
        console.log('\n4️⃣ DETERMINING FIX STRATEGY');
        
        if (!hasProductsView) {
            console.log('❌ ISSUE CONFIRMED: User role does not have products.view permission');
            console.log('   This explains why:');
            console.log('   - Login works (authentication succeeds)');
            console.log('   - Products tab shows (frontend fallback or caching issue)');
            console.log('   - Products API fails with 403 (backend enforces real permissions)');
            
            // Check if there's a viewer role that should have products.view
            const viewerRole = allRoles.find(r => r.name.toLowerCase().includes('viewer') || r.name.toLowerCase().includes('customer'));
            
            if (viewerRole) {
                console.log(`\n   Found potential viewer role: ${viewerRole.name} (ID: ${viewerRole.id})`);
                
                // Check if viewer role has products.view
                const viewerPermissions = await query(`
                    SELECT p.name
                    FROM permissions p
                    JOIN role_permissions rp ON p.id = rp.permission_id
                    WHERE rp.role_id = ? AND p.name = 'products.view'
                `, [viewerRole.id]);
                
                if (viewerPermissions.length > 0) {
                    console.log('✅ Viewer role has products.view - should update user role');
                    
                    // Update user to viewer role
                    await query(`UPDATE users SET role_id = ? WHERE email = 'thems@company.com'`, [viewerRole.id]);
                    console.log(`✅ Updated thems user to role ID ${viewerRole.id}`);
                } else {
                    console.log('❌ Viewer role also lacks products.view - need to add permission');
                    await addProductsViewToRole(viewerRole.id);
                }
            } else {
                // Add products.view to current role
                console.log('   No viewer role found - adding products.view to current role');
                await addProductsViewToRole(user.role_id);
            }
        }
        
        // 6. Verify fix
        console.log('\n5️⃣ VERIFYING FIX');
        const updatedUser = await query(`
            SELECT u.id, u.name, u.email, u.role_id, u.role,
                   r.name as role_name, r.display_name as role_display_name
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE u.email = 'thems@company.com'
        `);
        
        const finalPermissions = await query(`
            SELECT p.name, p.display_name, p.category
            FROM permissions p
            JOIN role_permissions rp ON p.id = rp.permission_id
            WHERE rp.role_id = ?
        `, [updatedUser[0].role_id]);
        
        const nowHasProductsView = finalPermissions.some(p => p.name === 'products.view');
        
        console.log(`✅ Final state:`);
        console.log(`   User role: ${updatedUser[0].role_name}`);
        console.log(`   Has products.view: ${nowHasProductsView ? '✅' : '❌'}`);
        console.log(`   Total permissions: ${finalPermissions.length}`);
        
        if (nowHasProductsView) {
            console.log('\n🎉 SUCCESS! Permission system fixed');
            console.log('   - User can now access Products API');
            console.log('   - Frontend will show correct permissions');
            console.log('   - No more 403 errors expected');
        } else {
            console.log('\n❌ Fix incomplete - manual intervention needed');
        }
        
    } catch (error) {
        console.error('❌ Error fixing permissions:', error);
    } finally {
        db.end();
    }
}

async function addProductsViewToRole(roleId) {
    console.log(`   Adding products.view permission to role ${roleId}`);
    
    // Get products.view permission ID
    const permission = await query(`SELECT id FROM permissions WHERE name = 'products.view'`);
    
    if (permission.length === 0) {
        console.log('   ❌ products.view permission not found in database!');
        return;
    }
    
    const permissionId = permission[0].id;
    
    // Check if already exists
    const existing = await query(`
        SELECT id FROM role_permissions 
        WHERE role_id = ? AND permission_id = ?
    `, [roleId, permissionId]);
    
    if (existing.length > 0) {
        console.log('   ✅ Permission already exists');
        return;
    }
    
    // Add permission
    await query(`
        INSERT INTO role_permissions (role_id, permission_id)
        VALUES (?, ?)
    `, [roleId, permissionId]);
    
    console.log('   ✅ Added products.view permission');
}

// Helper function to promisify database queries
function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

// Run the fix
fixPermissionsSystem().catch(console.error);