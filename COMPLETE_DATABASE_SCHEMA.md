# 🗄️ StockIQ Complete Database Schema

## 📊 Database Overview
- **Database Name**: `inventory_db`
- **Engine**: MySQL 8.0+
- **Character Set**: utf8mb4_0900_ai_ci
- **Total Tables**: ~15-20 tables

---

## 🔐 Authentication & User Management

### 1. `users` Table
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- 2FA Columns (Recently Added)
    two_factor_secret VARCHAR(255) NULL,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_backup_codes JSON NULL,
    two_factor_setup_at TIMESTAMP NULL,
    
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_is_active (is_active),
    INDEX idx_two_factor_enabled (two_factor_enabled)
);
```

### 2. `roles` Table
```sql
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_is_active (is_active)
);
```

### 3. `permissions` Table
```sql
CREATE TABLE permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_category (category)
);
```

### 4. `role_permissions` Table
```sql
CREATE TABLE role_permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_permission (role_id, permission_id),
    INDEX idx_role_id (role_id),
    INDEX idx_permission_id (permission_id)
);
```

---

## 📦 Inventory Management

### 5. `products` Table
```sql
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100) UNIQUE,
    category_id INT,
    description TEXT,
    unit_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    weight DECIMAL(8,3),
    dimensions VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (category_id) REFERENCES product_categories(id),
    INDEX idx_sku (sku),
    INDEX idx_barcode (barcode),
    INDEX idx_category_id (category_id),
    INDEX idx_is_active (is_active)
);
```

### 6. `product_categories` Table
```sql
CREATE TABLE product_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_id INT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (parent_id) REFERENCES product_categories(id),
    INDEX idx_name (name),
    INDEX idx_parent_id (parent_id),
    INDEX idx_is_active (is_active)
);
```

### 7. `inventory_ledger` Table
```sql
CREATE TABLE inventory_ledger (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    transaction_type ENUM('IN', 'OUT', 'ADJUSTMENT') NOT NULL,
    quantity INT NOT NULL,
    running_balance INT NOT NULL,
    reference_type VARCHAR(50),
    reference_id INT,
    notes TEXT,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_product_id (product_id),
    INDEX idx_transaction_type (transaction_type),
    INDEX idx_reference (reference_type, reference_id),
    INDEX idx_created_at (created_at)
);
```

---

## 🚚 Orders & Dispatch

### 8. `orders` Table
```sql
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(100) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    shipping_address TEXT,
    total_amount DECIMAL(10,2),
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_order_number (order_number),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);
```

### 9. `warehouse_dispatch` Table
```sql
CREATE TABLE warehouse_dispatch (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_ref VARCHAR(100),
    customer VARCHAR(255) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    awb VARCHAR(100),
    courier VARCHAR(100),
    status ENUM('pending', 'dispatched', 'in_transit', 'delivered') DEFAULT 'pending',
    dispatch_date DATE,
    expected_delivery DATE,
    actual_delivery DATE,
    created_by INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_order_ref (order_ref),
    INDEX idx_awb (awb),
    INDEX idx_status (status),
    INDEX idx_dispatch_date (dispatch_date)
);
```

### 10. `self_transfer` Table
```sql
CREATE TABLE self_transfer (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    transfer_reference VARCHAR(255) NOT NULL UNIQUE,
    from_location VARCHAR(255) NOT NULL,
    to_location VARCHAR(255) NOT NULL,
    total_quantity INT NOT NULL DEFAULT 0,
    total_weight DECIMAL(10,3) DEFAULT 0,
    total_dimensions VARCHAR(100),
    status ENUM('pending', 'in_transit', 'completed', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_transfer_reference (transfer_reference),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);
```

### 11. `self_transfer_items` Table
```sql
CREATE TABLE self_transfer_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    transfer_id INT UNSIGNED NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    weight DECIMAL(8,3),
    dimensions VARCHAR(100),
    notes TEXT,
    
    FOREIGN KEY (transfer_id) REFERENCES self_transfer(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_transfer_id (transfer_id),
    INDEX idx_product_id (product_id)
);
```

---

## 📋 Audit & Logging System

### 12. `audit_logs` Table
```sql
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- User Information
    user_id INT,
    user_name VARCHAR(255),
    user_email VARCHAR(255),
    user_role VARCHAR(100),
    
    -- Action Details
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(50),
    resource_name VARCHAR(255),
    
    -- Human-readable description
    description TEXT NOT NULL,
    
    -- Detailed information (JSON)
    details JSON,
    
    -- Request Information
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_method VARCHAR(10),
    request_url VARCHAR(500),
    
    -- Location Tracking (Recently Added)
    location_country VARCHAR(100) NULL,
    location_city VARCHAR(100) NULL,
    location_region VARCHAR(100) NULL,
    location_coordinates VARCHAR(50) NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_resource (resource_type, resource_id),
    INDEX idx_created_at (created_at),
    INDEX idx_user_action (user_id, action)
);
```

---

## 🔔 Notification System

### 13. `notifications` Table
```sql
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('login', 'dispatch', 'return', 'damage', 'product', 'inventory', 'system') NOT NULL,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    related_entity_type VARCHAR(50),
    related_entity_id INT,
    data JSON,
    is_read BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);
