@echo off
echo ========================================
echo FIX SERVER EXTERNAL ACCESS
echo ========================================
echo Server: 54.179.63.233
echo Issue: API not accessible externally
echo Solution: Configure firewall and security
echo ========================================

echo.
echo Step 1: Checking server status...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "ps aux | grep 'node server.js' | grep -v grep"

echo.
echo Step 2: Checking server binding...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "sudo netstat -tlnp | grep :5000 || sudo ss -tlnp | grep :5000"

echo.
echo Step 3: Checking firewall status...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "sudo ufw status"

echo.
echo Step 4: Opening port 5000 in firewall...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "sudo ufw allow 5000/tcp"

echo.
echo Step 5: Restarting server to ensure proper binding...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "cd ~/inventoryfullstack && pkill -f 'node server.js' && nohup node server.js > server.log 2>&1 &"

echo.
echo Step 6: Waiting for server to start...
timeout /t 5 /nobreak > nul

echo.
echo Step 7: Testing local server access...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "curl -s http://localhost:5000/api/health"

echo.
echo Step 8: Testing external access...
curl -s --connect-timeout 10 http://54.179.63.233:5000/api/health

echo.
echo ========================================
echo SERVER EXTERNAL ACCESS FIX COMPLETE
echo ========================================
echo.
echo If external access still fails, check:
echo 1. AWS Security Group allows port 5000
echo 2. Server is running on 0.0.0.0:5000
echo 3. Ubuntu firewall allows port 5000
echo.
echo Test with: curl http://54.179.63.233:5000/api/health
echo ========================================

pause