@echo off
echo ========================================
echo MANUAL HTTPS SETUP - STEP BY STEP
echo ========================================
echo.
echo If the automated script fails, follow these steps:
echo.

echo Step 1: SSH to server
echo ========================================
echo Run this command:
echo ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233
echo.
echo Then run these commands on the server:
echo.

echo # Update system
echo sudo apt update -y
echo.

echo # Install Certbot
echo sudo apt install certbot python3-certbot-nginx -y
echo.

echo # Install SSL certificate
echo sudo certbot --nginx -d 54.179.63.233.nip.io --non-interactive --agree-tos --email admin@company.com --redirect
echo.

echo # Test nginx
echo sudo nginx -t
echo.

echo # Reload nginx
echo sudo systemctl reload nginx
echo.

echo # Test HTTPS
echo curl -I https://54.179.63.233.nip.io/api/health
echo.

echo Step 2: Update frontend (run on your local machine)
echo ========================================
echo.

echo # Update .env.production
echo echo NEXT_PUBLIC_API_BASE=https://54.179.63.233.nip.io ^> .env.production
echo echo NODE_ENV=production ^>^> .env.production
echo.

echo # Update .env.local  
echo echo NEXT_PUBLIC_API_BASE=https://54.179.63.233.nip.io ^> .env.local
echo echo NODE_ENV=development ^>^> .env.local
echo echo NEXT_PUBLIC_API_TIMEOUT=30000 ^>^> .env.local
echo.

echo # Build and deploy
echo npm run build
echo vercel --prod
echo.

echo Step 3: Test login
echo ========================================
echo Visit: https://stockiqfullstacktest.vercel.app
echo Login: admin@company.com / Admin@123
echo.

echo ========================================
echo MANUAL SETUP COMPLETE!
echo ========================================

pause