# JWT Token Fix Guide

## Problem
After login, only the products page works. All other pages return 401 Unauthorized errors.

## Root Cause Analysis

### What's Working:
1. ✅ Login API returns JWT token
2. ✅ Token is stored in localStorage
3. ✅ `apiRequest()` utility adds Authorization header
4. ✅ Backend JWT middleware verifies tokens correctly

### What's Not Working:
- ❌ Some pages/components not using `apiRequest()` utility
- ❌ Direct fetch() calls without Authorization header
- ❌ Token not being sent with some API requests

## Solution

### Step 1: Verify Token is Stored
After login, open browser console and check:
```javascript
localStorage.getItem('token')
localStorage.getItem('user')
```

Both should have values.

### Step 2: Check Network Tab
1. Open DevTools → Network tab
2. Navigate to any page (e.g., Inventory, Orders)
3. Look at API requests
4. Check if `Authorization: Bearer <token>` header is present

### Step 3: Ensure All API Calls Use apiRequest()

All components should use the `apiRequest()` utility from `src/utils/api.js`:

**❌ Wrong (Direct fetch):**
```javascript
fetch('https://16.171.161.150.nip.io/api/inventory')
  .then(res => res.json())
```

**✅ Correct (Using apiRequest):**
```javascript
import { apiRequest } from '@/utils/api';

apiRequest('/api/inventory')
  .then(data => console.log(data))
```

**✅ Or use the api object:**
```javascript
import { api } from '@/utils/api';

api.getInventory()
  .then(data => console.log(data))
```

### Step 4: Fix Components Making Direct Fetch Calls

Search for components using direct fetch():
```bash
grep -r "fetch.*api" src/app --include="*.jsx" --include="*.js"
```

Replace with `apiRequest()` or `api.*()` methods.

## Testing the Fix

### Test 1: Login and Check Token
1. Login as admin@company.com / admin@123
2. Open Console
3. Run: `console.log(localStorage.getItem('token'))`
4. Should see: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Test 2: Check API Requests
1. Navigate to Inventory page
2. Open Network tab
3. Find API request to `/api/inventory`
4. Check Request Headers
5. Should see: `Authorization: Bearer eyJhbGci...`

### Test 3: Manual API Test
Open Console and run:
```javascript
fetch('https://16.171.161.150.nip.io/api/inventory', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(console.log)
```

Should return inventory data, not 401 error.

## Quick Fix Script

Run this in browser console after login to test if token works:
```javascript
// Test function
async function testAllAPIs() {
  const token = localStorage.getItem('token');
  const apis = [
    '/api/products',
    '/api/inventory',
    '/api/dispatch',
    '/api/order-tracking',
    '/api/returns',
    '/api/self-transfer'
  ];
  
  for (const endpoint of apis) {
    try {
      const response = await fetch(`https://16.171.161.150.nip.io${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log(`${endpoint}: ${response.status}`);
    } catch (e) {
      console.log(`${endpoint}: ERROR - ${e.message}`);
    }
  }
}

testAllAPIs();
```

Expected output:
```
/api/products: 200
/api/inventory: 200
/api/dispatch: 200
/api/order-tracking: 200
/api/returns: 200
/api/self-transfer: 200
```

## Common Issues

### Issue 1: Token Not Stored
**Symptom:** `localStorage.getItem('token')` returns null
**Fix:** Check login page - ensure it's storing token after successful login

### Issue 2: Token Expired
**Symptom:** 401 error with message "Token expired"
**Fix:** Login again to get fresh token (tokens expire after 24 hours)

### Issue 3: Wrong Token Format
**Symptom:** 401 error with message "Invalid token"
**Fix:** Ensure token is sent as `Bearer <token>`, not just `<token>`

### Issue 4: CORS Issues
**Symptom:** Network error, no response
**Fix:** Check server CORS configuration

## Verification Checklist

- [ ] Login successful
- [ ] Token stored in localStorage
- [ ] User data stored in localStorage
- [ ] Products page loads (200)
- [ ] Inventory page loads (200)
- [ ] Orders page loads (200)
- [ ] Dispatch page loads (200)
- [ ] Returns page loads (200)
- [ ] Self Transfer page loads (200)
- [ ] All API requests include Authorization header
- [ ] No 401 errors in console
- [ ] No "Access token required" errors

## If Still Not Working

1. **Clear browser cache and localStorage:**
   ```javascript
   localStorage.clear();
   location.reload();
   ```

2. **Login again and test immediately**

3. **Check server logs:**
   ```bash
   ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150
   cd inventoryfullstack
   tail -50 server.log
   ```

4. **Verify JWT middleware is working:**
   - Should see "JWT verification failed" if token is invalid
   - Should NOT see this if token is valid

5. **Test backend directly:**
   ```bash
   # Get token first
   TOKEN=$(curl -X POST https://16.171.161.150.nip.io/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@company.com","password":"admin@123"}' \
     -s | jq -r '.token')
   
   # Test API with token
   curl https://16.171.161.150.nip.io/api/inventory \
     -H "Authorization: Bearer $TOKEN"
   ```

## Expected Behavior

After implementing the fix:
1. Login → Token stored
2. Navigate to any page → Token sent automatically
3. All API calls return 200 (or appropriate status)
4. No 401 errors
5. All features work correctly

---

**Status:** Ready to implement
**Priority:** HIGH - Blocks all functionality except products
**Estimated Fix Time:** 10-15 minutes
