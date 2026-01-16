-- Check which table contains order ID 2762

-- Check warehouse_dispatch table
SELECT 'warehouse_dispatch' as table_name, id, order_ref, awb, product_name, barcode, status, timestamp
FROM warehouse_dispatch 
WHERE id = 2762 OR order_ref = 2762;

-- Check if there's a dispatch_tracking or order_tracking table
SELECT 'dispatch_tracking' as table_name, dispatch_id, awb_number, product_name, barcode, status, created_at
FROM dispatch_tracking 
WHERE dispatch_id = 2762
LIMIT 5;

-- Check warehouse_dispatch_items table
SELECT 'warehouse_dispatch_items' as table_name, dispatch_id, product_name, barcode, qty
FROM warehouse_dispatch_items
WHERE dispatch_id = 2762;
