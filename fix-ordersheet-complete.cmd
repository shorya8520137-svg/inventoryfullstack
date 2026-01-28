@echo off
echo ========================================
echo COMPLETE ORDERSHEET.JSX FIX
echo ========================================

cd /d "C:\Users\Admin\WebstormProjects\stockiqfullstack\stockiqfullstacktest"

echo Step 1: Clean build cache...
rmdir /s /q .next 2>nul
rmdir /s /q node_modules\.cache 2>nul

echo Step 2: Test build...
npm run build

if %ERRORLEVEL% EQU 0 (
    echo ✅ Build successful!
    echo Step 3: Push to GitHub...
    git add .
    git commit -m "Fix OrderSheet.jsx - Remove ChatUI and fix JSX syntax errors"
    git push origin main
    echo ✅ OrderSheet.jsx fixed and deployed!
) else (
    echo ❌ Build failed - checking file...
    type "src\app\order\OrderSheet.jsx" | findstr /n "ChatUI"
)

echo ========================================
echo ORDERSHEET.JSX FIX COMPLETE
echo ========================================
pause