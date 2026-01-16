## 🔐 Permissions System Implementation Plan

## Overview
Complete JWT-based authentication and role-based access control (RBAC) system for the inventory management application.

---

## 📋 Phase 1: Database Setup (30 minutes)

### Tables to Create:
1. **roles** - User roles (admin, manager, warehouse_staff, viewer)
2. **permissions** - All system permissions
3. **users** - User accounts with JWT support
4. **role_permissions** - Role-permission mapping
5. **user_permissions** - User-specific permission overrides

### Deployment Steps:
```bash
# SSH to server
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150

# Navigate to project
cd inventoryfullstack

# Copy SQL file (already created)
# Run deployment script
bash deploy-permissions-system.sh
```

### Default Admin User:
- **Username:** admin
- **Email:** admin@inventory.com
- **Password:** Admin@123 (MUST CHANGE!)
- **Role:** admin (full access)

---

## 📋 Phase 2: Backend Implementation (2-3 hours)

### 2.1 Install Dependencies
```bash
npm install jsonwebtoken bcryptjs
```

### 2.2 Create Authentication Middleware
**File:** `middleware/auth.js`
- Verify JWT token
- Extract user info
- Check if user is active

### 2.3 Create Permission Middleware
**File:** `middleware/permissions.js`
- Check user permissions
- Validate module access
- Handle permission denied

### 2.4 Create Auth Controller
**File:** `controllers/authController.js`
- `login()` - User login with JWT generation
- `logout()` - Token invalidation
- `getCurrentUser()` - Get logged-in user info
- `changePassword()` - Password change

### 2.5 Create Users Controller
**File:** `controllers/usersController.js`
- `getUsers()` - List all users
- `createUser()` - Create new user
- `updateUser()` - Update user details
- `deleteUser()` - Delete user
- `getUserPermissions()` - Get user's permissions

### 2.6 Create Auth Routes
**File:** `routes/authRoutes.js`
```javascript
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me
POST /api/auth/change-password
```

### 2.7 Create Users Routes
**File:** `routes/usersRoutes.js`
```javascript
GET /api/users
POST /api/users
PUT /api/users/:id
DELETE /api/users/:id
GET /api/users/:id/permissions
```

### 2.8 Protect Existing Routes
Add authentication middleware to all routes:
```javascript
router.use(authMiddleware);
router.use(permissionMiddleware('module.action'));
```

---

## 📋 Phase 3: Frontend Implementation (3-4 hours)

### 3.1 Create Auth Context
**File:** `src/contexts/AuthContext.jsx`
- Store JWT token
- Store user info
- Store permissions
- Login/logout functions

### 3.2 Create Login Page
**File:** `src/app/login/page.jsx`
- Username/email input
- Password input
- Remember me checkbox
- Login button
- Error handling

### 3.3 Create Protected Route Component
**File:** `src/components/ProtectedRoute.jsx`
- Check if user is logged in
- Redirect to login if not
- Check permissions
- Show "Access Denied" if no permission

### 3.4 Update App Layout
**File:** `src/app/layout.jsx`
- Wrap with AuthProvider
- Add user info in header
- Add logout button
- Show user's full name

### 3.5 Add Permission Checks to Components
Update all components to check permissions:
```javascript
const { hasPermission } = useAuth();

{hasPermission('products.create') && (
    <button>Create Product</button>
)}
```

### 3.6 Update API Calls
Add JWT token to all API requests:
```javascript
headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
}
```

---

## 📋 Phase 4: Testing (1 hour)

### 4.1 Backend Testing
```bash
# Test login
curl -X POST https://16.171.161.150.nip.io/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}'

# Test protected route
curl https://16.171.161.150.nip.io/api/products \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test permissions
curl https://16.171.161.150.nip.io/api/users/1/permissions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4.2 Frontend Testing
1. Login with admin credentials
2. Verify user name displays in header
3. Test all modules with admin access
4. Create a viewer user
5. Login as viewer
6. Verify limited access (read-only)
7. Test logout functionality

---

## 📋 Phase 5: Deployment (30 minutes)

### 5.1 Backend Deployment
```bash
# SSH to server
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150

# Pull latest code
cd inventoryfullstack
git pull origin main

# Install dependencies
npm install

# Restart server
pkill -9 node
nohup node server.js > server.log 2>&1 &
```

### 5.2 Frontend Deployment
```bash
# Commit and push
git add .
git commit -m "Add JWT authentication and permissions system"
git push origin main

# Vercel will auto-deploy
```

---

## 🔐 Permission Matrix

| Module | Admin | Manager | Warehouse Staff | Viewer |
|--------|-------|---------|-----------------|--------|
| Dashboard | ✅ View | ✅ View | ✅ View | ✅ View |
| Products | ✅ All | ✅ View/Create/Edit | ✅ View | ✅ View |
| Inventory | ✅ All | ✅ All | ✅ View/Add/Upload | ✅ View |
| Dispatch | ✅ All | ✅ View/Create/Edit/Status | ✅ View/Create/Status | ✅ View |
| Orders | ✅ All | ✅ All | ✅ View | ✅ View |
| Self Transfer | ✅ All | ✅ All | ✅ View/Create | ✅ View |
| Damage | ✅ All | ✅ All | ✅ View/Report | ✅ View |
| Returns | ✅ All | ✅ All | ✅ View/Process | ✅ View |
| Users | ✅ All | ❌ None | ❌ None | ❌ None |
| Permissions | ✅ Manage | ❌ None | ❌ None | ❌ None |

---

## 🚀 Quick Start Commands

### Deploy Database:
```bash
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "cd inventoryfullstack && bash deploy-permissions-system.sh"
```

### Verify Setup:
```bash
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "sudo mysql inventory_db -e 'SELECT * FROM users; SELECT * FROM roles; SELECT COUNT(*) FROM permissions;'"
```

---

## 📝 Files to Create/Modify

### Backend (New Files):
- `middleware/auth.js`
- `middleware/permissions.js`
- `controllers/authController.js`
- `controllers/usersController.js`
- `routes/authRoutes.js`
- `routes/usersRoutes.js`
- `setup-permissions-system.sql` ✅ Created
- `deploy-permissions-system.sh` ✅ Created

### Backend (Modify):
- `server.js` - Add auth routes
- All route files - Add auth middleware

### Frontend (New Files):
- `src/contexts/AuthContext.jsx`
- `src/app/login/page.jsx`
- `src/components/ProtectedRoute.jsx`
- `src/hooks/useAuth.js`

### Frontend (Modify):
- `src/app/layout.jsx` - Add AuthProvider
- `src/services/api/index.js` - Add JWT token
- All component files - Add permission checks

---

## ⚠️ Important Notes

1. **Change Default Password:** Admin password MUST be changed after first login
2. **JWT Secret:** Use strong secret key in `.env` file
3. **Token Expiry:** Set appropriate token expiry (24 hours recommended)
4. **HTTPS Only:** JWT tokens should only be sent over HTTPS
5. **Refresh Tokens:** Consider implementing refresh tokens for better security
6. **Password Policy:** Enforce strong password requirements
7. **Session Management:** Implement proper session timeout
8. **Audit Logging:** Log all authentication attempts

---

## 🎯 Success Criteria

- ✅ Database tables created
- ✅ Admin user created with full access
- ✅ JWT authentication working
- ✅ Login page functional
- ✅ User name displays after login
- ✅ Protected routes working
- ✅ Permission checks working
- ✅ Logout functionality working
- ✅ All APIs protected
- ✅ Frontend components render based on permissions

---

**Estimated Total Time: 6-8 hours**

**Priority: HIGH - Security Feature**

---
