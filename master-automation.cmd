@echo off
title StockIQ Server Automation
color 0A

echo.
echo  ███████╗████████╗ ██████╗  ██████╗██╗  ██╗██╗ ██████╗ 
echo  ██╔════╝╚══██╔══╝██╔═══██╗██╔════╝██║ ██╔╝██║██╔═══██╗
echo  ███████╗   ██║   ██║   ██║██║     █████╔╝ ██║██║   ██║
echo  ╚════██║   ██║   ██║   ██║██║     ██╔═██╗ ██║██║▄▄ ██║
echo  ███████║   ██║   ╚██████╔╝╚██████╗██║  ██╗██║╚██████╔╝
echo  ╚══════╝   ╚═╝    ╚═════╝  ╚═════╝╚═╝  ╚═╝╚═╝ ╚══▀▀═╝ 
echo.
echo ========================================
echo    MASTER AUTOMATION SCRIPT
echo ========================================
echo Server: 54.179.63.233
echo SSH Key: C:\Users\Admin\e2c.pem
echo Frontend: https://stockiqfullstacktest.vercel.app
echo ========================================

:menu
echo.
echo 🚀 AVAILABLE ACTIONS:
echo.
echo 1. 🔍 Check Server Status
echo 2. 🛠️  Full Server Setup (Database + Code + APIs)
echo 3. 🔄 Update Code Only
echo 4. 🗄️  Verify Database Setup
echo 5. 🧪 Test All APIs
echo 6. 📊 View Server Logs
echo 7. 🔄 Restart Services
echo 8. 📋 System Health Check
echo 9. 🚪 Exit
echo.
set /p choice="👉 Enter your choice (1-9): "

if "%choice%"=="1" goto check_status
if "%choice%"=="2" goto full_setup
if "%choice%"=="3" goto update_code
if "%choice%"=="4" goto verify_database
if "%choice%"=="5" goto test_apis
if "%choice%"=="6" goto view_logs
if "%choice%"=="7" goto restart_services
if "%choice%"=="8" goto health_check
if "%choice%"=="9" goto exit
goto invalid_choice

:check_status
echo.
echo 🔍 Checking Server Status...
echo ========================================
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "
echo '=== SERVER INFORMATION ==='
echo 'Hostname:' \$(hostname)
echo 'Uptime:' \$(uptime)
echo 'Date:' \$(date)
echo

echo '=== SERVICES STATUS ==='
echo 'MySQL:' \$(systemctl is-active mysql)
echo 'PM2 Processes:'
pm2 list 2>/dev/null || echo 'PM2 not installed or no processes'
echo

echo '=== DISK & MEMORY ==='
df -h /
echo
free -h
echo

echo '=== NETWORK ==='
curl -s http://localhost:5000/api/health && echo '✅ API responding' || echo '❌ API not responding'
"
goto menu

:full_setup
echo.
echo 🛠️ Starting Full Server Setup...
echo ========================================
echo This will:
echo - Upload and restore database
echo - Clone/update repository
echo - Install dependencies
echo - Start server
echo - Test all APIs
echo.
set /p confirm="Continue? (y/n): "
if /i "%confirm%"=="y" (
    call automated-server-setup-and-test.cmd
) else (
    echo Setup cancelled.
)
goto menu

:update_code
echo.
echo 🔄 Updating Code...
echo ========================================
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "
cd inventoryfullstack || exit 1
echo '=== Stashing local changes ==='
git stash push -m 'Local changes before update - \$(date)'
echo '=== Pulling latest code ==='
git pull origin main
echo '=== Installing dependencies ==='
npm install
echo '=== Restarting server ==='
pm2 restart all
sleep 5
echo '=== Testing API ==='
curl -f http://localhost:5000/api/health && echo '✅ Update successful' || echo '❌ Update failed'
"
goto menu

:verify_database
echo.
echo 🗄️ Verifying Database Setup...
echo ========================================
node verify-database-setup.js
goto menu

:test_apis
echo.
echo 🧪 Testing All APIs...
echo ========================================
node comprehensive-api-test.js
goto menu

:view_logs
echo.
echo 📊 Viewing Server Logs...
echo ========================================
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "
echo '=== PM2 APPLICATION LOGS ==='
pm2 logs --lines 50
echo
echo '=== SYSTEM LOGS ==='
sudo tail -20 /var/log/syslog | grep -E '(mysql|node|pm2|error)'
echo
echo '=== MYSQL ERROR LOGS ==='
sudo tail -10 /var/log/mysql/error.log 2>/dev/null || echo 'MySQL logs not accessible'
"
goto menu

:restart_services
echo.
echo 🔄 Restarting Services...
echo ========================================
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "
echo '=== Restarting MySQL ==='
sudo systemctl restart mysql
echo '=== Restarting PM2 processes ==='
pm2 restart all
echo '=== Waiting for services to start ==='
sleep 10
echo '=== Checking status ==='
systemctl is-active mysql && echo '✅ MySQL running' || echo '❌ MySQL failed'
pm2 list
curl -f http://localhost:5000/api/health && echo '✅ API responding' || echo '❌ API not responding'
"
goto menu

:health_check
echo.
echo 📋 System Health Check...
echo ========================================
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "
echo '=== COMPREHENSIVE HEALTH CHECK ==='
echo

echo '1. System Resources:'
echo '   CPU Usage:' \$(top -bn1 | grep 'Cpu(s)' | awk '{print \$2}' | cut -d'%' -f1)%
echo '   Memory Usage:' \$(free | grep Mem | awk '{printf \"%.1f%%\", \$3/\$2 * 100.0}')
echo '   Disk Usage:' \$(df / | tail -1 | awk '{print \$5}')
echo

echo '2. Services Status:'
systemctl is-active mysql && echo '   ✅ MySQL: Running' || echo '   ❌ MySQL: Not running'
pm2 list | grep -q online && echo '   ✅ Node.js: Running' || echo '   ❌ Node.js: Not running'
echo

echo '3. Database Health:'
mysql -u inventory_user -pStrongPass@123 inventory_db -e 'SELECT COUNT(*) as users FROM users;' 2>/dev/null && echo '   ✅ Database: Accessible' || echo '   ❌ Database: Not accessible'
echo

echo '4. API Health:'
curl -s http://localhost:5000/api/health | grep -q success && echo '   ✅ API: Responding' || echo '   ❌ API: Not responding'
echo

echo '5. Network Connectivity:'
ping -c 1 google.com >/dev/null 2>&1 && echo '   ✅ Internet: Connected' || echo '   ❌ Internet: No connection'
echo

echo '=== HEALTH CHECK COMPLETE ==='
"
goto menu

:invalid_choice
echo.
echo ❌ Invalid choice. Please enter a number between 1-9.
goto menu

:exit
echo.
echo 👋 Thank you for using StockIQ Server Automation!
echo.
echo 🔗 Quick Access URLs:
echo    Frontend: https://stockiqfullstacktest.vercel.app
echo    Backend:  https://54.179.63.233.nip.io
echo.
echo 📞 Support: Check logs and documentation for troubleshooting
echo ========================================
pause
exit
