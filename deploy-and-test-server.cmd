@echo off
echo 🚀 DEPLOYING TO SERVER AND TESTING USER CRUD
echo ==================================================

echo.
echo 📡 Connecting to server: ubuntu@13.51.56.188

REM Execute SSH command with all remote commands
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@13.51.56.188 "cd inventoryfullstack && echo '📥 Pulling latest changes...' && git pull origin main && echo '🛑 Stopping server...' && pkill -f 'node server.js' || true && sleep 3 && echo '🚀 Starting server...' && nohup node server.js > server.log 2>&1 & && sleep 5 && echo '✅ Server status:' && ps aux | grep 'node server.js' | grep -v grep && echo '🏥 Health check:' && curl -s https://13.51.56.188.nip.io/api/health && echo '🧪 Testing CRUD:' && node test-table-structure.js && echo '📋 Server logs:' && tail -20 server.log"

echo.
echo 🎉 Deployment completed!
echo.
echo 📝 The server should now have the fixed code without status column issues.
pause