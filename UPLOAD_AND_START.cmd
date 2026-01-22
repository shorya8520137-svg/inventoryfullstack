@echo off
echo 🔧 UPLOAD FIXED FILE AND START SERVER
echo ====================================

echo 📤 Upload fixed dispatchRoutes.js
scp -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no routes/dispatchRoutes-fixed.js ubuntu@16.171.197.86:/home/ubuntu/inventoryfullstack/routes/dispatchRoutes.js

echo 🚀 Start server
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && nohup node server.js > server.log 2>&1 &"

echo ⏳ Wait 3 seconds
timeout /t 3 /nobreak > nul

echo 🧪 Test APIs
node test-all-apis-comprehensive.js