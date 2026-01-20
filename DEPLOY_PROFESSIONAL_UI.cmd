@echo off
echo ========================================
echo DEPLOYING PROFESSIONAL UI DESIGN
echo ========================================

echo Step 1: Commit UI improvements...
git add src/app/permissions/permissions.module.css
git commit -m "Professional UI redesign - remove bright colors, add neutral professional styling"

echo Step 2: Push to GitHub...
git push origin main

echo Step 3: Deploy to Vercel...
vercel --prod

echo ========================================
echo PROFESSIONAL UI DEPLOYED
echo Check: https://your-app.vercel.app/permissions
echo ========================================