# StockIQ - Enterprise Inventory Management System

A comprehensive, full-stack inventory management solution built with modern web technologies, designed for multi-warehouse operations with advanced tracking, permissions, and real-time analytics.

## 🏢 System Overview

StockIQ is an enterprise-grade inventory management system that provides complete visibility and control over warehouse operations across multiple locations. The system handles product lifecycle management, order processing, dispatch operations, damage recovery, and comprehensive audit trails.

### Core Business Logic

The system operates on a **double-entry ledger principle** where every inventory movement is recorded with:
- **Direction**: IN (stock increase) or OUT (stock decrease)
- **Movement Type**: BULK_UPLOAD, DISPATCH, DAMAGE, RECOVER, RETURN, SELF_TRANSFER
- **Warehouse Context**: All operations are warehouse-specific
- **Audit Trail**: Complete timeline with user attribution and timestamps

## 🎯 Key Features

### 📊 **Dashboard & Analytics**
- Real-time inventory metrics across all warehouses
- Stock level monitoring with automated alerts
- Movement analytics and trend visualization
- Performance KPIs and operational insights

### 📦 **Inventory Management**
- **Multi-warehouse Support**: GGM_WH, BLR_WH, MUM_WH, AMD_WH, HYD_WH
- **Real-time Stock Tracking**: Live inventory levels with batch management
- **Product Timeline**: Complete movement history for each product
- **Advanced Filtering**: By warehouse, date range, stock status, and search terms
- **Bulk Operations**: CSV/Excel import with validation and error handling

### 🛒 **Order Processing**
- **Order Creation**: Manual and website order integration
- **Dispatch Management**: AWB generation, logistics integration, dimension capture
- **Order Tracking**: Real-time status updates with customer notifications
- **Billing Integration**: Invoice generation and payment tracking

### 🔄 **Operations Management**
- **Damage Recovery**: Report damaged items and track recovery processes
- **Returns Processing**: Handle customer returns with inventory reconciliation
- **Self Transfers**: Inter-warehouse stock movements with approval workflows
- **Bulk Upload**: Mass inventory updates with validation and rollback capabilities

### 🔐 **Security & Permissions**
- **Role-based Access Control**: Super Admin, Admin, Manager, Operator roles
- **Granular Permissions**: 25+ permission types for fine-grained access control
- **Audit Logging**: Complete user activity tracking with human-readable logs
- **JWT Authentication**: Secure token-based authentication with refresh tokens

### 💬 **Team Collaboration**
- **Real-time Messaging**: Team communication with file sharing
- **Notification System**: Automated alerts for critical operations
- **Activity Feeds**: Live updates on system activities

## 🏗️ Technical Architecture

### Frontend Stack
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom component library
- **State Management**: React Context API with custom hooks
- **UI Components**: Shadcn/ui with custom extensions
- **Authentication**: JWT with automatic refresh
- **API Integration**: Axios with interceptors and error handling

### Backend Stack
- **Runtime**: Node.js with Express.js
- **Database**: MySQL with connection pooling
- **Authentication**: JWT with bcrypt password hashing
- **File Upload**: Multer with validation
- **API Design**: RESTful with consistent response patterns
- **Middleware**: Custom auth, permissions, and error handling

## 📦 Dependencies & Node Modules

### Frontend Dependencies
```json
{
  "@radix-ui/react-alert-dialog": "^1.0.5",    // Alert dialogs and modals
  "@radix-ui/react-dialog": "^1.0.5",          // Dialog components
  "@radix-ui/react-separator": "^1.0.3",       // UI separators
  "@radix-ui/react-slot": "^1.0.2",            // Slot component for composition
  "@radix-ui/react-tooltip": "^1.0.7",         // Tooltip components
  "axios": "^1.13.2",                          // HTTP client for API calls
  "class-variance-authority": "^0.7.0",        // CSS class variance utility
  "clsx": "^2.0.0",                            // Conditional CSS classes
  "framer-motion": "^10.16.4",                 // Animation library
  "lucide-react": "^0.292.0",                  // Icon library
  "next": "14.0.0",                            // React framework
  "react": "^18",                              // React library
  "react-chat-elements": "^12.0.18",           // Chat UI components
  "react-dom": "^18",                          // React DOM renderer
  "react-leaflet": "^4.2.1",                   // Map components
  "recharts": "^2.8.0",                        // Chart library
  "tailwind-merge": "^2.0.0"                   // Tailwind CSS utility merger
}
```

