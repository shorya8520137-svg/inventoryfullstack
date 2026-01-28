@echo off
echo ============================================================
echo TESTING HTTPS API AND DEPLOYING FRONTEND
echo ============================================================

echo [STEP 1] Testing HTTPS API...

ssh -i "C:\Users\Admin\e2c.pem" ubuntu@13.212.182.78 "
echo 'Testing HTTPS health check...'
curl -k https://13.212.182.78.nip.io

echo ''
echo 'Testing admin login API...'
curl -k -X POST https://13.212.182.78.nip.io/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{\"email\":\"admin@company.com\",\"password\":\"Admin@123\"}'
"

echo.
echo [STEP 2] Deploying frontend with HTTPS environment...
echo.

cd stockiqfullstacktest
vercel --prod

echo.
echo ============================================================
echo DEPLOYMENT COMPLETE!
echo ============================================================
echo Backend: https://13.212.182.78.nip.io
echo Frontend: https://stockiqfullstacktest.vercel.app
echo Environment updated to use HTTPS
echo ============================================================

pause