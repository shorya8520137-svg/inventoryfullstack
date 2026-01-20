// QUICK FIX FOR API PERMISSIONS ISSUE
// The problem: User can login but gets 403 on all API calls because they don't have specific permissions

const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'inventory_system'
});

async function fixApiPermissions() {
    console.log('🔧 FIXING API PERMISSIONS ISSUE');
    console.log('================================');

    try {
        // 1. Check if roles table exists and has data
        console.log('\n1️⃣ Checking roles table...');
        const roles = await query('SELECT * FROM roles');
        console.log('Roles found:', roles.length);
        
        if (roles.length === 0) {
            console.log('❌ No roles found! Creating default roles...');
            await createDefaultRoles();
        }

        // 2. Check if permissions table exists and has data
        console.log('\n2️⃣ Checking permissions table...');
        const permissions = await query('SELECT * FROM permissions');
        console.log('Permissions found:', permissions.length);
        
        if (permissions.length === 0) {
            console.log('❌ No permissions found! Creating default permissions...');
            await createDefaultPermissions();
        }

        // 3. Check role_permissions mapping
        console.log('\n3️⃣ Checking role-permission mappings...');
        const rolePerm = await query('SELECT * FROM role_permissions');
        console.log('Role-permission mappings found:', rolePerm.length);
        
        if (rolePerm.length === 0) {
            console.log('❌ No role-permission mappings! Creating default mappings...');
            await createDefaultRolePermissions();
        }

        // 4. Update all users to have proper role_id
        console.log('\n4️⃣ Fixing user role assignments...');
        
        // Set admin user to super_admin role (role_id = 1)
        await query(`
            UPDATE users 
            SET role_id = 1 
            WHERE email = 'admin@company.com' OR name = 'System Administrator'
        `);
        
        // Set other users to appropriate roles based on their current role_id
        // If role_id is null or invalid, set to viewer (role_id = 6)
        await query(`
            UPDATE users u
            LEFT JOIN roles r ON u.role_id = r.id
            SET u.role_id = 6
            WHERE r.id IS NULL
        `);

        console.log('✅ User role assignments fixed');

        // 5. Test the fix
        console.log('\n5️⃣ Testing the fix...');
        await testPermissionsFix();

        console.log('\n✅ API PERMISSIONS ISSUE FIXED!');
        console.log('================================');
        console.log('Now restart your server and try logging in again.');

    } catch (error) {
        console.error('❌ Error fixing API permissions:', error);
    } finally {
        db.end();
    }
}

async function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

async function createDefaultRoles() {
    const roles = [
        { id: 1, name: 'super_admin', display_name: 'Super Administrator', color: '#dc2626', priority: 1 },
        { id: 2, name: 'admin', display_name: 'Administrator', color: '#ea580c', priority: 2 },
        { id: 3, name: 'manager', display_name: 'Manager', color: '#ca8a04', priority: 3 },
        { id: 4, name: 'operator', display_name: 'Operator', color: '#16a34a', priority: 4 },
        { id: 5, name: 'warehouse', display_name: 'Warehouse Staff', color: '#2563eb', priority: 5 },
        { id: 6, name: 'viewer', display_name: 'Viewer', color: '#6b7280', priority: 6 }
    ];

    for (const role of roles) {
        await query(`
            INSERT INTO roles (id, name, display_name, color, priority) 
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            display_name = VALUES(display_name),
            color = VALUES(color),
            priority = VALUES(priority)
        `, [role.id, role.name, role.display_name, role.color, role.priority]);
    }
    console.log('✅ Default roles created');
}

async function createDefaultPermissions() {
    const permissions = [
        // Basic permissions that most users need
        { name: 'INVENTORY_VIEW', display_name: 'View Inventory', category: 'INVENTORY' },
        { name: 'PRODUCTS_VIEW', display_name: 'View Products', category: 'PRODUCTS' },
        { name: 'ORDERS_VIEW', display_name: 'View Orders', category: 'ORDERS' },
        { name: 'DISPATCH_VIEW', display_name: 'View Dispatch', category: 'DISPATCH' },
        
        // Admin permissions
        { name: 'INVENTORY_MANAGE', display_name: 'Manage Inventory', category: 'INVENTORY' },
        { name: 'PRODUCTS_MANAGE', display_name: 'Manage Products', category: 'PRODUCTS' },
        { name: 'ORDERS_MANAGE', display_name: 'Manage Orders', category: 'ORDERS' },
        { name: 'DISPATCH_MANAGE', display_name: 'Manage Dispatch', category: 'DISPATCH' },
        
        // System permissions
        { name: 'SYSTEM_USER_MANAGEMENT', display_name: 'User Management', category: 'SYSTEM' },
        { name: 'SYSTEM_ROLE_MANAGEMENT', display_name: 'Role Management', category: 'SYSTEM' }
    ];

    for (const perm of permissions) {
        await query(`
            INSERT INTO permissions (name, display_name, category) 
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            display_name = VALUES(display_name),
            category = VALUES(category)
        `, [perm.name, perm.display_name, perm.category]);
    }
    console.log('✅ Default permissions created');
}