### Backend Dependencies
```json
{
  "bcrypt": "^6.0.0",                          // Password hashing
  "bcryptjs": "^3.0.3",                        // Alternative bcrypt implementation
  "cors": "^2.8.5",                            // Cross-origin resource sharing
  "csv-parser": "^3.0.0",                      // CSV file parsing
  "dotenv": "^17.2.3",                         // Environment variable loader
  "express": "^4.18.2",                        // Web framework
  "jsonwebtoken": "^9.0.3",                    // JWT token handling
  "leaflet": "^1.9.4",                         // Interactive maps
  "morgan": "^1.10.1",                         // HTTP request logger
  "multer": "^1.4.5-lts.1",                    // File upload middleware
  "mysql2": "^3.6.5",                          // MySQL database driver
  "xlsx": "^0.18.5"                            // Excel file processing
}
```

### Development Dependencies
```json
{
  "autoprefixer": "^10.0.1",                   // CSS autoprefixer
  "eslint": "^8",                              // JavaScript linter
  "eslint-config-next": "14.0.0",              // Next.js ESLint config
  "postcss": "^8",                             // CSS processor
  "tailwindcss": "^3.3.0",                     // Utility-first CSS framework
  "tailwindcss-animate": "^1.0.7"              // Tailwind CSS animations
}
```

### Database Architecture

#### Core Tables Structure

```sql
-- Product Management
products (id, name, category, barcode, specifications)
product_categories (id, name, description)

-- Inventory Tracking
inventory_ledger_base (
    id, barcode, product_name, warehouse, 
    movement_type, direction, qty, event_time,
    reference, user_id, created_at
)

stock_batches (
    id, barcode, warehouse, batch_id,
    qty_available, status, created_at
)

-- Operations
warehouse_dispatch (
    id, customer, awb, barcode, 
    length, width, height, actual_weight,
    logistics, payment_mode, status
)

damage_recovery (
    id, barcode, warehouse, damage_qty,
    recovery_qty, reason, status
)

-- User Management
users (id, name, email, password_hash, role_id, status)
roles (id, name, display_name, permissions)
audit_logs (id, user_id, action, details, timestamp)
```

#### Data Flow Architecture

1. **Inventory Movements**: All stock changes flow through `inventory_ledger_base`
2. **Stock Calculation**: Real-time stock computed from ledger entries
3. **Batch Management**: Physical stock organized in `stock_batches`
4. **Audit Trail**: Every operation logged with user context
5. **Permission Validation**: All operations checked against user permissions

## 🔌 Complete API Documentation

### API Flow Architecture
```
Client Request → JWT Authentication → Permission Check → Controller → Database → Response
```

### Base URL
- **Development**: `http://localhost:5000/api`
- **Production**: `https://your-backend-domain.com/api`

### Authentication Flow
1. **Login**: `POST /api/auth/login` → Returns JWT token
2. **Token Validation**: All protected routes require `Authorization: Bearer <token>`
3. **Permission Check**: Each endpoint validates user permissions
4. **Auto Refresh**: Frontend automatically refreshes expired tokens

---

## 📋 Complete API Endpoints (35+ APIs)

### 🔐 Authentication APIs (4 endpoints)

#### POST /api/auth/login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "admin@123"
}

Response: {
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "System Administrator",
    "email": "admin@company.com",
    "role": "super_admin",
    "permissions": ["INVENTORY_VIEW", "ORDERS_CREATE", ...]
  }
}
```

#### GET /api/auth/me
```http
GET /api/auth/me
Authorization: Bearer <token>

Response: {
  "success": true,
  "user": { "id": 1, "name": "Admin", "role": "super_admin" }
}
```

#### POST /api/auth/logout
```http
POST /api/auth/logout
Authorization: Bearer <token>

Response: { "success": true, "message": "Logged out successfully" }
```

#### POST /api/auth/change-password
```http
POST /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

---

### 📦 Inventory Management APIs (5 endpoints)

#### GET /api/inventory
```http
GET /api/inventory?warehouse=GGM_WH&dateFrom=2025-01-01&dateTo=2025-12-31&search=product&stockFilter=in-stock&sortBy=product_name&sortOrder=asc&page=1&limit=50
Authorization: Bearer <token>
Permission: INVENTORY_VIEW

Response: {
  "success": true,
  "data": [
    {
      "barcode": "ABC123",
      "product_name": "Samsung Galaxy S21",
      "warehouse": "GGM_WH",
      "current_stock": 45,
      "last_updated": "2025-01-20T10:30:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 50, "total": 150 }
}
```

