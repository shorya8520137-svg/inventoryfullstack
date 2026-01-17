Write-Host "TASK 4: TESTING NOTIFICATION SYSTEM" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# Step 1: Copy test script to server
Write-Host "1. Copying notification test script to server..." -ForegroundColor Yellow
scp -i "C:\Users\Admin\awsconection.pem" test-notification-system.js ubuntu@13.48.248.180:/home/ubuntu/inventoryfullstack/

# Step 2: Run comprehensive notification tests
Write-Host "2. Running comprehensive notification system tests..." -ForegroundColor Yellow
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "cd /home/ubuntu/inventoryfullstack; node test-notification-system.js"

# Step 3: Check notification tables
Write-Host "3. Checking notification data in database..." -ForegroundColor Yellow
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "mysql -u inventory_user -pStrongPass@123 inventory_db -e 'SELECT COUNT(*) as total_notifications FROM notifications; SELECT type, COUNT(*) as count FROM notifications GROUP BY type;'"

Write-Host "TASK 4 COMPLETED: Notification system tested!" -ForegroundColor Green