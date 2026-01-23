/**
 * Check Database Name and Structure
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

console.log('🔍 Checking database structure...\n');

class DatabaseChecker {
    constructor() {
        this.conn = new Client();
    }

    async run() {
        try {
            await this.connectToServer();
            await this.listDatabases();
            await this.checkTables();
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

    async listDatabases() {
        console.log('📋 Listing all databases...');
        
        const command = `sudo mysql -e "SHOW DATABASES;"`;
        
        try {
            const result = await this.executeCommand(command);
            console.log('✅ Available databases:');
            console.log(result);
        } catch (error) {
            console.log('❌ Error listing databases:', error.message);
        }
    }

    async checkTables() {
        console.log('\n🔍 Checking tables in common database names...');
        
        const commonNames = ['inventory_system', 'stockiq', 'inventory', 'main', 'app'];
        
        for (const dbName of commonNames) {
            console.log(`\n📊 Checking database: ${dbName}`);
            const command = `sudo mysql -e "USE ${dbName}; SHOW TABLES;"`;
            
            try {
                const result = await this.executeCommand(command);
                console.log(`✅ Tables in ${dbName}:`);
                console.log(result);
                
                // If we find tables, also check for users table structure
                if (result.includes('users') || result.includes('user')) {
                    console.log(`\n🔍 Checking users table structure in ${dbName}:`);
                    const userTableCommand = `sudo mysql -e "USE ${dbName}; DESCRIBE users;"`;
                    try {
                        const userResult = await this.executeCommand(userTableCommand);
                        console.log(userResult);
                    } catch (err) {
                        console.log('No users table or access denied');
                    }
                }
                
            } catch (error) {
                console.log(`❌ Database ${dbName} not found or access denied`);
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
const checker = new DatabaseChecker();
checker.run().catch(console.error);