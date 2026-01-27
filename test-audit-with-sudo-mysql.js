/**
 * TEST AUDIT SYSTEM WITH SUDO MYSQL
 * Tests audit system by connecting to the remote server and using sudo mysql
 */

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

const SERVER_IP = '13.60.36.159';
const SSH_KEY = 'C:\\Users\\Admin\\awsconection.pem';

async function runSSHCommand(command) {
    try {
        const sshCommand = `ssh -i "${SSH_KEY}" -o StrictHostKeyChecking=no ubuntu@${SERVER_IP} '${command}'`;
        console.log(`🔍 Running: ${command}`);
        
        const { stdout, stderr } = await execAsync(sshCommand);
        
        if (stderr && !stderr.includes('Warning')) {
            console.log(`⚠️ Warning: ${stderr}`);
        }
        
        return stdout.trim();
    } catch (error) {
        console.error(`❌ SSH command failed: ${error.message}`);
        throw error;
    }
}

async function testAuditSystemOnServer() {
    try {
        console.log('🧪 AUDIT SYSTEM TEST ON SERVER');
        console.log('===============================');
        console.log(`📡 Connecting to server: ${SERVER_IP}`);
        
        // Test 1: Check if audit_logs table exists
        console.log('\n📋 Checking audit_logs table structure...');
        const tableStructure = await runSSHCommand('sudo mysql -e "USE inventory_db; DESCRIBE audit_logs;"');
        
        if (tableStructure) {
            console.log('✅ audit_logs table exists:');
            console.log(tableStructure);
        } else {
            console.log('❌ audit_logs table not found');
            return;
        }
        
        // Test 2: Count total audit logs
        console.log('\n📊 Counting audit logs...');
        const totalCount = await runSSHCommand('sudo mysql -e "USE inventory_db; SELECT COUNT(*) as total FROM audit_logs;" | tail -n 1');
        console.log(`✅ Total audit logs: ${totalCount}`);
        
        // Test 3: Get recent audit logs
        console.log('\n📝 Fetching recent audit logs...');
        const recentLogs = await runSSHCommand(`sudo mysql -e "USE inventory_db; SELECT al.id, al.action, al.resource, al.user_id, u.name as user_name, al.ip_address, al.created_at FROM audit_logs al LEFT JOIN users u ON al.user_id = u.id ORDER BY al.created_at DESC LIMIT 10;" | column -t`);
        
        if (recentLogs) {
            console.log('✅ Recent audit logs:');
            console.log(recentLogs);
        } else {
            console.log('❌ No recent audit logs found');
        }
        
        // Test 4: Check audit logs by action type
        console.log('\n📈 Audit logs by action type...');
        const actionStats = await runSSHCommand('sudo mysql -e "USE inventory_db; SELECT action, COUNT(*) as count FROM audit_logs GROUP BY action ORDER BY count DESC;" | column -t');
        
        if (actionStats) {
            console.log('✅ Action statistics:');
            console.log(actionStats);
        }
        
        // Test 5: Check audit logs by resource type
        console.log('\n📈 Audit logs by resource type...');
        const resourceStats = await runSSHCommand('sudo mysql -e "USE inventory_db; SELECT resource, COUNT(*) as count FROM audit_logs GROUP BY resource ORDER BY count DESC;" | column -t');
        
        if (resourceStats) {
            console.log('✅ Resource statistics:');
            console.log(resourceStats);
        }
        
        // Test 6: Check for NULL user_id issues
        console.log('\n🔍 Checking for NULL user_id issues...');
        const nullUserIds = await runSSHCommand('sudo mysql -e "USE inventory_db; SELECT COUNT(*) as null_user_ids FROM audit_logs WHERE user_id IS NULL;" | tail -n 1');
        console.log(`${nullUserIds === '0' ? '✅' : '⚠️'} NULL user_ids: ${nullUserIds}`);
        
        // Test 7: Check for NULL ip_address issues
        console.log('\n🔍 Checking for NULL ip_address issues...');
        const nullIPs = await runSSHCommand('sudo mysql -e "USE inventory_db; SELECT COUNT(*) as null_ips FROM audit_logs WHERE ip_address IS NULL OR ip_address = \'\';" | tail -n 1');
        console.log(`${nullIPs === '0' ? '✅' : '⚠️'} NULL/empty IP addresses: ${nullIPs}`);
        
        // Test 8: Check recent events (last 24 hours)
        console.log('\n⏰ Recent events (last 24 hours)...');
        const recentEvents = await runSSHCommand('sudo mysql -e "USE inventory_db; SELECT action, resource, COUNT(*) as count FROM audit_logs WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) GROUP BY action, resource ORDER BY count DESC;" | column -t');
        
        if (recentEvents && recentEvents.includes('count')) {
            console.log('✅ Recent events:');
            console.log(recentEvents);
        } else {
            console.log('⚠️ No events in the last 24 hours');
        }
        
        // Test 9: Test audit log creation
        console.log('\n🧪 Testing audit log creation...');
        const testDetails = JSON.stringify({
            test_action: 'server_database_test',
            timestamp: new Date().toISOString(),
            test_data: 'This is a test audit log entry from server'
        });
        
        const insertCommand = `sudo mysql -e "USE inventory_db; INSERT INTO audit_logs (user_id, action, resource, resource_id, details, ip_address, user_agent, created_at) VALUES (1, 'TEST', 'SERVER_DATABASE', 'test_123', '${testDetails}', '127.0.0.1', 'Server Database Test', NOW());"`;
        
        await runSSHCommand(insertCommand);
        console.log('✅ Test audit log created');
        
        // Verify the test log was created
        const testLogId = await runSSHCommand('sudo mysql -e "USE inventory_db; SELECT id FROM audit_logs WHERE action = \'TEST\' AND resource = \'SERVER_DATABASE\' ORDER BY created_at DESC LIMIT 1;" | tail -n 1');
        
        if (testLogId && testLogId !== 'id') {
            console.log(`✅ Test audit log verified with ID: ${testLogId}`);
            
            // Clean up test log
            await runSSHCommand(`sudo mysql -e "USE inventory_db; DELETE FROM audit_logs WHERE id = ${testLogId};"`);
            console.log('🧹 Test audit log cleaned up');
        }
        
        // Test 10: Check server processes
        console.log('\n🔍 Checking server processes...');
        const nodeProcesses = await runSSHCommand('ps aux | grep node | grep -v grep || echo "No Node.js processes found"');
        console.log('Node.js processes:');
        console.log(nodeProcesses);
        
        const pm2Processes = await runSSHCommand('pm2 list || echo "PM2 not running or not installed"');
        console.log('\nPM2 processes:');
        console.log(pm2Processes);
        
        console.log('\n🎉 AUDIT SYSTEM SERVER TEST COMPLETED');
        
    } catch (error) {
        console.error('❌ Server test failed:', error.message);
        
        // Additional troubleshooting
        console.log('\n🔧 TROUBLESHOOTING INFORMATION:');
        console.log('================================');
        console.log('If the test failed, try these steps:');
        console.log('1. Check if SSH key is correct and accessible');
        console.log('2. Verify server IP address is correct');
        console.log('3. Ensure MySQL is running on the server');
        console.log('4. Check if inventory_db database exists');
        console.log('5. Verify audit_logs table structure');
        
        console.log('\nManual commands to run on server:');
        console.log(`ssh -i "${SSH_KEY}" ubuntu@${SERVER_IP}`);
        console.log('sudo mysql -e "SHOW DATABASES;"');
        console.log('sudo mysql -e "USE inventory_db; SHOW TABLES;"');
        console.log('sudo mysql -e "USE inventory_db; DESCRIBE audit_logs;"');
    }
}

// Run the test
testAuditSystemOnServer();