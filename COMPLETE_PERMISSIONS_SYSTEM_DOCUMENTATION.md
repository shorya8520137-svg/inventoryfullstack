# 🔐 Complete Permissions System Documentation
## Inventory Management System - Component-wise Permission Analysis

**Generated on:** January 20, 2026  
**System:** StockIQ Inventory Management  
**Database:** MySQL (`inventory_db`)  
**Total Permissions:** 153  
**Total Components:** 8 Main Modules

---

## 📋 TABLE OF CONTENTS

1. [System Overview](#system-overview)
2. [Database Structure](#database-structure)
3. [Component-wise Permission Analysis](#component-wise-permission-analysis)
4. [Permission Categories](#permission-categories)
5. [Role Definitions](#role-definitions)
6. [API Endpoint Permissions](#api-endpoint-permissions)
7. [Frontend Component Permissions](#frontend-component-permissions)
8. [Implementation Guide](#implementation-guide)

---

## 🏗️ SYSTEM OVERVIEW

### Current Architecture
- **Frontend:** Next.js React application with role-based UI
- **Backend:** Node.js Express API with JWT authentication
- **Database:** MySQL with role-permission mapping
- **Authentication:** JWT tokens with 24-hour expiration
- **Authorization:** Role-based access control (RBAC)

### Permission Flow
```
User → Role → Permissions → API Access → UI Elements
```

1. **User** is assigned a **Role**
2. **Role** has multiple **Permissions**
3. **Permissions** control **API Access**
4. **API Access** determines **UI Elements** visibility

---

## 🗄️ DATABASE STRUCTURE

### Core Tables

#### 1. `users` Table
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id INT,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    login_count INT DEFAULT 0,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);
```

#### 2. `roles` Table
```sql
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6366f1',
    priority INT DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. `permissions` Table
```sql
CREATE TABLE permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. `role_permissions` Table (Junction)
```sql
CREATE TABLE role_permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_permission (role_id, permission_id)
);
```

---

## 🧩 COMPONENT-WISE PERMISSION ANALYSIS

### 1. 📦 PRODUCTS MODULE
**Location:** `/products`  
**Main Component:** `ProductManager.jsx`

#### Features & Sub-components:
- **Product Listing** - View all products with search/filter
- **Product Creation** - Add new products with details
- **Product Editing** - Modify existing product information
- **Product Categories** - Organize products by categories
- **Bulk Import** - Import products from CSV/Excel
- **Product Transfer** - Transfer products between warehouses

#### Required Permissions:
| Permission | Display Name | Component/Feature | API Endpoint |
|------------|--------------|-------------------|--------------|
| `products.view` | View Products | Product listing, search | `GET /api/products` |
| `products.create` | Create Products | Add product form | `POST /api/products` |
| `products.edit` | Edit Products | Edit product modal | `PUT /api/products/:id` |
| `products.delete` | Delete Products | Delete button | `DELETE /api/products/:id` |
| `products.categories` | Manage Categories | Category dropdown | `GET /api/products/categories` |
| `products.bulk_import` | Bulk Import | Import CSV button | `POST /api/products/bulk/import` |
| `products.export` | Export Products | Export button | `GET /api/products/export` |
| `inventory.transfer` | Transfer Products | Transfer form | `POST /api/products/transfer` |

#### UI Permission Gates:
```jsx
// Product creation button
<PermissionGate permission="products.create">
  <Button onClick={openCreateModal}>Add Product</Button>
</PermissionGate>

// Edit button in product row
<PermissionGate permission="products.edit">
  <EditButton productId={product.id} />
</PermissionGate>

// Delete button
<PermissionGate permission="products.delete">
  <DeleteButton productId={product.id} />
</PermissionGate>
```

---

### 2. 📊 INVENTORY MODULE
**Location:** `/inventory`  
**Main Components:** `InventorySheet.jsx`, `ProductTracker.jsx`

#### Features & Sub-components:
- **Inventory Sheet** - Real-time stock levels display
- **Product Tracker** - Individual product movement tracking
- **Stock Filtering** - Filter by warehouse, date, status
- **Bulk Upload** - Mass inventory updates via file
- **Export Functionality** - Export inventory data
- **Timeline View** - Product movement history
- **Stock Adjustments** - Manual stock corrections

#### Required Permissions:
| Permission | Display Name | Component/Feature | API Endpoint |
|------------|--------------|-------------------|--------------|
| `inventory.view` | View Inventory | Main inventory display | `GET /api/inventory` |
| `inventory.create` | Add Inventory | Add stock form | `POST /api/inventory/add-stock` |
| `inventory.edit` | Edit Inventory | Edit stock quantities | `PUT /api/inventory/:id` |
| `inventory.delete` | Delete Inventory | Remove stock entries | `DELETE /api/inventory/:id` |
| `inventory.bulk_upload` | Bulk Upload | CSV upload interface | `POST /api/bulk-upload` |
| `inventory.export` | Export Inventory | Export CSV button | `GET /api/inventory/export` |
| `inventory.adjust` | Adjust Inventory | Stock adjustment form | `POST /api/inventory/adjust` |
| `inventory.timeline` | View Timeline | Product timeline | `GET /api/timeline/:productCode` |
| `inventory.transfer` | Transfer Stock | Inter-warehouse transfer | `POST /api/inventory/transfer` |

#### Sub-modules:

##### A. Bulk Upload Interface
**Component:** `BulkUploadModal.jsx`
```jsx
<PermissionGate permission="inventory.bulk_upload">
  <BulkUploadButton />
</PermissionGate>
```

##### B. Product Timeline
**Component:** `Timeline.jsx`
```jsx
<PermissionGate permission="inventory.timeline">
  <TimelineView productCode={barcode} />
</PermissionGate>
```

---

### 3. 🚚 ORDERS MODULE
**Location:** `/order`  
**Main Component:** `OrderSheet.jsx`

#### Features & Sub-components:
- **Order Management** - Create and manage orders
- **Dispatch Operations** - Create dispatch orders
- **Website Orders** - Handle online orders
- **Store Orders** - Manage in-store orders
- **Order Tracking** - Real-time status updates
- **Payment Tracking** - Monitor payment status

#### Required Permissions:
| Permission | Display Name | Component/Feature | API Endpoint |
|------------|--------------|-------------------|--------------|
| `orders.view` | View Orders | Order listing | `GET /api/orders` |
| `orders.create` | Create Orders | New order form | `POST /api/orders` |
| `orders.edit` | Edit Orders | Edit order details | `PUT /api/orders/:id` |
| `orders.delete` | Delete Orders | Cancel/delete orders | `DELETE /api/orders/:id` |
| `orders.dispatch` | Dispatch Orders | Dispatch creation | `POST /api/dispatch` |
| `orders.status_update` | Update Status | Status change buttons | `PUT /api/orders/:id/status` |
| `orders.export` | Export Orders | Export functionality | `GET /api/orders/export` |
| `orders.timeline` | View Timeline | Order timeline | `GET /api/order-tracking/:id/timeline` |

#### Sub-modules:

##### A. Dispatch Form
**Component:** `DispatchForm.jsx`
**Permission:** `operations.dispatch`
```jsx
<PermissionGate permission="operations.dispatch">
  <DispatchForm />
</PermissionGate>
```

##### B. Order Status Updates
```jsx
<PermissionGate permission="orders.status_update">
  <StatusUpdateButtons orderId={order.id} />
</PermissionGate>
```

---

### 4. 📍 TRACKING MODULE
**Location:** `/tracking`  
**Main Component:** `Order.js`

#### Features & Sub-components:
- **Order Tracking** - Real-time order status
- **Dispatch Timeline** - Detailed dispatch history
- **Status Updates** - Update order status
- **Damage Reporting** - Report damaged items
- **Delivery Confirmation** - Confirm deliveries

#### Required Permissions:
| Permission | Display Name | Component/Feature | API Endpoint |
|------------|--------------|-------------------|--------------|
| `tracking.view` | View Tracking | Tracking display | `GET /api/order-tracking` |
| `tracking.update` | Update Tracking | Status updates | `PUT /api/order-tracking/:id/status` |
| `orders.timeline` | View Timeline | Dispatch timeline | `GET /api/order-tracking/:id/timeline` |
| `operations.damage` | Report Damage | Damage reporting | `POST /api/order-tracking/:id/damage` |
| `orders.delete` | Delete Orders | Cancel dispatch | `DELETE /api/order-tracking/:id` |

---

### 5. ⚙️ OPERATIONS MODULE
**Modal-based Services** (No dedicated route)

#### Sub-modules:

##### A. Dispatch Operations
**Permission:** `operations.dispatch`
- Create dispatch orders
- Allocate products from inventory
- Generate dispatch documents
- Track dispatch status

##### B. Returns Processing
**Permission:** `operations.return`
- Process customer returns
- Quality inspection
- Automatic stock restoration
- Return reason tracking

##### C. Damage Management
**Permission:** `operations.damage`
- Report damaged items
- Damage recovery operations
- Loss tracking
- Insurance documentation

##### D. Self-Transfer
**Permission:** `operations.self_transfer`
- Inter-warehouse transfers
- Store-to-store transfers
- Transfer tracking

##### E. Bulk Operations
**Permission:** `operations.bulk`
- Bulk return processing
- Mass inventory updates
- Batch operations

#### Required Permissions:
| Permission | Display Name | Feature | API Endpoint |
|------------|--------------|---------|--------------|
| `operations.dispatch` | Dispatch Operations | Create/manage dispatch | `POST /api/dispatch` |
| `operations.return` | Return Operations | Process returns | `POST /api/returns` |
| `operations.damage` | Damage Operations | Report/recover damage | `POST /api/damage-recovery/damage` |
| `operations.recover` | Recovery Operations | Recover damaged items | `POST /api/damage-recovery/recover` |
| `operations.self_transfer` | Self Transfer | Inter-warehouse transfer | `POST /api/self-transfer/create` |
| `operations.bulk` | Bulk Operations | Mass operations | `POST /api/returns/bulk` |

---

### 6. 👥 PERMISSIONS MODULE
**Location:** `/permissions`  
**Main Components:** `PermissionsManager.jsx`, `RealPermissionsManager.jsx`

#### Features & Sub-components:
- **User Management** - CRUD operations for users
- **Role Management** - Create and manage roles
- **Permission Assignment** - Assign permissions to roles
- **Audit Logs** - View system activity logs
- **System Statistics** - Permission usage analytics

#### Required Permissions:
| Permission | Display Name | Component/Feature | API Endpoint |
|------------|--------------|-------------------|--------------|
| `SYSTEM_USER_MANAGEMENT` | User Management | User CRUD operations | `GET/POST/PUT/DELETE /api/users` |
| `SYSTEM_ROLE_MANAGEMENT` | Role Management | Role CRUD operations | `GET/POST/PUT/DELETE /api/roles` |
| `SYSTEM_PERMISSION_MANAGEMENT` | Permission Management | Permission assignment | `PUT /api/roles/:id/permissions` |
| `SYSTEM_AUDIT_LOG` | Audit Logs | View audit logs | `GET /api/audit-logs` |
| `SYSTEM_MONITORING` | System Monitoring | System statistics | `GET /api/system/stats` |

#### UI Permission Gates:
```jsx
// User management tab
<PermissionGate permission="SYSTEM_USER_MANAGEMENT">
  <UserManagementTab />
</PermissionGate>

// Role management tab
<PermissionGate permission="SYSTEM_ROLE_MANAGEMENT">
  <RoleManagementTab />
</PermissionGate>

// Audit logs tab
<PermissionGate permission="SYSTEM_AUDIT_LOG">
  <AuditLogsTab />
</PermissionGate>
```

---

### 7. 🧪 API TEST MODULE
**Location:** `/api-test`  
**Component:** `page.jsx`

#### Features:
- **API Testing Interface** - Test API endpoints
- **Request Builder** - Build API requests
- **Response Viewer** - View API responses
- **Authentication Testing** - Test JWT tokens

#### Required Permissions:
| Permission | Display Name | Feature | Access Level |
|------------|--------------|---------|--------------|
| `system.api_test` | API Testing | Access API test interface | Developer/Admin only |

---

### 8. 📊 DASHBOARD MODULE
**Location:** `/dashboard` (Currently disabled)  
**Component:** `Dashboard.jsx`

#### Planned Features:
- **Analytics Dashboard** - System metrics and KPIs
- **Real-time Statistics** - Live inventory and order stats
- **Charts and Graphs** - Visual data representation
- **Quick Actions** - Shortcut buttons for common tasks

#### Required Permissions:
| Permission | Display Name | Feature | API Endpoint |
|------------|--------------|---------|--------------|
| `dashboard.view` | View Dashboard | Access dashboard | `GET /api/dashboard` |
| `dashboard.analytics` | Dashboard Analytics | View analytics | `GET /api/dashboard/analytics` |
| `dashboard.export` | Export Dashboard | Export dashboard data | `GET /api/dashboard/export` |

---

## 📂 PERMISSION CATEGORIES

### 1. DASHBOARD (6 permissions)
- `dashboard.view` - View Dashboard
- `dashboard.analytics` - Dashboard Analytics  
- `dashboard.stats` - View Statistics
- `dashboard.charts` - View Charts
- `dashboard.export` - Export Dashboard
- `dashboard.customize` - Customize Dashboard

### 2. INVENTORY (15 permissions)
- `inventory.view` - View Inventory
- `inventory.create` - Create Inventory
- `inventory.edit` - Edit Inventory
- `inventory.delete` - Delete Inventory
- `inventory.bulk_upload` - Bulk Upload
- `inventory.bulk_export` - Bulk Export
- `inventory.transfer` - Transfer Inventory
- `inventory.adjust` - Adjust Inventory
- `inventory.audit` - Audit Inventory
- `inventory.timeline` - View Timeline
- `inventory.reports` - Inventory Reports
- `inventory.add` - Add Stock
- `inventory.export` - Export Inventory
- `inventory.low_stock` - Low Stock Alerts
- `inventory.snapshots` - Daily Snapshots

### 3. ORDERS (13 permissions)
- `orders.view` - View Orders
- `orders.create` - Create Orders
- `orders.edit` - Edit Orders
- `orders.delete` - Delete Orders
- `orders.process` - Process Orders
- `orders.dispatch` - Dispatch Orders
- `orders.returns` - Handle Returns
- `orders.bulk_process` - Bulk Process
- `orders.export` - Export Orders
- `orders.reports` - Order Reports
- `orders.timeline` - View Timeline
- `orders.status_update` - Update Status
- `orders.payment_tracking` - Payment Tracking

### 4. PRODUCTS (13 permissions)
- `products.view` - View Products
- `products.create` - Create Products
- `products.edit` - Edit Products
- `products.delete` - Delete Products
- `products.bulk_import` - Bulk Import
- `products.bulk_export` - Bulk Export
- `products.categories` - Manage Categories
- `products.pricing` - Manage Pricing
- `products.reports` - Product Reports
- `products.export` - Export Products
- `products.search` - Search Products
- `products.variants` - Manage Variants
- `products.barcodes` - Manage Barcodes

### 5. OPERATIONS (12 permissions)
- `operations.dispatch` - Dispatch Operations
- `operations.return` - Return Operations
- `operations.damage` - Damage Operations
- `operations.recover` - Recovery Operations
- `operations.self_transfer` - Self Transfer
- `operations.bulk` - Bulk Operations
- `operations.warehouse_manage` - Manage Warehouses
- `operations.logistics` - Manage Logistics
- `operations.quality_check` - Quality Checks
- `operations.stock_count` - Stock Counting
- `operations.reconciliation` - Reconciliation
- `operations.emergency` - Emergency Operations

### 6. TRACKING (6 permissions)
- `tracking.view` - View Tracking
- `tracking.update` - Update Tracking
- `tracking.create` - Create Tracking
- `tracking.bulk_update` - Bulk Update
- `tracking.reports` - Tracking Reports
- `tracking.notifications` - Tracking Notifications

### 7. SYSTEM (10 permissions)
- `SYSTEM_USER_MANAGEMENT` - User Management
- `SYSTEM_ROLE_MANAGEMENT` - Role Management
- `SYSTEM_PERMISSION_MANAGEMENT` - Permission Management
- `SYSTEM_AUDIT_LOG` - Audit Logs
- `SYSTEM_MONITORING` - System Monitoring
- `system.settings` - System Settings
- `system.backup` - System Backup
- `system.maintenance` - System Maintenance
- `system.api_test` - API Testing
- `system.database` - Database Access

### 8. MESSAGES (5 permissions)
- `messages.view` - View Messages
- `messages.send` - Send Messages
- `messages.delete` - Delete Messages
- `messages.moderate` - Moderate Messages
- `messages.export` - Export Messages

---

## 👤 ROLE DEFINITIONS

### 1. SUPER_ADMIN (Role ID: 1)
**Color:** Red (#dc2626)  
**Priority:** 1 (Highest)  
**Permissions:** All 153 permissions  
**Description:** Complete system access including user management

**Key Capabilities:**
- Full system administration
- User and role management
- System configuration
- Database access
- All operational permissions

### 2. ADMIN (Role ID: 2)
**Color:** Orange (#ea580c)  
**Priority:** 2  
**Permissions:** 38 permissions  
**Description:** Administrative access without user management

**Key Capabilities:**
- All inventory operations
- All order management
- All product management
- All operational tasks
- Reports and analytics
- **Excluded:** User/role management, system settings

### 3. MANAGER (Role ID: 3)
**Color:** Yellow (#ca8a04)  
**Priority:** 3  
**Permissions:** 31 permissions  
**Description:** Management level access with reporting

**Key Capabilities:**
- View all modules
- Create and edit operations
- Generate reports
- Manage day-to-day operations
- **Excluded:** System administration, user management

### 4. OPERATOR (Role ID: 4)
**Color:** Green (#16a34a)  
**Priority:** 4  
**Permissions:** 16 permissions  
**Description:** Daily operational tasks

**Key Capabilities:**
- View inventory and products
- Create and update orders
- Process dispatches and returns
- Basic inventory operations
- **Excluded:** Deletion, system settings, user management

### 5. WAREHOUSE_STAFF (Role ID: 5)
**Color:** Blue (#2563eb)  
**Priority:** 5  
**Permissions:** 9 permissions  
**Description:** Warehouse-focused operations

**Key Capabilities:**
- Inventory management
- Stock adjustments
- Dispatch operations
- Damage reporting
- **Excluded:** Orders, products, system access

### 6. VIEWER (Role ID: 6)
**Color:** Gray (#6b7280)  
**Priority:** 6 (Lowest)  
**Permissions:** 5 permissions  
**Description:** Read-only access

**Key Capabilities:**
- View inventory
- View products
- View orders
- View tracking information
- **Excluded:** All create, edit, delete operations

---

## 🔗 API ENDPOINT PERMISSIONS

### Authentication Endpoints (No permissions required)
```
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
POST /api/auth/change-password
```

### User Management Endpoints
```
GET    /api/users              → SYSTEM_USER_MANAGEMENT
GET    /api/users/:id          → SYSTEM_USER_MANAGEMENT
POST   /api/users              → SYSTEM_USER_MANAGEMENT
PUT    /api/users/:id          → SYSTEM_USER_MANAGEMENT
DELETE /api/users/:id          → SYSTEM_USER_MANAGEMENT
PUT    /api/users/:id/role     → SYSTEM_USER_MANAGEMENT
```

### Role Management Endpoints
```
GET    /api/roles              → Public (for dropdowns)
GET    /api/roles/:id          → SYSTEM_ROLE_MANAGEMENT
POST   /api/roles              → SYSTEM_ROLE_MANAGEMENT
PUT    /api/roles/:id          → SYSTEM_ROLE_MANAGEMENT
DELETE /api/roles/:id          → SYSTEM_ROLE_MANAGEMENT
```

### Permission Management Endpoints
```
GET /api/permissions           → Public (for UI)
PUT /api/roles/:id/permissions → SYSTEM_ROLE_MANAGEMENT
```

### Inventory Endpoints
```
GET    /api/inventory          → inventory.view
GET    /api/inventory/export   → inventory.export
POST   /api/inventory/add-stock → inventory.adjust
GET    /api/timeline/:code     → inventory.timeline
```

### Product Endpoints
```
GET    /api/products           → products.view
POST   /api/products           → products.create
PUT    /api/products/:id       → products.edit
DELETE /api/products/:id       → products.delete
GET    /api/products/categories → products.view
POST   /api/products/bulk-import → products.bulk_import
```

### Order Endpoints
```
GET    /api/orders             → orders.view
POST   /api/orders             → orders.create
PUT    /api/orders/:id         → orders.edit
DELETE /api/orders/:id         → orders.delete
PUT    /api/orders/:id/status  → orders.status_update
```

### Dispatch Endpoints
```
POST /api/dispatch             → operations.dispatch
GET  /api/dispatch             → orders.view
PUT  /api/dispatch/:id/status  → orders.status_update
GET  /api/dispatch/search-products → products.view
GET  /api/dispatch/check-inventory → inventory.view
```

### Operations Endpoints
```
POST /api/returns              → operations.return
POST /api/damage-recovery/damage → operations.damage
POST /api/damage-recovery/recover → operations.damage
POST /api/self-transfer/create → operations.self_transfer
POST /api/bulk-upload          → inventory.bulk_upload
```

### Tracking Endpoints
```
GET  /api/order-tracking       → orders.view
GET  /api/order-tracking/stats → orders.view
GET  /api/order-tracking/:id/timeline → inventory.timeline
POST /api/order-tracking/:id/damage → operations.damage
DELETE /api/order-tracking/:id → orders.delete
```

---

## 🎨 FRONTEND COMPONENT PERMISSIONS

### Sidebar Navigation
```jsx
// Products menu item
<PermissionGate permission="products.view">
  <SidebarItem href="/products" icon={Package}>Products</SidebarItem>
</PermissionGate>

// Inventory menu item
<PermissionGate permission="inventory.view">
  <SidebarItem href="/inventory" icon={Warehouse}>Inventory</SidebarItem>
</PermissionGate>

// Orders menu item
<PermissionGate permission="orders.view">
  <SidebarItem href="/order" icon={Truck}>Orders</SidebarItem>
</PermissionGate>

// Tracking menu item
<PermissionGate permission="tracking.view">
  <SidebarItem href="/tracking" icon={MapPin}>Tracking</SidebarItem>
</PermissionGate>

// Permissions menu item (Admin only)
<PermissionGate permission="SYSTEM_USER_MANAGEMENT">
  <SidebarItem href="/permissions" icon={Users}>Permissions</SidebarItem>
</PermissionGate>
```

### Action Buttons
```jsx
// Create buttons
<PermissionGate permission="products.create">
  <Button onClick={createProduct}>Add Product</Button>
</PermissionGate>

<PermissionGate permission="orders.create">
  <Button onClick={createOrder}>New Order</Button>
</PermissionGate>

<PermissionGate permission="operations.dispatch">
  <Button onClick={createDispatch}>Create Dispatch</Button>
</PermissionGate>

// Edit buttons
<PermissionGate permission="products.edit">
  <EditButton productId={product.id} />
</PermissionGate>

<PermissionGate permission="orders.edit">
  <EditButton orderId={order.id} />
</PermissionGate>

// Delete buttons
<PermissionGate permission="products.delete">
  <DeleteButton productId={product.id} />
</PermissionGate>

<PermissionGate permission="orders.delete">
  <DeleteButton orderId={order.id} />
</PermissionGate>

// Export buttons
<PermissionGate permission="inventory.export">
  <ExportButton data={inventoryData} />
</PermissionGate>

<PermissionGate permission="orders.export">
  <ExportButton data={ordersData} />
</PermissionGate>
```

### Modal Components
```jsx
// Bulk upload modal
<PermissionGate permission="inventory.bulk_upload">
  <BulkUploadModal />
</PermissionGate>

// User management modal
<PermissionGate permission="SYSTEM_USER_MANAGEMENT">
  <UserManagementModal />
</PermissionGate>

// Role management modal
<PermissionGate permission="SYSTEM_ROLE_MANAGEMENT">
  <RoleManagementModal />
</PermissionGate>
```

### Table Columns
```jsx
// Actions column in tables
const columns = [
  // ... other columns
  {
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex gap-2">
        <PermissionGate permission="products.edit">
          <EditButton productId={row.id} />
        </PermissionGate>
        <PermissionGate permission="products.delete">
          <DeleteButton productId={row.id} />
        </PermissionGate>
        <PermissionGate permission="inventory.timeline">
          <TimelineButton barcode={row.barcode} />
        </PermissionGate>
      </div>
    )
  }
];
```

---

## 🛠️ IMPLEMENTATION GUIDE

### 1. Backend Implementation

#### A. Middleware Setup
```javascript
// middleware/auth.js
const checkPermission = (permissionName) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            const roleId = req.user.role_id;

            const permissionQuery = `
                SELECT p.name 
                FROM permissions p
                JOIN role_permissions rp ON p.id = rp.permission_id
                WHERE rp.role_id = ? AND p.name = ?
                LIMIT 1
            `;

            db.query(permissionQuery, [roleId, permissionName], (err, results) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: 'Permission check failed'
                    });
                }

                if (results.length === 0) {
                    return res.status(403).json({
                        success: false,
                        message: 'Insufficient permissions',
                        required_permission: permissionName
                    });
                }

                next();
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Permission check failed'
            });
        }
    };
};
```

#### B. Route Protection
```javascript
// routes/productRoutes.js
router.get('/', 
    authenticateToken, 
    checkPermission('products.view'), 
    ProductController.getAllProducts
);

