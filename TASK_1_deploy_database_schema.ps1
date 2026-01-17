Write-Host "TASK 1: DEPLOYING NOTIFICATION DATABASE SCHEMA" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# Step 1: Copy SQL schema to server
Write-Host "1. Copying database schema to server..." -ForegroundColor Yellow
scp -i "C:\Users\Admin\awsconection.pem" create-notifications-system.sql ubuntu@13.48.248.180:/home/ubuntu/inventoryfullstack/

# Step 2: Execute SQL schema on server
Write-Host "2. Creating notification tables in database..." -ForegroundColor Yellow
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "cd /home/ubuntu/inventoryfullstack; mysql -u inventory_user -pStrongPass@123 inventory_db < create-notifications-system.sql"

# Step 3: Verify tables created
Write-Host "3. Verifying tables created..." -ForegroundColor Yellow
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "mysql -u inventory_user -pStrongPass@123 inventory_db -e 'SHOW TABLES LIKE \"%notification%\"; SELECT COUNT(*) as notification_count FROM notifications; SELECT COUNT(*) as preference_count FROM notification_preferences;'"

Write-Host "TASK 1 COMPLETED: Database schema deployed!" -ForegroundColor Green