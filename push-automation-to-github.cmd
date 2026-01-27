@echo off
echo ========================================
echo PUSH AUTOMATION SCRIPTS TO GITHUB
echo ========================================
echo Repository: https://github.com/shorya8520137-svg/inventoryfullstack.git
echo ========================================

echo.
echo Step 1: Checking git status...
git status

echo.
echo Step 2: Adding all new files...
git add .

echo.
echo Step 3: Checking what will be committed...
git status

echo.
echo Step 4: Creating commit with automation features...
git commit -m "🚀 Add Complete Server Automation Suite

✨ New Features:
- Master automation script with interactive menu
- Comprehensive API testing framework
- Database setup and verification scripts
- SSH automation helpers
- Server health monitoring tools

🔧 Automation Scripts Added:
- master-automation.cmd - Interactive menu system
- automated-server-setup-and-test.cmd - Full server setup
- comprehensive-api-test.js - Complete API testing
- verify-database-setup.js - Database verification
- ssh-automation-script.cmd - SSH helper tools

🎯 Capabilities:
- One-click server deployment
- Automated database restoration
- Complete API endpoint testing
- Real-time health monitoring
- Interactive troubleshooting tools

🔐 Includes:
- 2FA system deployment
- Location tracking features
- Audit logging system
- Notification framework
- Production-ready configuration

Ready for deployment to server 54.179.63.233 🚀"

echo.
echo Step 5: Pushing to GitHub...
git push origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================
    echo ✅ SUCCESS: Automation Suite Pushed!
    echo ========================================
    echo.
    echo 🎉 All automation scripts are now on GitHub!
    echo.
    echo 📦 What was pushed:
    echo    ✅ Master automation menu
    echo    ✅ Server setup scripts
    echo    ✅ API testing framework
    echo    ✅ Database verification tools
    echo    ✅ SSH automation helpers
    echo    ✅ Health monitoring scripts
    echo.
    echo 🔗 Repository: https://github.com/shorya8520137-svg/inventoryfullstack.git
    echo.
    echo 🚀 Next Steps:
    echo    1. Clone on server: git clone [repo-url]
    echo    2. Run: master-automation.cmd
    echo    3. Choose option 2 for full setup
    echo    4. Test with option 5
    echo ========================================
) else (
    echo.
    echo ========================================
    echo ❌ ERROR: Push failed
    echo ========================================
    echo Please check:
    echo 1. Internet connection
    echo 2. GitHub authentication
    echo 3. Repository permissions
    echo 4. Git configuration
    echo ========================================
)

pause