router.post('/', 
    authenticateToken, 
    checkPermission('products.create'), 
    ProductController.createProduct
);

router.put('/:id', 
    authenticateToken, 
    checkPermission('products.edit'), 
    ProductController.updateProduct
);

router.delete('/:id', 
    authenticateToken, 
    checkPermission('products.delete'), 
    ProductController.deleteProduct
);
```

### 2. Frontend Implementation

#### A. Permission Context
```jsx
// contexts/PermissionsContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const PermissionsContext = createContext();

export const PermissionsProvider = ({ children }) => {
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUserPermissions();
    }, []);

    const loadUserPermissions = async () => {
        try {
            const response = await fetch('/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setPermissions(data.user.permissions || []);
        } catch (error) {
            console.error('Failed to load permissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const hasPermission = (permission) => {
        return permissions.includes(permission);
    };

    return (
        <PermissionsContext.Provider value={{
            permissions,
            hasPermission,
            loading
        }}>
            {children}
        </PermissionsContext.Provider>
    );
};

export const usePermissions = () => {
    const context = useContext(PermissionsContext);
    if (!context) {
        throw new Error('usePermissions must be used within PermissionsProvider');
    }
    return context;
};
```

#### B. Permission Gate Component
```jsx
// components/PermissionGate.jsx
import { usePermissions } from '../contexts/PermissionsContext';

const PermissionGate = ({ permission, children, fallback = null }) => {
    const { hasPermission, loading } = usePermissions();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!hasPermission(permission)) {
        return fallback;
    }

    return children;
};

export default PermissionGate;
```

#### C. Permission Hook
```jsx
// hooks/usePermissions.js
import { usePermissions as usePermissionsContext } from '../contexts/PermissionsContext';

export const usePermissions = () => {
    const { permissions, hasPermission, loading } = usePermissionsContext();

    const hasAnyPermission = (permissionList) => {
        return permissionList.some(permission => hasPermission(permission));
    };

    const hasAllPermissions = (permissionList) => {
        return permissionList.every(permission => hasPermission(permission));
    };

    return {
        permissions,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        loading
    };
};
```

### 3. Database Setup

#### A. Create Tables
```sql
-- Create roles table
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6366f1',
    priority INT DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create permissions table
CREATE TABLE permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create role_permissions junction table
CREATE TABLE role_permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_permission (role_id, permission_id)
);

