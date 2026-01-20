# 🧪 MANUAL TEST COMMANDS - ADMIN VS THEMS

Since the automated test can't connect to your server, here are the exact commands to run manually:

## 🔧 Server URL
```
https://16.171.197.86.nip.io
```

## 1️⃣ TEST ADMIN USER

### Login Admin:
```bash
curl -X POST "https://16.171.197.86.nip.io/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "admin@123"
  }'
```

### Test Admin Products API (use token from above):
```bash
curl -X GET "https://16.171.197.86.nip.io/api/products?page=1&limit=5" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### Test Admin Dispatch Creation:
```bash
curl -X POST "https://16.171.197.86.nip.io/api/dispatch" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "orderNumber": "TEST-ADMIN-001",
    "customerName": "Test Customer",
    "customerPhone": "1234567890",
    "warehouse": "MAIN",
    "products": [
      {
        "productCode": "TEST001",
        "productName": "Test Product",
        "quantity": 1
      }
    ]
  }'
```

## 2️⃣ TEST THEMS USER

### Login Thems:
```bash
curl -X POST "https://16.171.197.86.nip.io/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "thems@company.com",
    "password": "gfx998sd"
  }'
```

### Test Thems Products API (use token from above):
```bash
curl -X GET "https://16.171.197.86.nip.io/api/products?page=1&limit=5" \
  -H "Authorization: Bearer YOUR_THEMS_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### Test Thems Dispatch Creation:
```bash
curl -X POST "https://16.171.197.86.nip.io/api/dispatch" \
  -H "Authorization: Bearer YOUR_THEMS_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "orderNumber": "TEST-THEMS-001",
    "customerName": "Test Customer",
    "customerPhone": "1234567890",
    "warehouse": "MAIN",
    "products": [
      {
        "productCode": "TEST001",
        "productName": "Test Product",
        "quantity": 1
      }
    ]
  }'
```

## 🎯 EXPECTED RESULTS

**If permissions are working correctly:**
- ✅ Admin login: 200 (gets token)
- ✅ Admin products: 200 (gets product list)
- ✅ Admin dispatch: 200 (creates dispatch)
- ✅ Thems login: 200 (gets token)
- ✅ Thems products: 200 (gets product list)
- ✅ Thems dispatch: 200 (creates dispatch)

**If permissions are broken (current issue):**
- ✅ Admin login: 200 (gets token)
- ✅ Admin products: 200 (gets product list)
- ✅ Admin dispatch: 200 (creates dispatch)
- ✅ Thems login: 200 (gets token)
- ❌ Thems products: 403 Forbidden
- ❌ Thems dispatch: 403 Forbidden

## 🔍 WHAT TO LOOK FOR

1. **Both users should login successfully** (status 200)
2. **Admin should access all APIs** (status 200)
3. **Thems should get 403 errors** on products/dispatch APIs

If Thems gets 403 errors, that confirms the permissions issue we need to fix.

## 🛠️ NEXT STEPS

Once you confirm the issue:
1. Run the SQL fix: `sudo mysql inventory_db < fix-user-permissions.sql`
2. Restart your server
3. Test again - Thems should now work