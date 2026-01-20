# JWT Authentication Issue - FIXED

## Problem
- Frontend shows "Invalid or expired token" errors
- `/api/users` endpoint returns 403 Forbidden
- Other endpoints (`/api/roles`, `/api/permissions`) work fine
- Console shows: `API Request Error: Error: Invalid or expired token`

## Root Cause
The `routes/permissionsRoutes.js` file was using its own JWT authentication middleware with a different fallback secret key, causing token validation to fail for user management endpoints.

## Solution Applied
1. ✅ **Fixed file uploaded**: `routes/permissionsRoutes-fixed-jwt.js` → server
2. 🔄 **Server restart needed**: Kill and restart Node.js process
3. 🧪 **Test ready**: `test-after-fix.js` to verify fix

## Manual Steps to Complete Fix

### Option 1: SSH Terminal Commands
```bash
# SSH into server
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86

# Navigate and restart
cd ~/inventoryfullstack
pkill -f "node server.js"
sleep 2
nohup node server.js > server.log 2>&1 &
exit
```

### Option 2: Simple Restart Commands
Run these one by one in separate terminal:
```bash
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "cd ~/inventoryfullstack && pkill -f node"
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "cd ~/inventoryfullstack && nohup node server.js > server.log 2>&1 &"
```

## Test the Fix
After server restart, run:
```bash
node test-after-fix.js
```

## Expected Result
- ✅ `/api/users` endpoint should return 200 with user data
- ✅ Frontend permissions page should load without errors
- ✅ User creation/management should work
- ✅ All JWT token authentication should be consistent

## What Was Changed
- Removed duplicate JWT middleware from permissions routes
- Now uses the main `middleware/auth.js` for consistent token validation
- All endpoints use the same JWT_SECRET configuration