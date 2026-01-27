/**
 * Database Analysis Runner
 * This script will help you understand your database structure
 * Run this after connecting to your server
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 Database Analysis for Audit Logging System\n');
console.log('='.repeat(50));

console.log('\n📋 Instructions:');
console.log('1. Connect to your server via SSH:');
console.log('   ssh -i "C:\\Users\\Admin\\awsconection.pem" ubuntu@16.171.5.50');
console.log('\n2. Run the following commands on the server:\n');

// Generate the commands to run
const commands = [
    {
        title: '📊 Check MySQL Status',
        command: 'sudo systemctl status mysql --no-pager'
    },
    {
        title: '📋 Show All Databases',
        command: 'mysql -u root -e "SHOW DATABASES;"'
    },
    {
        title: '📊 Show All Tables',
        command: 'mysql -u root -e "USE inventory_system; SHOW TABLES;"'
    },
    {
        title: '📈 Table Row Counts and Sizes',
        command: `mysql -u root -e "
USE inventory_system; 
SELECT 
    table_name as 'Table', 
    table_rows as 'Rows',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) as 'Size_MB'
FROM information_schema.tables 
WHERE table_schema = 'inventory_system' 
ORDER BY table_rows DESC;"`
    },
    {
        title: '👥 User Management Tables',
        command: `mysql -u root -e "
USE inventory_system;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'inventory_system' 
AND (table_name LIKE '%user%' OR table_name LIKE '%role%' OR table_name LIKE '%permission%');"`
    },
    {
        title: '📦 Business Operation Tables',
        command: `mysql -u root -e "
USE inventory_system;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'inventory_system' 
AND (table_name LIKE '%dispatch%' OR table_name LIKE '%return%' OR table_name LIKE '%damage%' 
     OR table_name LIKE '%product%' OR table_name LIKE '%inventory%' OR table_name LIKE '%order%' 
     OR table_name LIKE '%transfer%' OR table_name LIKE '%bulk%');"`
    },
    {
        title: '🔍 Existing Audit/Log Tables',
        command: `mysql -u root -e "
USE inventory_system;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'inventory_system' 
AND (table_name LIKE '%audit%' OR table_name LIKE '%log%' OR table_name LIKE '%activity%' OR table_name LIKE '%history%');"`
    },
    {
        title: '📋 Users Table Structure',
        command: 'mysql -u root -e "USE inventory_system; DESCRIBE users;"'
    },
    {
        title: '👤 Sample Users Data',
        command: 'mysql -u root -e "USE inventory_system; SELECT id, name, email, role_name, is_active, created_at FROM users LIMIT 5;"'
    },
    {
        title: '📦 Products Table Structure',
        command: 'mysql -u root -e "USE inventory_system; DESCRIBE products;"'
    },
    {
        title: '🏷️ Sample Products Data',
        command: 'mysql -u root -e "USE inventory_system; SELECT id, name, sku, category, price, created_at FROM products LIMIT 5;"'
    },
    {
        title: '🚚 Dispatches Table Structure',
        command: 'mysql -u root -e "USE inventory_system; DESCRIBE dispatches;"'
    },
    {
        title: '📤 Sample Dispatch Data',
        command: 'mysql -u root -e "USE inventory_system; SELECT id, product_id, quantity, status, created_by, created_at FROM dispatches ORDER BY created_at DESC LIMIT 5;"'
    },
    {
        title: '↩️ Returns Table Structure',
        command: 'mysql -u root -e "USE inventory_system; DESCRIBE returns_main;"'
    },
    {
        title: '📥 Sample Returns Data',
        command: 'mysql -u root -e "USE inventory_system; SELECT id, product_id, quantity, reason, created_by, created_at FROM returns_main ORDER BY created_at DESC LIMIT 5;"'
    },
    {
        title: '💔 Damage Table Structure',
        command: 'mysql -u root -e "USE inventory_system; DESCRIBE damage_recovery;"'
    },
    {
        title: '⚠️ Sample Damage Data',
        command: 'mysql -u root -e "USE inventory_system; SELECT id, product_id, quantity, reason, created_by, created_at FROM damage_recovery ORDER BY created_at DESC LIMIT 5;"'
    },
    {
        title: '📊 Bulk Upload Table Structure',
        command: 'mysql -u root -e "USE inventory_system; DESCRIBE bulk_uploads;"'
    },
    {
        title: '📤 Sample Bulk Upload Data',
        command: 'mysql -u root -e "USE inventory_system; SELECT id, filename, total_records, processed_records, status, created_by, created_at FROM bulk_uploads ORDER BY created_at DESC LIMIT 5;"'
    }
];

// Output all commands
commands.forEach((cmd, index) => {
    console.log(`\n${index + 1}. ${cmd.title}`);
    console.log('-'.repeat(40));
    console.log(cmd.command);
    console.log('');
});

console.log('\n🎯 What We\'re Looking For:');
console.log('- User activities (login, logout, profile changes)');
console.log('- Product operations (create, update, delete)');
console.log('- Inventory movements (dispatch, return, damage, transfer)');
console.log('- Bulk operations (uploads, imports, exports)');
console.log('- Administrative actions (role changes, permissions)');

console.log('\n📝 After running these commands, we will:');
console.log('1. Create a proper audit_logs table');
console.log('2. Implement real-time activity tracking');
console.log('3. Build user-friendly audit log display');
console.log('4. Show meaningful messages like:');
console.log('   - "Shorya dispatched 50x Product ABC to Warehouse Delhi"');
console.log('   - "Admin processed return of 10x Product XYZ (Reason: Damaged)"');
console.log('   - "Manager uploaded bulk inventory file (500 items)"');

console.log('\n🚀 Ready to analyze your database!');
console.log('Copy and paste the commands above into your SSH session.');

// Also create a batch file for easy copying
const batchCommands = commands.map(cmd => cmd.command).join('\n\n');
fs.writeFileSync('database-analysis-batch.sql', batchCommands);
console.log('\n💾 Commands saved to: database-analysis-batch.sql');