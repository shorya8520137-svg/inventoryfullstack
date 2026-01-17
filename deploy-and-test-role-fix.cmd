@echo off
echo 🚀 DEPLOYING ROLE_ID FIX TO SERVER
echo ============================================================

echo.
echo 📥 STEP 1: PULLING CHANGES ON SERVER
echo ----------------------------------------
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@13.51.56.188 "cd inventoryfullstack && git pull origin main"

echo.
echo 🛑 STEP 2: RESTARTING SERVER
echo ----------------------------------------
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@13.51.56.188 "pkill -f 'node server.js' || true"
timeout /t 3 /nobreak >nul

ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@13.51.56.188 "cd inventoryfullstack && nohup node server.js > server.log 2>&1 &"
timeout /t 8 /nobreak >nul

echo.
echo 🧪 STEP 3: TESTING ROLE_ID FIX
echo ----------------------------------------
node test-crud-operations-now.js

echo.
echo ✅ DEPLOYMENT AND TESTING COMPLETED!