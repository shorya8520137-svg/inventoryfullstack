# UI Permissions Testing - Step by Step Guide

## Test Objective
Test the complete permissions system through the UI:
1. Create a new user with specific permissions
2. Login as that user and perform operations
3. Verify API calls match the permissions
4. Check audit logs as super admin

---

## Prerequisites

### 1. Start Backend Server
```bash
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150
cd inventoryfullstack
bash start-server.sh
```

### 2. Open Browser Developer Tools
- Press F12 to open DevTools
- Go to "Network" tab
- Keep it open during all tests to monitor API calls

---

## TEST PHASE 1: Create Test User

### Step 1.1: Login as Super Admin
1. Open: https://stockiqfullstacktest-4n13k90f-test-tests-projects.vercel.app/login
2. Enter credentials:
   - Email: `admin@company.com`
   - Password: `admin@123`
3. Click "Sign In"
4. **Expected:** Redirect to products page

### Step 1.2: Navigate to Permissions Page
1. Click "Permissions" in the left sidebar (Shield icon)
2. **Expected:** See 4 tabs: Users, Roles, Permissions, Audit Logs

### Step 1.3: Create New User
1. Click "Users" tab
2. Click "Add User" or "Create User" button
3. Fill in the form:
   - **Name:** `Test Operations User`
   - **Email:** `operations.test@hunyhuny.com`
   - **Password:** `operations@123`
   - **Role:** Select "Operator" (or create custom role)
   - **Active:** Yes/Checked
4. Click "Create" or "Save"
5. **Expected:** User appears in the users list

### Step 1.4: Assign Specific Permissions
If you need to customize permissions:
1. Click "Roles" tab
2. Find "Operator" role or create new role
3. Assign these permissions:
   - ✅ OPERATIONS_DISPATCH
   - ✅ OPERATIONS_RETURN
   - ✅ OPERATIONS_DAMAGE
   - ✅ OPERATIONS_RECOVER
   - ✅ INVENTORY_VIEW
   - ✅ PRODUCTS_VIEW
4. Save the role

### Step 1.5: Verify User Creation
1. Go back to "Users" tab
2. Find `operations.test@hunyhuny.com`
3. Click to view details
4. **Expected:** See assigned role and permissions

### Step 1.6: Logout
1. Click user profile in top right
2. Click "Logout"
3. **Expected:** Redirect to login page

---

## TEST PHASE 2: Login as New User

### Step 2.1: Login as Operations User
1. On login page, enter:
   - Email: `operations.test@hunyhuny.com`
   - Password: `operations@123`
2. Click "Sign In"
3. **Monitor Network Tab:** Look for `/api/auth/login` call
4. **Expected Response:**
   ```json
   {
     "success": true,
     "token": "eyJhbGci...",
     "user": {
       "name": "Test Operations User",
       "email": "operations.test@hunyhuny.com",
       "role": "operator",
       "permissions": [...]
     }
   }
   ```

### Step 2.2: Verify UI Access
Check which menu items are visible:
- ✅ Should see: Products, Inventory, Orders, Operations
- ❌ Should NOT see: Permissions (if not admin)

---

## TEST PHASE 3: Perform Dispatch Operation

### Step 3.1: Open Dispatch Form
1. Click "Operations" in sidebar
2. Click "Dispatch" submenu
3. **Monitor Network Tab:** Look for API calls
4. **Expected Calls:**
   - `GET /api/dispatch/warehouses` - Should return 200
   - `GET /api/dispatch/logistics` - Should return 200
   - `GET /api/products` - Should return 200

### Step 3.2: Create Dispatch
1. Fill in dispatch form:
   - Select warehouse
   - Select logistics partner
   - Add products
   - Enter quantities
2. Click "Create Dispatch" or "Submit"
3. **Monitor Network Tab:** Look for:
   - `POST /api/dispatch` - Should return 200 or 201
4. **Expected:** Success message, dispatch created

### Step 3.3: Verify Dispatch in List
1. Go to Orders → Dispatch (or wherever dispatch list is)
2. **Monitor Network Tab:**
   - `GET /api/dispatch` - Should return 200
3. **Expected:** See the newly created dispatch

---

## TEST PHASE 4: Perform Return Operation

### Step 4.1: Open Return Form
1. Click "Operations" in sidebar
2. Click "Return" submenu
3. **Monitor Network Tab:** Look for API calls
4. **Expected:** Form opens successfully

### Step 4.2: Create Return
1. Fill in return form:
   - Select product
   - Enter quantity
   - Enter reason
2. Click "Submit Return"
3. **Monitor Network Tab:**
   - `POST /api/returns` - Should return 200 or 201
4. **Expected:** Success message

---

## TEST PHASE 5: Perform Damage Operation

