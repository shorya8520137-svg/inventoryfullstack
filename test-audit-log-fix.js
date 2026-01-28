/**
 * Test script to verify audit log fix
 */

const mysql = require('mysql2');

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'inventory_user',
    password: 'StrongPass@123',
    database: 'inventory_db'
});

console.log('🔍 Testing audit log creation after fix...');

// Test the exact same INSERT that was failing
const sql = `
    INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?, ?, ?)
`;

const values = [1, 'DELETE', 'ROLE', '33', '{}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0'];

db.query(sql, values, (err, result) => {
    if (err) {
        console.error('❌ Audit log creation failed:', err.message);
        console.error('Error code:', err.code);
    } else {
        console.log('✅ Audit log created successfully!');
        console.log('Insert ID:', result.insertId);
        console.log('Affected rows:', result.affectedRows);
    }
    
    // Test reading the created log
    db.query('SELECT * FROM audit_logs WHERE id = ?', [result?.insertId], (readErr, logs) => {
        if (readErr) {
            console.error('❌ Failed to read audit log:', readErr.message);
        } else if (logs.length > 0) {
            console.log('✅ Audit log read successfully:');
            console.log('- ID:', logs[0].id);
            console.log('- Action:', logs[0].action);
            console.log('- Resource Type:', logs[0].resource_type);
            console.log('- Description:', logs[0].description || 'NULL (as expected)');
            console.log('- Created At:', logs[0].created_at);
        }
        
        db.end();
        console.log('🎉 Test completed!');
    });
});