@echo off
echo.
echo ============================================================
echo                   TEST BUTTON CLICK NOW
echo ============================================================
echo.
echo ✅ I've added direct button click detection
echo ✅ Frontend rebuilt and deployed
echo 🔍 Now we'll see if the button is working at all
echo.
echo ============================================================
echo                   TEST INSTRUCTIONS
echo ============================================================
echo.
echo 1. Go to: https://stockiqfullstacktest.vercel.app/login
echo 2. Press F12 → Console tab
echo 3. Click the "Sign In" button
echo.
echo ============================================================
echo                   WHAT YOU SHOULD SEE
echo ============================================================
echo.
echo ✅ If button works: You'll see an ALERT popup saying "Direct button click detected!"
echo ❌ If button broken: No alert popup at all
echo.
echo If you see the alert:
echo - The button is working
echo - The issue is in the form submission
echo.
echo If you DON'T see the alert:
echo - The button click is completely broken
echo - JavaScript/React is not working
echo - CSS might be blocking the button
echo.
echo ============================================================
echo                   OPENING FRONTEND
echo ============================================================
echo.
start https://stockiqfullstacktest.vercel.app/login
echo.
echo ============================================================
echo Tell me: Do you see the alert popup when you click Sign In?
echo ============================================================
pause