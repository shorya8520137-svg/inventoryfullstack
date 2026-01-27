/**
 * DATABASE VERIFICATION SCRIPT
 * Verifies database setup and table structure
 */

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

const SSH_COMMAND = 'ssh -i "C:\\Users\\Admin\\e2c.pem" ubuntu@54.179.63.233';

async function runSSHCommand(command) {
    try {
        const { stdout, stderr } = await execAsync(`${SSH_COMMAND} "${command}"`);
        return { success: true, output: stdout, error: stderr };
    } catch (error) {
        return { success: false, output: '', error: error.message };
    }
}

async function verifyDatabase() {
    console.log('🔍 Verifying Database Setup on Server...\n');
    
    const tests = [
        {
            name: 'MySQL Service Status',
            command: 'systemctl is-active mysql'
        },
        {
            name: 'Database Exists',
            command: 'mysql -u inventory_user -pStrongPass@123 -e "SHOW DATABASES;" | grep inventory_db'
        },
        {
            name: 'Table Count',
            command: 'mysql -u inventory_user -pStrongPass@123 inventory_db -e "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema=\'inventory_db\';"'
        },
        {
            name: 'Users Table Structure',
            command: 'mysql -u inventory_user -pStrongPass@123 inventory_db -e "DESCRIBE users;"'
        },
        {
            name: '2FA Columns Check',
            command: 'mysql -u inventory_user -pStrongPass@123 inventory_db -e "DESCRIBE users;" | grep two_factor'
        },
        {
            name: 'User Count',
            command: 'mysql -u inventory_user -pStrongPass@123 inventory_db -e "SELECT COUNT(*) as user_count FROM users;"'
        },
        {
            name: 'Products Table',
            command: 'mysql -u inventory_user -pStrongPass@123 inventory_db -e "SELECT COUNT(*) as product_count FROM products;"'
        },
        {
            name: 'Audit Logs Table',
            command: 'mysql -u inventory_user -pStrongPass@123 inventory_db -e "SELECT COUNT(*) as audit_count FROM audit_logs;"'
        },
        {
            name: 'Notifications Table',
            command: 'mysql -u inventory_user -pStrongPass@123 inventory_db -e "SELECT COUNT(*) as notification_count FROM notifications;"'
        },
        {
            name: 'All Tables List',
            command: 'mysql -u inventory_user -pStrongPass@123 inventory_db -e "SHOW TABLES;"'
        }
    ];
    
    const results = [];
    
    for (const test of tests) {
        console.log(`🔍 ${test.name}...`);
        const result = await runSSHCommand(test.command);
        
        if (result.success && result.output.trim()) {
            console.log(`✅ ${test.name}: PASS`);
            console.log(`📊 Output: ${result.output.trim()}\n`);
            results.push({ name: test.name, status: 'PASS', output: result.output.trim() });
        } else {
            console.log(`❌ ${test.name}: FAIL`);
            console.log(`❌ Error: ${result.error}\n`);
            results.push({ name: test.name, status: 'FAIL', error: result.error });
        }
    }
    
    // Summary
    console.log('='.repeat(60));
    console.log('📋 DATABASE VERIFICATION SUMMARY');
    console.log('='.repeat(60));
    
    const passCount = results.filter(r => r.status === 'PASS').length;
    const totalCount = results.length;
    
    results.forEach(result => {
        console.log(`${result.status === 'PASS' ? '✅' : '❌'} ${result.name}: ${result.status}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log(`🎯 OVERALL: ${passCount}/${totalCount} tests passed`);
    
    if (passCount >= 8) {
        console.log('🎉 DATABASE IS PROPERLY CONFIGURED!');
        console.log('\n✅ Ready for:');
        console.log('   - User authentication');
        console.log('   - 2FA implementation');
        console.log('   - Inventory management');
        console.log('   - Audit logging');
        console.log('   - Notifications');
    } else {
        console.log('⚠️  DATABASE NEEDS ATTENTION');
        console.log('\n🔧 Recommended actions:');
        console.log('   1. Run database setup script');
        console.log('   2. Check MySQL service status');
        console.log('   3. Verify user permissions');
        console.log('   4. Restore database backup');
    }
    
    console.log('='.repeat(60));
}

// Run verification
verifyDatabase().catch(console.error);