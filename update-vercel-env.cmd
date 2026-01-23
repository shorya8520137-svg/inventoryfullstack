@echo off
echo 🔧 UPDATING VERCEL ENVIRONMENT VARIABLES
echo ============================================================

echo 📋 STEP-BY-STEP INSTRUCTIONS:
echo.
echo 1️⃣ Open Vercel Dashboard:
echo    https://vercel.com/dashboard
echo.
echo 2️⃣ Select your project:
echo    Click on "stockiqfullstacktest"
echo.
echo 3️⃣ Go to Settings:
echo    Click "Settings" tab at the top
echo.
echo 4️⃣ Environment Variables:
echo    Click "Environment Variables" in the left sidebar
echo.
echo 5️⃣ Find NEXT_PUBLIC_API_BASE:
echo    Look for existing NEXT_PUBLIC_API_BASE variable
echo    If it exists, click the "..." menu and select "Edit"
echo    If it doesn't exist, click "Add New"
echo.
echo 6️⃣ Update the value:
echo    Variable Name: NEXT_PUBLIC_API_BASE
echo    Value: https://16.171.5.50.nip.io
echo    Environment: Check ALL (Production, Preview, Development)
echo.
echo 7️⃣ Save the changes:
echo    Click "Save" button
echo.
echo 8️⃣ Redeploy:
echo    Go to "Deployments" tab
echo    Find the latest deployment
echo    Click "..." menu and select "Redeploy"
echo    OR run: vercel --prod
echo.
echo ============================================================
echo ⚠️  IMPORTANT: Vercel environment variables override local .env files!
echo    The production deployment will only use the correct API after
echo    updating the environment variables in Vercel dashboard.
echo.
echo 🔗 Quick Links:
echo    Dashboard: https://vercel.com/dashboard
echo    Project: https://vercel.com/test-tests-projects-d6b8ba0b/stockiqfullstacktest
echo.

pause

echo.
echo 🧪 After updating, test the deployment:
echo    1. Visit: https://stockiqfullstacktest.vercel.app/api-debug
echo    2. Should show: https://16.171.5.50.nip.io
echo    3. Visit: https://stockiqfullstacktest.vercel.app/login
echo    4. Try login: admin@company.com / admin@123
echo.

pause