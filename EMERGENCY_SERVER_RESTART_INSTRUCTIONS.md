# 🚨 EMERGENCY SERVER RESTART INSTRUCTIONS

## PROBLEM SOLVED ✅
- **Auth Controller Exports**: Fixed missing `getCurrentUser` function
- **Code Status**: ✅ Pushed to GitHub (commit d8ef012)
- **Server Status**: ❌ Still down (502 Bad Gateway)

## IMMEDIATE ACTION REQUIRED

### 1. SSH to Server
```bash
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180
```

### 2. Deploy Fix and Restart Server
```bash
cd ~/inventoryfullstack
git pull origin main
pkill -f "node server.js"
sleep 2
nohup node server.js > server.log 2>&1 &
sleep 3
curl -k https://13.48.248.180.nip.io/api/health
```

### 3. Verify Server is Running
```bash
# Check if server process is running
ps aux | grep "node server.js"

# Check server logs
tail -f server.log

# Test health endpoint
curl -k https://13.48.248.180.nip.io/api/health
```

## WHAT WAS FIXED

### Auth Controller Issues:
1. **Missing Function**: Added `getCurrentUser` function that was referenced in routes
2. **Export Error**: Fixed module.exports to include all required functions
3. **Permission Loading**: Ensured permissions are returned as full objects, not just names

### Expected Results After Restart:
- ✅ Server starts without "Route.get() requires a callback function" error
- ✅ Login endpoint returns user with permissions array
- ✅ CMS user (`nope@comp.com`) can login and access APIs
- ✅ Permissions count > 0 (should show 5 permissions for CMS role)

## TEST AFTER RESTART

Run this command locally to test:
```bash
node test-cms-login-after-fix.js
```

Expected output:
```
✅ LOGIN SUCCESS!
👤 User: cms-hunyhunyprmession (nope@comp.com)
🎭 Role: cms-hunyhunyprmession (ID: 43)
🔑 Permissions Count: 5
📋 Permissions:
   1. inventory.view (View Inventory)
   2. orders.view (View Orders)
   3. operations.dispatch (Dispatch Operations)
   4. orders.status_update (Update Order Status)
   5. products.view (View Products)
```

## CRITICAL: 10-MINUTE DEADLINE
- Server restart should take < 2 minutes
- Testing should take < 1 minute
- **Total time needed: ~3 minutes**

## BACKUP PLAN
If server still fails to start, check logs:
```bash
tail -20 server.log
```

Common issues:
- Port 5000 already in use: `pkill -f "node server.js"`
- Database connection: Check MySQL service
- Missing dependencies: `npm install`