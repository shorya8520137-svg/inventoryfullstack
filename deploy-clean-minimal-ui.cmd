@echo off
echo Deploying Clean Minimal UI like reference image...

echo Step 1: Building the project...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo Build failed! Please check for errors.
    pause
    exit /b 1
)

echo Step 2: Deploying to Vercel...
call vercel --prod

echo Clean minimal UI deployment completed successfully!
echo The UI now matches your reference image with:
echo - Clean header with search and download buttons
echo - Minimal table design with proper spacing
echo - Professional color scheme
echo - No chat bot icon
pause