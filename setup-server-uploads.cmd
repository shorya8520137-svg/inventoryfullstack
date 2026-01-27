@echo off
echo Setting up server uploads directory...

REM Connect to server and create uploads directory
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.5.50 "cd /home/ubuntu/stockiqfullstacktest && mkdir -p uploads && chmod 755 uploads && echo 'Uploads directory created successfully'"

echo Server uploads directory setup complete!
pause