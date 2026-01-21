const mysql = require('mysql2');

// Test the timeline API query directly
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'your_password',
    database: 'inventory_db'
});

const barcode = '638-30500'; // The barcode from your screenshot

console.log('🧪 Testing timeline API for barcode:', barcode);

// Test the exact query from timelineController
const timelineSql = `
    SELECT 
        ilb.id,
        ilb.event_time as timestamp,
        ilb.movement_type as type,
        ilb.barcode,
        ilb.product_name,
        ilb.location_code as warehouse,
        ilb.qty as quantity,
        ilb.direction,
        ilb.reference,
        'ledger' as source,
        -- Include dispatch details for DISPATCH entries
        wd.customer,
        wd.awb,
        wd.order_ref,
        wd.logistics,
        wd.payment_mode,
        wd.invoice_amount,
        wd.length,
        wd.width,
        wd.height,
        wd.actual_weight,
        wd.status as dispatch_status
    FROM inventory_ledger_base ilb
    LEFT JOIN warehouse_dispatch wd ON (
        ilb.movement_type = 'DISPATCH' 
        AND ilb.reference LIKE CONCAT('DISPATCH_', wd.id, '%')
    )
    WHERE ilb.barcode = ?
    ORDER BY ilb.event_time DESC
    LIMIT 10
`;

db.query(timelineSql, [barcode], (err, results) => {
    if (err) {
        console.error('❌ Query error:', err);
        return;
    }
    
    console.log('📊 Timeline results:');
    results.forEach((row, index) => {
        console.log(`\n--- Entry ${index + 1} ---`);
        console.log('Type:', row.type);
        console.log('Reference:', row.reference);
        console.log('Quantity:', row.quantity);
        console.log('Direction:', row.direction);
        
        if (row.type === 'DISPATCH') {
            console.log('🚚 DISPATCH DETAILS:');
            console.log('  Customer:', row.customer);
            console.log('  AWB:', row.awb);
            console.log('  Order Ref:', row.order_ref);
            console.log('  Dimensions:', `L:${row.length} W:${row.width} H:${row.height}`);
            console.log('  Weight:', row.actual_weight);
            console.log('  Invoice Amount:', row.invoice_amount);
        }
    });
    
    db.end();
});