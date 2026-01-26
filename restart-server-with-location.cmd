@echo off
echo ========================================
echo RESTARTING SERVER WITH LOCATION TRACKING
echo ========================================
echo.
echo 🔄 This will restart the server to load the updated location tracking code
echo 📍 After restart, audit logs will show location data for IP addresses
echo.
echo 💡 INSTRUCTIONS:
echo 1. Stop the current server (Ctrl+C if running in terminal)
echo 2. Run this command: npm run server
echo 3. Test the location tracking with: node test-location-api-response.js
echo.
echo 🚀 Starting server with location tracking...
echo.

npm run server