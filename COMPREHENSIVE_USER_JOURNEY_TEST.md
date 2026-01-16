# Comprehensive User Journey Test Plan

## Test Overview
Complete end-to-end testing of user lifecycle, permissions, and inventory operations.

## Test Structure

### Test 1: User "Isha" - Complete Journey with Logout
1. **CRUD**: Create user "isha" with operator permissions
2. **Login**: Login as isha
3. **Dispatch**: Create dispatch
4. **Return**: Create return
5. **Damage**: Report damage
6. **Timeline**: Trigger and verify timeline entries
7. **Logout**: Logout isha

### Test 2: User "Amit" - Multi-Product Operations (No Logout)
1. **CRUD**: Create user "amit" with warehouse staff permissions
2. **Login**: Login as amit
3. **Dispatch**: Create dispatch with MULTIPLE products
4. **Return**: Create return
5. **Damage**: Report damage
6. **Recover**: Recover damaged stock
7. **Stay Logged In**: Keep session active

### Test 3: User "Vikas" - Operations on Amit's Data
1. **CRUD**: Create user "vikas" with manager permissions
2. **Login**: Login as vikas
3. **View**: View amit's dispatch
4. **Dispatch**: Create dispatch with MULTIPLE products
5. **Return**: Create return
6. **Damage**: Report damage
7. **Recover**: Recover damaged stock

### Test 4: Super Admin "Chaksu" - Admin Operations & Cleanup
1. **CRUD**: Create super admin user "chaksu"
2. **Login**: Login as chaksu (super admin)
3. **Delete**: Delete isha's dispatch entry
4. **Verify**: Check stock backfill after deletion
5. **Delete**: Delete isha's user account
6. **Audit**: View and verify audit log entries

## Expected Results
- All users created successfully
- All operations logged in audit trail
- Stock levels correctly updated
- Timeline entries created for all operations
- Audit log shows all admin actions
- Deleted dispatch stock returned to inventory
