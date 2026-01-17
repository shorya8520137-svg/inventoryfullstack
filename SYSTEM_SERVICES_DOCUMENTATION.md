# StockIQ Inventory Management System - Services Documentation

## System Overview
StockIQ is a comprehensive inventory management system with role-based permissions, real-time tracking, and multi-warehouse support.

**Server**: `https://13.51.56.188.nip.io`  
**Frontend**: Deployed on Vercel  
**Database**: MySQL (`inventory_db`)  
**Admin Login**: `admin@company.com` / `admin@123`

---

## 🏗️ System Architecture

### Frontend Structure
```
src/app/
├── login/           # Authentication
├── products/        # Product Management
├── inventory/       # Inventory Operations
├── order/           # Order Management
├── permissions/     # User & Role Management
├── tracking/        # Order Tracking
└── api-test/        # API Testing Tools
```

### Backend Structure
```
controllers/         # Business Logic
├── authController.js
├── permissionsController.js
└── dispatchController.js

routes/             # API Routes
middleware/         # Authentication & Authorization
```

---

## 📋 Navigation Menu Services (Sidebar Order)

### 1. **Products** 📦
**Route**: `/products`  
**Permission**: `PRODUCTS_VIEW`

#### Features:
- **Product Listing**: View all products with search and filters
- **Product Creation**: Add new products with details
- **Product Updates**: Edit existing product information
- **Product Categories**: Organize products by categories
- **Bulk Import**: Import products from CSV/Excel files

#### API Endpoints:
```
GET    /api/products              # List all products
GET    /api/products/:id          # Get specific product
POST   /api/products              # Create new product
PUT    /api/products/:id          # Update product
DELETE /api/products/:id          # Delete product
GET    /api/products/search       # Search products
GET    /api/products/categories   # Get categories
POST   /api/products/bulk-import  # Bulk import
```

#### Components:
- `ProductManager.jsx` - Main product management interface
- `TransferForm.jsx` - Product transfer between warehouses

---

### 2. **Inventory** 📊
**Route**: `/inventory`  
**Permission**: `INVENTORY_VIEW`

#### Features:
- **Inventory Sheet**: Real-time stock levels across warehouses
- **Product Tracker**: Track individual product movements
- **Stock Filtering**: Filter by warehouse, date range, stock status
- **Low Stock Alerts**: Identify products below threshold
- **Export Functionality**: Export inventory data

#### API Endpoints:
```
GET /api/inventory                    # List inventory with filters
GET /api/inventory/export             # Export inventory data
GET /api/inventory/stats              # Get inventory statistics
GET /api/inventory/low-stock          # Get low stock items
GET /api/timeline/:productCode        # Product movement timeline
```

#### Sub-Services:
- **Bulk Upload**: Mass inventory updates via file upload
- **Damage Management**: Record and track damaged items
- **Return Processing**: Handle product returns
- **Self Transfer**: Internal warehouse transfers

#### Components:
- `InventorySheet.jsx` - Main inventory display
- `ProductTracker.jsx` - Individual product tracking
- `InventoryEntry.jsx` - Bulk upload interface

---

### 3. **Orders** 🚚
**Route**: `/order`  
**Permission**: `ORDERS_VIEW`

#### Features:
- **Dispatch Management**: Create and manage dispatch orders
- **Website Orders**: Handle online orders
- **Store Orders**: Manage in-store orders
- **Order Tracking**: Real-time order status updates
- **Payment Tracking**: Monitor payment status

#### API Endpoints:
```
GET  /api/orders                 # List all orders
GET  /api/orders/:id             # Get specific order
POST /api/orders                 # Create new order
PUT  /api/orders/:id/status      # Update order status
POST /api/orders/:id/dispatch    # Dispatch order
GET  /api/orders/:id/tracking    # Get tracking info
GET  /api/orders/warehouse/:wh   # Orders by warehouse
GET  /api/orders/export          # Export orders
```

