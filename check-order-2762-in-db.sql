-- Check if order 2762 exists in warehouse_dispatch table
SELECT id, order_ref, awb, product_name, barcode, status, warehouse, timestamp
FROM warehouse_dispatch
WHERE id = 2762;

-- Check if there are any orders with barcode 2460-3499
SELECT id, order_ref, awb, product_name, barcode, status, warehouse, timestamp
FROM warehouse_dispatch
WHERE barcode = '2460-3499';

-- Check warehouse_dispatch_items for dispatch_id 2762
SELECT id, dispatch_id, product_name, barcode, qty, selling_price
FROM warehouse_dispatch_items
WHERE dispatch_id = 2762;

-- Show last 5 dispatches to see the ID range
SELECT id, order_ref, awb, product_name, barcode, status, timestamp
FROM warehouse_dispatch
ORDER BY id DESC
LIMIT 5;
