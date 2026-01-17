#!/bin/bash
cd /home/ubuntu/inventoryfullstack

# Stop server
pkill -f "node server.js"
sleep 2

# Fix controller - add callbacks to prevent MySQL errors
sed -i 's/createAuditLog(\([^)]*\));/createAuditLog(\1, () => {});/g' controllers/permissionsController.js

# Update test file with new IP
sed -i 's/16.171.161.150/13.51.56.188/g' comprehensive-nested-user-journey-test.js

# Fix return API calls in test
sed -i 's/product_name: dispatchData.product_name,/product_type: dispatchData.product_name,\n            warehouse: dispatchData.warehouse,/g' comprehensive-nested-user-journey-test.js
sed -i 's/product_name: multiDispatchData.product_name,/product_type: multiDispatchData.product_name,\n            warehouse: multiDispatchData.warehouse,/g' comprehensive-nested-user-journey-test.js
sed -i 's/product_name: amitDispatchData.product_name,/product_type: amitDispatchData.product_name,\n            warehouse: amitDispatchData.warehouse,/g' comprehensive-nested-user-journey-test.js

# Start server
nohup node server.js > server.log 2>&1 &
sleep 3

# Run test
node comprehensive-nested-user-journey-test.js