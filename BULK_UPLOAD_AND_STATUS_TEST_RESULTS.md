# Bulk Upload and Status Update API Test Results

**Date:** January 16, 2026  
**Time:** 04:12 AM  
**Tester:** Automated Test Script

---

## 🎯 Test Objectives

1. Test bulk upload products API with user-specified columns
2. Test PATCH /api/order-tracking/:id/status API
3. Identify and fix any authorization or routing issues

---

## 📊 Test Results Summary

| Test | Status | Details |
|------|--------|---------|
| Admin Login | ✅ PASS | Token generated successfully |
| Find Order by Barcode | ✅ PASS | Found order ID 2762 with barcode 2460-3499 |
| Status Update WITHOUT Auth | ✅ PASS | Returns 401 as expected (security working) |
| Status Update WITH Auth | ❌ FAIL | Returns 404 "Dispatch not found" |
| Bulk Upload Products | ⚠️ PARTIAL | API works but CSV column mismatch |

**Overall Success Rate:** 60% (3/5 tests passed)

---

## 🔍 Issue 1: Status Update Returns 404

### Problem:
```
PATCH /api/order-tracking/2762/status
Status: 404
Response: { "success": false, "message": "Dispatch not found" }
```

### Root Cause Analysis:

**GET /api/order-tracking** returns data from:
- `dispatch_tracking` table (or similar)
- Returns order ID: 2762
- Returns barcode: 2460-3499
- Returns status: "Completed"

**PATCH /api/order-tracking/:id/status** updates:
- `warehouse_dispatch` table
- Query: `UPDATE warehouse_dispatch SET status = ? WHERE id = ?`
- Returns 404 because order 2762 doesn't exist in `warehouse_dispatch`

### The Issue:
**Table Mismatch!** The GET endpoint reads from one table, but the PATCH endpoint writes to a different table.

### Code Location:
**File:** `controllers/orderTrackingController.js`  
**Line:** ~960-975

```javascript
// Current code (WRONG TABLE)
const updateSql = barcode 
    ? `UPDATE warehouse_dispatch SET status = ? WHERE id = ? AND barcode = ?`
    : `UPDATE warehouse_dispatch SET status = ? WHERE id = ?`;
```

### Fix Required:
Update the status update function to use the correct table that matches the GET endpoint.

**Option 1:** Update `dispatch_tracking` table instead
```javascript
const updateSql = `UPDATE dispatch_tracking SET status = ? WHERE dispatch_id = ?`;
```

**Option 2:** Check both tables
```javascript
// Try dispatch_tracking first
const updateSql = `UPDATE dispatch_tracking SET status = ? WHERE dispatch_id = ?`;
// If no rows affected, try warehouse_dispatch
const fallbackSql = `UPDATE warehouse_dispatch SET status = ? WHERE id = ?`;
```

---

## 🔍 Issue 2: Bulk Upload CSV Column Mismatch

### Problem:
```
POST /api/products/bulk/import
Status: 200
Response: {
  "success": true,
  "message": "Import completed. 0 products imported successfully, 3 errors.",
  "errors": [
    "Row 1: Missing required fields (product_name, barcode)",
    "Row 2: Missing required fields (product_name, barcode)",
    "Row 3: Missing required fields (product_name, barcode)"
  ]
}
```

### Root Cause:
**CSV Column Names Don't Match Backend Expectations**

**User's CSV Columns (with spaces):**
```
Product Name, Variant, Barcode, Category, Description, Price, Cost Price, Total Stock, Warehouse Locations, Weight, Dimensions
```

**Backend Expected Columns (snake_case):**
```
product_name, product_variant, barcode, description, category_id, price, cost_price, weight, dimensions
```

### The Issue:
- CSV has "Product Name" but backend expects "product_name"
- CSV has "Variant" but backend expects "product_variant"
- CSV has "Category" but backend expects "category_id"
- CSV has "Total Stock" and "Warehouse Locations" but backend doesn't handle these

### Fix Required:

**Option 1:** Update backend to accept both formats (Recommended)
```javascript
// In productController.js bulk import function
// Add column name mapping
const columnMapping = {
    'Product Name': 'product_name',
    'Variant': 'product_variant',
    'Barcode': 'barcode',
    'Category': 'category_id',
    'Description': 'description',
    'Price': 'price',
    'Cost Price': 'cost_price',
    'Total Stock': 'initial_stock',
    'Warehouse Locations': 'warehouse_name',
    'Weight': 'weight',
    'Dimensions': 'dimensions'
};

// Map CSV columns to database columns
const mappedProduct = {};
Object.keys(product).forEach(key => {
    const dbColumn = columnMapping[key] || key.toLowerCase().replace(/ /g, '_');
    mappedProduct[dbColumn] = product[key];
});
```

**Option 2:** Update template to use snake_case (Current behavior)
```javascript
// In ProductManager.jsx downloadTemplate()
const templateData = [{
    product_name: '',
    product_variant: '',
    barcode: '',
    // ... etc
}];
```

