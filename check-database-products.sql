-- Check if there are products in dispatch_product table
SELECT COUNT(*) as product_count FROM dispatch_product;

-- Check if there are items in inventory table
SELECT COUNT(*) as inventory_count FROM inventory;

-- Show sample products if any
SELECT * FROM dispatch_product LIMIT 5;

-- Show sample inventory if any
SELECT * FROM inventory LIMIT 5;

-- Check if inventory has products not in dispatch_product
SELECT DISTINCT i.code, i.product_name 
FROM inventory i 
LEFT JOIN dispatch_product p ON i.code = p.barcode 
WHERE p.barcode IS NULL 
LIMIT 10;