### Step 5.1: Open Damage Form
1. Click "Operations" in sidebar
2. Click "Damage" submenu
3. **Monitor Network Tab:** Look for API calls

### Step 5.2: Record Damage
1. Fill in damage form:
   - Select product
   - Enter quantity
   - Enter damage reason
2. Click "Submit"
3. **Monitor Network Tab:**
   - `POST /api/damage-recovery` - Should return 200 or 201
4. **Expected:** Success message

---

## TEST PHASE 6: Perform Recovery Operation

### Step 6.1: Open Recovery Form
1. Click "Operations" in sidebar
2. Click "Recover" submenu

### Step 6.2: Record Recovery
1. Fill in recovery form
2. Click "Submit"
3. **Monitor Network Tab:**
   - `POST /api/damage-recovery` (recovery endpoint)
4. **Expected:** Success message

---

## TEST PHASE 7: Test Restricted Access

### Step 7.1: Try to Access Permissions Page
1. Try to navigate to `/permissions` directly in URL
2. **Expected:** Either:
   - Redirect to products page
   - Show "Access Denied" message
   - Permissions menu not visible in sidebar

### Step 7.2: Try to Access Admin APIs
Open browser console and try:
```javascript
fetch('https://16.171.161.150.nip.io/api/users', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
}).then(r => r.json()).then(console.log)
```
**Expected:** 403 Forbidden or Access Denied

---

## TEST PHASE 8: Logout and Login as Super Admin

### Step 8.1: Logout Operations User
1. Click user profile
2. Click "Logout"

### Step 8.2: Login as Super Admin
1. Login with:
   - Email: `admin@company.com`
   - Password: `admin@123`

---

## TEST PHASE 9: Check Audit Logs

### Step 9.1: Navigate to Audit Logs
1. Click "Permissions" in sidebar
2. Click "Audit Logs" tab

### Step 9.2: Verify Logged Activities
Look for these entries:
1. **Login Events:**
   - `operations.test@hunyhuny.com` - LOGIN
   - `admin@company.com` - LOGIN
   - Timestamps should match your test time

2. **User Creation:**
   - Action: CREATE
   - Resource: USER
   - Details: operations.test@hunyhuny.com

3. **Operation Events:**
   - Dispatch creation
   - Return creation
   - Damage recording
   - Recovery recording

### Step 9.3: Filter Audit Logs
1. Filter by user: `operations.test@hunyhuny.com`
2. **Expected:** See only that user's activities
3. Filter by action: `LOGIN`
4. **Expected:** See all login events
5. Filter by date: Today
6. **Expected:** See today's activities

---

## EXPECTED RESULTS SUMMARY

### ✅ What Should Work:
1. Super admin can create users
2. New user can login successfully
3. New user can perform operations they have permissions for
4. API calls return 200/201 for allowed operations
5. Audit logs capture all activities
6. Timestamps are accurate
7. User details are correct in logs

### ❌ What Should Be Blocked:
1. Operations user cannot access Permissions page
2. Operations user cannot create/edit other users
3. Operations user cannot view audit logs
4. API calls return 403 for restricted operations

---

## TROUBLESHOOTING

### If Login Fails:
- Check server is running: `ps aux | grep node`
- Check server logs: `tail -50 server.log`
- Verify user exists in database

### If APIs Return 401:
- Check token is stored: `localStorage.getItem('token')`
- Check token is sent in headers (Network tab)
- Verify token is valid (not expired)

### If APIs Return 403:
- Check user permissions in database
- Verify role has correct permissions
- Check permission names match exactly

### If Audit Logs Don't Show:
- Check database: `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;`
- Verify audit log API is working
- Check user has SYSTEM_AUDIT_LOG permission

---

## RECORDING YOUR TEST

### Network Tab Recording:
1. Right-click in Network tab
2. Select "Save all as HAR"
3. Save file for analysis

### Take Screenshots:
1. Login success
2. User creation form
3. Dispatch creation
4. Return creation
5. Damage recording
6. Audit logs showing all activities

### Note API Responses:
For each operation, record:
- API endpoint called
- HTTP status code
- Response body
- Any errors

---

## TEST COMPLETION CHECKLIST

- [ ] Super admin login successful
- [ ] New user created via UI
- [ ] New user login successful
- [ ] Dispatch operation completed
- [ ] Return operation completed
- [ ] Damage operation completed
- [ ] Recovery operation completed
- [ ] All API calls returned correct status codes
- [ ] Restricted access properly blocked
- [ ] Audit logs show all activities
- [ ] Audit logs have correct timestamps
- [ ] Audit logs have correct user details
- [ ] Can filter audit logs by user
- [ ] Can filter audit logs by action
- [ ] Can filter audit logs by date

---

**Ready to Start Testing!**

Follow each step carefully and monitor the Network tab in DevTools to see all API calls and responses.
