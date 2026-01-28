@echo off
echo.
echo ============================================================
echo                  POWERSHELL CURL COMMANDS
echo ============================================================
echo.
echo Copy and paste these PowerShell commands:
echo.
echo ============================================================
echo                  1. TEST HTTP LOGIN (SHOULD WORK)
echo ============================================================
echo.
echo curl -X POST "http://54.179.63.233.nip.io/api/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"admin@company.com\",\"password\":\"Admin@123\"}"
echo.
echo ============================================================
echo                  2. TEST HTTPS LOGIN (WILL FAIL)
echo ============================================================
echo.
echo curl -X POST "https://54.179.63.233.nip.io/api/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"admin@company.com\",\"password\":\"Admin@123\"}" -k
echo.
echo ============================================================
echo                  3. TEST SERVER STATUS
echo ============================================================
echo.
echo curl -I "http://54.179.63.233.nip.io"
echo.
echo ============================================================
echo                  4. TEST DIRECT IP WITH PORT
echo ============================================================
echo.
echo curl -X POST "http://54.179.63.233:5000/api/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"admin@company.com\",\"password\":\"Admin@123\"}"
echo.
echo ============================================================
echo                  ALTERNATIVE: USE INVOKE-WEBREQUEST
echo ============================================================
echo.
echo $body = @{email="admin@company.com"; password="Admin@123"} ^| ConvertTo-Json
echo Invoke-WebRequest -Uri "http://54.179.63.233.nip.io/api/auth/login" -Method POST -Body $body -ContentType "application/json"
echo.
echo ============================================================
pause