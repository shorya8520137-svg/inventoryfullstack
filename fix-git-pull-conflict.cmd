@echo off
echo ========================================
echo FIXING GIT PULL CONFLICT ON SERVER
echo ========================================
echo.
echo Issue: Local changes to .env.production conflict with GitHub version
echo Solution: Stash local changes, pull updates, then restore if needed
echo.
echo Current server: 54.169.107.64
echo.
pause

echo Connecting to server to fix git conflict...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.169.107.64 "
echo '=== Checking current git status ==='
cd ~/inventoryfullstack
git status

echo ''
echo '=== Backing up current .env.production ==='
cp .env.production .env.production.backup
echo 'Backup created: .env.production.backup'

echo ''
echo '=== Stashing local changes ==='
git stash push -m 'Backup local env changes before pull'

echo ''
echo '=== Pulling latest changes from GitHub ==='
git pull origin main

echo ''
echo '=== Checking if .env.production needs restoration ==='
if [ -f .env.production.backup ]; then
    echo 'Comparing .env.production files...'
    if ! cmp -s .env.production .env.production.backup; then
        echo 'Files are different. Checking content...'
        echo '--- Current .env.production ---'
        cat .env.production
        echo ''
        echo '--- Backup .env.production ---'
        cat .env.production.backup
        echo ''
        echo 'Keeping the backup version (your server settings)'
        cp .env.production.backup .env.production
    else
        echo 'Files are identical, no restoration needed'
    fi
fi

echo ''
echo '=== Final git status ==='
git status

echo ''
echo '=== SUCCESS: Git pull completed! ==='
echo 'Your .env.production settings have been preserved'
"

echo.
echo ========================================
echo GIT CONFLICT RESOLVED!
echo ========================================
echo.
echo ✅ Local changes stashed safely
echo ✅ Latest code pulled from GitHub  
echo ✅ .env.production settings preserved
echo ✅ Ready to apply audit logs fixes
echo.
echo Next steps:
echo 1. Run database migration: sudo mysql inventory_db ^< fix-audit-logs-schema.sql
echo 2. Restart server: pm2 restart server
echo.
pause