#### Sub-Services:
- **Dispatch**: Create dispatch orders with product allocation
- **Website Orders**: Integration with e-commerce platforms
- **Store Management**: Physical store order processing

#### Components:
- `OrderSheet.jsx` - Main order management interface
- `DispatchForm.jsx` - Dispatch creation form

---

### 4. **Operations** ⚙️
**Modal-based Services** (No dedicated route)  
**Permissions**: Various operation-specific permissions

#### 4.1 Dispatch Operations 📦
**Permission**: `OPERATIONS_DISPATCH`
- Create dispatch orders
- Allocate products from inventory
- Generate dispatch documents
- Track dispatch status

#### 4.2 Damage Management ⚠️
**Permission**: `OPERATIONS_DAMAGE`
- Record damaged items
- Damage recovery processes
- Loss tracking and reporting
- Insurance claim documentation

#### 4.3 Return Processing 🔄
**Permission**: `OPERATIONS_RETURN`
- Process customer returns
- Quality inspection
- Restocking decisions
- Return reason tracking

#### 4.4 Recovery Operations 🔧
**Permission**: `OPERATIONS_RECOVER`
- Recover damaged items
- Refurbishment processes
- Quality restoration
- Re-inventory procedures

#### 4.5 Bulk Upload 📤
**Permission**: `OPERATIONS_BULK`
- Mass inventory updates
- CSV/Excel file processing
- Batch operations
- Data validation

#### API Endpoints:
```
POST /api/dispatch               # Create dispatch
POST /api/damage                 # Record damage
POST /api/returns                # Process return
POST /api/recovery               # Recovery operation
POST /api/bulk-upload            # Bulk upload
```

#### Components:
- `DispatchForm.jsx` - Dispatch creation
- `DamageRecoveryModal.jsx` - Damage management
- `ReturnModal.jsx` - Return processing
- `InventoryEntry.jsx` - Bulk operations

---

### 5. **Permissions** 🛡️
**Route**: `/permissions`  
**Permissions**: `SYSTEM_USER_MANAGEMENT`, `SYSTEM_ROLE_MANAGEMENT`, `SYSTEM_AUDIT_LOG`

#### Features:
- **User Management**: Create, update, delete users
- **Role Management**: Define roles and permissions
- **Permission Assignment**: Assign permissions to roles
- **Audit Logging**: Track all system activities
- **Access Control**: Manage system access levels

#### API Endpoints:
```
GET    /api/users                # List all users
POST   /api/users                # Create new user
PUT    /api/users/:id            # Update user
DELETE /api/users/:id            # Delete user
GET    /api/roles                # List all roles
POST   /api/roles                # Create new role
PUT    /api/roles/:id            # Update role
GET    /api/permissions          # List all permissions
GET    /api/audit-logs           # Get audit logs
```

#### Components:
- `PermissionsManager.jsx` - Main permissions interface
- `RealPermissionsManager.jsx` - Advanced permissions
- `EnhancedAuditTab.jsx` - Audit log viewer

---

## 🔐 Authentication & Authorization

### Login System
**Route**: `/login`
- JWT-based authentication
- Role-based access control
- Session management
- Password security

### Permission System
```javascript
PERMISSIONS = {
    // Product Management
    PRODUCTS_VIEW: 'products:view',
    PRODUCTS_CREATE: 'products:create',
    PRODUCTS_UPDATE: 'products:update',
    PRODUCTS_DELETE: 'products:delete',
    
    // Inventory Management
    INVENTORY_VIEW: 'inventory:view',
    INVENTORY_UPDATE: 'inventory:update',
    
    // Order Management
    ORDERS_VIEW: 'orders:view',
    ORDERS_CREATE: 'orders:create',
    ORDERS_UPDATE: 'orders:update',
    
    // Operations
    OPERATIONS_DISPATCH: 'operations:dispatch',
    OPERATIONS_DAMAGE: 'operations:damage',
    OPERATIONS_RETURN: 'operations:return',
    OPERATIONS_RECOVER: 'operations:recover',
    OPERATIONS_BULK: 'operations:bulk',
    
    // System Administration
    SYSTEM_USER_MANAGEMENT: 'system:user_management',
    SYSTEM_ROLE_MANAGEMENT: 'system:role_management',
    SYSTEM_AUDIT_LOG: 'system:audit_log',
    SYSTEM_SETTINGS: 'system:settings'
}
```