#### GET /api/inventory/by-warehouse
```http
GET /api/inventory/by-warehouse?warehouse=BLR_WH
Authorization: Bearer <token>
Permission: INVENTORY_VIEW
```

#### GET /api/inventory/export
```http
GET /api/inventory/export?warehouse=GGM_WH&format=csv
Authorization: Bearer <token>
Permission: INVENTORY_VIEW

Response: CSV file download
```

#### POST /api/inventory/add-stock
```http
POST /api/inventory/add-stock
Authorization: Bearer <token>
Permission: INVENTORY_EDIT
Content-Type: application/json

{
  "barcode": "ABC123",
  "warehouse": "GGM_WH",
  "quantity": 10,
  "reason": "Stock replenishment"
}
```

#### GET /api/inventory/timeline/:productCode
```http
GET /api/inventory/timeline/ABC123?warehouse=GGM_WH&limit=50
Authorization: Bearer <token>
Permission: INVENTORY_TIMELINE
```

---

### 🛍️ Product Management APIs (15 endpoints)

#### GET /api/products
```http
GET /api/products?page=1&limit=50&search=samsung&category=electronics
Authorization: Bearer <token>
Permission: PRODUCTS_VIEW

Response: {
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Samsung Galaxy S21",
      "barcode": "ABC123",
      "category": "Electronics",
      "price": 699.99,
      "created_at": "2025-01-15T08:00:00Z"
    }
  ]
}
```

#### POST /api/products
```http
POST /api/products
Authorization: Bearer <token>
Permission: PRODUCTS_CREATE
Content-Type: application/json

{
  "name": "iPhone 14 Pro",
  "barcode": "IPH14PRO001",
  "category": "Electronics",
  "price": 999.99,
  "description": "Latest iPhone model"
}
```

#### PUT /api/products/:id
```http
PUT /api/products/1
Authorization: Bearer <token>
Permission: PRODUCTS_EDIT
Content-Type: application/json

{
  "name": "iPhone 14 Pro Max",
  "price": 1099.99
}
```

#### DELETE /api/products/:id
```http
DELETE /api/products/1
Authorization: Bearer <token>
Permission: PRODUCTS_DELETE
```

#### GET /api/products/search/:barcode
```http
GET /api/products/search/ABC123
Authorization: Bearer <token>
Permission: PRODUCTS_VIEW
```

#### GET /api/products/inventory
```http
GET /api/products/inventory?warehouse=GGM_WH
Authorization: Bearer <token>
Permission: PRODUCTS_VIEW
```

#### GET /api/products/inventory/by-warehouse/:warehouse
```http
GET /api/products/inventory/by-warehouse/BLR_WH
Authorization: Bearer <token>
Permission: PRODUCTS_VIEW
```

#### GET /api/products/inventory/export
```http
GET /api/products/inventory/export?format=csv&warehouse=GGM_WH
Authorization: Bearer <token>
Permission: PRODUCTS_EXPORT
```

#### POST /api/products/transfer
```http
POST /api/products/transfer
Authorization: Bearer <token>
Permission: PRODUCTS_SELF_TRANSFER
Content-Type: application/json

{
  "barcode": "ABC123",
  "fromWarehouse": "GGM_WH",
  "toWarehouse": "BLR_WH",
  "quantity": 5
}
```

#### POST /api/products/bulk/transfer
```http
POST /api/products/bulk/transfer
Authorization: Bearer <token>
Permission: PRODUCTS_SELF_TRANSFER
Content-Type: application/json

{
  "transfers": [
    {
      "barcode": "ABC123",
      "fromWarehouse": "GGM_WH",
      "toWarehouse": "BLR_WH",
      "quantity": 5
    }
  ]
}
```

#### GET /api/products/inventory/:barcode
```http
GET /api/products/inventory/ABC123
Authorization: Bearer <token>
Permission: PRODUCTS_VIEW
```

#### POST /api/products/bulk/import
```http
POST /api/products/bulk/import
Authorization: Bearer <token>
Permission: PRODUCTS_BULK_IMPORT
Content-Type: multipart/form-data

file: products.csv
```

#### POST /api/products/bulk/import/progress
```http
POST /api/products/bulk/import/progress
Authorization: Bearer <token>
Permission: PRODUCTS_BULK_IMPORT
Content-Type: multipart/form-data

file: products.xlsx
```

#### GET /api/products/categories/all
```http
GET /api/products/categories/all
Authorization: Bearer <token>
Permission: PRODUCTS_CATEGORIES

Response: {
  "success": true,
  "data": [
    { "id": 1, "name": "Electronics", "description": "Electronic devices" },
    { "id": 2, "name": "Clothing", "description": "Apparel and accessories" }
  ]
}
```