-- Add role_id to users table
ALTER TABLE users ADD COLUMN role_id INT;
ALTER TABLE users ADD FOREIGN KEY (role_id) REFERENCES roles(id);
```

#### B. Insert Default Data
```sql
-- Insert default roles
INSERT INTO roles (id, name, display_name, description, color, priority) VALUES
(1, 'super_admin', 'Super Administrator', 'Full system access', '#dc2626', 1),
(2, 'admin', 'Administrator', 'Administrative access', '#ea580c', 2),
(3, 'manager', 'Manager', 'Management access', '#ca8a04', 3),
(4, 'operator', 'Operator', 'Operational access', '#16a34a', 4),
(5, 'warehouse_staff', 'Warehouse Staff', 'Warehouse operations', '#2563eb', 5),
(6, 'viewer', 'Viewer', 'Read-only access', '#6b7280', 6);

-- Insert permissions (example for products category)
INSERT INTO permissions (name, display_name, description, category) VALUES
('products.view', 'View Products', 'View product catalog and details', 'PRODUCTS'),
('products.create', 'Create Products', 'Add new products to catalog', 'PRODUCTS'),
('products.edit', 'Edit Products', 'Modify existing product information', 'PRODUCTS'),
('products.delete', 'Delete Products', 'Remove products from catalog', 'PRODUCTS'),
('products.categories', 'Manage Categories', 'Manage product categories', 'PRODUCTS'),
('products.bulk_import', 'Bulk Import Products', 'Import products in bulk', 'PRODUCTS'),
('products.export', 'Export Products', 'Export product data', 'PRODUCTS');

