/**
 * ANALYZE AUDIT DATABASE STRUCTURE
 * Connect to server database and analyze current audit system
 */

const { Client } = require('ssh2');
const fs = require('fs');

const sshConfig = {
    host: '13.60.36.159',
    port: 22,
    username: 'ubuntu',
    privateKey: fs.readFileSync('C:\\Users\\Admin\\awsconection.pem')
};

console.log('🔍 ANALYZING AUDIT DATABASE STRUCTURE');
console.log('='.repeat(60));

function connectAndAnalyze() {
    const conn = new Client();
    
    conn.on('ready', () => {
        console.log('✅ SSH Connection established to 13.60.36.159\n');
        
        // Execute database analysis commands
        const commands = [
            'echo "📊 CHECKING AUDIT LOGS TABLE STRUCTURE:"',
            'sudo mysql inventory_db -e "DESCRIBE audit_logs;"',
            '',
            'echo "📋 CURRENT AUDIT LOG ENTRIES:"',
            'sudo mysql inventory_db -e "SELECT action, resource, COUNT(*) as count FROM audit_logs GROUP BY action, resource ORDER BY count DESC LIMIT 10;"',
            '',
            'echo "📈 TOTAL AUDIT ENTRIES:"',
            'sudo mysql inventory_db -e "SELECT COUNT(*) as total_entries FROM audit_logs;"',
            '',
            'echo "🔍 RECENT AUDIT ENTRIES:"',
            'sudo mysql inventory_db -e "SELECT id, action, resource, resource_id, user_id, ip_address, created_at FROM audit_logs ORDER BY created_at DESC LIMIT 10;"',
            '',
            'echo "📊 ALL AVAILABLE RESOURCES IN AUDIT:"',
            'sudo mysql inventory_db -e "SELECT DISTINCT resource FROM audit_logs ORDER BY resource;"',
            '',
            'echo "🎯 ALL AVAILABLE ACTIONS IN AUDIT:"',
            'sudo mysql inventory_db -e "SELECT DISTINCT action FROM audit_logs ORDER BY action;"',
            '',
            'echo "👥 USERS TABLE STRUCTURE:"',
            'sudo mysql inventory_db -e "DESCRIBE users;"',
            '',
            'echo "🔐 PERMISSIONS TABLE:"',
            'sudo mysql inventory_db -e "SELECT name, display_name, category FROM permissions ORDER BY category, name LIMIT 20;"',
            '',
            'echo "📋 ALL TABLES IN DATABASE:"',
            'sudo mysql inventory_db -e "SHOW TABLES;"'
        ];
        
        executeCommands(conn, commands, 0);
    });
    
    conn.on('error', (err) => {
        console.error('❌ SSH Connection error:', err.message);
        console.log('\n💡 Troubleshooting:');
        console.log('1. Check if the SSH key exists: C:\\Users\\Admin\\awsconection.pem');
        console.log('2. Verify server is accessible: 13.60.36.159');
        console.log('3. Ensure ubuntu user has proper permissions');
        process.exit(1);
    });
    
    conn.connect(sshConfig);
}

function executeCommands(conn, commands, index) {
    if (index >= commands.length) {
        console.log('\n🎉 DATABASE ANALYSIS COMPLETE');
        console.log('='.repeat(60));
        conn.end();
        return;
    }
    
    const command = commands[index];
    if (command === '') {
        console.log('');
        executeCommands(conn, commands, index + 1);
        return;
    }
    
    conn.exec(command, (err, stream) => {
        if (err) {
            console.error(`❌ Error executing: ${command}`);
            console.error(err.message);
            executeCommands(conn, commands, index + 1);
            return;
        }
        
        let output = '';
        let errorOutput = '';
        
        stream.on('close', (code, signal) => {
            if (output) console.log(output.trim());
            if (errorOutput) console.error('Error:', errorOutput.trim());
            executeCommands(conn, commands, index + 1);
        });
        
        stream.on('data', (data) => {
            output += data.toString();
        });
        
        stream.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
    });
}

connectAndAnalyze();