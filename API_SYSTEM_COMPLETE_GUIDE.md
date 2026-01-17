# 🚀 INVENTORY DASHBOARD API SYSTEM - COMPLETE GUIDE

**Server:** 13.48.248.180 (NEW PRIMARY)  
**API Base:** https://13.48.248.180.nip.io  
**Updated:** January 17, 2026

---

## 🏗️ API ARCHITECTURE OVERVIEW

### **Backend Stack:**
- **Framework:** Node.js + Express.js
- **Database:** MySQL (inventory_db)
- **Authentication:** JWT (JSON Web Tokens)
- **Authorization:** Role-based permissions (28 permissions)
- **Security:** bcrypt password hashing, CORS enabled

### **Frontend Integration:**
- **Environment:** Next.js React application
- **API Client:** Axios with interceptors
- **Base URL:** `process.env.NEXT_PUBLIC_API_BASE`
- **Authentication:** Bearer token in headers

---

## 🔐 AUTHENTICATION SYSTEM

### **Login Flow:**
```javascript
POST /api/auth/login
{
  "email": "admin@company.com",
  "password": "admin@123"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "System Administrator",
    "email": "admin@company.com",
    "role": "super_admin",
    "permissions": ["products.view", "inventory.create", ...]
  }
}
```

### **JWT Token Structure:**
```javascript
{
  "id": 1,
  "userId": 1,
  "email": "admin@company.com",
  "name": "System Administrator",
  "role_id": 1,
  "roleId": 1,
  "role_name": "super_admin",
  "role": "super_admin",
  "iat": 1768666655,
  "exp": 1768753055
}
```

### **Protected Routes:**
All API routes except `/api/auth/*` require JWT token:
```javascript
Headers: {
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

---

## 📊 PERMISSION SYSTEM (28 PERMISSIONS)

### **Categories & Permissions:**

#### **1. Products (8 permissions):**
- `products.view` - View products list
- `products.create` - Create new products
- `products.edit` - Edit existing products
- `products.delete` - Delete products
- `products.export` - Export products data
- `products.bulk_import` - Bulk import products
- `products.categories` - Manage product categories
- `products.self_transfer` - Product self transfers

#### **2. Inventory (6 permissions):**
- `inventory.view` - View inventory levels
- `inventory.adjust` - Adjust inventory quantities
- `inventory.transfer` - Transfer between warehouses
- `inventory.export` - Export inventory data
- `inventory.bulk_upload` - Bulk upload inventory
- `inventory.timeline` - View inventory timeline

#### **3. Orders (6 permissions):**
- `orders.view` - View orders
- `orders.create` - Create new orders
- `orders.edit` - Edit existing orders
- `orders.delete` - Delete orders
- `orders.export` - Export orders data
- `orders.status_update` - Update order status

#### **4. Operations (5 permissions):**
- `operations.dispatch` - Dispatch operations
- `operations.return` - Return processing
- `operations.damage` - Damage management
- `operations.bulk` - Bulk operations
- `operations.self_transfer` - Self transfer operations

#### **5. System (3 permissions):**
- `system.user_management` - Manage users
- `system.role_management` - Manage roles
- `system.audit_log` - View audit logs

---

## 🛣️ API ENDPOINTS STRUCTURE

### **Authentication Routes:**
```
POST   /api/auth/login          - User login
POST   /api/auth/logout         - User logout
POST   /api/auth/refresh-token  - Refresh JWT token
```

### **User Management:**
```
GET    /api/users               - Get all users
GET    /api/users/:id           - Get user by ID
POST   /api/users               - Create new user
PUT    /api/users/:id           - Update user
DELETE /api/users/:id           - Delete user
```

### **Role & Permission Management:**
```
GET    /api/roles               - Get all roles
POST   /api/roles               - Create new role
PUT    /api/roles/:id           - Update role
GET    /api/permissions         - Get all permissions
GET    /api/system-stats        - Get system statistics
```

### **Product Management:**
```
GET    /api/products            - Get products list
POST   /api/products            - Create new product
PUT    /api/products/:id        - Update product
DELETE /api/products/:id        - Delete product
GET    /api/products/search/:barcode - Search by barcode
GET    /api/products/inventory  - Get product inventory
```

### **Inventory Management:**
```
GET    /api/inventory           - Get inventory data
POST   /api/inventory/adjust    - Adjust inventory
POST   /api/inventory/transfer  - Transfer inventory
GET    /api/inventory/timeline  - Get inventory timeline
```

### **Order Management:**
```
GET    /api/order-tracking      - Get orders
POST   /api/order-tracking      - Create new order
PUT    /api/order-tracking/:id  - Update order
DELETE /api/order-tracking/:id  - Delete order
```

### **Operations:**
```
POST   /api/dispatch            - Create dispatch
GET    /api/dispatch            - Get dispatches
POST   /api/returns             - Create return
GET    /api/returns             - Get returns
POST   /api/damage-recovery     - Report damage
GET    /api/damage-recovery     - Get damage reports
```

### **Bulk Operations:**
```
POST   /api/bulk-upload         - Bulk upload data
GET    /api/bulk-upload/status  - Get upload status
POST   /api/bulk-upload/validate - Validate bulk data
```

### **Timeline & Tracking:**
```
GET    /api/timeline            - Get timeline events
POST   /api/timeline            - Create timeline event
GET    /api/timeline/:orderId   - Get order timeline
```

### **Self Transfer:**
```
POST   /api/self-transfer       - Create self transfer
GET    /api/self-transfer       - Get self transfers
PUT    /api/self-transfer/:id   - Update self transfer
```

### **🔔 Notification System (NEW - Phase 1.5):**
```
GET    /api/notifications       - Get notifications
POST   /api/notifications       - Create notification
PUT    /api/notifications/:id/read - Mark as read
PUT    /api/notifications/read-all - Mark all as read
GET    /api/notifications/stats - Get notification stats
POST   /api/notifications/firebase-token - Save Firebase token

