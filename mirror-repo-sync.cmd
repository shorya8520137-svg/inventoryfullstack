@echo off
echo ========================================
echo Git Mirror Sync: Personal → Company
echo ========================================

REM Create temporary directory for mirror
set TEMP_DIR=C:\Users\Admin\Desktop\temp_mirror_sync
if exist "%TEMP_DIR%" rmdir /s /q "%TEMP_DIR%"
mkdir "%TEMP_DIR%"
cd /d "%TEMP_DIR%"

echo.
echo ========================================
echo Step 1: Clone Mirror from Personal Repo
echo ========================================
echo Cloning mirror from: https://github.com/shorya8520137-svg/inventoryfullstack.git
git clone --mirror https://github.com/shorya8520137-svg/inventoryfullstack.git

echo.
echo ========================================
echo Step 2: Enter Mirror Directory
echo ========================================
cd inventoryfullstack.git

echo.
echo ========================================
echo Step 3: Push Mirror to Company Repo
echo ========================================
echo Pushing to: https://github.com/shoryasingh-creator/hunyhunyinventory.git
git push --mirror https://github.com/shoryasingh-creator/hunyhunyinventory.git

echo.
echo ========================================
echo Step 4: Cleanup
echo ========================================
cd /d C:\Users\Admin\Desktop
rmdir /s /q "%TEMP_DIR%"

echo.
echo ========================================
echo MIRROR SYNC COMPLETED!
echo ========================================
echo.
echo ✓ Personal repo: shorya8520137-svg/inventoryfullstack
echo ✓ Company repo: shoryasingh-creator/hunyhunyinventory
echo.
echo The company repository now contains a complete mirror
echo of your personal repository including all branches,
echo tags, and commit history.
echo.
echo To verify: Check https://github.com/shoryasingh-creator/hunyhunyinventory

pause