---

## 📋 Detailed Test Logs

### Test 1: Admin Login ✅
```
POST /api/auth/login
Status: 200
Token: eyJhbGciOiJIUzI1NiIs...
Result: ✅ PASS
```

### Test 2: Find Order by Barcode ✅
```
GET /api/order-tracking?limit=1000
Barcode: 2460-3499
Found: Order ID 2762
Product: HH_Bedding Cutie cat CC
Status: Completed
Result: ✅ PASS
```

### Test 3: Status Update Without Auth ✅
```
PATCH /api/order-tracking/2762/status
Authorization: NOT INCLUDED
Status: 401
Response: { "message": "Access token required", "error": "NO_TOKEN" }
Result: ✅ PASS (Security working correctly)
```

### Test 4: Status Update With Auth ❌
```
PATCH /api/order-tracking/2762/status
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Status: 404
Response: { "message": "Dispatch not found" }
Result: ❌ FAIL (Table mismatch issue)
```

### Test 5: Bulk Upload Products ⚠️
```
POST /api/products/bulk/import
File: test_products_bulk_upload.csv
Columns: Product Name, Variant, Barcode, Category, Description, Price, Cost Price, Total Stock, Warehouse Locations, Weight, Dimensions
Status: 200
Imported: 0 products
Errors: 3 (Column name mismatch)
Result: ⚠️ PARTIAL (API works but CSV format wrong)
```

---

## 🔧 Recommended Fixes

### Priority 1: Fix Status Update Table Mismatch (CRITICAL)

**File:** `controllers/orderTrackingController.js`  
**Function:** Status update function (around line 960)

**Current Code:**
```javascript
const updateSql = barcode 
    ? `UPDATE warehouse_dispatch SET status = ? WHERE id = ? AND barcode = ?`
    : `UPDATE warehouse_dispatch SET status = ? WHERE id = ?`;
```

**Fixed Code:**
```javascript
// First, check which table the dispatch is in
const checkSql = `
    SELECT 'dispatch_tracking' as source, dispatch_id as id 
    FROM dispatch_tracking 
    WHERE dispatch_id = ?
    UNION
    SELECT 'warehouse_dispatch' as source, id 
    FROM warehouse_dispatch 
    WHERE id = ?
`;

db.query(checkSql, [dispatchId, dispatchId], (err, results) => {
    if (err || results.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Dispatch not found'
        });
    }
    
    const source = results[0].source;
    const updateSql = source === 'dispatch_tracking'
        ? `UPDATE dispatch_tracking SET status = ? WHERE dispatch_id = ?`
        : `UPDATE warehouse_dispatch SET status = ? WHERE id = ?`;
    
    db.query(updateSql, [status, dispatchId], (err, result) => {
        // ... rest of the code
    });
});
```

### Priority 2: Fix Bulk Upload Column Mapping (HIGH)

**File:** `controllers/productController.js`  
**Function:** Bulk import function

**Add column name mapping before validation:**
```javascript
// Add this before the validation check
const columnMapping = {
    'Product Name': 'product_name',
    'Variant': 'product_variant',
    'Barcode': 'barcode',
    'Category': 'category_id',
    'Description': 'description',
    'Price': 'price',
    'Cost Price': 'cost_price',
    'Total Stock': 'initial_stock',
    'Warehouse Locations': 'warehouse_name',
    'Weight': 'weight',
    'Dimensions': 'dimensions'
};

// Map CSV columns to database columns
products = products.map(product => {
    const mappedProduct = {};
    Object.keys(product).forEach(key => {
        const dbColumn = columnMapping[key] || key.toLowerCase().replace(/ /g, '_');
        mappedProduct[dbColumn] = product[key];
    });
    return mappedProduct;
});
```

---

## 📝 Next Steps

1. **Fix Status Update:**
   - Update `orderTrackingController.js` to use correct table
   - Test with order ID 2762
   - Verify status updates successfully

2. **Fix Bulk Upload:**
   - Add column name mapping in `productController.js`
   - Update template in `ProductManager.jsx` to match user's format
   - Test with sample CSV

3. **Deploy and Test:**
   - Commit changes to GitHub
   - Deploy to server
   - Run comprehensive tests
   - Verify both APIs work correctly

---

## 🎯 Success Criteria

- [x] Admin login working
- [x] Authorization middleware working (401 without token)
- [ ] Status update working with correct table
- [ ] Bulk upload accepting user's CSV format
- [ ] All tests passing (5/5)

---

## 📞 Files to Modify

1. `controllers/orderTrackingController.js` - Fix status update table
2. `controllers/productController.js` - Add CSV column mapping
3. `src/app/products/ProductManager.jsx` - Update template format (optional)

---

**Test Script:** `test-status-update-with-barcode.js`  
**Test Data:** Barcode 2460-3499, Order ID 2762  
**Backend:** https://16.171.161.150.nip.io  
**Status:** Issues identified, fixes recommended

