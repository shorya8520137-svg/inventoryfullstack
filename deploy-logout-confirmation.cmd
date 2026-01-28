@echo off
echo 🔧 Deploying Logout Confirmation Modal
echo ======================================

echo 📝 What was added:
echo - Beautiful logout confirmation modal
echo - Shows user info (name, email, avatar)
echo - "Are you sure you want to logout?" message
echo - Cancel and Logout buttons with hover effects
echo - Backdrop blur and smooth animations
echo - Modal appears when clicking logout in sidebar
echo.

echo 🎯 Features:
echo - Modal shows user's name and email
echo - Cancel button to dismiss modal
echo - Logout button to confirm and logout
echo - Beautiful styling with animations
echo - Backdrop blur effect
echo - Responsive design
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
echo ✅ LOGOUT CONFIRMATION DEPLOYED!
echo 🌐 Test URL: https://stockiqfullstacktest.vercel.app
echo.
echo 🧪 Test Steps:
echo 1. Login with: admin@company.com / Admin@123
echo 2. Go to any page (products, inventory, etc.)
echo 3. Click the logout button in the sidebar (red button with logout icon)
echo 4. Should see beautiful confirmation modal
echo 5. Click "Cancel" to dismiss or "Logout" to confirm
echo.
echo 🎯 Expected: Beautiful modal with user info and confirmation buttons!
pause