-- Assign all permissions to super_admin (role_id = 1)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;
```

### 4. Testing Implementation

#### A. Permission Testing Script
```javascript
// test-permissions.js
const testUserPermissions = async (userId, expectedPermissions) => {
    try {
        const response = await fetch(`/api/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const userData = await response.json();
        const userPermissions = userData.data.permissions.map(p => p.name);
        
        console.log('User Permissions:', userPermissions);
        console.log('Expected Permissions:', expectedPermissions);
        
        const hasAllPermissions = expectedPermissions.every(
            permission => userPermissions.includes(permission)
        );
        
        console.log('Test Result:', hasAllPermissions ? 'PASS' : 'FAIL');
        
        return hasAllPermissions;
    } catch (error) {
        console.error('Permission test failed:', error);
        return false;
    }
};

// Test admin user
testUserPermissions(1, [
    'products.view', 'products.create', 'products.edit',
    'inventory.view', 'inventory.create', 'inventory.edit',
    'orders.view', 'orders.create', 'orders.edit'
]);
```

#### B. API Endpoint Testing
```javascript
// test-api-permissions.js
const testAPIPermissions = async () => {
    const tests = [
        {
            endpoint: '/api/products',
            method: 'GET',
            permission: 'products.view',
            expectedStatus: 200
        },
        {
            endpoint: '/api/products',
            method: 'POST',
            permission: 'products.create',
            expectedStatus: 201
        },
        {
            endpoint: '/api/inventory',
            method: 'GET',
            permission: 'inventory.view',
            expectedStatus: 200
        }
    ];

    for (const test of tests) {
        try {
            const response = await fetch(test.endpoint, {
                method: test.method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const passed = response.status === test.expectedStatus;
            console.log(`${test.method} ${test.endpoint}: ${passed ? 'PASS' : 'FAIL'}`);
        } catch (error) {
            console.error(`Test failed for ${test.endpoint}:`, error);
        }
    }
};
```

---

## 📊 SUMMARY STATISTICS

### System Totals:
- **Total Permissions:** 153
- **Permission Categories:** 8 main categories
- **Predefined Roles:** 6 roles
- **API Endpoints:** 80+ endpoints
- **Frontend Components:** 50+ components
- **Database Tables:** 12+ tables

### Permission Distribution by Role:
- **SUPER_ADMIN:** 153 permissions (100%)
- **ADMIN:** 38 permissions (25%)
- **MANAGER:** 31 permissions (20%)
- **OPERATOR:** 16 permissions (10%)
- **WAREHOUSE_STAFF:** 9 permissions (6%)
- **VIEWER:** 5 permissions (3%)

### Component Coverage:
- **Products Module:** 8 permissions
- **Inventory Module:** 15 permissions
- **Orders Module:** 13 permissions
- **Operations Module:** 12 permissions
- **Tracking Module:** 6 permissions
- **System Module:** 10 permissions
- **Dashboard Module:** 6 permissions
- **Messages Module:** 5 permissions

---

## 🔄 MAINTENANCE & UPDATES

### Adding New Permissions:
1. **Database:** Insert new permission in `permissions` table
2. **Backend:** Add permission check to relevant API endpoints
3. **Frontend:** Add permission gates to UI components
4. **Roles:** Assign permission to appropriate roles
5. **Testing:** Test permission functionality

### Adding New Roles:
1. **Database:** Insert new role in `roles` table
2. **Permissions:** Assign appropriate permissions via `role_permissions`
3. **Frontend:** Update role selection dropdowns
4. **Testing:** Test role functionality

### Permission Auditing:
- Regular review of permission assignments
- Monitor permission usage via audit logs
- Remove unused permissions
- Update role definitions as needed

---

**Document Version:** 1.0  
**Last Updated:** January 20, 2026  
**Next Review:** February 20, 2026