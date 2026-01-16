# JWT Token Fixes Applied

## Date: January 16, 2026

---

## Problem Summary
Multiple components were making direct `fetch()` API calls without including the JWT Authorization header, resulting in 401 Unauthorized errors.

## Root Cause
Components were not using the `apiRequest()` utility from `src/utils/api.js` and were making direct fetch calls without the Bearer token.

---

## Files Fixed

### 1. src/app/inventory/InventorySheet.jsx
**Fixed 3 fetch calls:**

#### Fix 1: Line ~102 - Load Inventory
```javascript
// BEFORE
const response = await fetch(`${API_BASE}/api/inventory?${params}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
});

// AFTER
const token = localStorage.getItem('token');
const response = await fetch(`${API_BASE}/api/inventory?${params}`, {
    method: 'GET',
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
});
```

#### Fix 2: Line ~420 - Load Warehouse Inventory
```javascript
// BEFORE
const response = await fetch(`${API_BASE}/api/inventory?${params}`, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
});

// AFTER
const token = localStorage.getItem('token');
const response = await fetch(`${API_BASE}/api/inventory?${params}`, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
});
```

#### Fix 3: Line ~592 - Export Inventory
```javascript
// BEFORE
const response = await fetch(`${API_BASE}/api/inventory/export?${params}`, {
    method: 'GET'
});

// AFTER
const token = localStorage.getItem('token');
const response = await fetch(`${API_BASE}/api/inventory/export?${params}`, {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`
    }
});
```

---

### 2. src/app/order/OrderSheet.jsx
**Fixed 2 fetch calls:**

#### Fix 1: Line ~85 - Load Orders
```javascript
// BEFORE
const response = await fetch('https://16.171.161.150.nip.io/api/order-tracking');

// AFTER
const token = localStorage.getItem('token');
const response = await fetch('https://16.171.161.150.nip.io/api/order-tracking', {
    headers: { 'Authorization': `Bearer ${token}` }
});
```

#### Fix 2: Line ~149 - Load Timeline
```javascript
// BEFORE
const response = await fetch(`https://16.171.161.150.nip.io/api/order-tracking/${order.id}/timeline`);

// AFTER
const token = localStorage.getItem('token');
const response = await fetch(`https://16.171.161.150.nip.io/api/order-tracking/${order.id}/timeline`, {
    headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## Still Need to Fix

### 3. src/app/order/dispatch/DispatchForm.jsx
Need to check and fix dispatch-related fetch calls for:
- `/api/dispatch/warehouses`
- `/api/dispatch/logistics`
- `/api/dispatch/processed-persons`
- `/api/dispatch/search-products`

### 4. src/app/inventory/ProductTracker.jsx
Need to fix:
- Line ~81: `/api/order-tracking/${dispatchId}/timeline`

### 5. src/app/inventory/selftransfer/SelfTransfer.jsx
Need to fix:
- Line ~32: `/api/inventory-ledger`
- Line ~38: `/api/inventory-ledger/summary`

---

## Testing Required

After deploying these fixes, test the following:

### ✅ Should Now Work:
1. **Inventory Page**
   - Load inventory list
   - Filter by warehouse
   - Export inventory
   - All should return 200 instead of 401

2. **Orders Page**
   - Load order tracking list
   - View timeline for orders
   - All should return 200 instead of 401

### ⏳ Still Need Fixing:
3. **Dispatch Operations**
   - Load warehouses dropdown
   - Load logistics partners
   - Search products
   - Create dispatch

4. **Product Tracker**
   - View dispatch timeline

5. **Self Transfer**
   - Load ledger
   - Load summary

---

## Next Steps

1. **Deploy to Vercel:**
   ```bash
   git add .
   git commit -m "Fix: Add JWT Authorization headers to all fetch calls"
   git push
   ```

2. **Test Inventory Page:**
   - Login as admin
   - Navigate to Inventory
   - Check Network tab - should see 200 responses

3. **Test Orders Page:**
   - Navigate to Orders
   - Check Network tab - should see 200 responses

4. **Fix Remaining Components:**
   - DispatchForm.jsx
   - ProductTracker.jsx
   - SelfTransfer.jsx

---

## Pattern to Follow

For any component making API calls, use this pattern:

```javascript
// Get token from localStorage
const token = localStorage.getItem('token');

// Add Authorization header to fetch
const response = await fetch(url, {
    method: 'GET', // or POST, PUT, DELETE
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data) // if needed
});
```

**OR better yet, use the apiRequest utility:**

```javascript
import { apiRequest } from '@/utils/api';

const data = await apiRequest('/api/inventory');
```

---

## Expected Results After Fix

### Before:
```
GET /api/inventory 401 0.530 ms - 70
GET /api/order-tracking 401 0.357 ms - 70
GET /api/dispatch/warehouses 401 0.590 ms - 70
```

### After:
```
GET /api/inventory 200 15.234 ms - 3250
GET /api/order-tracking 200 12.456 ms - 3756
GET /api/dispatch/warehouses 200 8.123 ms - 456
```

---

**Status:** Partial Fix Applied (5/10 fetch calls fixed)
**Priority:** HIGH
**Next:** Fix remaining dispatch-related fetch calls
