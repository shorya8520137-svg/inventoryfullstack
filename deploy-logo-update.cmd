@echo off
echo ========================================
echo DEPLOYING LOGO UPDATE TO HUNHUNY.JPEG
echo ========================================

cd /d "C:\Users\Admin\Desktop\stockiqfullstacktest"

echo.
echo [1/4] Adding changes to git...
git add .

echo.
echo [2/4] Committing logo update...
git commit -m "Replace logo with hunhuny.jpeg image in login page and sidebar"

echo.
echo [3/4] Pushing to GitHub...
git push origin main

echo.
echo [4/4] Verifying deployment...
timeout /t 3 /nobreak > nul

echo.
echo ========================================
echo LOGO UPDATE DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo CHANGES MADE:
echo - Login page: Replaced CSS logo with hunhuny.jpeg image
echo - Sidebar: Replaced Box icon with hunhuny.jpeg image  
echo - Both logos now use the actual company image
echo.
echo NEXT STEPS:
echo 1. Vercel will auto-deploy from GitHub
echo 2. Check https://stockiqfullstacktest.vercel.app/login
echo 3. Verify logo appears correctly in both locations
echo.
pause