#### POST /api/products/categories
```http
POST /api/products/categories
Authorization: Bearer <token>
Permission: PRODUCTS_CATEGORIES
Content-Type: application/json

{
  "name": "Home & Garden",
  "description": "Home improvement and garden supplies"
}
```

#### GET /api/products/warehouses
```http
GET /api/products/warehouses
Authorization: Bearer <token>
Permission: PRODUCTS_VIEW

Response: {
  "success": true,
  "data": [
    { "code": "GGM_WH", "name": "Gurgaon Warehouse" },
    { "code": "BLR_WH", "name": "Bangalore Warehouse" }
  ]
}
```

---

### 🚚 Dispatch & Order Management APIs (8 endpoints)

#### POST /api/dispatch
```http
POST /api/dispatch
Authorization: Bearer <token>
Permission: OPERATIONS_DISPATCH
Content-Type: application/json

{
  "customer": "John Doe",
  "awb": "AWB123456789",
  "barcode": "ABC123",
  "warehouse": "GGM_WH",
  "quantity": 2,
  "logistics": "BlueDart",
  "payment_mode": "COD",
  "invoice_amount": 1299.98,
  "length": 25.5,
  "width": 15.0,
  "height": 10.0,
  "actual_weight": 2.5
}
```

#### GET /api/dispatch
```http
GET /api/dispatch?warehouse=GGM_WH&status=Pending&dateFrom=2025-01-01&dateTo=2025-12-31&search=customer&page=1&limit=50
Authorization: Bearer <token>
Permission: OPERATIONS_DISPATCH
```

#### PUT /api/dispatch/:id/status
```http
PUT /api/dispatch/123/status
Authorization: Bearer <token>
Permission: OPERATIONS_DISPATCH
Content-Type: application/json

{
  "status": "Delivered",
  "notes": "Package delivered successfully"
}
```

#### GET /api/dispatch/warehouses
```http
GET /api/dispatch/warehouses
Authorization: Bearer <token>
Permission: OPERATIONS_DISPATCH
```

#### GET /api/dispatch/search-products
```http
GET /api/dispatch/search-products?query=samsung&warehouse=GGM_WH
Authorization: Bearer <token>
Permission: OPERATIONS_DISPATCH
```

#### GET /api/dispatch/check-inventory
```http
GET /api/dispatch/check-inventory?warehouse=GGM_WH&barcode=ABC123&qty=2
Authorization: Bearer <token>
Permission: OPERATIONS_DISPATCH

Response: {
  "success": true,
  "available": true,
  "current_stock": 45,
  "requested_qty": 2,
  "remaining_after": 43
}
```

#### GET /api/dispatch/logistics
```http
GET /api/dispatch/logistics
Authorization: Bearer <token>
Permission: OPERATIONS_DISPATCH

Response: {
  "success": true,
  "data": ["BlueDart", "DTDC", "Delhivery", "Ecom Express"]
}
```

#### GET /api/dispatch/payment-modes
```http
GET /api/dispatch/payment-modes
Authorization: Bearer <token>
Permission: OPERATIONS_DISPATCH

Response: {
  "success": true,
  "data": ["COD", "Prepaid", "Credit", "UPI"]
}
```

---

### 📊 Order Tracking APIs (6 endpoints)

#### GET /api/order-tracking
```http
GET /api/order-tracking?warehouse=BLR_WH&status=Pending&page=1&limit=20
Authorization: Bearer <token>
Permission: ORDERS_VIEW

Response: {
  "success": true,
  "data": [
    {
      "id": 17,
      "customer": "Jane Smith",
      "awb": "AWB987654321",
      "status": "In Transit",
      "created_at": "2025-01-20T14:30:00Z",
      "items": [
        {
          "barcode": "XYZ789",
          "product_name": "iPhone 14",
          "quantity": 1
        }
      ]
    }
  ]
}
```

#### GET /api/order-tracking/stats
```http
GET /api/order-tracking/stats?warehouse=BLR_WH&dateFrom=2025-01-01
Authorization: Bearer <token>
Permission: ORDERS_VIEW

Response: {
  "success": true,
  "data": {
    "total_orders": 150,
    "pending": 25,
    "in_transit": 45,
    "delivered": 80,
    "total_value": 125000.50
  }
}
```

#### GET /api/order-tracking/:dispatchId/timeline
```http
GET /api/order-tracking/17/timeline
Authorization: Bearer <token>
Permission: INVENTORY_TIMELINE
```

