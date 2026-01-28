@echo off
echo ========================================
echo 🚀 DEPLOY FRONTEND TO VERCEL WITH HTTPS AWS BACKEND
echo ========================================

echo.
echo 📋 This will:
echo 1. Update environment for HTTPS AWS backend
echo 2. Build and deploy to Vercel
echo 3. Backend runs HTTPS on AWS only
echo.

cd stockiqfullstacktest

echo 🔧 Creating production environment for Vercel...
echo # Production Environment - HTTPS AWS Backend for Vercel > .env.production
echo NEXT_PUBLIC_API_BASE=https://13.212.182.78 >> .env.production
echo NODE_ENV=production >> .env.production
echo NEXT_PUBLIC_API_TIMEOUT=30000 >> .env.production

echo 🏗️ Building frontend...
npm run build

echo 🚀 Deploying to Vercel...
vercel --prod

echo.
echo ✅ DEPLOYMENT COMPLETE!
echo 🌐 Frontend: https://stockiqfullstacktest.vercel.app
echo 🔒 Backend: https://13.212.182.78/api
echo.
echo 📋 On AWS server, run: chmod +x setup-https-backend-only.sh && ./setup-https-backend-only.sh
echo.
pause