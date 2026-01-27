@echo off
echo ========================================
echo SSH AUTOMATION SCRIPT
echo ========================================
echo Server: 54.179.63.233
echo SSH Key: C:\Users\Admin\e2c.pem
echo ========================================

echo.
echo Step 1: Testing SSH Connection...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "
echo '=== SSH Connection Successful ==='
echo 'Server Time:' \$(date)
echo 'Server Info:' \$(uname -a)
echo 'Disk Space:' \$(df -h /)
echo 'Memory:' \$(free -h)
echo

echo '=== Checking if server is already set up ==='
if [ -d 'inventoryfullstack' ]; then
    echo '✅ Repository exists'
    cd inventoryfullstack
    echo 'Current branch:' \$(git branch --show-current)
    echo 'Last commit:' \$(git log -1 --oneline)
else
    echo '❌ Repository not found'
fi

echo '=== Checking MySQL ==='
if systemctl is-active --quiet mysql; then
    echo '✅ MySQL is running'
    mysql -u inventory_user -pStrongPass@123 inventory_db -e \"SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema='inventory_db';\" 2>/dev/null || echo '❌ Database not accessible'
else
    echo '❌ MySQL not running'
fi

echo '=== Checking Node.js server ==='
if pm2 list | grep -q 'inventory-backend'; then
    echo '✅ Server process exists'
    pm2 list
else
    echo '❌ Server process not found'
fi

echo '=== Testing API endpoint ==='
curl -f http://localhost:5000/api/health 2>/dev/null && echo '✅ API responding' || echo '❌ API not responding'

echo
echo '=== CURRENT STATUS SUMMARY ==='
"

echo.
echo Step 2: Choose action...
echo 1. Full setup (database + code + server)
echo 2. Update code only
echo 3. Restart server only
echo 4. Test APIs only
echo 5. View logs
set /p choice="Enter choice (1-5): "

if "%choice%"=="1" (
    echo.
    echo Running full setup...
    call automated-server-setup-and-test.cmd
) else if "%choice%"=="2" (
    echo.
    echo Updating code only...
    ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "
    cd inventoryfullstack
    git stash push -m 'Local changes before update'
    git pull origin main
    npm install
    pm2 restart all
    echo 'Code updated and server restarted'
    "
) else if "%choice%"=="3" (
    echo.
    echo Restarting server only...
    ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "
    pm2 restart all
    sleep 5
    pm2 list
    curl -f http://localhost:5000/api/health
    "
) else if "%choice%"=="4" (
    echo.
    echo Testing APIs...
    node comprehensive-api-test.js
) else if "%choice%"=="5" (
    echo.
    echo Viewing logs...
    ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "
    echo '=== PM2 Logs ==='
    pm2 logs --lines 30
    echo
    echo '=== System Logs ==='
    sudo tail -20 /var/log/syslog
    echo
    echo '=== MySQL Logs ==='
    sudo tail -10 /var/log/mysql/error.log
    "
) else (
    echo Invalid choice
)

echo.
echo ========================================
echo SSH Automation Complete
echo ========================================

pause