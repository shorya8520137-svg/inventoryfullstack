#!/bin/bash

echo "🔍 ANALYZING DATABASE STRUCTURE WITH SUDO MYSQL"
echo "============================================================"
echo "🎯 Goal: Understand why LOGIN/DISPATCH events are missing from audit logs"
echo "============================================================"

echo ""
echo "📊 STEP 1: Audit Logs Table Structure"
echo "----------------------------------------------------"
sudo mysql -e "USE inventory_db; DESCRIBE audit_logs;"

echo ""
echo "📊 STEP 2: Current Audit Data (Recent 10 entries)"
echo "----------------------------------------------------"
sudo mysql -e "USE inventory_db; SELECT id, user_id, action, resource, resource_id, ip_address, user_agent, created_at FROM audit_logs ORDER BY created_at DESC LIMIT 10;"

echo ""
echo "📊 STEP 3: Audit Event Types Summary"
echo "----------------------------------------------------"
sudo mysql -e "USE inventory_db; SELECT DISTINCT action, resource, COUNT(*) as count FROM audit_logs GROUP BY action, resource ORDER BY count DESC;"

echo ""
echo "📊 STEP 4: All Database Tables"
echo "----------------------------------------------------"
sudo mysql -e "USE inventory_db; SHOW TABLES;"

echo ""
echo "📊 STEP 5: Users Table Structure (for login tracking)"
echo "----------------------------------------------------"
sudo mysql -e "USE inventory_db; DESCRIBE users;"

echo ""
echo "📊 STEP 6: Recent User Logins (last_login field)"
echo "----------------------------------------------------"
sudo mysql -e "USE inventory_db; SELECT id, name, email, last_login, created_at FROM users ORDER BY last_login DESC LIMIT 5;"

echo ""
echo "📊 STEP 7: Warehouse Dispatch Table Structure"
echo "----------------------------------------------------"
sudo mysql -e "USE inventory_db; DESCRIBE warehouse_dispatch;" 2>/dev/null || echo "❌ warehouse_dispatch table not found"

echo ""
echo "📊 STEP 8: Recent Dispatches (should be in audit but missing)"
echo "----------------------------------------------------"
sudo mysql -e "USE inventory_db; SELECT id, order_ref, customer, product_name, awb, timestamp FROM warehouse_dispatch ORDER BY timestamp DESC LIMIT 5;" 2>/dev/null || echo "❌ No dispatch data found"

echo ""
echo "📊 STEP 9: Check for Login/Session Related Tables"
echo "----------------------------------------------------"
sudo mysql -e "USE inventory_db; SHOW TABLES LIKE '%session%';"
sudo mysql -e "USE inventory_db; SHOW TABLES LIKE '%login%';"
sudo mysql -e "USE inventory_db; SHOW TABLES LIKE '%auth%';"

echo ""
echo "📊 STEP 10: Check NULL Issues in Audit Logs"
echo "----------------------------------------------------"
echo "Entries with NULL user_id:"
sudo mysql -e "USE inventory_db; SELECT COUNT(*) as null_user_id_count FROM audit_logs WHERE user_id IS NULL;"

echo "Entries with NULL ip_address:"
sudo mysql -e "USE inventory_db; SELECT COUNT(*) as null_ip_count FROM audit_logs WHERE ip_address IS NULL;"

echo ""
echo "🔍 ANALYSIS COMPLETE"
echo "============================================================"
echo "🎯 Based on this data, we need to:"
echo "   1. Find where LOGIN events should be tracked"
echo "   2. Find where DISPATCH events should be tracked"
echo "   3. Fix user_id and ip_address NULL issues"
echo "   4. Understand current audit system implementation"
echo "============================================================"