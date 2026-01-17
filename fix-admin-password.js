const mysql = require('mysql2');

// Database configuration
const DB_CONFIG = {
    host: 'localhost',
    user: 'root',
    password: 'StrongPass@123',
    database: 'inventory_system'
};

console.log('🔧 Fixing admin password...');

// Create connection
const connection = mysql.createConnection(DB_CONFIG);

connection.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        process.exit(1);
    }
    
    console.log('✅ Connected to database');
    
    // Step 1: Check current admin user
    connection.query('SELECT id, name, email, password, password_hash, role_id FROM users WHERE email = ?', ['admin@company.com'], (err, results) => {
        if (err) {
            console.error('❌ Query failed:', err.message);
            connection.end();
            process.exit(1);
        }
        
        console.log('📋 Current admin user:', results);
        
        if (results.length === 0) {
            console.log('❌ Admin user not found! Creating admin user...');
            
            // Create admin user
            const createUserQuery = `
                INSERT INTO users (name, email, password, role_id, is_active) 
                VALUES ('System Administrator', 'admin@company.com', 'admin@123', 1, 1)
            `;
            
            connection.query(createUserQuery, (createErr, createResult) => {
                if (createErr) {
                    console.error('❌ Failed to create admin user:', createErr.message);
                } else {
                    console.log('✅ Admin user created successfully!');
                }
                connection.end();
            });
        } else {
            // Update existing admin user password
            console.log('🔄 Updating admin password...');
            
            const updateQuery = `
                UPDATE users 
                SET password = 'admin@123', password_hash = NULL, role_id = 1 
                WHERE email = 'admin@company.com'
            `;
            
            connection.query(updateQuery, (updateErr, updateResult) => {
                if (updateErr) {
                    console.error('❌ Failed to update admin password:', updateErr.message);
                } else {
                    console.log('✅ Admin password updated successfully!');
                    console.log('📊 Affected rows:', updateResult.affectedRows);
                    
                    // Verify the update
                    connection.query('SELECT id, name, email, password, role_id FROM users WHERE email = ?', ['admin@company.com'], (verifyErr, verifyResults) => {
                        if (verifyErr) {
                            console.error('❌ Verification failed:', verifyErr.message);
                        } else {
                            console.log('✅ Updated admin user:', verifyResults[0]);
                            console.log('\n🎉 Admin login should now work with:');
                            console.log('   📧 Email: admin@company.com');
                            console.log('   🔑 Password: admin@123');
                        }
                        connection.end();
                    });
                }
            });
        }
    });
});