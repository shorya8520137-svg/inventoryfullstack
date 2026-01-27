# 🚀 StockIQ Backend API Documentation

## 📡 **API Base URL**
```
Production: https://16.171.5.50.nip.io
```

## 🔐 **Authentication**
All API endpoints (except login) require JWT Bearer token authentication.

### Headers Required:
```javascript
{
  "Authorization": "Bearer <your_jwt_token>",
  "Content-Type": "application/json"
}
```

---

## 🔑 **Authentication Endpoints**

### 1. Login
```http
POST /api/auth/login
```
**Body:**
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
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@company.com",
    "role_name": "admin"
  }
}
```

### 2. Get Current User
```http
GET /api/auth/me
```

### 3. Logout
```http
POST /api/auth/logout
```

---

## 👥 **User Management Endpoints**

### 1. Get All Users
```http
GET /api/users
```
**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search term

### 2. Create User
```http
POST /api/users
```
**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role_id": 2,
  "is_active": true
}
```

### 3. Update User
```http
PUT /api/users/{id}
```

### 4. Delete User
```http
DELETE /api/users/{id}
```

### 5. Get User Profile
```http
GET /api/users/profile
```

### 6. Update User Profile (with file upload)
```http
PUT /api/users/profile
```
**Content-Type:** `multipart/form-data`

---

## 🛡️ **Role Management Endpoints**

### 1. Get All Roles
```http
GET /api/roles
```

### 2. Create Role
```http
POST /api/roles
```
**Body:**
```json
{
  "name": "manager",
  "display_name": "Manager",
  "description": "Department manager role",
  "color": "#3b82f6",
  "permissionIds": [1, 2, 3]
}
```

### 3. Update Role
```http
PUT /api/roles/{id}
```

### 4. Delete Role
```http
DELETE /api/roles/{id}
```

### 5. Get Role Permissions
```http
GET /api/roles/{id}/permissions
```

### 6. Update Role Permissions
```http
PUT /api/roles/{id}/permissions
```
**Body:**
```json
{
  "permissionIds": [1, 2, 3, 4]
}
```

---

## 🔒 **Permission Endpoints**

### 1. Get All Permissions
```http
GET /api/permissions
```

---

## 📦 **Product Management Endpoints**

### 1. Get All Products
```http
GET /api/products
```
**Query Parameters:**
- `page`, `limit`, `search`
- `category`, `warehouse`

### 2. Create Product
```http
POST /api/products
```
**Body:**
```json
{
  "name": "Product Name",
  "sku": "SKU123",
  "category": "Electronics",
  "price": 99.99,
  "warehouse": "WH001"
}
```

### 3. Update Product
```http
PUT /api/products/{id}
```

### 4. Delete Product
```http
DELETE /api/products/{id}
```

---

## 📋 **Inventory Management Endpoints**

### 1. Get Inventory
```http
GET /api/inventory
```
**Query Parameters:**
- `warehouse`, `category`, `status`
- `page`, `limit`, `search`

---

## 🚚 **Dispatch Management Endpoints**

### 1. Get All Dispatches
```http
GET /api/dispatch
```

### 2. Create Dispatch
```http
POST /api/dispatch
```
**Body:**
```json
{
  "order_id": "ORD123",
  "products": [
    {
      "product_id": 1,
      "quantity": 5
    }
  ],
  "destination": "Customer Address",
  "dispatch_date": "2024-01-23"
}
```

---

## 📊 **Order Tracking Endpoints**

### 1. Get Order Tracking
```http
GET /api/order-tracking
```
**Query Parameters:**
- `status`, `warehouse`, `date_from`, `date_to`
- `page`, `limit`, `search`

### 2. Update Order Status
```http
PATCH /api/order-tracking/{id}/status
```
**Body:**
```json
{
  "status": "shipped"
}
```

### 3. Delete Order
```http
DELETE /api/order-tracking/{id}
```

---

## 🔄 **Self Transfer Endpoints**

### 1. Get Self Transfers
```http
GET /api/self-transfer
```

### 2. Create Self Transfer
```http
POST /api/self-transfer
```
**Body:**
```json
{
  "from_warehouse": "WH001",
  "to_warehouse": "WH002",
  "products": [
    {
      "product_id": 1,
      "quantity": 10
    }
  ],
  "reason": "Stock rebalancing"
}
```

---

## 📤 **Bulk Upload Endpoints**

### 1. Bulk Upload
```http
POST /api/bulk-upload
```
**Content-Type:** `multipart/form-data`
**Body:**
- `file`: CSV/Excel file
- `type`: "products" | "inventory" | "orders"

---

## 🔧 **Damage Recovery Endpoints**

### 1. Get Damage Records
```http
GET /api/damage-recovery
```

### 2. Create Damage Record
```http
POST /api/damage-recovery
```
**Body:**
```json
{
  "product_id": 1,
  "quantity": 2,
  "damage_type": "broken",
  "description": "Damaged during transport",
  "warehouse": "WH001"
}
```

---

## 🔙 **Returns Management Endpoints**

### 1. Get Returns
```http
GET /api/returns
```

### 2. Create Return
```http
POST /api/returns
```
**Body:**
```json
{
  "order_id": "ORD123",
  "product_id": 1,
  "quantity": 1,
  "reason": "defective",
  "awb": "AWB123456",
  "customer_name": "John Doe"
}
```

---

## 📈 **Timeline & Analytics Endpoints**

### 1. Get Timeline
```http
GET /api/timeline
```
**Query Parameters:**
- `order_id`, `date_from`, `date_to`
- `event_type`, `warehouse`

### 2. Get System Stats
```http
GET /api/system/stats
```

---

## 📝 **Audit Log Endpoints**

### 1. Get Audit Logs
```http
GET /api/audit-logs
```
**Query Parameters:**
- `user_id`, `action`, `resource`
- `date_from`, `date_to`
- `page`, `limit`

---

## 🔧 **Common Response Format**

### Success Response:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error info"
}
```

---

## 🚀 **Quick Test Commands**

### Test Login:
```bash
curl -X POST https://16.171.5.50.nip.io/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"admin@123"}'
```

### Test Protected Endpoint:
```bash
curl -X GET https://16.171.5.50.nip.io/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📱 **Frontend Integration**

The frontend uses the API utility (`src/utils/api.js`) which handles:
- ✅ JWT token management
- ✅ Automatic authentication headers
- ✅ Error handling and redirects
- ✅ Request/response formatting

### Example Usage:
```javascript
import { api } from '@/utils/api';

// Login
const response = await api.login({
  email: 'admin@company.com',
  password: 'admin@123'
});

// Get users
const users = await api.getUsers();

// Create user
const newUser = await api.createUser({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  role_id: 2
});
```

---

## 🔐 **Test Credentials**

```
Email: admin@company.com
Password: admin@123
```

**Backend API is fully functional and ready for integration!** 🎉