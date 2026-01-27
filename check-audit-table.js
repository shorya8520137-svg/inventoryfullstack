/**
 * Check Audit Table Structure
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

console.log('🔍 Checking audit table structure...\n');

class AuditTableChecker {
    constructor() {
        this.conn = new Client();
    }

    async run() {
        try {
            await this.connectToServer();
            await this.checkTableStructure();
            await this.showSampleData();
        } catch (error) {
            console.error('❌ Check failed:', error.message);
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

    async checkTableStructure() {
        console.log('🗄️ Checking audit_logs table structure...');
        
        const command = `sudo mysql -e "USE inventory_db; DESCRIBE audit_logs;"`;
        
        try {
            const result = await this.executeCommand(command);
            console.log('✅ Table structure:');
            console.log(result);
        } catch (error) {
            console.log('❌ Error checking table structure:', error.message);
        }
    }

    async showSampleData() {
        console.log('\n📋 Sample audit data (first 5 rows):');
        
        const command = `sudo mysql -e "USE inventory_db; SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 5;"`;
        
        try {
            const result = await this.executeCommand(command);
            console.log('✅ Sample data:');
            console.log(result);
        } catch (error) {
            console.log('❌ Error fetching sample data:', error.message);
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
                        resolve(output || 'No output');
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

// Run the checker
const checker = new AuditTableChecker();
checker.run().catch(console.error);