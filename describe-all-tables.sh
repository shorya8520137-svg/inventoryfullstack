#!/bin/bash

echo "📊 COMPLETE DATABASE STRUCTURE ANALYSIS"
echo "========================================"
echo ""

mysql -u inventory_user -pStrongPass@123 inventory_db << 'EOF'

-- Get all table names
SET @tables = '';
SELECT GROUP_CONCAT(table_name) INTO @tables
FROM information_schema.tables 
WHERE table_schema = 'inventory_db';

-- Describe each table
SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: ai_column_mapping' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE ai_column_mapping;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM ai_column_mapping;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: ai_learning_events' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE ai_learning_events;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM ai_learning_events;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: audit_logs' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE audit_logs;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM audit_logs;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: conversation_invites' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE conversation_invites;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM conversation_invites;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: conversation_participants' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE conversation_participants;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM conversation_participants;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: conversations' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE conversations;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM conversations;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: cost_ledger' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE cost_ledger;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM cost_ledger;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: damage_recovery_log' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE damage_recovery_log;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM damage_recovery_log;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: dispatch_delivery' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE dispatch_delivery;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM dispatch_delivery;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: dispatch_product' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE dispatch_product;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM dispatch_product;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: dispatch_warehouse' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE dispatch_warehouse;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM dispatch_warehouse;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: inventory' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE inventory;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM inventory;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: inventory_adjustments' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE inventory_adjustments;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM inventory_adjustments;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: inventory_daily_snapshot' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE inventory_daily_snapshot;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM inventory_daily_snapshot;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: inventory_ledger' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE inventory_ledger;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM inventory_ledger;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: inventory_ledger_base' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE inventory_ledger_base;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM inventory_ledger_base;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: inventory_snapshots' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE inventory_snapshots;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM inventory_snapshots;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: locations_geo' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE locations_geo;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM locations_geo;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: logistics' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE logistics;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM logistics;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: message_reads' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE message_reads;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM message_reads;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: messages' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE messages;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM messages;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: payment_mode' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE payment_mode;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM payment_mode;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: permissions' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE permissions;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM permissions;
SELECT 'Sample permissions:' as '';
SELECT * FROM permissions LIMIT 5;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: processed_persons' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE processed_persons;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM processed_persons;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: product_categories' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE product_categories;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM product_categories;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: product_headquatory' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE product_headquatory;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM product_headquatory;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: product_parts' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE product_parts;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM product_parts;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: products' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE products;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM products;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: return_parts' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE return_parts;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM return_parts;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: returns' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE returns;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM returns;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: returns_main' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE returns_main;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM returns_main;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: role_permissions' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE role_permissions;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM role_permissions;
SELECT 'Sample role-permission mappings:' as '';
SELECT 
    r.name as role_name,
    p.name as permission_name,
    p.category
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
JOIN permissions p ON rp.permission_id = p.id
LIMIT 10;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: roles' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE roles;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM roles;
SELECT 'All roles:' as '';
SELECT * FROM roles;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: stock_batches' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE stock_batches;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM stock_batches;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: stock_delta_view' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE stock_delta_view;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: stock_transactions' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE stock_transactions;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM stock_transactions;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: storeinventory' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE storeinventory;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM storeinventory;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: stores' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE stores;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM stores;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: tracking_history' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE tracking_history;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM tracking_history;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: tracking_history_backup' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE tracking_history_backup;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM tracking_history_backup;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: user_activity_log' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE user_activity_log;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM user_activity_log;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: user_profiles' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE user_profiles;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM user_profiles;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: users' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE users;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM users;
SELECT 'All users:' as '';
SELECT id, name, email, role, role_id, is_active, created_at FROM users;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: warehouse_dispatch' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE warehouse_dispatch;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM warehouse_dispatch;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: warehouse_dispatch_items' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE warehouse_dispatch_items;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM warehouse_dispatch_items;

SELECT '═══════════════════════════════════════════════════════' as '';
SELECT 'TABLE: website' as '';
SELECT '═══════════════════════════════════════════════════════' as '';
DESCRIBE website;
SELECT CONCAT('Row count: ', COUNT(*)) as '' FROM website;

SELECT '' as '';
SELECT '✅ COMPLETE DATABASE ANALYSIS FINISHED' as '';
SELECT '' as '';

EOF

echo ""
echo "✅ All tables described!"
echo "📊 Total tables analyzed: 50+"
