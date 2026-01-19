@echo off
echo ========================================
echo AUTOMATED DEPLOYMENT - SATURDAY VERSION
echo ========================================

echo.
echo Step 1: Pushing code to GitHub...
git add .
git commit -m "RESTORE: Saturday working version with updated API IP (13.53.54.181)"
git push origin main
if %errorlevel% neq 0 (
    echo ERROR: Failed to push to GitHub
    pause
    exit /b 1
)
echo SUCCESS: Code pushed to GitHub

echo.
echo Step 2: Deploying to server...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.53.54.181 "cd ~/inventoryfullstack && echo 'Stopping server...' && pkill -f 'node server.js' || true && echo 'Pulling from GitHub...' && git fetch origin && git reset --hard origin/main && echo 'Installing dependencies...' && npm install && echo 'Starting server...' && nohup node server.js > server.log 2>&1 & && sleep 3 && echo 'Testing server...' && curl -X GET https://13.53.54.181.nip.io/ -k -s && echo 'Testing login...' && curl -X POST https://13.53.54.181.nip.io/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"admin@company.com\",\"password\":\"password\"}' -k -s && echo 'Deployment completed!'"

if %errorlevel% neq 0 (
    echo ERROR: Server deployment failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo DEPLOYMENT COMPLETED SUCCESSFULLY!
echo ========================================
echo Frontend: http://localhost:3000
echo Backend: https://13.53.54.181.nip.io
echo Login: admin@company.com / password
echo ========================================
pause