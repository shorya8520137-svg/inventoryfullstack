@echo off
echo Restoring original OrderSheet with all columns and features...

echo Step 1: Restoring from working commit...
git checkout 76d4bb5 -- src/app/order/OrderSheet.jsx

echo Step 2: Removing only ChatUI import...
powershell -Command "(Get-Content 'src/app/order/OrderSheet.jsx') -replace 'import ChatUI from \"./chatui\";', '' | Set-Content 'src/app/order/OrderSheet.jsx'"

echo Step 3: Removing only ChatUI usage...
powershell -Command "(Get-Content 'src/app/order/OrderSheet.jsx') -replace '<ChatUI />', '' | Set-Content 'src/app/order/OrderSheet.jsx'"

echo Step 4: Building...
call npm run build

echo Step 5: Deploying...
call vercel --prod

echo Original OrderSheet restored with all your columns and features!
pause