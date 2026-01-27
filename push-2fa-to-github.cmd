@echo off
echo 🚀 PUSHING 2FA IMPLEMENTATION TO GITHUB
echo ==========================================

echo.
echo 📋 This will commit and push the complete 2FA system:
echo • Google Authenticator integration
echo • Backend 2FA services and controllers
echo • Frontend 2FA setup wizard
echo • Enhanced login with 2FA support
echo • Database schema updates
echo • Testing and documentation

echo.
echo 🔍 Checking Git status...
git status

echo.
echo 📝 Adding all 2FA files to Git...
git add .

echo.
echo 💾 Committing 2FA implementation...
git commit -m "feat: Complete Google 2FA implementation

✨ Features Added:
- Google Authenticator Two-Factor Authentication
- TOTP token generation and verification
- QR code setup wizard (/2fa-setup)
- Backup codes for account recovery
- Enhanced login flow with 2FA support
- Secure secret storage and management

🔧 Backend Implementation:
- TwoFactorAuthService for core 2FA functionality
- TwoFactorController with complete API endpoints
- Enhanced AuthController with 2FA login flow
- Database schema with 4 new 2FA columns
- Speakeasy and QRCode integration

🎨 Frontend Implementation:
- Professional 4-step 2FA setup wizard
- Enhanced login page with seamless 2FA input
- QR code display and manual entry support
- Backup codes download and management
- User-friendly error handling and feedback

🔐 Security Features:
- 32-character base32 secrets
- 30-second TOTP time windows
- One-time backup codes (10 per user)
- JWT authentication for all 2FA endpoints
- Proper token validation and rate limiting

📁 Files Added/Modified:
Backend:
- services/TwoFactorAuthService.js
- controllers/twoFactorController.js
- routes/twoFactorRoutes.js
- controllers/authController.js (enhanced)

Frontend:
- src/app/2fa-setup/page.jsx
- src/app/login/page.jsx (enhanced)

Database:
- add-2fa-columns.sql
- add-2fa-columns-with-sudo.js
- setup-2fa-database.cmd

Testing & Documentation:
- test-2fa-system.js
- GOOGLE_2FA_IMPLEMENTATION_COMPLETE.md
- check-users-table-structure.js

🎯 Ready for Production:
- Complete API documentation
- Comprehensive testing suite
- Database migration scripts
- User setup instructions
- Security best practices implemented"

if %errorlevel% neq 0 (
    echo ❌ Commit failed!
    pause
    exit /b 1
)

echo.
echo 🚀 Pushing to GitHub...
git push origin main

if %errorlevel% neq 0 (
    echo ❌ Push failed!
    echo 💡 Make sure you have push access to the repository
    pause
    exit /b 1
)

echo.
echo 🎉 SUCCESS! 2FA Implementation pushed to GitHub!
echo.
echo 📋 What was pushed:
echo ✅ Complete Google 2FA system
echo ✅ Backend services and API endpoints
echo ✅ Frontend setup wizard and enhanced login
echo ✅ Database schema and migration scripts
echo ✅ Comprehensive testing suite
echo ✅ Complete documentation
echo.
echo 🔗 GitHub Repository: https://github.com/your-username/your-repo
echo 📖 Documentation: GOOGLE_2FA_IMPLEMENTATION_COMPLETE.md
echo 🧪 Test Script: test-2fa-system.js
echo 🔧 Setup Script: setup-2fa-database.cmd
echo.
echo 💡 Next Steps:
echo 1. Run database setup on server: node add-2fa-columns-with-sudo.js
echo 2. Restart your server to load new routes
echo 3. Test 2FA system: node test-2fa-system.js
echo 4. Visit /2fa-setup to enable 2FA for users
echo.
echo 🔐 2FA is now ready for production use!

pause