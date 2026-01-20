@echo off
echo ========================================
echo FIXING FRONTEND PERMISSIONS FORMAT
echo ========================================

echo Step 1: Commit and push the permissions fix...
git add src/contexts/PermissionsContext.jsx
git commit -m "Fix permissions format mismatch - use backend UPPERCASE format"
git push origin main

echo Step 2: Deploy to Vercel...
vercel --prod

echo ========================================
echo FRONTEND PERMISSIONS FIX DEPLOYED
echo ========================================

echo Now check your frontend - the sidebar should render properly!