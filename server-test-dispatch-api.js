// Test script to run on the server to check dispatch dimensions
// Upload this to server and run: node server-test-dispatch-api.js

const db = require('./db/connection');

const barcode = '638-30500'; // The barcode from your screenshot

console.log('🧪 Testing dispatch dimensions on server for barcode:', barcode);

// Test 1: Check warehouse_dispatch table structure
console.log('\n1️⃣ Checking warehouse_dispatch table structure...');
db.query('DESCRIBE warehouse_dispatch', (err, structure) => {
    if (err) {
        console.error('❌ Structure query error:', err);
        return;
    }
    
    console.log('📋 Dimension-related columns:');
    structure.forEach(col => {
        if (col.Field.includes('length') || col.Field.includes('width') || col.Field.includes('height') || col.Field.includes('weight')) {
            console.log(`  ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'nullable' : 'not null'})`);
        }
    });
    
    // Test 2: Check actual dispatch data
    console.log('\n2️⃣ Checking dispatch data for barcode:', barcode);
    db.query(`
        SELECT id, customer, awb, barcode, length, width, height, actual_weight, timestamp
        FROM warehouse_dispatch 
        WHERE barcode = ?
        ORDER BY id DESC 
        LIMIT 3
    `, [barcode], (err, dispatches) => {
        if (err) {
            console.error('❌ Dispatch query error:', err);
            return;
        }
        
        console.log(`📦 Found ${dispatches.length} dispatches:`);
        dispatches.forEach((row, index) => {
            console.log(`\n--- Dispatch ${row.id} ---`);
            console.log('Customer:', row.customer);
            console.log('AWB:', row.awb);
            console.log('Dimensions:', `L:${row.length} W:${row.width} H:${row.height}`);
            console.log('Weight:', row.actual_weight);
            console.log('Timestamp:', row.timestamp);
        });
        
        // Test 3: Check inventory ledger references
        console.log('\n3️⃣ Checking inventory ledger references...');
        db.query(`
            SELECT reference, movement_type, qty, event_time 
            FROM inventory_ledger_base 
            WHERE barcode = ? AND movement_type = 'DISPATCH'
            ORDER BY event_time DESC
            LIMIT 3
        `, [barcode], (err, ledgerEntries) => {
            if (err) {
                console.error('❌ Ledger query error:', err);
                return;
            }
            
            console.log(`📋 Found ${ledgerEntries.length} ledger entries:`);
            ledgerEntries.forEach(row => {
                console.log(`  Reference: ${row.reference} | Qty: ${row.qty} | Date: ${row.event_time}`);
            });
            
            // Test 4: Test the JOIN query
            console.log('\n4️⃣ Testing JOIN query (timelineController logic)...');
            db.query(`
                SELECT 
                    ilb.reference,
                    ilb.movement_type,
                    ilb.qty,
                    wd.id as dispatch_id,
                    wd.customer,
                    wd.awb,
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
                ORDER BY ilb.event_time DESC
                LIMIT 3
            `, [barcode], (err, joinResults) => {
                if (err) {
                    console.error('❌ JOIN query error:', err);
                    return;
                }
                
                console.log(`🔗 JOIN Results (${joinResults.length} entries):`);
                joinResults.forEach((row, index) => {
                    console.log(`\n--- JOIN Result ${index + 1} ---`);
                    console.log('Reference:', row.reference);
                    console.log('Dispatch ID:', row.dispatch_id);
                    console.log('Customer:', row.customer);
                    console.log('AWB:', row.awb);
                    console.log('Dimensions:', `L:${row.length} W:${row.width} H:${row.height}`);
                    console.log('Weight:', row.actual_weight);
                    console.log('JOIN Success:', row.dispatch_id ? '✅ YES' : '❌ NO');
                });
                
                console.log('\n🎯 SUMMARY:');
                console.log('- Dispatches found:', dispatches.length);
                console.log('- Ledger entries found:', ledgerEntries.length);
                console.log('- JOIN matches found:', joinResults.filter(r => r.dispatch_id).length);
                
                if (joinResults.filter(r => r.dispatch_id).length === 0) {
                    console.log('\n❌ ISSUE: JOIN is not matching! Check reference format.');
                    console.log('Expected format: DISPATCH_{id}_...');
                    console.log('Actual references:', ledgerEntries.map(r => r.reference));
                }
                
                db.end();
            });
        });
    });
});