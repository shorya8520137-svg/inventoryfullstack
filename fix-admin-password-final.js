const bcrypt = require('bcrypt');
const mysql = require('mysql2');

// Database configuration
const DB_CONFIG = {
    host: 'localhost',
    user: 'root',
    password: 'StrongPass@123',
    database: 'inventory_db'
};

console.log('🔧 FIXING ADMIN PASSWORD - FINAL SOLUTION');

async function fixAdminPassword() {
    try {
        // Generate bcrypt hash for admin@123
        console.log('🔐 Generating bcrypt hash for admin@123...');
        const hash = await bcrypt.hash('admin@123', 10);
        console.log('✅ Hash generated:', hash);
        
        // Connect to database
        const connection = mysql.createConnection(DB_CONFIG);
        
        connection.connect((err) => {
            if (err) {
                console.error('❌ Database connection failed:', err.message);
                process.exit(1);
            }
            
            console.log('✅ Connected to database');
            
            // First, add password_hash column if it doesn't exist
            const addColumnQuery = 'ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) AFTER password';
            
            connection.query(addColumnQuery, (err) => {
                if (err && !err.message.includes('Duplicate column')) {
                    console.error('❌ Failed to add password_hash column:', err.message);
                }
                
                // Update admin user with hashed password
                const updateQuery = 'UPDATE users SET password = NULL, password_hash = ? WHERE email = ?';
                
                connection.query(updateQuery, [hash, 'admin@company.com'], (err, result) => {
                    if (err) {
                        console.error('❌ Failed to update admin password:', err.message);
                        connection.end();
                        process.exit(1);
                    }
                    
                    console.log('✅ Admin password updated successfully!');
                    console.log('📊 Affected rows:', result.affectedRows);
                    
                    // Verify the update
                    const verifyQuery = 'SELECT id, name, email, password, password_hash FROM users WHERE email = ?';
                    
                    connection.query(verifyQuery, ['admin@company.com'], (err, users) => {
                        if (err) {
                            console.error('❌ Verification failed:', err.message);
                        } else {
                            console.log('✅ Updated admin user:');
                            console.log('   ID:', users[0].id);
                            console.log('   Name:', users[0].name);
                            console.log('   Email:', users[0].email);
                            console.log('   Password:', users[0].password);
                            console.log('   Password Hash:', users[0].password_hash ? 'SET' : 'NULL');
                        }
                        
                        connection.end();
                        
                        console.log('\n🎉 ADMIN PASSWORD FIX COMPLETED!');
                        console.log('📧 Email: admin@company.com');
                        console.log('🔑 Password: admin@123');
                        console.log('🔄 Please restart the server now');
                        
                        process.exit(0);
                    });
                });
            });
        });
        
    } catch (error) {
        console.error('💥 Script failed:', error.message);
        process.exit(1);
    }
}

// Run the fix
fixAdminPassword();