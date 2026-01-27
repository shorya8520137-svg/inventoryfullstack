sudo systemctl status mysql --no-pager

mysql -u root -e "SHOW DATABASES;"

mysql -u root -e "USE inventory_system; SHOW TABLES;"

mysql -u root -e "
USE inventory_system; 
SELECT 
    table_name as 'Table', 
    table_rows as 'Rows',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) as 'Size_MB'
FROM information_schema.tables 
WHERE table_schema = 'inventory_system' 
ORDER BY table_rows DESC;"

mysql -u root -e "
USE inventory_system;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'inventory_system' 
AND (table_name LIKE '%user%' OR table_name LIKE '%role%' OR table_name LIKE '%permission%');"

mysql -u root -e "
USE inventory_system;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'inventory_system' 
AND (table_name LIKE '%dispatch%' OR table_name LIKE '%return%' OR table_name LIKE '%damage%' 
     OR table_name LIKE '%product%' OR table_name LIKE '%inventory%' OR table_name LIKE '%order%' 
     OR table_name LIKE '%transfer%' OR table_name LIKE '%bulk%');"

mysql -u root -e "
USE inventory_system;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'inventory_system' 
AND (table_name LIKE '%audit%' OR table_name LIKE '%log%' OR table_name LIKE '%activity%' OR table_name LIKE '%history%');"

mysql -u root -e "USE inventory_system; DESCRIBE users;"

mysql -u root -e "USE inventory_system; SELECT id, name, email, role_name, is_active, created_at FROM users LIMIT 5;"

mysql -u root -e "USE inventory_system; DESCRIBE products;"

mysql -u root -e "USE inventory_system; SELECT id, name, sku, category, price, created_at FROM products LIMIT 5;"

mysql -u root -e "USE inventory_system; DESCRIBE dispatches;"

mysql -u root -e "USE inventory_system; SELECT id, product_id, quantity, status, created_by, created_at FROM dispatches ORDER BY created_at DESC LIMIT 5;"

mysql -u root -e "USE inventory_system; DESCRIBE returns_main;"

mysql -u root -e "USE inventory_system; SELECT id, product_id, quantity, reason, created_by, created_at FROM returns_main ORDER BY created_at DESC LIMIT 5;"

mysql -u root -e "USE inventory_system; DESCRIBE damage_recovery;"

mysql -u root -e "USE inventory_system; SELECT id, product_id, quantity, reason, created_by, created_at FROM damage_recovery ORDER BY created_at DESC LIMIT 5;"

mysql -u root -e "USE inventory_system; DESCRIBE bulk_uploads;"

mysql -u root -e "USE inventory_system; SELECT id, filename, total_records, processed_records, status, created_by, created_at FROM bulk_uploads ORDER BY created_at DESC LIMIT 5;"