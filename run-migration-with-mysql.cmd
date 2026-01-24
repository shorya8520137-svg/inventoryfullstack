@echo off
echo Running location tracking migration...
mysql -u root -p inventory_db < add-location-columns-to-audit-logs.sql
echo Migration completed!
pause