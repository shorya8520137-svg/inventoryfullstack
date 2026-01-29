@echo off
echo Deploying EXACT flat UI to match your reference images...

echo Step 1: Building the project...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo Build failed! Please check for errors.
    pause
    exit /b 1
)

echo Step 2: Deploying to Vercel...
call vercel --prod

echo EXACT flat UI deployment completed!
echo Changes made:
echo - Removed unnecessary card wrapper around search
echo - Flat table design without rounded corners
echo - Search and date filters in same row as buttons
echo - Clean flat design exactly like your reference images
echo - No chat bot icon
pause