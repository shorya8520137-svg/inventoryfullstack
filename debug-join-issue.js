const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'your_password',
    database: 'inventory_db'
});

const barcode = '638-30500';

console.log('🔍 Debugging JOIN issue for barcode:', barcode);

// First, check what references exist in inventory_ledger_base for DISPATCH
db.query(`
    SELECT reference, movement_type, qty, event_time 
    FROM inventory_ledger_base 
    WHERE barcode = ? AND movement_type = 'DISPATCH'
    ORDER BY event_time DESC
`, [barcode], (err, ledgerResults) => {
    if (err) {
        console.error('❌ Ledger query error:', err);
        return;
    }
    
    console.log('\n📋 DISPATCH references in inventory_ledger_base:');
    ledgerResults.forEach(row => {
        console.log(`  Reference: ${row.reference} | Qty: ${row.qty} | Date: ${row.event_time}`);
    });
    
    // Now check what dispatch IDs exist in warehouse_dispatch
    db.query(`
        SELECT id, customer, awb, length, width, height, actual_weight 
        FROM warehouse_dispatch 
        WHERE barcode = ?
        ORDER BY id DESC
    `, [barcode], (err, dispatchResults) => {
        if (err) {
            console.error('❌ Dispatch query error:', err);
            return;
        }
        
        console.log('\n🚚 Dispatches in warehouse_dispatch:');
        dispatchResults.forEach(row => {
            console.log(`  ID: ${row.id} | Customer: ${row.customer} | AWB: ${row.awb}`);
            console.log(`    Dimensions: L:${row.length} W:${row.width} H:${row.height} Weight:${row.actual_weight}`);
            
            // Check if this ID matches any reference
            const expectedRef = `DISPATCH_${row.id}`;
            const matchingRef = ledgerResults.find(lr => lr.reference && lr.reference.startsWith(expectedRef));
            console.log(`    Expected ref: ${expectedRef} | Found match: ${matchingRef ? 'YES' : 'NO'}`);
        });
        
        // Test the actual JOIN
        console.log('\n🔗 Testing JOIN query:');
        db.query(`
            SELECT 
                ilb.reference,
                ilb.movement_type,
                wd.id as dispatch_id,
                wd.customer,
                wd.length,
                wd.width,
                wd.height,
                wd.actual_weight
            FROM inventory_ledger_base ilb
            LEFT JOIN warehouse_dispatch wd ON (
                ilb.movement_type = 'DISPATCH' 
                AND ilb.reference LIKE CONCAT('DISPATCH_', wd.id, '%')
            )
            WHERE ilb.barcode = ? AND ilb.movement_type = 'DISPATCH'
        `, [barcode], (err, joinResults) => {
            if (err) {
                console.error('❌ JOIN query error:', err);
                return;
            }
            
            console.log('JOIN Results:');
            joinResults.forEach(row => {
                console.log(`  Reference: ${row.reference}`);
                console.log(`  Dispatch ID: ${row.dispatch_id}`);
                console.log(`  Customer: ${row.customer}`);
                console.log(`  Dimensions: L:${row.length} W:${row.width} H:${row.height} Weight:${row.actual_weight}`);
                console.log('  ---');
            });
            
            db.end();
        });
    });
});