#### POST /api/order-tracking/:dispatchId/damage
```http
POST /api/order-tracking/17/damage
Authorization: Bearer <token>
Permission: OPERATIONS_DAMAGE
Content-Type: application/json

{
  "product_name": "iPhone 14",
  "barcode": "XYZ789",
  "warehouse": "BLR_WH",
  "quantity": 1,
  "reason": "Screen cracked during transit"
}
```

#### DELETE /api/order-tracking/:dispatchId
```http
DELETE /api/order-tracking/17
Authorization: Bearer <token>
Permission: ORDERS_EDIT
```

#### PATCH /api/order-tracking/:dispatchId/status
```http
PATCH /api/order-tracking/17/status
Authorization: Bearer <token>
Permission: ORDERS_EDIT
Content-Type: application/json

{
  "status": "Delivered"
}
```

---

### 🔄 Operations APIs (12 endpoints)

#### Bulk Upload APIs (4 endpoints)

##### POST /api/bulk-upload
```http
POST /api/bulk-upload
Authorization: Bearer <token>
Permission: inventory.bulk_upload
Content-Type: multipart/form-data

file: inventory.csv
warehouse: GGM_WH
```

##### POST /api/bulk-upload/progress
```http
POST /api/bulk-upload/progress
Authorization: Bearer <token>
Permission: inventory.bulk_upload
Content-Type: multipart/form-data

file: inventory.xlsx
```

##### GET /api/bulk-upload/warehouses
```http
GET /api/bulk-upload/warehouses
Authorization: Bearer <token>
```

##### GET /api/bulk-upload/history
```http
GET /api/bulk-upload/history?page=1&limit=20
Authorization: Bearer <token>
Permission: inventory.bulk_upload
```

#### Damage Recovery APIs (6 endpoints)

##### POST /api/damage-recovery/damage
```http
POST /api/damage-recovery/damage
Authorization: Bearer <token>
Permission: operations.damage
Content-Type: application/json

{
  "barcode": "ABC123",
  "warehouse": "GGM_WH",
  "quantity": 3,
  "reason": "Water damage during storage"
}
```

##### POST /api/damage-recovery/recover
```http
POST /api/damage-recovery/recover
Authorization: Bearer <token>
Permission: operations.damage
Content-Type: application/json

{
  "barcode": "ABC123",
  "warehouse": "GGM_WH",
  "quantity": 2,
  "reason": "Items restored after cleaning"
}
```

##### GET /api/damage-recovery/log
```http
GET /api/damage-recovery/log?warehouse=GGM_WH&page=1&limit=50
Authorization: Bearer <token>
Permission: operations.damage
```

##### GET /api/damage-recovery/warehouses
```http
GET /api/damage-recovery/warehouses
Authorization: Bearer <token>
```

##### GET /api/damage-recovery/search-products
```http
GET /api/damage-recovery/search-products?query=samsung
Authorization: Bearer <token>
Permission: products.view
```

##### GET /api/damage-recovery/summary
```http
GET /api/damage-recovery/summary?warehouse=GGM_WH
Authorization: Bearer <token>
Permission: operations.damage
```

#### Returns APIs (2 endpoints)

##### POST /api/returns
```http
POST /api/returns
Authorization: Bearer <token>
Permission: OPERATIONS_RETURN
Content-Type: application/json

{
  "customer": "John Doe",
  "barcode": "ABC123",
  "warehouse": "GGM_WH",
  "quantity": 1,
  "reason": "Customer return - defective item",
  "condition": "Damaged"
}
```

##### GET /api/returns
```http
GET /api/returns?warehouse=GGM_WH&dateFrom=2025-01-01&page=1&limit=50
Authorization: Bearer <token>
Permission: OPERATIONS_RETURN
```

---

### 📈 Timeline & Analytics APIs (3 endpoints)

#### GET /api/timeline/:productCode
```http
GET /api/timeline/ABC123?warehouse=BLR_WH&dateFrom=2025-01-01&dateTo=2025-01-31&limit=50
Authorization: Bearer <token>
Permission: INVENTORY_TIMELINE

Response: {
  "success": true,
  "data": {
    "product_code": "ABC123",
    "warehouse_filter": "BLR_WH",
    "timeline": [
      {
        "id": 1,
        "timestamp": "2025-01-20T10:30:00Z",
        "type": "DISPATCH",
        "quantity": 2,
        "direction": "OUT",
        "balance_after": 43,
        "dispatch_details": {
          "customer": "John Doe",
          "awb": "AWB123456789",
          "length": 25.5,
          "width": 15.0,
          "height": 10.0,
          "actual_weight": 2.5
        }
      }
    ],
    "summary": {
      "current_stock": 43,
      "total_in": 100,
      "total_out": 57
    }
  }
}
```

