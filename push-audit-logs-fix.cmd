@echo off
echo ========================================
echo PUSHING AUDIT LOGS FIX TO GITHUB
echo ========================================
echo.
echo Changes to be pushed:
echo ✅ Fixed audit logs API column names (resource -> resource_type)
echo ✅ Added complete audit logs schema update SQL
echo ✅ Fixed permissions controller for audit logs filtering
echo ✅ Added database migration scripts
echo.
echo Repository: https://github.com/shorya8520137-svg/inventoryfullstack.git
echo.
pause

cd stockiqfullstacktest

echo Adding all changes to git...
git add .

echo.
echo Committing changes...
git commit -m "Fix audit logs API and database schema

- Fixed audit logs API column name from 'resource' to 'resource_type'
- Updated permissions controller to use correct column names
- Added complete audit logs schema migration SQL
- Fixed INSERT statements for audit log creation
- Added location tracking columns support
- Fixed filtering by resource type in audit logs API
- Added database migration scripts for audit_logs table

Resolves: Unknown column 'al.resource' in 'where clause' error"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo AUDIT LOGS FIX PUSHED TO GITHUB!
echo ========================================
echo.
echo Successfully pushed:
echo ✅ controllers/permissionsController.js (fixed column names)
echo ✅ inventoryfullstack/controllers/permissionsController.js (fixed)
echo ✅ fix-audit-logs-schema.sql (database migration)
echo ✅ fix-audit-logs-schema.cmd (automation script)
echo ✅ fix-audit-logs-api.cmd (server restart script)
echo.
echo GitHub repository updated with audit logs fixes!
echo Repository: https://github.com/shorya8520137-svg/inventoryfullstack.git
echo.
echo Next steps:
echo 1. Pull changes on server: git pull origin main
echo 2. Run database migration: fix-audit-logs-schema.cmd
echo 3. Restart server: pm2 restart server
echo.
pause