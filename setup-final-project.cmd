@echo off
echo ========================================
echo Final Project Setup by Shorya Singh
echo ========================================

REM Create the final project folder on desktop
set PROJECT_DIR=C:\Users\Admin\Desktop\Final Project by Shorya Singh

echo Creating project directory: %PROJECT_DIR%
if exist "%PROJECT_DIR%" rmdir /s /q "%PROJECT_DIR%"
mkdir "%PROJECT_DIR%"

echo.
echo ========================================
echo Cloning StockIQ Inventory System
echo ========================================

REM Navigate to the project directory
cd /d "%PROJECT_DIR%"

echo Cloning repository from GitHub...
git clone https://github.com/shorya8520137-svg/inventoryfullstack.git

echo.
echo ========================================
echo Setting up project structure
echo ========================================

REM Rename the cloned folder to a cleaner name
if exist "inventoryfullstack" (
    echo Renaming folder to StockIQ-Inventory-System...
    ren "inventoryfullstack" "StockIQ-Inventory-System"
)

echo.
echo ========================================
echo Creating project documentation
echo ========================================

REM Create a project overview file
echo STOCKIQ INVENTORY MANAGEMENT SYSTEM > "%PROJECT_DIR%\PROJECT_OVERVIEW.txt"
echo ================================== >> "%PROJECT_DIR%\PROJECT_OVERVIEW.txt"
echo. >> "%PROJECT_DIR%\PROJECT_OVERVIEW.txt"
echo Developer: Shorya Singh >> "%PROJECT_DIR%\PROJECT_OVERVIEW.txt"
echo Project: Enterprise Inventory Management System >> "%PROJECT_DIR%\PROJECT_OVERVIEW.txt"
echo Technology: Full-Stack (Next.js + Node.js + MySQL) >> "%PROJECT_DIR%\PROJECT_OVERVIEW.txt"
echo. >> "%PROJECT_DIR%\PROJECT_OVERVIEW.txt"
echo CONTENTS: >> "%PROJECT_DIR%\PROJECT_OVERVIEW.txt"
echo ========= >> "%PROJECT_DIR%\PROJECT_OVERVIEW.txt"
echo - StockIQ-Inventory-System/  (Complete source code) >> "%PROJECT_DIR%\PROJECT_OVERVIEW.txt"
echo - Frontend: Next.js 14 with modern UI >> "%PROJECT_DIR%\PROJECT_OVERVIEW.txt"
echo - Backend: Node.js with Express.js >> "%PROJECT_DIR%\PROJECT_OVERVIEW.txt"
echo - Database: MySQL with 52 tables >> "%PROJECT_DIR%\PROJECT_OVERVIEW.txt"
echo - APIs: 35+ RESTful endpoints >> "%PROJECT_DIR%\PROJECT_OVERVIEW.txt"
echo - Features: Multi-warehouse, permissions, audit logs >> "%PROJECT_DIR%\PROJECT_OVERVIEW.txt"
echo. >> "%PROJECT_DIR%\PROJECT_OVERVIEW.txt"
echo LIVE DEPLOYMENT: >> "%PROJECT_DIR%\PROJECT_OVERVIEW.txt"
echo ================ >> "%PROJECT_DIR%\PROJECT_OVERVIEW.txt"
echo Frontend: https://stockiqfullstacktest.vercel.app >> "%PROJECT_DIR%\PROJECT_OVERVIEW.txt"
echo Backend: AWS EC2 (16.171.197.86:5000) >> "%PROJECT_DIR%\PROJECT_OVERVIEW.txt"
echo. >> "%PROJECT_DIR%\PROJECT_OVERVIEW.txt"
echo ADMIN CREDENTIALS: >> "%PROJECT_DIR%\PROJECT_OVERVIEW.txt"
echo ================== >> "%PROJECT_DIR%\PROJECT_OVERVIEW.txt"
echo Email: admin@company.com >> "%PROJECT_DIR%\PROJECT_OVERVIEW.txt"
echo Password: admin@123 >> "%PROJECT_DIR%\PROJECT_OVERVIEW.txt"
echo. >> "%PROJECT_DIR%\PROJECT_OVERVIEW.txt"
echo GITHUB REPOSITORIES: >> "%PROJECT_DIR%\PROJECT_OVERVIEW.txt"
echo =================== >> "%PROJECT_DIR%\PROJECT_OVERVIEW.txt"
echo Personal: https://github.com/shorya8520137-svg/inventoryfullstack >> "%PROJECT_DIR%\PROJECT_OVERVIEW.txt"
echo Company: https://github.com/shoryasingh-creator/hunyhunyinventory >> "%PROJECT_DIR%\PROJECT_OVERVIEW.txt"
echo. >> "%PROJECT_DIR%\PROJECT_OVERVIEW.txt"
echo TO RUN LOCALLY: >> "%PROJECT_DIR%\PROJECT_OVERVIEW.txt"
echo =============== >> "%PROJECT_DIR%\PROJECT_OVERVIEW.txt"
echo 1. cd StockIQ-Inventory-System >> "%PROJECT_DIR%\PROJECT_OVERVIEW.txt"
echo 2. npm install >> "%PROJECT_DIR%\PROJECT_OVERVIEW.txt"
echo 3. Configure .env file >> "%PROJECT_DIR%\PROJECT_OVERVIEW.txt"
echo 4. npm run dev (frontend) >> "%PROJECT_DIR%\PROJECT_OVERVIEW.txt"
echo 5. npm run server (backend) >> "%PROJECT_DIR%\PROJECT_OVERVIEW.txt"
echo. >> "%PROJECT_DIR%\PROJECT_OVERVIEW.txt"
echo Created: %date% %time% >> "%PROJECT_DIR%\PROJECT_OVERVIEW.txt"

echo.
echo ========================================
echo Final Project Setup Complete!
echo ========================================
echo.
echo Project Location: %PROJECT_DIR%
echo.
echo Contents:
echo ✓ StockIQ-Inventory-System/ (Complete source code)
echo ✓ PROJECT_OVERVIEW.txt (Project documentation)
echo.
echo Your final project is ready for presentation!

REM Open the project folder
explorer "%PROJECT_DIR%"

echo.
echo Press any key to exit...
pause > nul