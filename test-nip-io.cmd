@echo off
echo ============================================================
echo TESTING .NIP.IO DOMAIN WITH DIFFERENT IPS
echo ============================================================

echo [TEST 1] Testing your current server IP: 13.212.182.78
echo.
echo HTTP test:
curl -s --connect-timeout 10 http://13.212.182.78.nip.io || echo "HTTP failed"
echo.
echo HTTPS test:
curl -s -k --connect-timeout 10 https://13.212.182.78.nip.io || echo "HTTPS failed"

echo.
echo [TEST 2] Testing the IP you provided: 160.191.74.173
echo.
echo HTTP test:
curl -s --connect-timeout 10 http://160.191.74.173.nip.io || echo "HTTP failed"
echo.
echo HTTPS test:
curl -s -k --connect-timeout 10 https://160.191.74.173.nip.io || echo "HTTPS failed"

echo.
echo [TEST 3] Testing direct IP access (without .nip.io)
echo.
echo Testing 13.212.182.78 directly:
curl -s --connect-timeout 10 http://13.212.182.78 || echo "Direct HTTP failed"
echo.
echo Testing 160.191.74.173 directly:
curl -s --connect-timeout 10 http://160.191.74.173 || echo "Direct HTTP failed"

echo.
echo ============================================================
echo TEST RESULTS ABOVE
echo ============================================================
echo If any test shows JSON response, that IP/domain is working
echo If all tests fail, there might be firewall/security group issues
echo ============================================================

pause