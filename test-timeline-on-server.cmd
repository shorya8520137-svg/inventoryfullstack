@echo off
REM Timeline API Test Script for Windows
REM Run this to test both timeline APIs

echo ==============================================
echo TIMELINE API TEST
echo ==============================================
echo.

REM Step 1: Login
echo Step 1: Login to get token
echo -------------------------------------------
curl -s -k -X POST https://inventorysystem.cloud:3001/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}" > login_response.json

echo Login response saved to login_response.json
echo.

REM Step 2: Test Product Timeline
echo Step 2: Test Product Timeline
echo ==============================================
echo GET /api/timeline/2460-3499
echo.

curl -s -k -X GET "https://inventorysystem.cloud:3001/api/timeline/2460-3499" ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE" > timeline_response.json

echo Timeline response saved to timeline_response.json
echo.

REM Step 3: Test Nested Timeline
echo Step 3: Test Nested Dispatch Timeline
echo ==============================================
echo GET /api/order-tracking/19/timeline
echo.

curl -s -k -X GET "https://inventorysystem.cloud:3001/api/order-tracking/19/timeline" ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE" > nested_timeline_response.json

echo Nested timeline response saved to nested_timeline_response.json
echo.

echo ==============================================
echo TEST COMPLETE
echo ==============================================
echo Check these files for responses:
echo - login_response.json
echo - timeline_response.json
echo - nested_timeline_response.json
echo.

pause
