# 🔧 MANUAL PERMISSIONS FIX INSTRUCTIONS

## 🎯 THE ISSUE
- **Admin login works** ✅
- **Regular users get 403 errors** ❌

## 🛠️ SOLUTION

### Step 1: Run the SQL Fix
```bash
sudo mysql inventory_db < fix-user-permissions.sql
```

### Step 2: Restart Your Server
```bash
# Stop current server (Ctrl+C)
# Then restart
npm start
# OR
node server.js
```

### Step 3: Test Backend APIs
```bash
node test-user-permissions-backend.js
```

## 🔍 WHAT THE FIX DOES

1. **Creates proper permissions** with exact route names:
   - `products.view`
   - `inventory.view` 
   - `operations.return`
   - etc.

2. **Creates role hierarchy**:
   - Super Admin (all permissions)
   - Admin (most permissions)
   - Manager (view + basic operations)
   - Operator (basic operations)
   - Warehouse (inventory focused)
   - Viewer (view only)

3. **Fixes user assignments**:
   - Admin → Super Admin role
   - Test users → Manager role
   - Others → Viewer role

## 🧪 EXPECTED RESULTS

**Before Fix:**
```
✅ Admin login: 200
❌ User APIs: 403 Forbidden
```

**After Fix:**
```
✅ Admin login: 200
✅ Admin APIs: 200
✅ User login: 200  
✅ User APIs: 200 (based on role permissions)
```

## 🚨 IF MYSQL COMMAND FAILS

Try these alternatives:

```bash
# Option 1: Direct mysql
mysql -u root -p inventory_db < fix-user-permissions.sql

# Option 2: Copy-paste SQL content manually
sudo mysql
USE inventory_db;
# Then paste the SQL content from fix-user-permissions.sql

# Option 3: Use your existing database tool
# Import fix-user-permissions.sql through phpMyAdmin, MySQL Workbench, etc.
```

## ✅ VERIFICATION

After running the fix, check:

1. **Database has permissions**:
   ```sql
   SELECT COUNT(*) FROM permissions;  -- Should show 17 permissions
   SELECT COUNT(*) FROM roles;        -- Should show 6 roles  
   SELECT COUNT(*) FROM role_permissions; -- Should show mappings
   ```

2. **Users have proper roles**:
   ```sql
   SELECT u.name, u.email, r.name as role_name 
   FROM users u 
   JOIN roles r ON u.role_id = r.id;
   ```

3. **Backend test passes**:
   ```bash
   node test-user-permissions-backend.js
   ```

## 🎯 NEXT STEPS

Once backend is working:
1. Test frontend login with regular users
2. Verify sidebar shows appropriate tabs
3. Check API calls work in browser network tab