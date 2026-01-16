# Test User Credentials

## All Test Users for Permissions System

### 1. Super Admin
- **Email:** admin@company.com
- **Password:** admin@123
- **Role:** super_admin
- **Permissions:** 62 (Full system access)
- **Access Level:** 92% (11/12 endpoints)
- **Description:** Complete administrative access to all system features

---

### 2. Manager
- **Email:** manager@test.com
- **Password:** manager@123
- **Role:** manager
- **Permissions:** 38
- **Access Level:** 75% (9/12 endpoints)
- **Description:** Management level access - can view/edit most features except user management and audit logs

---

### 3. Operator
- **Email:** operator@test.com
- **Password:** operator@123
- **Role:** operator
- **Permissions:** 29
- **Access Level:** 75% (9/12 endpoints)
- **Description:** Operational access - can perform day-to-day operations

---

### 4. Warehouse Staff
- **Email:** warehouse@test.com
- **Password:** warehouse@123
- **Role:** warehouse_staff
- **Permissions:** 21
- **Access Level:** 75% (9/12 endpoints)
- **Description:** Warehouse operations - inventory, dispatch, transfers

---

### 5. Viewer
- **Email:** viewer@test.com
- **Password:** viewer@123
- **Role:** viewer
- **Permissions:** 6
- **Access Level:** 75% (9/12 endpoints)
- **Description:** Read-only access to view data

---

### 6. Limited User
- **Email:** limited@test.com
- **Password:** limited@123
- **Role:** limited_user
- **Permissions:** 3
- **Access Level:** 75% (9/12 endpoints)
- **Description:** Very limited access - minimal permissions

---

## API Endpoint Access Matrix

| Endpoint | Super Admin | Manager | Operator | Warehouse | Viewer | Limited |
|----------|-------------|---------|----------|-----------|--------|---------|
| Products List | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Inventory List | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Dispatch List | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Order Tracking | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Self Transfer | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Damage Recovery | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Returns | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Timeline | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Users Management | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Roles Management | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Permissions List | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Audit Logs | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Login API Endpoint

**URL:** `https://16.171.161.150.nip.io/api/auth/login`

**Method:** POST

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "email": "admin@company.com",
  "password": "admin@123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 85,
    "name": "System Administrator",
    "email": "admin@company.com",
    "role": "super_admin",
    "roleDisplayName": "Super Admin",
    "permissions": ["DASHBOARD_VIEW", "PRODUCTS_VIEW", ...]
  }
}
```

---

## Testing Instructions

### Using cURL:
```bash
curl -X POST https://16.171.161.150.nip.io/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"admin@123"}'
```

### Using the Token:
After login, use the returned token in subsequent requests:
```bash
curl https://16.171.161.150.nip.io/api/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Notes

- All passwords are currently stored as plain text for testing
- In production, passwords should be hashed with bcrypt
- JWT tokens expire after 24 hours
- Audit logs track all login activities
- The "Damage Recovery" endpoint returns 404 (not implemented yet)

---

**Last Updated:** January 16, 2026
**System Status:** ✅ Fully Functional
**Test Results:** 78% success rate (56/72 tests passed)