# Test Endpoints:
POST   /api/notifications/test/dispatch - Test dispatch notification
POST   /api/notifications/test/return - Test return notification
POST   /api/notifications/test/status-change - Test status change
POST   /api/notifications/test/data-insert - Test data insert
```

---

## 🔄 NOTIFICATION TRIGGERS

### **Automatic Triggers:**
1. **User Login** → Creates login notification
2. **User Logout** → Creates logout notification
3. **Dispatch Created** → High priority notification
4. **Return Created** → High priority notification
5. **Status Change** → Medium priority notification
6. **Data Insert** → Low priority notification

### **Notification Types:**
- `dispatch` - Dispatch operations
- `return` - Return processing
- `status_change` - Status updates
- `data_insert` - New data added
- `user_login` - User login events
- `user_logout` - User logout events
- `inventory` - Inventory changes
- `order` - Order updates
- `product` - Product changes
- `system` - System events

---

## 🛡️ MIDDLEWARE CHAIN

### **Request Flow:**
```
1. CORS Middleware → Allow cross-origin requests
2. Body Parser → Parse JSON/URL-encoded data
3. Morgan Logger → Log HTTP requests
4. Authentication Check → Verify JWT token
5. Permission Check → Verify user permissions
6. Route Handler → Execute business logic
7. Response → Send JSON response
```

### **Error Handling:**
```javascript
// Global error handler
app.use((err, req, res, next) => {
    console.error("[SERVER ERROR]", err);
    res.status(500).json({
        success: false,
        error: err.message || "Internal Server Error"
    });
});
```

---

## 📱 FRONTEND INTEGRATION

### **API Client Setup:**
```javascript
// src/utils/api.js
const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

const apiClient = axios.create({
    baseURL: API_BASE,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```

### **Usage Examples:**
```javascript
// Login
const loginResponse = await apiClient.post('/api/auth/login', {
    email: 'admin@company.com',
    password: 'admin@123'
});

// Get products
const productsResponse = await apiClient.get('/api/products');

// Create notification
const notificationResponse = await apiClient.post('/api/notifications', {
    title: 'New Order',
    message: 'Order #123 has been created',
    type: 'order',
    priority: 'high'
});
```

---

## 🧪 TESTING COMMANDS

### **Test Admin Login:**
```bash
curl -k -X POST https://13.48.248.180.nip.io/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"admin@123"}'
```

### **Test API with Token:**
```bash
TOKEN="your_jwt_token_here"
curl -k -H "Authorization: Bearer $TOKEN" \
  https://13.48.248.180.nip.io/api/products
```

### **Test Notification System:**
```bash
node test-notification-system.js
```

---

## 🚀 DEPLOYMENT PROCESS

### **1. Update Code:**
```bash
git add .
git commit -m "Update API changes"
git push origin main
```

### **2. Deploy to Server:**
```bash
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180
cd /home/ubuntu/inventoryfullstack
git pull origin main
npm install
pkill -f 'node server.js'
nohup node server.js > server.log 2>&1 &
```

### **3. Test Deployment:**
```bash
./deploy-notification-system.ps1
```

---

## 📊 DATABASE SCHEMA

### **Core Tables:**
- `users` - User accounts (1 admin user)
- `roles` - User roles (1 super_admin role)
- `permissions` - System permissions (28 permissions)
- `role_permissions` - Role-permission mapping
- `audit_logs` - System audit trail

### **Notification Tables (NEW):**
- `notifications` - Notification records
- `notification_preferences` - User notification settings
- `firebase_tokens` - Push notification tokens

### **Business Tables:**
- `products` - Product catalog
- `inventory` - Inventory levels
- `orders` - Order management
- `dispatches` - Dispatch records
- `returns` - Return processing
- `timeline` - Event timeline

---

## 🔧 ENVIRONMENT CONFIGURATION

### **.env (Server):**
```
DB_HOST=127.0.0.1
DB_NAME=inventory_db
DB_USER=inventory_user
DB_PASSWORD=StrongPass@123
JWT_SECRET=supersecretkey123
PORT=5000
NEXT_PUBLIC_API_BASE=https://13.48.248.180.nip.io
```

### **.env.local (Frontend):**
```
NEXT_PUBLIC_API_BASE=https://13.48.248.180.nip.io
NODE_ENV=development
NEXT_PUBLIC_API_TIMEOUT=30000
```

---

## 🎯 NEXT STEPS

1. **Deploy notification system:** `./deploy-notification-system.ps1`
2. **Test all APIs:** `node test-notification-system.js`
3. **Add notification triggers to existing controllers**
4. **Implement Firebase push notifications**
5. **Create frontend notification panel**

---

**🚨 CRITICAL: New server IP 13.48.248.180 is now the primary server!**