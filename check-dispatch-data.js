const mysql = require('mysql2');

// Check what's actually in the warehouse_dispatch table
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'your_password',
    database: 'inventory_db'
});

console.log('🔍 Checking warehouse_dispatch table for dimensions data...');

// Check the structure first
db.query('DESCRIBE warehouse_dispatch', (err, structure) => {
    if (err) {
        console.error('❌ Structure query error:', err);
        return;
    }
    
    console.log('\n📋 Table structure:');
    structure.forEach(col => {
        if (col.Field.includes('length') || col.Field.includes('width') || col.Field.includes('height') || col.Field.includes('weight')) {
            console.log(`  ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'nullable' : 'not null'})`);
        }
    });
    
    // Check actual data
    db.query('SELECT id, customer, awb, length, width, height, actual_weight, barcode FROM warehouse_dispatch ORDER BY id DESC LIMIT 5', (err, results) => {
        if (err) {
            console.error('❌ Data query error:', err);
            return;
        }
        
        console.log('\n📊 Recent dispatch records:');
        results.forEach((row, index) => {
            console.log(`\n--- Dispatch ${row.id} ---`);
            console.log('Customer:', row.customer);
            console.log('AWB:', row.awb);
            console.log('Barcode:', row.barcode);
            console.log('Dimensions:', `L:${row.length} W:${row.width} H:${row.height}`);
            console.log('Weight:', row.actual_weight);
        });
        
        db.end();
    });
});