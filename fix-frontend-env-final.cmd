@echo off
echo.
echo ============================================================
echo                  FIXING FRONTEND ENVIRONMENT
echo ============================================================
echo.
echo ✅ Login is working!
echo ❌ Products page still uses HTTPS
echo.
echo Updating environment variables to use HTTP...
echo.
echo ============================================================
echo                  UPDATING .ENV FILES
echo ============================================================
echo.

echo Updating .env.production...
echo # Production Environment Variables - Backend HTTP > .env.production
echo NEXT_PUBLIC_API_BASE=http://54.179.63.233.nip.io >> .env.production
echo NODE_ENV=production >> .env.production

echo.
echo Updating .env.local...
echo # Local Environment Variables - Backend HTTP > .env.local
echo NEXT_PUBLIC_API_BASE=http://54.179.63.233.nip.io >> .env.local
echo NODE_ENV=development >> .env.local
echo NEXT_PUBLIC_API_TIMEOUT=30000 >> .env.local

echo.
echo ============================================================
echo                  REBUILDING AND DEPLOYING
echo ============================================================
echo.
echo Building frontend with correct environment...
call npm run build

echo.
echo Deploying to Vercel...
call vercel --prod

echo.
echo ============================================================
echo                  TESTING COMPLETE FLOW
echo ============================================================
echo.
echo After deployment:
echo 1. Go to: https://stockiqfullstacktest.vercel.app/login
echo 2. Login with: admin@company.com / Admin@123
echo 3. Products page should load correctly!
echo.
echo ============================================================
pause