---

## 🗄️ Database Structure

### Core Tables
- **users**: User accounts and authentication
- **roles**: User roles (super_admin, admin, manager)
- **permissions**: System permissions
- **role_permissions**: Role-permission mapping
- **products**: Product catalog
- **inventory**: Stock levels and movements
- **orders**: Order management
- **dispatches**: Dispatch records
- **returns**: Return processing
- **audit_logs**: System activity tracking

### Key Relationships
- Users → Roles (many-to-one)
- Roles → Permissions (many-to-many)
- Products → Inventory (one-to-many)
- Orders → Dispatches (one-to-many)

---

## 🔧 System Operations

### CRUD Operations by Service

#### Products
- **Create**: Add new products with validation
- **Read**: List, search, filter products
- **Update**: Modify product details
- **Delete**: Remove products (with dependency checks)

#### Inventory
- **Create**: Add stock entries
- **Read**: View stock levels, movements
- **Update**: Adjust stock quantities
- **Delete**: Remove inventory records

#### Orders
- **Create**: Generate new orders
- **Read**: View order details, history
- **Update**: Modify order status, details
- **Delete**: Cancel orders

#### Users & Permissions
- **Create**: Add users, roles
- **Read**: View user lists, permissions
- **Update**: Modify user details, role assignments
- **Delete**: Remove users, roles

### Status Management
- **Orders**: Pending → Processing → Dispatched → Delivered
- **Inventory**: Available → Reserved → Dispatched → Returned
- **Returns**: Initiated → Inspected → Approved → Restocked
- **Damage**: Reported → Assessed → Recovered/Written-off

---

## 🚀 Deployment & Testing

### Server Commands
```bash
# Start server
npm start

# Test APIs
node test-all-apis-with-token.js

# Database operations
mysql -u inventory_user -p'StrongPass@123' inventory_db
```

### Frontend Deployment
- **Platform**: Vercel
- **Environment**: Production
- **API Base**: `https://13.51.56.188.nip.io`

### Testing Suite
- **Authentication Tests**: Login, JWT validation
- **API Tests**: All endpoints with proper tokens
- **User Journey Tests**: Complete workflows
- **Permission Tests**: Role-based access validation

---

## 📊 System Statistics

### Current Data (as of backup)
- **Users**: 126 registered users
- **Products**: 1000+ products across categories
- **Warehouses**: Multiple locations (GGM_WH, BLR_WH, etc.)
- **Orders**: Thousands of processed orders
- **Inventory Movements**: Complete audit trail

### Performance Metrics
- **API Response Time**: < 100ms average
- **Database Queries**: Optimized with indexes
- **File Upload**: Supports bulk operations
- **Real-time Updates**: WebSocket integration

---

## 🔄 Workflow Examples

### 1. Product Dispatch Workflow
1. **Login** → Authenticate user
2. **Orders** → Create new dispatch order
3. **Products** → Select products to dispatch
4. **Inventory** → Check stock availability
5. **Operations** → Execute dispatch
6. **Tracking** → Monitor delivery status

### 2. Inventory Management Workflow
1. **Inventory** → View current stock levels
2. **Operations** → Bulk upload new stock
3. **Products** → Update product details
4. **Inventory** → Verify stock updates
5. **Permissions** → Audit log review

### 3. Return Processing Workflow
1. **Orders** → Identify return request
2. **Operations** → Process return
3. **Inventory** → Update stock levels
4. **Products** → Quality assessment
5. **Tracking** → Update order status

---

This documentation provides a complete overview of the StockIQ system services organized according to the sidebar navigation structure, with detailed information about each component's functionality, API endpoints, and operational workflows.