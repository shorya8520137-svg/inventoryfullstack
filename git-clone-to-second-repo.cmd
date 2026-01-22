@echo off
REM =====================================================
REM STOCKIQ INVENTORY - CLONE TO SECOND REPOSITORY SCRIPT
REM =====================================================
REM This script clones the current repo to a second GitHub account
REM while maintaining upstream connection for future syncing
REM =====================================================

echo 🚀 Starting StockIQ Inventory Repository Clone Process...
echo ========================================================

REM Step 1: Clone the sender repository (current repo)
echo 📥 Step 1: Cloning sender repository...
git clone https://github.com/shorya8520137-svg/inventoryfullstack.git

REM Step 2: Enter the project directory
echo 📁 Step 2: Entering project directory...
cd inventoryfullstack

REM Step 3: Rename sender repo remote to upstream
echo 🔄 Step 3: Renaming origin to upstream...
git remote rename origin upstream

REM Step 4: Add receiver repository as origin (REPLACE WITH YOUR SECOND REPO URL)
echo 🎯 Step 4: Adding receiver repository as origin...
git remote add origin https://github.com/shoryasingh-creator/hunyhunyinventory.git

REM Step 5: Verify remotes configuration
echo ✅ Step 5: Verifying remote configuration...
git remote -v

REM Step 6: Push code to receiver repository
echo 🚀 Step 6: Pushing code to receiver repository...
git push -u origin main

REM Step 7: Optional - Prevent accidental push to sender (RECOMMENDED)
echo 🔐 Step 7: Securing upstream remote (preventing accidental pushes)...
git remote set-url --push upstream DISABLE

echo.
echo ✅ SUCCESS! Repository cloned successfully!
echo ========================================================
echo 📊 FINAL CONFIGURATION:
echo origin   → shoryasingh-creator/hunyhunyinventory   (your main repo)
echo upstream → shorya8520137-svg/inventoryfullstack    (original source)
echo.
echo 🔄 TO SYNC FUTURE UPDATES FROM ORIGINAL REPO:
echo git pull upstream main
echo.
echo 🔐 SECURITY: Upstream is protected from accidental pushes
echo ✨ Your StockIQ Inventory system is ready in your second account!

pause