/**
 * SSH Database Analysis Script
 * Connects via SSH to analyze the database structure for audit logging
 */

const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

// SSH Configuration
const sshConfig = {
    host: '16.171.5.50',
    port: 22,
    username: 'ubuntu',
    privateKey: fs.readFileSync('C:\\Users\\Admin\\awsconection.pem')
};

function connectAndAnalyze() {
    const conn = new Client();
    
    conn.on('ready', () => {
        console.log('🔗 SSH Connection established\n');
        
        // First, check if MySQL is running
        conn.exec('sudo systemctl status mysql', (err, stream) => {
            if (err) throw err;
            
            let output = '';
            stream.on('close', (code, signal) => {
                console.log('📊 MySQL Status:', code === 0 ? 'Running' : 'Not Running');
                
                // Now let's connect to MySQL and analyze the database
                analyzeMySQLDatabase(conn);
            }).on('data', (data) => {
                output += data;
            }).stderr.on('data', (data) => {
                console.log('STDERR: ' + data);
            });
        });
    }).connect(sshConfig);
    
    conn.on('error', (err) => {
        console.error('❌ SSH Connection failed:', err.message);
        console.log('\n💡 Make sure:');
        console.log('1. The SSH key path is correct: C:\\Users\\Admin\\awsconection.pem');
        console.log('2. The server 16.171.5.50 is accessible');
        console.log('3. The ubuntu user has proper permissions');
    });
}

function analyzeMySQLDatabase(conn) {
    console.log('\n🔍 Analyzing MySQL Database Structure...\n');
    
    // MySQL commands to analyze the database
    const commands = [
        'mysql -u root -e "SHOW DATABASES;"',
        'mysql -u root -e "USE inventory_system; SHOW TABLES;"',
        'mysql -u root -e "USE inventory_system; SELECT table_name, table_rows FROM information_schema.tables WHERE table_schema = \'inventory_system\';"'
    ];
    
    let commandIndex = 0;
    
    function runNextCommand() {
        if (commandIndex >= commands.length) {
            // Now get detailed table structures
            getTableStructures(conn);
            return;
        }
        
        const command = commands[commandIndex];
        console.log(`📋 Running: ${command}`);
        
        conn.exec(command, (err, stream) => {
            if (err) {
                console.error('❌ Command failed:', err.message);
                commandIndex++;
                runNextCommand();
                return;
            }
            
            let output = '';
            stream.on('close', (code, signal) => {
                console.log('Output:');
                console.log(output);
                console.log('---\n');
                
                commandIndex++;
                runNextCommand();
            }).on('data', (data) => {
                output += data;
            }).stderr.on('data', (data) => {
                console.log('STDERR: ' + data);
            });
        });
    }
    
    runNextCommand();
}

function getTableStructures(conn) {
    console.log('🔍 Getting detailed table structures...\n');
    
    // Get list of tables first
    conn.exec('mysql -u root -e "USE inventory_system; SHOW TABLES;" | tail -n +2', (err, stream) => {
        if (err) {
            console.error('❌ Failed to get tables:', err.message);
            conn.end();
            return;
        }
        
        let tablesOutput = '';
        stream.on('close', (code, signal) => {
            const tables = tablesOutput.trim().split('\n').filter(t => t.trim());
            console.log(`📊 Found ${tables.length} tables:`, tables);
            
            // Analyze each table
            analyzeEachTable(conn, tables, 0);
        }).on('data', (data) => {
            tablesOutput += data;
        });
    });
}

function analyzeEachTable(conn, tables, index) {
    if (index >= tables.length) {
        console.log('\n✅ Database analysis complete!');
        
        // Now create our audit logging recommendations
        createAuditRecommendations(conn, tables);
        return;
    }
    
    const tableName = tables[index].trim();
    console.log(`\n🔸 Analyzing table: ${tableName}`);
    
    // Get table structure and sample data
    const commands = [
        `mysql -u root -e "USE inventory_system; DESCRIBE ${tableName};"`,
        `mysql -u root -e "USE inventory_system; SELECT COUNT(*) as row_count FROM ${tableName};"`,
        `mysql -u root -e "USE inventory_system; SELECT * FROM ${tableName} LIMIT 3;"`
    ];
    
    let cmdIndex = 0;
    
    function runTableCommand() {
        if (cmdIndex >= commands.length) {
            analyzeEachTable(conn, tables, index + 1);
            return;
        }
        
        conn.exec(commands[cmdIndex], (err, stream) => {
            if (err) {
                console.error(`❌ Failed to analyze ${tableName}:`, err.message);
                cmdIndex++;
                runTableCommand();
                return;
            }
            
            let output = '';
            stream.on('close', (code, signal) => {
                if (cmdIndex === 0) console.log('Structure:', output);
                else if (cmdIndex === 1) console.log('Row Count:', output);
                else console.log('Sample Data:', output);
                
                cmdIndex++;
                runTableCommand();
            }).on('data', (data) => {
                output += data;
            });
        });
    }
    
    runTableCommand();
}

function createAuditRecommendations(conn, tables) {
    console.log('\n📝 Creating Audit Logging Recommendations...\n');
    
    // Identify key tables for audit logging
    const auditTargets = {
        users: tables.filter(t => t.toLowerCase().includes('user')),
        products: tables.filter(t => t.toLowerCase().includes('product')),
        inventory: tables.filter(t => t.toLowerCase().includes('inventory')),
        dispatch: tables.filter(t => t.toLowerCase().includes('dispatch')),
        returns: tables.filter(t => t.toLowerCase().includes('return')),
        damage: tables.filter(t => t.toLowerCase().includes('damage')),
        orders: tables.filter(t => t.toLowerCase().includes('order')),
        transfers: tables.filter(t => t.toLowerCase().includes('transfer'))
    };
    
    console.log('🎯 Audit Target Tables:');
    Object.entries(auditTargets).forEach(([category, categoryTables]) => {
        if (categoryTables.length > 0) {
            console.log(`  ${category.toUpperCase()}: ${categoryTables.join(', ')}`);
        }
    });
    
    // Create audit table structure recommendation
    const auditTableSQL = `
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    user_name VARCHAR(255),
    user_email VARCHAR(255),
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(50),
    resource_name VARCHAR(255),
    description TEXT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_resource (resource_type, resource_id),
    INDEX idx_created_at (created_at)
);`;
    
    console.log('\n📋 Recommended Audit Table Structure:');
    console.log(auditTableSQL);
    
    conn.end();
}

// Start the analysis
console.log('🚀 Starting SSH Database Analysis...\n');
connectAndAnalyze();