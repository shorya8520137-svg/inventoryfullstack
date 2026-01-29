@echo off
echo ========================================
echo FIXING ORDERSHEET.JSX - PULL FROM GITHUB
echo ========================================

cd /d "C:\Users\Admin\Desktop\stockiqfullstacktest"

echo Step 1: Pull latest working code from GitHub...
git stash
git pull origin main

echo Step 2: Check if OrderSheet.jsx is fixed...
if exist "src\app\order\OrderSheet.jsx" (
    echo ✅ OrderSheet.jsx found
) else (
    echo ❌ OrderSheet.jsx missing
)

echo Step 3: Remove any ChatUI references...
powershell -Command "(Get-Content 'src\app\order\OrderSheet.jsx') -replace '// import ChatUI from.*', '' -replace 'import ChatUI from.*', '' | Set-Content 'src\app\order\OrderSheet.jsx'"

echo Step 4: Test build...
npm run build

echo ========================================
echo ORDERSHEET.JSX FIX COMPLETE
echo ========================================
pause