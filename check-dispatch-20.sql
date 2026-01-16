-- Check if dispatch ID 20 exists
SELECT * FROM warehouse_dispatch WHERE id = 20;

-- Check dispatch items for ID 20
SELECT * FROM warehouse_dispatch_items WHERE dispatch_id = 20;

-- Check all dispatches with their IDs
SELECT id, order_ref, awb, barcode, product_name, warehouse, status, timestamp 
FROM warehouse_dispatch 
ORDER BY id DESC 
LIMIT 10;