#### GET /api/timeline
```http
GET /api/timeline?warehouse=BLR_WH&groupBy=product&dateFrom=2025-01-01
Authorization: Bearer <token>
Permission: INVENTORY_TIMELINE
```

#### Self Transfer APIs (2 endpoints)

##### POST /api/self-transfer/create
```http
POST /api/self-transfer/create
Authorization: Bearer <token>
Permission: OPERATIONS_SELF_TRANSFER
Content-Type: application/json

{
  "barcode": "ABC123",
  "fromWarehouse": "GGM_WH",
  "toWarehouse": "BLR_WH",
  "quantity": 10,
  "reason": "Stock rebalancing"
}
```

##### GET /api/self-transfer
```http
GET /api/self-transfer?fromWarehouse=GGM_WH&page=1&limit=50
Authorization: Bearer <token>
Permission: OPERATIONS_SELF_TRANSFER
```

---

### 👥 User & Permission Management APIs (25+ endpoints)

#### User Management (5 endpoints)

##### GET /api/users
```http
GET /api/users?page=1&limit=50&role=admin&status=active
Authorization: Bearer <token>
Permission: SYSTEM_USER_MANAGEMENT

Response: {
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "System Administrator",
      "email": "admin@company.com",
      "role": "super_admin",
      "status": "active",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

##### GET /api/users/:userId
```http
GET /api/users/1
Authorization: Bearer <token>
Permission: SYSTEM_USER_MANAGEMENT
```

##### POST /api/users
```http
POST /api/users
Authorization: Bearer <token>
Permission: SYSTEM_USER_MANAGEMENT
Content-Type: application/json

{
  "name": "John Manager",
  "email": "john@company.com",
  "password": "secure_password",
  "role_id": 2
}
```

##### PUT /api/users/:userId
```http
PUT /api/users/1
Authorization: Bearer <token>
Permission: SYSTEM_USER_MANAGEMENT
Content-Type: application/json

{
  "name": "John Senior Manager",
  "email": "john.senior@company.com"
}
```

##### DELETE /api/users/:userId
```http
DELETE /api/users/1
Authorization: Bearer <token>
Permission: SYSTEM_USER_MANAGEMENT
```

#### Role Management (8 endpoints)

##### GET /api/roles
```http
GET /api/roles
Authorization: Bearer <token>

Response: {
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "super_admin",
      "display_name": "Super Administrator",
      "color": "#dc2626",
      "permissions": ["INVENTORY_VIEW", "ORDERS_CREATE", ...]
    }
  ]
}
```

##### GET /api/roles/:roleId
```http
GET /api/roles/1
Authorization: Bearer <token>
Permission: SYSTEM_ROLE_MANAGEMENT
```

##### POST /api/roles
```http
POST /api/roles
Authorization: Bearer <token>
Permission: SYSTEM_ROLE_MANAGEMENT
Content-Type: application/json

{
  "name": "warehouse_manager",
  "display_name": "Warehouse Manager",
  "description": "Manages warehouse operations",
  "color": "#059669",
  "permissionIds": [1, 2, 3, 4, 5]
}
```

##### PUT /api/roles/:roleId
```http
PUT /api/roles/1
Authorization: Bearer <token>
Permission: SYSTEM_ROLE_MANAGEMENT
Content-Type: application/json

{
  "display_name": "Senior Warehouse Manager",
  "permissionIds": [1, 2, 3, 4, 5, 6, 7]
}
```

##### DELETE /api/roles/:roleId
```http
DELETE /api/roles/1
Authorization: Bearer <token>
Permission: SYSTEM_ROLE_MANAGEMENT
```

##### GET /api/roles/:roleId/permissions
```http
GET /api/roles/1/permissions
Authorization: Bearer <token>
Permission: SYSTEM_ROLE_MANAGEMENT
```

##### POST /api/roles/:roleId/permissions
```http
POST /api/roles/1/permissions
Authorization: Bearer <token>
Permission: SYSTEM_ROLE_MANAGEMENT
Content-Type: application/json

{
  "permissionId": 15
}
```

##### PUT /api/roles/:roleId/permissions
```http
PUT /api/roles/1/permissions
Authorization: Bearer <token>
Permission: SYSTEM_ROLE_MANAGEMENT
Content-Type: application/json

