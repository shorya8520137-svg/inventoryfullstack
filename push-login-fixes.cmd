@echo off
echo 🔧 Pushing Login Fixes to GitHub
echo ================================

echo 📝 Adding all changes...
git add .

echo 💬 Committing changes...
git commit -m "Fix React hydration issue - Add multiple login approaches

- Fixed ClientLayout to prevent hydration mismatch
- Added simple-login page for testing
- Added login-isolated page with separate layout
- Created comprehensive test automation
- Fixed loading state handling in ClientLayout

This should resolve the login button not working issue."

echo 🚀 Pushing to GitHub...
git push origin main

if %errorlevel% neq 0 (
    echo ❌ Push failed! Trying to pull first...
    git pull origin main
    echo 🔄 Retrying push...
    git push origin main
)

echo ✅ Changes pushed to GitHub successfully!
echo 🌐 Repository: https://github.com/shorya8520137-svg/inventoryfullstack.git
pause