// Emergency fix for admin permissions
const mysql = require('mysql2');

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Huny@2024',
    database: 'hunyhuny_auto_dispatch'
});

console.log('🚨 EMERGENCY ADMIN PERMISSIONS FIX');
console.log('='.repeat(50));

async function fixAdminPermissions() {
    try {
        // 1. Ensure permissions table exists with correct structure
        console.log('1. Checking/creating permissions table...');
        
        await new Promise((resolve, reject) => {
            db.query(`
                CREATE TABLE IF NOT EXISTS permissions (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    name VARCHAR(100) NOT NULL UNIQUE,
                    display_name VARCHAR(150) NOT NULL,
                    description TEXT,
                    category VARCHAR(50) NOT NULL,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    
                    INDEX idx_name (name),
                    INDEX idx_category (category),
                    INDEX idx_active (is_active)
                )
            `, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        // 2. Ensure roles table exists
        console.log('2. Checking/creating roles table...');
        
        await new Promise((resolve, reject) => {
            db.query(`
                CREATE TABLE IF NOT EXISTS roles (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    name VARCHAR(50) NOT NULL UNIQUE,
                    display_name VARCHAR(100) NOT NULL,
                    description TEXT,
                    color VARCHAR(7) DEFAULT '#6366f1',
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    
                    INDEX idx_name (name),
                    INDEX idx_active (is_active)
                )
            `, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        // 3. Ensure role_permissions table exists
        console.log('3. Checking/creating role_permissions table...');
        
        await new Promise((resolve, reject) => {
            db.query(`
                CREATE TABLE IF NOT EXISTS role_permissions (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    role_id INT NOT NULL,
                    permission_id INT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    
                    UNIQUE KEY unique_role_permission (role_id, permission_id),
                    INDEX idx_role (role_id),
                    INDEX idx_permission (permission_id)
                )
            `, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        // 4. Add role_id column to users if missing
        console.log('4. Adding role_id to users table...');
        
        await new Promise((resolve, reject) => {
            db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id INT`, (err) => {
                if (err && !err.message.includes('Duplicate column')) reject(err);
                else resolve();
            });
        });
        
        // 5. Insert super_admin role
        console.log('5. Creating super_admin role...');
        
        await new Promise((resolve, reject) => {
            db.query(`
                INSERT IGNORE INTO roles (name, display_name, description, color) 
                VALUES ('super_admin', 'Super Admin', 'Full system access with all permissions', '#ef4444')
            `, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        // 6. Insert essential permissions
        console.log('6. Creating essential permissions...');
        
        const permissions = [
            // System permissions
            ['system.user_management', 'User Management', 'Manage system users and accounts', 'system'],
            ['system.role_management', 'Role Management', 'Manage user roles and permissions', 'system'],
            ['system.audit_log', 'Audit Log', 'View system audit logs and user activities', 'system'],
            
            // Inventory permissions
            ['inventory.view', 'View Inventory', 'View inventory items and stock levels', 'inventory'],
            ['inventory.create', 'Create Inventory', 'Add new inventory items', 'inventory'],
            ['inventory.edit', 'Edit Inventory', 'Modify existing inventory items', 'inventory'],
            ['inventory.delete', 'Delete Inventory', 'Remove inventory items', 'inventory'],
            ['inventory.bulk_upload', 'Bulk Upload Inventory', 'Upload inventory in bulk via CSV', 'inventory'],
            ['inventory.transfer', 'Transfer Inventory', 'Transfer inventory between warehouses', 'inventory'],
            
            // Orders permissions
            ['orders.view', 'View Orders', 'View order list and details', 'orders'],
            ['orders.create', 'Create Orders', 'Create new orders', 'orders'],
            ['orders.edit', 'Edit Orders', 'Modify existing orders', 'orders'],
            ['orders.delete', 'Delete Orders', 'Cancel or delete orders', 'orders'],
            ['orders.dispatch', 'Dispatch Orders', 'Dispatch orders for delivery', 'orders'],
            ['orders.status_update', 'Update Order Status', 'Update order status and tracking', 'orders'],
            
            // Products permissions
            ['products.view', 'View Products', 'View product catalog and details', 'products'],
            ['products.create', 'Create Products', 'Add new products to catalog', 'products'],
            ['products.edit', 'Edit Products', 'Modify existing product information', 'products'],
            ['products.delete', 'Delete Products', 'Remove products from catalog', 'products'],
            ['products.bulk_import', 'Bulk Import Products', 'Import products in bulk via CSV', 'products'],
            ['products.categories', 'Manage Categories', 'Manage product categories and classifications', 'products'],
            ['products.self_transfer', 'Self Transfer Products', 'Transfer products between locations', 'products'],
            
            // Operations permissions
            ['operations.dispatch', 'Dispatch Operations', 'Handle dispatch operations', 'operations'],
            ['operations.return', 'Return Operations', 'Handle return operations', 'operations'],
            ['operations.damage', 'Damage Operations', 'Handle damage recovery operations', 'operations'],
            ['operations.bulk', 'Bulk Operations', 'Handle bulk operations', 'operations'],
            ['operations.self_transfer', 'Self Transfer Operations', 'Handle self transfer operations', 'operations']
        ];
        
        for (const [name, display_name, description, category] of permissions) {
            await new Promise((resolve, reject) => {
                db.query(`
                    INSERT IGNORE INTO permissions (name, display_name, description, category) 
                    VALUES (?, ?, ?, ?)
                `, [name, display_name, description, category], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        }
        
        // 7. Get super_admin role ID
        console.log('7. Getting super_admin role ID...');
        
        const roleResult = await new Promise((resolve, reject) => {
            db.query(`SELECT id FROM roles WHERE name = 'super_admin'`, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        
        if (roleResult.length === 0) {
            throw new Error('Super admin role not found');
        }
        
        const superAdminRoleId = roleResult[0].id;
        console.log(`✅ Super admin role ID: ${superAdminRoleId}`);
        
        // 8. Assign ALL permissions to super_admin
        console.log('8. Assigning all permissions to super_admin...');
        
        await new Promise((resolve, reject) => {
            db.query(`
                INSERT IGNORE INTO role_permissions (role_id, permission_id)
                SELECT ?, p.id FROM permissions p
            `, [superAdminRoleId], (err, result) => {
                if (err) reject(err);
                else {
                    console.log(`✅ Assigned ${result.affectedRows} permissions to super_admin`);
                    resolve();
                }
            });
        });
        
        // 9. Update admin user to have super_admin role
        console.log('9. Updating admin user role...');
        
        await new Promise((resolve, reject) => {
            db.query(`
                UPDATE users 
                SET role_id = ? 
                WHERE email = 'admin@company.com'
            `, [superAdminRoleId], (err, result) => {
                if (err) reject(err);
                else {
                    console.log(`✅ Updated ${result.affectedRows} admin user(s)`);
                    resolve();
                }
            });
        });
        
        // 10. Verify the fix
        console.log('10. Verifying the fix...');
        
        const verifyResult = await new Promise((resolve, reject) => {
            db.query(`
                SELECT u.id, u.name, u.email, u.role_id, r.name as role_name,
                       COUNT(rp.permission_id) as permission_count
                FROM users u
                JOIN roles r ON u.role_id = r.id
                LEFT JOIN role_permissions rp ON r.id = rp.role_id
                WHERE u.email = 'admin@company.com'
                GROUP BY u.id, u.name, u.email, u.role_id, r.name
            `, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        
        if (verifyResult.length > 0) {
            const admin = verifyResult[0];
            console.log('✅ ADMIN USER VERIFICATION:');
            console.log(`   ID: ${admin.id}`);
            console.log(`   Name: ${admin.name}`);
            console.log(`   Email: ${admin.email}`);
            console.log(`   Role ID: ${admin.role_id}`);
            console.log(`   Role Name: ${admin.role_name}`);
            console.log(`   Permission Count: ${admin.permission_count}`);
            
            if (admin.permission_count > 0) {
                console.log('\n🎉 SUCCESS! Admin now has permissions assigned.');
                console.log('🔄 Please restart your server and try logging in again.');
            } else {
                console.log('\n❌ Still no permissions found for admin.');
            }
        } else {
            console.log('\n❌ Admin user not found after fix attempt.');
        }
        
    } catch (error) {
        console.error('❌ Error during fix:', error);
    } finally {
        db.end();
    }
}

// Run the fix
fixAdminPermissions();