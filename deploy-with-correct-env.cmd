@echo off
echo 🚀 DEPLOYING WITH CORRECT ENVIRONMENT VARIABLES
echo ============================================================

echo 1️⃣ Checking local environment...
node test-frontend-final.js

echo.
echo 2️⃣ Building production version...
npm run build

echo.
echo 3️⃣ Vercel deployment instructions:
echo.
echo 📋 IMPORTANT: Update Vercel Environment Variables
echo    1. Go to: https://vercel.com/dashboard
echo    2. Select your project: stockiqfullstacktest
echo    3. Go to: Settings ^> Environment Variables
echo    4. Update NEXT_PUBLIC_API_BASE to: https://16.171.5.50.nip.io
echo    5. Make sure it's set for: Production, Preview, Development
echo    6. Click "Save"
echo    7. Go to Deployments tab and click "Redeploy" on latest deployment
echo.
echo 🔧 Alternative: Deploy from command line
echo    vercel --prod
echo.
echo ⚠️  CRITICAL: Vercel environment variables override local .env files!
echo    Make sure to update them in the Vercel dashboard.
echo.
echo ============================================================
echo ✅ Local environment is ready for deployment!

pause