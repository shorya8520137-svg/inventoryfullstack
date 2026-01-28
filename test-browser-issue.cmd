@echo off
echo.
echo ============================================================
echo                   BROWSER LOGIN TEST
echo ============================================================
echo.
echo 🔍 Testing what happens when you click Sign In
echo.
echo ✅ API is working perfectly (confirmed)
echo ✅ CORS is configured correctly (confirmed)
echo ❓ Something is wrong in the browser
echo.
echo 🧪 OPENING BROWSER TEST PAGE...
echo.
echo This will:
echo 1. Open a simple test page
echo 2. Make the exact same API call as your frontend
echo 3. Show you exactly what error occurs
echo.
echo 📋 INSTRUCTIONS:
echo 1. Click "Test Login" button
echo 2. Look at the result
echo 3. Check browser console (F12) for errors
echo.
start test-browser-login.html
echo.
echo 🌐 Also opening your actual frontend...
start https://stockiqfullstacktest.vercel.app/login
echo.
echo 🔍 COMPARE BOTH:
echo - Test page should show the exact error
echo - Your frontend should have same issue
echo.
echo ============================================================