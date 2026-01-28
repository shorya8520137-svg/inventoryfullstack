@echo off
echo 🔧 Deploying COMPLETELY ISOLATED Login Page
echo ============================================

echo 📝 What was done:
echo - Copied EXACT working simple-login logic to main login page
echo - Created separate layout.jsx for login page (bypasses ClientLayout)
echo - Removed all 2FA complexity temporarily
echo - Added console debugging like working simple-login
echo - Beautiful styling preserved
echo.

echo 🎯 This should work because:
echo - Login page now has its own layout (no ClientLayout interference)
echo - Exact same JavaScript logic as working simple-login
echo - No AuthContext or complex state management
echo - Direct API calls with fallback URL
echo.

echo 📦 Building frontend...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo 🚀 Deploying to Vercel...
call vercel --prod

if %errorlevel% neq 0 (
    echo ❌ Deployment failed!
    pause
    exit /b 1
)

echo ⏳ Waiting for deployment...
timeout /t 10 /nobreak

echo.
echo ✅ COMPLETELY ISOLATED LOGIN DEPLOYED!
echo 🌐 Test URL: https://stockiqfullstacktest.vercel.app/login
echo.
echo 🧪 This should now work EXACTLY like simple-login:
echo 1. Open login page
echo 2. Open Developer Console (F12)  
echo 3. Fill: admin@company.com / Admin@123
echo 4. Click Sign In
echo 5. Should see: "🚀 Form submitted - JavaScript is working!"
echo 6. Should login and redirect to products
echo.
echo 🎯 If this doesn't work, then there's a deeper Next.js issue
pause