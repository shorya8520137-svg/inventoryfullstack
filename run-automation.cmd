@echo off
echo 🚀 Starting Automated Database Analysis...
echo =====================================

echo 📦 Installing required dependencies...
npm install ssh2 --save-dev

echo 🔍 Running automated database analysis...
node automated-database-analysis.js

echo ✅ Analysis complete! Check the results above.
pause