{
  "permissionIds": [1, 2, 3, 4, 5, 15, 16, 17]
}
```

#### Permission Management (2 endpoints)

##### GET /api/permissions
```http
GET /api/permissions
Authorization: Bearer <token>

Response: {
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "INVENTORY_VIEW",
      "display_name": "View Inventory",
      "category": "INVENTORY",
      "description": "Can view inventory data"
    }
  ]
}
```

##### GET /api/permissions/:permissionId
```http
GET /api/permissions/1
Authorization: Bearer <token>
Permission: SYSTEM_PERMISSION_MANAGEMENT
```

#### Audit & System APIs (8 endpoints)

##### GET /api/audit-logs
```http
GET /api/audit-logs?page=1&limit=50&action=CREATE&dateFrom=2025-01-01
Authorization: Bearer <token>
Permission: SYSTEM_AUDIT_LOG

Response: {
  "success": true,
  "data": [
    {
      "id": 1,
      "user_name": "System Administrator",
      "action": "CREATE",
      "entity_type": "USER",
      "entity_id": "2",
      "details": "Created new user: John Manager",
      "created_at": "2025-01-20T10:30:00Z"
    }
  ]
}
```

##### GET /api/audit-logs/user/:userId
```http
GET /api/audit-logs/user/1?page=1&limit=50
Authorization: Bearer <token>
Permission: SYSTEM_AUDIT_LOG
```

##### GET /api/audit-logs/action/:action
```http
GET /api/audit-logs/action/CREATE?page=1&limit=50
Authorization: Bearer <token>
Permission: SYSTEM_AUDIT_LOG
```

##### GET /api/system/stats
```http
GET /api/system/stats
Authorization: Bearer <token>
Permission: SYSTEM_MONITORING

Response: {
  "success": true,
  "data": {
    "total_users": 25,
    "active_users": 23,
    "total_roles": 4,
    "total_permissions": 25,
    "recent_logins": 15
  }
}
```

##### GET /api/system/permission-usage
```http
GET /api/system/permission-usage
Authorization: Bearer <token>
Permission: SYSTEM_MONITORING
```

##### GET /api/system/role-distribution
```http
GET /api/system/role-distribution
Authorization: Bearer <token>
Permission: SYSTEM_MONITORING
```

---

### 🔧 Debug & Utility APIs (1 endpoint)

#### GET /api/debug/dispatch-dimensions/:barcode
```http
GET /api/debug/dispatch-dimensions/ABC123
No Authentication Required (Debug Only)

Response: {
  "barcode": "ABC123",
  "tests": [
    {
      "test": "Dispatch Data",
      "status": "SUCCESS",
      "data": [
        {
          "length": "25.50",
          "width": "15.00",
          "height": "10.00",
          "actual_weight": "2.500"
        }
      ]
    }
  ]
}
```

---

## 🔄 API Response Patterns

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Validation failed",
  "message": "Invalid input parameters",
  "details": {
    "field": "email",
    "issue": "Email format is invalid"
  }
}
```

### Permission Error
```json
{
  "success": false,
  "error": "INSUFFICIENT_PERMISSIONS",
  "message": "You don't have permission to perform this action",
  "required_permission": "INVENTORY_EDIT"
}
```

## 🚀 Deployment Guide

### Prerequisites
- Node.js 16+
- MySQL 8.0+
- PM2 (for production)

### Environment Configuration

```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=StockIQ

# Backend (.env)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=inventory_system
JWT_SECRET=your_jwt_secret
PORT=5000
```

### Installation Steps

```bash
# 1. Clone Repository
git clone https://github.com/your-repo/stockiq-inventory.git
cd stockiq-inventory

# 2. Install Dependencies
npm install

# 3. Database Setup
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql

# 4. Start Backend
npm run server

# 5. Start Frontend (Development)
npm run dev

# 6. Build for Production
npm run build
npm start
```

### Production Deployment

```bash
# Backend (PM2)
pm2 start server.js --name "stockiq-backend"

# Frontend (Vercel)
vercel --prod

# Or Frontend (PM2)
npm run build
pm2 start npm --name "stockiq-frontend" -- start
```

## 🏢 Warehouse Configuration

### Supported Warehouses
- **GGM_WH**: Gurgaon Warehouse (Primary Hub)
- **BLR_WH**: Bangalore Warehouse (South Region)
- **MUM_WH**: Mumbai Warehouse (West Region)
- **AMD_WH**: Ahmedabad Warehouse (Gujarat)
- **HYD_WH**: Hyderabad Warehouse (Telangana)

