@echo off
echo Removing ChatUI and deploying clean minimal UI...

echo Step 1: Removing ChatUI import from OrderSheet.jsx...
powershell -Command "(Get-Content 'src/app/order/OrderSheet.jsx') -replace 'import ChatUI from \"./chatui\";', '' | Set-Content 'src/app/order/OrderSheet.jsx'"

echo Step 2: Removing ChatUI usage from OrderSheet.jsx...
powershell -Command "(Get-Content 'src/app/order/OrderSheet.jsx') -replace '<ChatUI />', '' | Set-Content 'src/app/order/OrderSheet.jsx'"

echo Step 3: Building the project...
call npm run build

echo Step 4: Deploying to Vercel...
call vercel --prod

echo Clean minimal UI deployment completed!
pause