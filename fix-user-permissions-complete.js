// COMPLETE FIX FOR USER PERMISSIONS ISSUE
// Admin works, regular users get 403 - this fixes the permissions system

require('dotenv').config();
const mysql = require('mysql2');

require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'inventory_user',
    password: process.env.DB_PASSWORD || 'StrongPass@123',
    database: process.env.DB_NAME || 'inventory_db'
});

async function fixUserPermissions() {
    console.log('🔧 FIXING USER PERMISSIONS SYSTEM');
    console.log('==================================');

    try {
        // 1. Create permissions table with EXACT route permission names
        console.log('\n1️⃣ Creating permissions with route-matching names...');
        await createRouteMatchingPermissions();

        // 2. Create roles table
        console.log('\n2️⃣ Creating roles...');
        await createRoles();

        // 3. Create role_permissions mappings
        console.log('\n3️⃣ Creating role-permission mappings...');
        await createRolePermissions();

        // 4. Fix user role assignments
        console.log('\n4️⃣ Fixing user role assignments...');
        await fixUserRoles();

        // 5. Test the fix
        console.log('\n5️⃣ Testing permissions...');
        await testPermissions();

        console.log('\n✅ USER PERMISSIONS FIXED!');
        console.log('==========================');
        console.log('Now restart your server and test with regular users.');

    } catch (error) {
        console.error('❌ Error fixing permissions:', error);
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

async function createRouteMatchingPermissions() {
    // Create permissions table if not exists
    await query(`
        CREATE TABLE IF NOT EXISTS permissions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) UNIQUE NOT NULL,
            display_name VARCHAR(200) NOT NULL,
            category VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Permissions that EXACTLY match your route checkPermission() calls
    const permissions = [
        // Products permissions (from productRoutes.js)
        { name: 'products.view', display_name: 'View Products', category: 'PRODUCTS' },
        { name: 'products.create', display_name: 'Create Products', category: 'PRODUCTS' },
        { name: 'products.edit', display_name: 'Edit Products', category: 'PRODUCTS' },
        { name: 'products.delete', display_name: 'Delete Products', category: 'PRODUCTS' },
        { name: 'products.categories', display_name: 'Manage Categories', category: 'PRODUCTS' },
        { name: 'products.bulk_import', display_name: 'Bulk Import Products', category: 'PRODUCTS' },
        
        // Inventory permissions (from productRoutes.js)
        { name: 'inventory.view', display_name: 'View Inventory', category: 'INVENTORY' },
        { name: 'inventory.export', display_name: 'Export Inventory', category: 'INVENTORY' },
        { name: 'inventory.transfer', display_name: 'Transfer Inventory', category: 'INVENTORY' },
        { name: 'inventory.timeline', display_name: 'View Timeline', category: 'INVENTORY' },
        
        // Operations permissions (from various routes)
        { name: 'operations.return', display_name: 'Manage Returns', category: 'OPERATIONS' },
        { name: 'operations.bulk', display_name: 'Bulk Operations', category: 'OPERATIONS' },
        { name: 'operations.self_transfer', display_name: 'Self Transfer', category: 'OPERATIONS' },
        
        // System permissions (from permissionsRoutes.js)
        { name: 'SYSTEM_USER_MANAGEMENT', display_name: 'User Management', category: 'SYSTEM' },
        { name: 'SYSTEM_ROLE_MANAGEMENT', display_name: 'Role Management', category: 'SYSTEM' },
        { name: 'SYSTEM_AUDIT_LOG', display_name: 'Audit Logs', category: 'SYSTEM' },
        { name: 'SYSTEM_MONITORING', display_name: 'System Monitoring', category: 'SYSTEM' }
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
    
    console.log(`✅ Created ${permissions.length} permissions`);
}

async function createRoles() {
    // Create roles table if not exists
    await query(`
        CREATE TABLE IF NOT EXISTS roles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(50) UNIQUE NOT NULL,
            display_name VARCHAR(100) NOT NULL,
            color VARCHAR(20) DEFAULT '#6b7280',
            priority INT DEFAULT 999,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

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
    
    console.log('✅ Created 6 roles');
}

async function createRolePermissions() {
    // Create role_permissions table if not exists
    await query(`
        CREATE TABLE IF NOT EXISTS role_permissions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            role_id INT NOT NULL,
            permission_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_role_permission (role_id, permission_id),
            FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
            FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
        )
    `);

    // Clear existing mappings
    await query('DELETE FROM role_permissions');

    // Get all permissions
    const allPermissions = await query('SELECT id, name FROM permissions');
    
    // Super Admin (role_id = 1) - ALL permissions
    for (const perm of allPermissions) {
        await query(`
            INSERT IGNORE INTO role_permissions (role_id, permission_id) 
            VALUES (1, ?)
        `, [perm.id]);
    }
    
    // Admin (role_id = 2) - All except system management
    const adminPermissions = allPermissions.filter(p => !p.name.startsWith('SYSTEM_'));
    for (const perm of adminPermissions) {
        await query(`
            INSERT IGNORE INTO role_permissions (role_id, permission_id) 
            VALUES (2, ?)
        `, [perm.id]);
    }
    
    // Manager (role_id = 3) - View and basic operations
    const managerPermissions = allPermissions.filter(p => 
        p.name.includes('.view') || 
        p.name.includes('.export') || 
        p.name === 'operations.return' ||
        p.name === 'inventory.transfer'
    );
    for (const perm of managerPermissions) {
        await query(`
            INSERT IGNORE INTO role_permissions (role_id, permission_id) 
            VALUES (3, ?)
        `, [perm.id]);
    }
    
    // Operator (role_id = 4) - Basic operational permissions
    const operatorPermissions = allPermissions.filter(p => 
        p.name === 'products.view' ||
        p.name === 'inventory.view' ||
        p.name === 'inventory.transfer' ||
        p.name === 'operations.return'
    );
    for (const perm of operatorPermissions) {
        await query(`
            INSERT IGNORE INTO role_permissions (role_id, permission_id) 
            VALUES (4, ?)
        `, [perm.id]);
    }
    
    // Warehouse (role_id = 5) - Inventory focused
    const warehousePermissions = allPermissions.filter(p => 
        p.name.startsWith('inventory.') || 
        p.name === 'products.view' ||
        p.name === 'operations.self_transfer'
    );
    for (const perm of warehousePermissions) {
        await query(`
            INSERT IGNORE INTO role_permissions (role_id, permission_id) 
            VALUES (5, ?)
        `, [perm.id]);
    }
    
    // Viewer (role_id = 6) - Only view permissions
    const viewerPermissions = allPermissions.filter(p => 
        p.name === 'products.view' ||
        p.name === 'inventory.view'
    );
    for (const perm of viewerPermissions) {
        await query(`
            INSERT IGNORE INTO role_permissions (role_id, permission_id) 
            VALUES (6, ?)
        `, [perm.id]);
    }
    
    console.log('✅ Created role-permission mappings');
}

async function fixUserRoles() {
    // Set admin user to super_admin role (role_id = 1)
    await query(`
        UPDATE users 
        SET role_id = 1, role = 'super_admin'
        WHERE email = 'admin@company.com' OR name = 'System Administrator'
    `);
    
    // Set test users to appropriate roles
    await query(`
        UPDATE users 
        SET role_id = 3, role = 'manager'
        WHERE email LIKE '%test%' AND email != 'admin@company.com'
    `);
    
    // Set any remaining users without valid role_id to viewer
    await query(`
        UPDATE users u
        LEFT JOIN roles r ON u.role_id = r.id
        SET u.role_id = 6, u.role = 'viewer'
        WHERE r.id IS NULL OR u.role_id IS NULL
    `);

    console.log('✅ Fixed user role assignments');
}

async function testPermissions() {
    // Test admin user
    const adminUser = await query(`
        SELECT u.id, u.name, u.email, u.role_id, r.name as role_name, 
               COUNT(rp.permission_id) as permission_count
        FROM users u
        JOIN roles r ON u.role_id = r.id
        LEFT JOIN role_permissions rp ON r.id = rp.role_id
        WHERE u.email = 'admin@company.com'
        GROUP BY u.id, u.name, u.email, u.role_id, r.name
    `);
    
    if (adminUser.length > 0) {
        console.log('✅ Admin user:', adminUser[0]);
    }
    
    // Test regular users
    const testUsers = await query(`
        SELECT u.id, u.name, u.email, u.role_id, r.name as role_name, 
               COUNT(rp.permission_id) as permission_count
        FROM users u
        JOIN roles r ON u.role_id = r.id
        LEFT JOIN role_permissions rp ON r.id = rp.role_id
        WHERE u.email LIKE '%test%' AND u.email != 'admin@company.com'
        GROUP BY u.id, u.name, u.email, u.role_id, r.name
        LIMIT 3
    `);
    
    console.log('\n✅ Test users with permissions:');
    testUsers.forEach(user => {
        console.log(`   ${user.name} (${user.role_name}) - ${user.permission_count} permissions`);
    });

    // Show specific permissions for a test user
    if (testUsers.length > 0) {
        const userPermissions = await query(`
            SELECT p.name, p.display_name
            FROM permissions p
            JOIN role_permissions rp ON p.id = rp.permission_id
            WHERE rp.role_id = ?
            ORDER BY p.category, p.name
        `, [testUsers[0].role_id]);
        
        console.log(`\n✅ Permissions for ${testUsers[0].name}:`);
        userPermissions.forEach(perm => {
            console.log(`   - ${perm.name} (${perm.display_name})`);
        });
    }
}

// Run the fix
if (require.main === module) {
    fixUserPermissions();
}

module.exports = { fixUserPermissions };