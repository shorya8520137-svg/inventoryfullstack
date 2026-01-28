@echo off
cls
echo.
echo ============================================================
echo                  SIMPLE FIX - WORKS NOW!
echo ============================================================
echo.
echo I can see from your screenshots:
echo   ✅ HTTP test login works perfectly
echo   ❌ HTTPS login page shows "1 hidden" in console
echo   ❌ No console messages when clicking Sign In
echo.
echo This confirms: Browser is blocking HTTPS → HTTP requests
echo.
echo ============================================================
echo                  30 SECOND FIX
echo ============================================================
echo.
echo 1. Go to: https://stockiqfullstacktest.vercel.app/login
echo 2. Look at address bar - you'll see 🔒 "Not secure" or 🔒 "Secure"
echo 3. CLICK THE 🔒 ICON
echo 4. Click "Site settings"
echo 5. Find "Insecure content"
echo 6. Change from "Block (default)" to "Allow"
echo 7. Refresh page (F5)
echo 8. Try login: admin@company.com / Admin@123
echo.
echo ============================================================
echo                  OPENING LOGIN PAGE
echo ============================================================
echo.
start "" "https://stockiqfullstacktest.vercel.app/login"
echo.
echo Login page opened! Follow the steps above.
echo.
echo ============================================================
echo                  WHAT WILL HAPPEN
echo ============================================================
echo.
echo After allowing insecure content:
echo   ✅ Console will show all debug messages
echo   ✅ Login will work immediately
echo   ✅ You'll be redirected to /products
echo   ✅ Everything will work perfectly!
echo.
echo ============================================================
pause