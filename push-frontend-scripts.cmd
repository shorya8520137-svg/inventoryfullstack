@echo off
echo ========================================
echo 🚀 PUSHING FRONTEND SCRIPTS TO GITHUB
echo ========================================

cd stockiqfullstacktest

echo 📋 Adding new files to git...
git add setup-frontend-on-aws.cmd
git add setup-frontend-simple.cmd
git add setup-frontend-server.sh
git add start-fullstack.sh
git add stop-fullstack.sh
git add .env.production
git add .env.local

echo 📝 Committing changes...
git commit -m "Add AWS frontend hosting scripts - Complete HTTPS solution

- setup-frontend-server.sh: Complete frontend setup for AWS server
- start-fullstack.sh: Quick start both frontend and backend
- stop-fullstack.sh: Stop all services
- Updated environment files for HTTPS same-server setup
- Solves Mixed Content Security issue by hosting both on same domain"

echo 🚀 Pushing to GitHub...
git push origin main

echo ✅ Successfully pushed to GitHub!
echo 🌐 Repository: https://github.com/shorya8520137-svg/inventoryfullstack.git
pause