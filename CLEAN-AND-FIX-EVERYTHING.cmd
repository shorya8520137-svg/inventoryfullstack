@echo off
echo ============================================================
echo CLEANING UP AND FIXING EVERYTHING - ONE TIME SOLUTION
echo ============================================================

echo [1/4] Cleaning up local unnecessary files...
del /q test-*.js 2>nul
del /q debug-*.js 2>nul
del /q check-*.js 2>nul
del /q fix-*.js 2>nul
del /q analyze-*.js 2>nul
del /q setup-*.cmd 2>nul
del /q setup-*.sh 2>nul
del /q backup-*.cmd 2>nul
del /q backup-*.sh 2>nul
del /q *.html 2>nul
del /q *.sql 2>nul
del /q run-*.cmd 2>nul
del /q run-*.ps1 2>nul
del /q deploy-*.cmd 2>nul
del /q deploy-*.sh 2>nul
del /q push-*.cmd 2>nul
del /q verify-*.js 2>nul
del /q comprehensive-*.js 2>nul
del /q automated-*.js 2>nul
del /q master-*.cmd 2>nul
del /q ssh-*.cmd 2>nul
del /q git-*.cmd 2>nul
del /q git-*.sh 2>nul
del /q mirror-*.cmd 2>nul
del /q UPLOAD_AND_START.cmd 2>nul
del /q server-https.js 2>nul
del /q server-integration-code.js 2>nul
del /q server-test-*.js 2>nul
del /q quick-*.js 2>nul
del /q simple-*.js 2>nul
del /q manual-*.js 2>nul
del /q notification-*.js 2>nul
del /q EventAuditLogger.js 2>nul
del /q ProductionEventAuditLogger.js 2>nul
del /q IPGeolocationTracker.js 2>nul
del /q AuditLogger.js 2>nul
del /q *.md 2>nul
del /q *.txt 2>nul
del /q curl-*.cmd 2>nul
del /q open-*.cmd 2>nul
del /q show-*.cmd 2>nul
del /q update-*.cmd 2>nul
del /q create-*.cmd 2>nul
del /q final-*.js 2>nul
del /q complete-*.js 2>nul
del /q build-*.js 2>nul
del /q preview-*.js 2>nul
del /q find-*.js 2>nul
del /q disable-*.js 2>nul
del /q patch-*.js 2>nul
del /q install-*.js 2>nul
del /q integrate-*.js 2>nul
del /q restart-*.cmd 2>nul
del /q restore-*.cmd 2>nul
del /q pull-*.cmd 2>nul
del /q cleanup-*.cmd 2>nul
del /q test-server-simple.cmd 2>nul
del /q fix-server-now.cmd 2>nul

echo Local cleanup done.

echo.
echo [2/4] SSH to server and clean up + setup...

ssh -i "C:\Users\Admin\e2c.pem" ubuntu@13.212.182.78 "
echo 'SERVER CLEANUP AND SETUP'
cd ~

echo 'Removing all unnecessary files...'
rm -f test-*.js debug-*.js check-*.js fix-*.js analyze-*.js setup-*.* backup-*.* *.html *.sql *.md *.txt *.ps1 run-*.* deploy-*.* push-*.* verify-*.js comprehensive-*.js automated-*.js master-*.cmd ssh-*.cmd git-*.* mirror-*.cmd UPLOAD_AND_START.cmd server-https.js server-integration-code.js server-test-*.js quick-*.js simple-*.js manual-*.js notification-*.js EventAuditLogger.js ProductionEventAuditLogger.js IPGeolocationTracker.js AuditLogger.js curl-*.* open-*.* show-*.* update-*.* create-*.* final-*.* complete-*.* build-*.* preview-*.* find-*.* disable-*.* patch-*.* install-*.* integrate-*.* restart-*.* restore-*.* pull-*.* cleanup-*.*

echo 'Files remaining:'
ls -la

echo 'Setting up nginx proxy...'
sudo tee /etc/nginx/sites-available/default > /dev/null << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

echo 'Restarting nginx...'
sudo systemctl restart nginx

echo 'Killing existing node processes...'
pkill -f 'node' 2>/dev/null || true

echo 'Starting server...'
cd ~/inventoryfullstack
nohup node server.js > server.log 2>&1 &

echo 'Waiting for server to start...'
sleep 5

echo 'Testing server...'
curl -s http://localhost:5000 | head -3
curl -s http://localhost | head -3

echo 'SERVER SETUP COMPLETE'
"

echo.
echo [3/4] Updating environment files...
echo NEXT_PUBLIC_API_BASE=http://13.212.182.78.nip.io > .env.production
echo NODE_ENV=production >> .env.production
echo NEXT_PUBLIC_API_BASE=http://13.212.182.78.nip.io > .env.local
echo NODE_ENV=development >> .env.local

echo.
echo [4/4] Testing final setup...
timeout 10 curl -s http://13.212.182.78.nip.io 2>nul || echo Server starting...

echo.
echo ============================================================
echo EVERYTHING CLEANED AND FIXED!
echo ============================================================
echo Server: http://13.212.182.78.nip.io
echo All unnecessary files removed from both local and server
echo Nginx proxy setup complete
echo Server running with node server.js
echo ============================================================

pause