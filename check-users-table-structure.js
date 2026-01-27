/**
 * CHECK USERS TABLE STRUCTURE
 * Verify if 2FA columns exist and add them if needed
 */

const db = require('./db/connection');

function checkAndAdd2FAColumns() {
    console.log('🔍 Checking users table structure for 2FA columns...');
    
    // First, check current table structure
    db.query('DESCRIBE users', (err, results) => {
        if (err) {
            console.error('❌ Error checking table structure:', err);
            return;
        }
        
        console.log('📋 Current users table columns:');
        results.forEach(column => {
            console.log(`  - ${column.Field} (${column.Type})`);
        });
        
        // Check if 2FA columns exist
        const columnNames = results.map(col => col.Field);
        const has2FASecret = columnNames.includes('two_factor_secret');
        const has2FAEnabled = columnNames.includes('two_factor_enabled');
        const has2FABackupCodes = columnNames.includes('two_factor_backup_codes');
        const has2FASetupAt = columnNames.includes('two_factor_setup_at');
        
        if (has2FASecret && has2FAEnabled && has2FABackupCodes && has2FASetupAt) {
            console.log('✅ All 2FA columns already exist!');
            process.exit(0);
        }
        
        console.log('\n🔧 Adding missing 2FA columns...');
        
        // Add missing columns
        const alterQueries = [];
        
        if (!has2FASecret) {
            alterQueries.push('ALTER TABLE users ADD COLUMN two_factor_secret VARCHAR(255) NULL');
        }
        
        if (!has2FAEnabled) {
            alterQueries.push('ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE');
        }
        
        if (!has2FABackupCodes) {
            alterQueries.push('ALTER TABLE users ADD COLUMN two_factor_backup_codes JSON NULL');
        }
        
        if (!has2FASetupAt) {
            alterQueries.push('ALTER TABLE users ADD COLUMN two_factor_setup_at TIMESTAMP NULL');
        }
        
        // Execute alter queries
        let completed = 0;
        const total = alterQueries.length;
        
        if (total === 0) {
            console.log('✅ No columns to add!');
            process.exit(0);
        }
        
        alterQueries.forEach((query, index) => {
            db.query(query, (alterErr) => {
                if (alterErr) {
                    console.error(`❌ Error adding column ${index + 1}:`, alterErr);
                } else {
                    console.log(`✅ Added column ${index + 1}/${total}`);
                }
                
                completed++;
                if (completed === total) {
                    // Create index
                    db.query('CREATE INDEX IF NOT EXISTS idx_users_two_factor_enabled ON users(two_factor_enabled)', (indexErr) => {
                        if (indexErr) {
                            console.warn('⚠️ Warning: Could not create index:', indexErr);
                        } else {
                            console.log('✅ Created index for 2FA enabled column');
                        }
                        
                        console.log('\n🎉 2FA database setup completed!');
                        console.log('💡 You can now use 2FA functionality');
                        process.exit(0);
                    });
                }
            });
        });
    });
}

// Run the check
checkAndAdd2FAColumns();