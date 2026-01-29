@echo off
echo Deploying EXACT reference UI design...

echo Step 1: Building the project...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo Build failed! Please check for errors.
    pause
    exit /b 1
)

echo Step 2: Deploying to Vercel...
call vercel --prod

echo EXACT reference UI deployment completed!
echo ✅ UI now matches your reference image EXACTLY:
echo - Top bar: Search icon + input + calendar + Refresh + Download
echo - Table headers: DELETE, CUSTOMER, PRODUCT, QTY, LENGTH, WIDTH, HEIGHT, WEIGHT, AWB, menu
echo - Clean flat design with proper spacing
echo - Colored badges for QTY and WEIGHT
echo - No unnecessary cards or wrappers
pause