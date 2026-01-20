# 🧪 MANUAL 4 SCENARIO TEST GUIDE

## Prerequisites
1. **Start Backend Server on AWS:**
   ```bash
   ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86
   cd ~/inventoryfullstack
   node server.js
   ```

2. **Start Frontend Locally:**
   ```bash
   npm run dev
   ```
   Open: http://localhost:3002

## TEST 1: Shorya - Basic User Journey ✅

### Steps:
1. **Admin Login:** admin@company.com / admin@123
2. **Create User Shorya:**
   - Go to Permissions page
   - Add user: Name="Shorya", Email="shorya@test.com", Password="password123", Role="Manager"
3. **Login as Shorya:** shorya@test.com / password123
4. **Create Dispatch:**
   - Go to Products/Orders
   - Create new dispatch with customer details
5. **Create Return:**
   - Go to Returns section
   - Create return entry
6. **Create Damage:**
   - Go to Damage Recovery
   - Create damage record
7. **Check Timeline:**
   - Go to Timeline/Tracking
   - Verify entries appear
8. **Logout Shorya**

### Expected Results:
- ✅ All operations complete successfully
- ✅ Timeline shows all activities
- ✅ User can logout

---

## TEST 2: Shivam - Multi-Product Operations ✅

### Steps:
1. **Admin Login:** admin@company.com / admin@123
2. **Create User Shivam:**
   - Name="Shivam", Email="shivam@test.com", Role="Operator"
3. **Login as Shivam:** shivam@test.com / password123
4. **Create Multi-Product Dispatch:**
   - Add multiple products (3-4 different items)
   - Set different quantities and warehouses
5. **Create Return:**
   - Return some items from the dispatch
6. **Create Damage:**
   - Report damage for one of the products
7. **Recovery Operation:**
   - Process recovery if available
8. **DO NOT LOGOUT** (as per requirement)

### Expected Results:
- ✅ Multi-product dispatch created
- ✅ Return and damage processed
- ✅ User remains logged in

---

## TEST 3: Bhushan Creates Amit - Complex Journey ✅

### Steps:
1. **Admin Login:** admin@company.com / admin@123
2. **Create User Bhushan:**
   - Name="Bhushan", Email="bhushan@test.com", Role="Manager"
3. **Login as Bhushan:** bhushan@test.com / password123
4. **Bhushan Creates User Amit:**
   - Use Bhushan's account to create Amit
   - Name="Amit", Email="amit@test.com", Role="Warehouse"
5. **Login as Amit:** amit@test.com / password123
6. **Amit Creates Multi-Product Dispatch:**
   - 4+ different products
   - Various quantities and warehouses
7. **Create Return:**
   - Return multiple items
8. **Create Damage:**
   - Report damage for different products
9. **Recovery Operation:**
   - Process recovery

### Expected Results:
- ✅ Nested user creation (Bhushan → Amit)
- ✅ Complex multi-product operations
- ✅ All CRUD operations work

---

## TEST 4: Chaksu Super Admin - Delete Operations ✅

### Steps:
1. **Admin Login:** admin@company.com / admin@123
2. **Create Super Admin Chaksu:**
   - Name="Chaksu", Email="chaksu@test.com", Role="Super Admin"
3. **Create User Isha:**
   - Name="Isha", Email="isha@test.com", Role="Viewer"
4. **Login as Chaksu:** chaksu@test.com / password123
5. **Login as Isha (separate tab):** isha@test.com / password123
6. **Isha Creates Dispatch:**
   - Create dispatch with products
7. **Chaksu Deletes Isha's Dispatch:**
   - Use super admin privileges to delete dispatch
8. **Check Stock Back Fill:**
   - Verify stock levels are restored
   - Check timeline for adjustments
9. **Chaksu Deletes Isha Account:**
   - Delete Isha user account
   - Verify account is removed

### Expected Results:
- ✅ Super admin can delete entries
- ✅ Stock levels are adjusted back
- ✅ User accounts can be deleted
- ✅ Timeline shows all activities

---

## 🔍 FRONTEND VERIFICATION CHECKLIST

After completing all tests, verify:

### Navigation & UI:
- [ ] All pages load correctly
- [ ] Sidebar navigation works
- [ ] User permissions display correctly
- [ ] Login/logout functions properly

### CRUD Operations:
- [ ] User creation/editing/deletion
- [ ] Dispatch creation with multiple products
- [ ] Return processing
- [ ] Damage reporting
- [ ] Timeline/tracking display

### Permissions System:
- [ ] Different roles have appropriate access
- [ ] Super admin can perform all operations
- [ ] Regular users have limited access
- [ ] Permission checks work on frontend

### Data Integrity:
- [ ] Stock levels update correctly
- [ ] Timeline shows accurate history
- [ ] User sessions work properly
- [ ] Database consistency maintained

---

## 🚨 ISSUE REPORTING

If any test fails, document:

1. **Test Number & Step:** Which test and specific step failed
2. **Error Message:** Exact error shown
3. **Expected vs Actual:** What should happen vs what happened
4. **Browser Console:** Any JavaScript errors
5. **Network Tab:** Failed API calls
6. **Screenshots:** Visual evidence of issues

### Common Issues to Check:
- API connection failures
- Authentication problems
- Permission errors
- Database connection issues
- Frontend rendering problems
- Timeline not updating
- Stock calculation errors

---

## 🎯 SUCCESS CRITERIA

**All 4 tests pass if:**
- ✅ Users can be created and login successfully
- ✅ CRUD operations work for all user types
- ✅ Multi-product dispatches process correctly
- ✅ Returns and damage reporting function
- ✅ Timeline shows accurate activity history
- ✅ Super admin can delete entries and users
- ✅ Stock levels adjust properly
- ✅ Frontend displays all data correctly
- ✅ No critical errors in console
- ✅ All user journeys complete end-to-end