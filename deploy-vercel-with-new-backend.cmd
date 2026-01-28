@echo off
echo ========================================
echo 🚀 DEPLOY TO VERCEL WITH NEW BACKEND
echo ========================================

echo.
echo 📋 Backend: https://54.169.107.64:8443
echo 🌐 Frontend: Vercel (HTTPS)
echo ✅ Same HTTPS protocol - No Mixed Content issues!
echo.

cd stockiqfullstacktest

echo 🔧 Building frontend with new backend URL...
npm run build

echo 🚀 Deploying to Vercel production...
vercel --prod

echo.
echo ✅ Deployment complete!
echo 🌐 Frontend: https://stockiqfullstacktest.vercel.app
echo 🔧 Backend: https://54.169.107.64:8443
echo.
echo 🧪 Test login at: https://stockiqfullstacktest.vercel.app/login
echo 👤 Admin: admin@company.com / Admin@123
echo.
pause