/**
 * Test script to verify audit logs API returns correct data with resource field
 */

const mysql = require('mysql2');

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'inventory_user',
    password: 'StrongPass@123',
    database: 'inventory_db'
});

console.log('🔍 Testing audit logs API data structure...');

// Test the exact same query that the API uses
const sql = `
    SELECT al.*, al.resource_type as resource, u.name as user_name, u.email as user_email
    FROM audit_logs al
    LEFT JOIN users u ON al.user_id = u.id
    WHERE 1=1
    ORDER BY al.created_at DESC
    LIMIT 10
`;

db.query(sql, (err, logs) => {
    if (err) {
        console.error('❌ Query failed:', err.message);
        db.end();
        return;
    }
    
    console.log(`✅ Found ${logs.length} audit logs`);
    
    if (logs.length > 0) {
        const log = logs[0];
        console.log('\n📊 Sample log structure:');
        console.log('- ID:', log.id);
        console.log('- Action:', log.action);
        console.log('- Resource Type (DB):', log.resource_type);
        console.log('- Resource (Alias):', log.resource);
        console.log('- User Name:', log.user_name);
        console.log('- Created At:', log.created_at);
        
        // Count by resource types
        console.log('\n📈 Counts by resource type:');
        const counts = {};
        logs.forEach(log => {
            const resource = log.resource || log.resource_type;
            counts[resource] = (counts[resource] || 0) + 1;
        });
        
        Object.entries(counts).forEach(([resource, count]) => {
            console.log(`- ${resource}: ${count}`);
        });
    }
    
    db.end();
    console.log('🎉 Test completed!');
});