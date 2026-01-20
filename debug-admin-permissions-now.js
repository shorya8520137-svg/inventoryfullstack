// Debug admin permissions issue
const mysql = require('mysql2');

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Huny@2024',
    database: 'hunyhuny_auto_dispatch'
});

console.log('🔍 DEBUGGING ADMIN PERMISSIONS ISSUE');
console.log('='.repeat(50));

// 1. Check if admin user exists and get role info
console.log('1. Checking admin user...');
db.query(`
    SELECT u.id, u.name, u.email, u.role_id, u.role, 
           r.name as role_name, r.display_name as role_display_name
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    WHERE u.email = 'admin@company.com'
`, (err, users) => {
    if (err) {
        console.error('❌ Error checking admin user:', err);
        return;
    }
    
    console.log('👤 Admin user data:', users);
    
    if (users.length === 0) {
        console.log('❌ No admin user found with email admin@company.com');
        return;
    }
    
    const admin = users[0];
    console.log(`✅ Admin found: ID=${admin.id}, Role ID=${admin.role_id}, Role Name=${admin.role_name}`);
    
    // 2. Check permissions table structure
    console.log('\n2. Checking permissions table structure...');
    db.query('DESCRIBE permissions', (err, structure) => {
        if (err) {
            console.error('❌ Error checking permissions table:', err);
            return;
        }
        
        console.log('📋 Permissions table structure:');
        structure.forEach(col => {
            console.log(`   ${col.Field}: ${col.Type}`);
        });
        
        // 3. Check if permissions exist
        console.log('\n3. Checking permissions data...');
        db.query('SELECT COUNT(*) as count FROM permissions', (err, count) => {
            if (err) {
                console.error('❌ Error counting permissions:', err);
                return;
            }
            
            console.log(`📊 Total permissions in database: ${count[0].count}`);
            
            if (count[0].count === 0) {
                console.log('❌ NO PERMISSIONS FOUND IN DATABASE!');
                console.log('🔧 Need to run permissions setup script');
                return;
            }
            
            // 4. Check role_permissions for admin
            console.log('\n4. Checking admin role permissions...');
            db.query(`
                SELECT COUNT(*) as count 
                FROM role_permissions rp 
                WHERE rp.role_id = ?
            `, [admin.role_id], (err, rolePermCount) => {
                if (err) {
                    console.error('❌ Error checking role permissions:', err);
                    return;
                }
                
                console.log(`📊 Admin role permissions count: ${rolePermCount[0].count}`);
                
                if (rolePermCount[0].count === 0) {
                    console.log('❌ ADMIN HAS NO PERMISSIONS ASSIGNED!');
                    console.log('🔧 Need to assign permissions to admin role');
                    
                    // Fix: Assign all permissions to admin
                    console.log('\n🔧 FIXING: Assigning all permissions to admin role...');
                    db.query(`
                        INSERT IGNORE INTO role_permissions (role_id, permission_id)
                        SELECT ?, p.id FROM permissions p
                    `, [admin.role_id], (err, result) => {
                        if (err) {
                            console.error('❌ Error assigning permissions:', err);
                            return;
                        }
                        
                        console.log(`✅ Assigned ${result.affectedRows} permissions to admin role`);
                        
                        // Verify fix
                        testAdminLogin();
                    });
                } else {
                    // 5. Check what permissions admin actually has
                    console.log('\n5. Checking admin permissions details...');
                    db.query(`
                        SELECT p.name, p.display_name, p.category
                        FROM permissions p
                        JOIN role_permissions rp ON p.id = rp.permission_id
                        WHERE rp.role_id = ?
                        LIMIT 10
                    `, [admin.role_id], (err, permissions) => {
                        if (err) {
                            console.error('❌ Error getting permissions:', err);
                            return;
                        }
                        
                        console.log('📋 Sample admin permissions:');
                        permissions.forEach(perm => {
                            console.log(`   ${perm.name} (${perm.category})`);
                        });
                        
                        testAdminLogin();
                    });
                }
            });
        });
    });
});

function testAdminLogin() {
    console.log('\n6. Testing admin login simulation...');
    
    // Simulate the login query from permissionsController.js
    db.query(`
        SELECT u.*, r.name as role_name, r.display_name as role_display_name
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.email = 'admin@company.com'
    `, (err, users) => {
        if (err) {
            console.error('❌ Login query error:', err);
            return;
        }
        
        if (users.length === 0) {
            console.log('❌ Admin user not found in login query');
            return;
        }
        
        const user = users[0];
        console.log('👤 Login user data:', {
            id: user.id,
            name: user.name,
            email: user.email,
            role_id: user.role_id,
            role_name: user.role_name
        });
        
        // Get permissions like the controller does
        db.query(`
            SELECT p.name, p.display_name, p.category
            FROM permissions p
            JOIN role_permissions rp ON p.id = rp.permission_id
            WHERE rp.role_id = ? AND p.is_active = true
        `, [user.role_id], (err, permissions) => {
            if (err) {
                console.error('❌ Permissions query error:', err);
                return;
            }
            
            console.log(`📊 Permissions returned for admin: ${permissions.length}`);
            
            if (permissions.length === 0) {
                console.log('❌ NO PERMISSIONS RETURNED FOR ADMIN!');
                console.log('🔧 This is the root cause of zero permissions in frontend');
            } else {
                console.log('✅ Admin permissions found:');
                permissions.slice(0, 5).forEach(perm => {
                    console.log(`   ${perm.name}`);
                });
                
                // Show what would be sent to frontend
                const frontendPermissions = permissions.map(p => p.name);
                console.log('\n📤 Permissions sent to frontend:', frontendPermissions.slice(0, 5));
            }
            
            db.end();
            console.log('\n🎯 DIAGNOSIS COMPLETE');
        });
    });
}