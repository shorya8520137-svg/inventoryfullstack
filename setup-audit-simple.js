/**
 * Simple Audit Database Setup - Using only sudo mysql
 */

const { Client } = require('ssh2');
const fs = require('fs');

const config = {
    ssh: {
        host: '16.171.5.50',
        port: 22,
        username: 'ubuntu',
        privateKey: fs.readFileSync('C:\\Users\\Admin\\awsconection.pem')
    }
};

console.log('🔧 Setting up Audit Database with sudo mysql...\n');

class SimpleAuditSetup {
    constructor() {
        this.conn = new Client();
    }

    async run() {
        try {
            await this.connectToServer();
            await this.createAuditTable();
            await this.insertSampleData();
            await this.verifySetup();
            console.log('\n🎉 Audit database setup complete!');
        } catch (error) {
            console.error('❌ Setup failed:', error.message);
        } finally {
            this.conn.end();
        }
    }

    async connectToServer() {
        console.log('📡 Connecting to server...');
        
        return new Promise((resolve, reject) => {
            this.conn.on('ready', () => {
                console.log('✅ SSH connection established');
                resolve();
            }).on('error', (err) => {
                reject(new Error(`SSH connection failed: ${err.message}`));
            });
            
            this.conn.connect(config.ssh);
        });
    }

    async createAuditTable() {
        console.log('🗄️ Creating audit_logs table...');
        
        const createTableSQL = `
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    user_name VARCHAR(255),
    user_email VARCHAR(255),
    user_role VARCHAR(100),
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(50),
    resource_name VARCHAR(255),
    description TEXT NOT NULL,
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_method VARCHAR(10),
    request_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_resource (resource_type, resource_id),
    INDEX idx_created_at (created_at)
);`;

        const command = `sudo mysql -e "USE inventory_db; ${createTableSQL}"`;
        
        try {
            await this.executeCommand(command);
            console.log('✅ audit_logs table created successfully');
        } catch (error) {
            console.log('⚠️ Table creation result:', error.message);
        }
    }

    async insertSampleData() {
        console.log('📊 Inserting sample audit data...');
        
        const sampleDataSQL = `
INSERT IGNORE INTO audit_logs (user_name, user_email, user_role, action, resource_type, resource_id, resource_name, description, details, ip_address) VALUES
('Shorya', 'shorya@company.com', 'Manager', 'DISPATCH', 'product', '123', 'Samsung Galaxy S24', 'Shorya dispatched 50 units of Samsung Galaxy S24 to Delhi warehouse', '{"quantity": 50, "warehouse": "Delhi", "awb_number": "AWB123456789"}', '192.168.1.100'),
('Admin', 'admin@company.com', 'Administrator', 'RETURN', 'product', '456', 'iPhone 15 Pro', 'Admin processed return of 10 units of iPhone 15 Pro', '{"quantity": 10, "reason": "Customer complaint", "awb_number": "AWB987654321"}', '192.168.1.101'),
('Rajesh', 'rajesh@company.com', 'Operator', 'DAMAGE', 'product', '789', 'MacBook Air M2', 'Rajesh reported damage for 2 units of MacBook Air M2', '{"quantity": 2, "reason": "Water damage", "location": "Warehouse Mumbai"}', '192.168.1.102'),
('Priya', 'priya@company.com', 'Manager', 'BULK_UPLOAD', 'inventory', 'bulk_001', 'inventory_update.xlsx', 'Priya uploaded bulk inventory file with 500 items', '{"filename": "inventory_update.xlsx", "total_items": 500, "processed_items": 485, "success_rate": "97%"}', '192.168.1.103'),
('Admin', 'admin@company.com', 'Administrator', 'LOGIN', 'session', 'sess_001', 'User Session', 'Admin logged into the system', '{"login_time": "2025-01-23T10:30:00Z", "browser": "Chrome", "os": "Windows"}', '192.168.1.101'),
('Shorya', 'shorya@company.com', 'Manager', 'DISPATCH', 'product', '124', 'iPhone 14', 'Shorya dispatched 25 units of iPhone 14 to Mumbai warehouse', '{"quantity": 25, "warehouse": "Mumbai", "awb_number": "AWB123456790"}', '192.168.1.100'),
('Priya', 'priya@company.com', 'Manager', 'RETURN', 'product', '125', 'OnePlus 11', 'Priya processed return of 5 units of OnePlus 11', '{"quantity": 5, "reason": "Defective", "awb_number": "AWB987654322"}', '192.168.1.103');`;

        const command = `sudo mysql -e "USE inventory_db; ${sampleDataSQL}"`;
        
        try {
            await this.executeCommand(command);
            console.log('✅ Sample audit data inserted');
        } catch (error) {
            console.log('⚠️ Sample data insertion result:', error.message);
        }
    }

    async verifySetup() {
        console.log('🔍 Verifying audit table setup...');
        
        const verifyCommand = `sudo mysql -e "USE inventory_db; SELECT COUNT(*) as total_logs, MAX(created_at) as latest_log FROM audit_logs;"`;
        
        try {
            const result = await this.executeCommand(verifyCommand);
            console.log('✅ Verification successful:');
            console.log(result);
        } catch (error) {
            console.log('⚠️ Verification result:', error.message);
        }

        // Also show sample logs
        console.log('📋 Sample audit logs:');
        const sampleCommand = `sudo mysql -e "USE inventory_db; SELECT user_name, action, description, created_at FROM audit_logs ORDER BY created_at DESC LIMIT 3;"`;
        
        try {
            const result = await this.executeCommand(sampleCommand);
            console.log(result);
        } catch (error) {
            console.log('⚠️ Sample logs result:', error.message);
        }
    }

    async executeCommand(command) {
        return new Promise((resolve, reject) => {
            this.conn.exec(command, (err, stream) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                let output = '';
                let errorOutput = '';
                
                stream.on('close', (code, signal) => {
                    if (errorOutput && errorOutput.includes('ERROR')) {
                        reject(new Error(errorOutput));
                    } else {
                        resolve(output || 'Command executed');
                    }
                }).on('data', (data) => {
                    output += data;
                }).stderr.on('data', (data) => {
                    errorOutput += data;
                });
            });
        });
    }
}

// Run the setup
const setup = new SimpleAuditSetup();
setup.run().catch(console.error);