```

### 14. `firebase_tokens` Table
```sql
CREATE TABLE firebase_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(500) NOT NULL,
    device_type ENUM('web', 'android', 'ios') DEFAULT 'web',
    device_info JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_token (user_id, token),
    INDEX idx_user_id (user_id),
    INDEX idx_is_active (is_active)
);
```

### 15. `notification_preferences` Table
```sql
CREATE TABLE notification_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    email_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_notification_type (user_id, notification_type),
    INDEX idx_user_id (user_id),
    INDEX idx_notification_type (notification_type)
);
```

---

## 🔗 Database Relationships

### Primary Relationships:
1. **users** ← **role_permissions** → **permissions**
2. **products** ← **inventory_ledger**
3. **products** ← **warehouse_dispatch**
4. **users** ← **audit_logs** (tracks user actions)
5. **users** ← **notifications** (user-specific notifications)
6. **users** ← **firebase_tokens** (push notification tokens)
7. **self_transfer** ← **self_transfer_items** → **products**

### Foreign Key Constraints:
- All user-related tables reference `users(id)`
- All product-related tables reference `products(id)`
- Role-permission system maintains referential integrity
- Audit logs track all user actions with proper references

---

## 📊 Key Features Supported

### ✅ Implemented Features:
1. **User Authentication & Authorization**
   - Role-based permissions
   - 2FA with Google Authenticator
   - Session management

2. **Inventory Management**
   - Product catalog with categories
   - Stock tracking with ledger
   - Barcode/SKU management

3. **Order Processing**
   - Order creation and tracking
   - Warehouse dispatch management
   - Self-transfer between locations

4. **Audit System**
   - Complete user activity tracking
   - IP-based location tracking
   - Detailed action logging

5. **Notification System**
   - Real-time notifications
   - Firebase push notifications
   - User preferences management

### 🔄 Recent Additions:
- **2FA Security**: Complete Google Authenticator integration
- **Location Tracking**: IP-based geolocation in audit logs
- **Enhanced Notifications**: Firebase integration with preferences
- **Audit Improvements**: Detailed action tracking with context

---

## 🚀 Database Backup & Maintenance

### Backup Strategy:
```bash
# Complete database backup
mysqldump -u inventory_user -p inventory_db > stockiq_backup.sql

# Structure only
mysqldump -u inventory_user -p --no-data inventory_db > stockiq_structure.sql

# Data only
mysqldump -u inventory_user -p --no-create-info inventory_db > stockiq_data.sql
```

### Maintenance Tasks:
1. Regular audit log cleanup (older than 6 months)
2. Notification cleanup (read notifications older than 30 days)
3. Firebase token cleanup (inactive tokens)
4. Index optimization for large tables

---

## 📈 Performance Considerations

### Optimized Indexes:
- User lookup by email/role
- Product search by SKU/barcode
- Audit logs by user/action/date
- Notifications by user/read status
- Inventory ledger by product/date

### Recommended Monitoring:
- Table sizes (especially audit_logs)
- Query performance on large datasets
- Foreign key constraint performance
- Index usage statistics

---

**This is your complete StockIQ database schema with all tables, relationships, and recent enhancements including 2FA, location tracking, and notification system!** 🎉