### Warehouse Operations
- Independent inventory tracking per warehouse
- Inter-warehouse transfers with approval workflows
- Warehouse-specific user permissions
- Location-based stock allocation

## 👥 User Roles & Permissions

### Role Hierarchy
1. **Super Admin**: Full system access, user management
2. **Admin**: Warehouse operations, reporting
3. **Manager**: Inventory management, order processing
4. **Operator**: Basic operations, data entry

### Permission Categories
- **INVENTORY**: View, Edit, Timeline access
- **PRODUCTS**: CRUD operations, bulk import, categories
- **ORDERS**: Create, edit, view, status updates
- **OPERATIONS**: Dispatch, damage recovery, returns, transfers
- **SYSTEM**: User management, audit logs, permissions

## 📊 Data Structure & Business Logic

### Inventory Movement Types
- **BULK_UPLOAD**: Initial stock or mass updates
- **DISPATCH**: Outbound shipments to customers
- **DAMAGE**: Stock marked as damaged/unusable
- **RECOVER**: Damaged stock restored to usable
- **RETURN**: Customer returns added back to inventory
- **SELF_TRANSFER**: Inter-warehouse movements

### Stock Calculation Logic
```javascript
// Real-time stock calculation
const currentStock = ledgerEntries.reduce((total, entry) => {
  return entry.direction === 'IN' 
    ? total + entry.quantity 
    : total - entry.quantity;
}, 0);
```

### Timeline Architecture
The system maintains three distinct timeline views:
1. **Order Timeline**: Complete order lifecycle tracking
2. **Product Timeline**: Individual product movement history
3. **Dispatch Details**: Shipping and logistics information

## 🔧 Development Guide

### Project Structure
```
stockiq-inventory/
├── src/                          # Frontend source
│   ├── app/                      # Next.js app router pages
│   │   ├── dashboard/           # Analytics dashboard
│   │   ├── inventory/           # Inventory management
│   │   ├── products/            # Product management
│   │   ├── order/               # Order processing
│   │   ├── permissions/         # User management
│   │   └── tracking/            # Order tracking
│   ├── components/              # Reusable UI components
│   │   ├── ui/                  # Base UI components
│   │   └── *.jsx               # Feature components
│   ├── contexts/                # React contexts
│   │   ├── AuthContext.jsx     # Authentication state
│   │   ├── PermissionsContext.jsx # User permissions
│   │   └── ThemeContext.jsx    # UI theme management
│   └── services/                # API integration
│       └── api/                 # API service modules
├── controllers/                 # Backend controllers
│   ├── authController.js       # Authentication logic
│   ├── inventoryController.js  # Inventory operations
│   ├── productController.js    # Product management
│   ├── dispatchController.js   # Dispatch operations
│   └── timelineController.js   # Timeline data
├── routes/                      # API route definitions
├── middleware/                  # Custom middleware
└── db/                         # Database configuration
```

### Development Workflow
1. **Feature Development**: Create feature branch from main
2. **API First**: Define API endpoints before frontend implementation
3. **Permission Validation**: All operations require permission checks
4. **Error Handling**: Comprehensive error handling with user feedback
5. **Testing**: Manual testing with real data scenarios
6. **Deployment**: Automated deployment via Vercel and PM2

## 📈 Performance & Scalability

### Optimization Features
- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: Efficient database connection management
- **Pagination**: Large datasets handled with server-side pagination
- **Caching**: Strategic caching for frequently accessed data
- **Lazy Loading**: Components loaded on demand

### Monitoring & Analytics
- Real-time performance metrics
- Error tracking and alerting
- User activity analytics
- System health monitoring

## 🔒 Security Features

### Data Protection
- **Input Validation**: All inputs sanitized and validated
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Output encoding and CSP headers
- **Authentication**: JWT with secure token handling
- **Authorization**: Role-based access control

### Audit & Compliance
- Complete audit trail for all operations
- User activity logging
- Data retention policies
- Backup and recovery procedures

## 📞 Support & Maintenance

### System Requirements
- **Minimum**: 2GB RAM, 2 CPU cores, 20GB storage
- **Recommended**: 4GB RAM, 4 CPU cores, 50GB storage
- **Database**: MySQL 8.0+ with InnoDB engine

### Backup Strategy
- Daily automated database backups
- File system snapshots
- Configuration backup
- Disaster recovery procedures

## 📄 License

MIT License - See LICENSE file for details

---

**StockIQ Inventory Management System** - Built for enterprise-scale warehouse operations with modern web technologies.

For technical support or feature requests, please contact the development team.