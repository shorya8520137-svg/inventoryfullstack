/**
 * Setup Audit Database Table
 * This script will create the audit_logs table with sample data
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

console.log('🔧 Setting up Audit Database...\n');

class DatabaseSetup {
    constructor() {
        this.conn = new Client();
    }

    async run() {
        try {
            await this.connectToServer();
            await this.setupDatabase();
            console.log('\n✅ Database setup complete!');
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

    async setupDatabase() {
        console.log('🗄️ Setting up audit_logs table...');
        
        // Create the audit table SQL
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

        // Try different authentication methods
        const commands = [
            // Try with sudo mysql
            `sudo mysql -e "USE inventory_system; ${createTableSQL}"`,
            // Try with mysql without password
            `mysql -u root inventory_system -e "${createTableSQL}"`,
            // Try with ubuntu user
            `mysql -u ubuntu inventory_system -e "${createTableSQL}"`
        ];

        for (const command of commands) {
            try {
                console.log(`Trying: ${command.split(' ').slice(0, 3).join(' ')}...`);
                await this.executeCommand(command);
                console.log('✅ Table created successfully');
                break;
            } catch (error) {
                console.log(`❌ Failed, trying next method...`);
                continue;
            }
        }

        // Insert sample data
        console.log('📊 Inserting sample audit data...');
        const sampleDataSQL = `
INSERT INTO audit_logs (user_name, user_email, user_role, action, resource_type, resource_id, resource_name, description, details, ip_address) VALUES
('Shorya', 'shorya@company.com', 'Manager', 'DISPATCH', 'product', '123', 'Samsung Galaxy S24', 'Shorya dispatched 50 units of Samsung Galaxy S24 to Delhi warehouse', '{"quantity": 50, "warehouse": "Delhi", "awb_number": "AWB123456789"}', '192.168.1.100'),
('Admin', 'admin@company.com', 'Administrator', 'RETURN', 'product', '456', 'iPhone 15 Pro', 'Admin processed return of 10 units of iPhone 15 Pro', '{"quantity": 10, "reason": "Customer complaint", "awb_number": "AWB987654321"}', '192.168.1.101'),
('Rajesh', 'rajesh@company.com', 'Operator', 'DAMAGE', 'product', '789', 'MacBook Air M2', 'Rajesh reported damage for 2 units of MacBook Air M2', '{"quantity": 2, "reason": "Water damage", "location": "Warehouse Mumbai"}', '192.168.1.102'),
('Priya', 'priya@company.com', 'Manager', 'BULK_UPLOAD', 'inventory', 'bulk_001', 'inventory_update.xlsx', 'Priya uploaded bulk inventory file with 500 items', '{"filename": "inventory_update.xlsx", "total_items": 500, "processed_items": 485, "success_rate": "97%"}', '192.168.1.103'),
('Admin', 'admin@company.com', 'Administrator', 'LOGIN', 'session', 'sess_001', 'User Session', 'Admin logged into the system', '{"login_time": "2025-01-23T10:30:00Z", "browser": "Chrome", "os": "Windows"}', '192.168.1.101');`;

        const sampleCommands = [
            `sudo mysql -e "USE inventory_system; ${sampleDataSQL}"`,
            `mysql -u root inventory_system -e "${sampleDataSQL}"`,
            `mysql -u ubuntu inventory_system -e "${sampleDataSQL}"`
        ];

        for (const command of sampleCommands) {
            try {
                await this.executeCommand(command);
                console.log('✅ Sample data inserted');
                break;
            } catch (error) {
                continue;
            }
        }

        // Verify the setup
        console.log('🔍 Verifying setup...');
        const verifyCommands = [
            `sudo mysql -e "USE inventory_system; SELECT COUNT(*) as total_logs FROM audit_logs;"`,
            `mysql -u root inventory_system -e "SELECT COUNT(*) as total_logs FROM audit_logs;"`,
            `mysql -u ubuntu inventory_system -e "SELECT COUNT(*) as total_logs FROM audit_logs;"`
        ];

        for (const command of verifyCommands) {
            try {
                const result = await this.executeCommand(command);
                console.log('✅ Verification result:', result);
                break;
            } catch (error) {
                continue;
            }
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
                    if (code === 0) {
                        resolve(output);
                    } else {
                        reject(new Error(errorOutput || `Command failed with code ${code}`));
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
const setup = new DatabaseSetup();
setup.run().catch(console.error);