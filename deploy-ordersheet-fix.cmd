@echo off
echo ========================================
echo DEPLOY ORDERSHEET.JSX FIX
echo ========================================

cd /d "C:\Users\Admin\WebstormProjects\stockiqfullstack\stockiqfullstacktest"

echo Step 1: Clear all caches...
rmdir /s /q .next 2>nul
rmdir /s /q node_modules\.cache 2>nul
del package-lock.json 2>nul

echo Step 2: Reinstall dependencies...
npm install

echo Step 3: Test build...
npm run build

if %ERRORLEVEL% EQU 0 (
    echo ✅ Build successful!
    
    echo Step 4: Push to GitHub...
    git add .
    git commit -m "Fix OrderSheet.jsx - Remove ChatUI completely and fix JSX syntax"
    git push origin main
    
    echo ✅ OrderSheet.jsx fixed and deployed successfully!
) else (
    echo ❌ Build still failing
)

echo ========================================
echo DEPLOYMENT COMPLETE
echo ========================================
pause