async function createDefaultRolePermissions() {
    // Get all permissions
    const allPermissions = await query('SELECT id FROM permissions');
    
    // Super Admin (role_id = 1) - All permissions
    for (const perm of allPermissions) {
        await query(`
            INSERT IGNORE INTO role_permissions (role_id, permission_id) 
            VALUES (1, ?)
        `, [perm.id]);
    }
    
    // Admin (role_id = 2) - Most permissions except system management
    const adminPermissions = await query(`
        SELECT id FROM permissions 
        WHERE category IN ('INVENTORY', 'PRODUCTS', 'ORDERS', 'DISPATCH')
    `);
    for (const perm of adminPermissions) {
        await query(`
            INSERT IGNORE INTO role_permissions (role_id, permission_id) 
            VALUES (2, ?)
        `, [perm.id]);
    }
    
    // Manager (role_id = 3) - View and some manage permissions
    const managerPermissions = await query(`
        SELECT id FROM permissions 
        WHERE name LIKE '%_VIEW' OR name LIKE '%_MANAGE'
    `);
    for (const perm of managerPermissions) {
        await query(`
            INSERT IGNORE INTO role_permissions (role_id, permission_id) 
            VALUES (3, ?)
        `, [perm.id]);
    }
    
    // Operator (role_id = 4) - Basic operational permissions
    const operatorPermissions = await query(`
        SELECT id FROM permissions 
        WHERE name IN ('INVENTORY_VIEW', 'PRODUCTS_VIEW', 'ORDERS_VIEW', 'DISPATCH_VIEW', 'INVENTORY_MANAGE')
    `);
    for (const perm of operatorPermissions) {
        await query(`
            INSERT IGNORE INTO role_permissions (role_id, permission_id) 
            VALUES (4, ?)
        `, [perm.id]);
    }
    
    // Warehouse (role_id = 5) - Inventory focused
    const warehousePermissions = await query(`
        SELECT id FROM permissions 
        WHERE name LIKE 'INVENTORY_%' OR name = 'PRODUCTS_VIEW'
    `);
    for (const perm of warehousePermissions) {
        await query(`
            INSERT IGNORE INTO role_permissions (role_id, permission_id) 
            VALUES (5, ?)
        `, [perm.id]);
    }
    
    // Viewer (role_id = 6) - Only view permissions
    const viewerPermissions = await query(`
        SELECT id FROM permissions 
        WHERE name LIKE '%_VIEW'
    `);
    for (const perm of viewerPermissions) {
        await query(`
            INSERT IGNORE INTO role_permissions (role_id, permission_id) 
            VALUES (6, ?)
        `, [perm.id]);
    }
    
    console.log('✅ Default role-permission mappings created');
}

async function testPermissionsFix() {
    // Test admin user
    const adminUser = await query(`
        SELECT u.id, u.name, u.email, u.role_id, r.name as role_name, r.display_name
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.email = 'admin@company.com'
    `);
    
    if (adminUser.length > 0) {
        console.log('✅ Admin user:', adminUser[0]);
        
        const adminPermissions = await query(`
            SELECT COUNT(*) as count
            FROM role_permissions rp
            WHERE rp.role_id = ?
        `, [adminUser[0].role_id]);
        
        console.log(`✅ Admin has ${adminPermissions[0].count} permissions`);
    }
    
    // Test all users
    const usersWithRoles = await query(`
        SELECT u.id, u.name, u.email, u.role_id, r.name as role_name, 
               COUNT(rp.permission_id) as permission_count
        FROM users u
        JOIN roles r ON u.role_id = r.id
        LEFT JOIN role_permissions rp ON r.id = rp.role_id
        GROUP BY u.id, u.name, u.email, u.role_id, r.name
        LIMIT 5
    `);
    
    console.log('\n✅ Users with permissions:');
    usersWithRoles.forEach(user => {
        console.log(`   ${user.name} (${user.role_name}) - ${user.permission_count} permissions`);
    });
}

// Run the fix
if (require.main === module) {
    fixApiPermissions();
}

module.exports = { fixApiPermissions };