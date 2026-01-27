/**
 * ADD 2FA COLUMNS WITH SUDO MYSQL
 * Execute SQL commands using sudo mysql to add 2FA columns
 */

const { spawn } = require('child_process');
const fs = require('fs');

function executeSudoMySQL() {
    console.log('🔧 Adding 2FA columns to users table using sudo mysql...');
    
    // SQL commands to execute
    const sqlCommands = `
USE inventory_db;

-- Check current table structure
DESCRIBE users;

-- Add 2FA columns if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS two_factor_backup_codes JSON NULL,
ADD COLUMN IF NOT EXISTS two_factor_setup_at TIMESTAMP NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_two_factor_enabled ON users(two_factor_enabled);

-- Show updated table structure
DESCRIBE users;

-- Show sample of users table with new columns
SELECT id, name, email, two_factor_enabled, two_factor_setup_at FROM users LIMIT 5;

SELECT 'SUCCESS: 2FA columns added successfully!' as result;
`;

    // Write SQL to temporary file
    const tempSqlFile = 'temp_2fa_setup.sql';
    fs.writeFileSync(tempSqlFile, sqlCommands);
    
    console.log('📝 SQL commands written to temporary file');
    console.log('🚀 Executing sudo mysql...');
    
    // Execute sudo mysql
    const mysqlProcess = spawn('sudo', ['mysql'], {
        stdio: ['pipe', 'pipe', 'pipe']
    });
    
    // Send SQL commands to mysql
    mysqlProcess.stdin.write(sqlCommands);
    mysqlProcess.stdin.end();
    
    let output = '';
    let errorOutput = '';
    
    mysqlProcess.stdout.on('data', (data) => {
        output += data.toString();
    });
    
    mysqlProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
    });
    
    mysqlProcess.on('close', (code) => {
        // Clean up temp file
        if (fs.existsSync(tempSqlFile)) {
            fs.unlinkSync(tempSqlFile);
        }
        
        if (code === 0) {
            console.log('✅ MySQL commands executed successfully!');
            console.log('\n📋 Output:');
            console.log(output);
            
            if (output.includes('SUCCESS: 2FA columns added successfully!')) {
                console.log('\n🎉 2FA database setup completed!');
                console.log('💡 You can now use 2FA functionality');
                console.log('\n📝 Next steps:');
                console.log('1. Restart your server');
                console.log('2. Visit /2fa-setup to enable 2FA');
                console.log('3. Use Google Authenticator app');
            }
        } else {
            console.error('❌ MySQL execution failed with code:', code);
            if (errorOutput) {
                console.error('Error output:', errorOutput);
            }
            console.log('\n💡 Troubleshooting:');
            console.log('1. Make sure you have sudo access');
            console.log('2. Ensure MySQL is running');
            console.log('3. Check if inventory_db database exists');
        }
    });
    
    mysqlProcess.on('error', (error) => {
        console.error('❌ Failed to execute sudo mysql:', error.message);
        console.log('\n💡 Make sure:');
        console.log('1. MySQL is installed');
        console.log('2. You have sudo privileges');
        console.log('3. Run this script from the server');
    });
}

// Run the setup
executeSudoMySQL();