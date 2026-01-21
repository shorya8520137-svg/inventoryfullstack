-- Test script to check dispatch dimensions data
-- Run with: sudo mysql < test-dispatch-dimensions.sql

USE inventory_db;

-- Check table structure for dimensions columns
DESCRIBE warehouse_dispatch;

-- Check if we have any dispatch data with dimensions
SELECT 
    id, 
    customer, 
    awb, 
    barcode,
    length, 
    width, 
    height, 
    actual_weight,
    timestamp
FROM warehouse_dispatch 
WHERE barcode = '638-30500'
ORDER BY id DESC 
LIMIT 5;

-- Check inventory ledger references for this barcode
SELECT 
    reference, 
    movement_type, 
    qty, 
    event_time 
FROM inventory_ledger_base 
WHERE barcode = '638-30500' 
AND movement_type = 'DISPATCH'
ORDER BY event_time DESC;

-- Test the JOIN query that timelineController uses
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
WHERE ilb.barcode = '638-30500' 
AND ilb.movement_type = 'DISPATCH'
ORDER BY ilb.event_time DESC;