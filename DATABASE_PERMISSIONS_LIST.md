# Database Permissions List

## Complete List of Permissions Available in Database

**Database**: `inventory_db`  
**Table**: `permissions`  
**Total Permissions**: 153 permissions

---

## Permissions by Category

### 1. DASHBOARD (5 permissions)
| ID | Name | Display Name | Description |
|----|------|--------------|-------------|
| 1 | DASHBOARD_VIEW | View Dashboard | Access to main dashboard |
| 2 | DASHBOARD_STATS | View Statistics | View dashboard statistics and metrics |
| 3 | DASHBOARD_CHARTS | View Charts | Access to dashboard charts and graphs |
| 4 | DASHBOARD_EXPORT | Export Dashboard | Export dashboard data and reports |
| 5 | DASHBOARD_CUSTOMIZE | Customize Dashboard | Customize dashboard layout and widgets |
| 125 | dashboard.view | View Dashboard | View dashboard |

### 2. INVENTORY (11 permissions)
| ID | Name | Display Name | Description |
|----|------|--------------|-------------|
| 6 | INVENTORY_VIEW | View Inventory | View inventory items and stock levels |
| 7 | INVENTORY_CREATE | Create Inventory | Add new inventory items |
| 8 | INVENTORY_EDIT | Edit Inventory | Modify existing inventory items |
| 9 | INVENTORY_DELETE | Delete Inventory | Remove inventory items |
| 10 | INVENTORY_BULK_UPLOAD | Bulk Upload Inventory | Upload inventory in bulk via CSV |
| 11 | INVENTORY_BULK_EXPORT | Bulk Export Inventory | Export inventory data in bulk |
| 12 | INVENTORY_TRANSFER | Transfer Inventory | Transfer inventory between warehouses |
| 13 | INVENTORY_ADJUST | Adjust Inventory | Make inventory adjustments and corrections |
| 14 | INVENTORY_AUDIT | Audit Inventory | Perform inventory audits and reconciliation |
| 15 | INVENTORY_TIMELINE | View Timeline | View inventory movement timeline |
| 16 | INVENTORY_REPORTS | Inventory Reports | Generate and view inventory reports |
| 130 | inventory.view | View Inventory | View inventory |
| 131 | inventory.add | Add Inventory | Add inventory stock |
| 132 | inventory.adjust | Adjust Inventory | Adjust inventory quantities |
| 133 | inventory.bulk_upload | Bulk Upload | Bulk upload inventory |

### 3. ORDERS (10 permissions)
| ID | Name | Display Name | Description |
|----|------|--------------|-------------|
| 17 | ORDERS_VIEW | View Orders | View order list and details |
| 18 | ORDERS_CREATE | Create Orders | Create new orders |
| 19 | ORDERS_EDIT | Edit Orders | Modify existing orders |
| 20 | ORDERS_DELETE | Delete Orders | Cancel or delete orders |
| 21 | ORDERS_PROCESS | Process Orders | Process and fulfill orders |
| 22 | ORDERS_DISPATCH | Dispatch Orders | Dispatch orders for delivery |
| 23 | ORDERS_RETURNS | Handle Returns | Process order returns and refunds |
| 24 | ORDERS_BULK_PROCESS | Bulk Process Orders | Process multiple orders at once |
| 25 | ORDERS_EXPORT | Export Orders | Export order data and reports |
| 26 | ORDERS_REPORTS | Order Reports | Generate and view order reports |
| 139 | orders.view | View Orders | View order tracking |
| 140 | orders.timeline | View Timeline | View order timeline |
| 141 | orders.export | Export Orders | Export order data |

### 4. TRACKING (6 permissions)
| ID | Name | Display Name | Description |
|----|------|--------------|-------------|
| 27 | TRACKING_VIEW | View Tracking | View shipment tracking information |
| 28 | TRACKING_UPDATE | Update Tracking | Update tracking status and information |
| 29 | TRACKING_CREATE | Create Tracking | Create new tracking entries |
| 30 | TRACKING_BULK_UPDATE | Bulk Update Tracking | Update multiple tracking entries |
| 31 | TRACKING_REPORTS | Tracking Reports | Generate tracking and delivery reports |
| 32 | TRACKING_NOTIFICATIONS | Tracking Notifications | Send tracking notifications to customers |

### 5. MESSAGES (5 permissions)
| ID | Name | Display Name | Description |
|----|------|--------------|-------------|
| 33 | MESSAGES_VIEW | View Messages | View team messages and communications |
| 34 | MESSAGES_SEND | Send Messages | Send messages to team members |
| 35 | MESSAGES_DELETE | Delete Messages | Delete messages and conversations |
| 36 | MESSAGES_MODERATE | Moderate Messages | Moderate team communications |
| 37 | MESSAGES_EXPORT | Export Messages | Export message history and logs |

### 6. PRODUCTS (9 permissions)
| ID | Name | Display Name | Description |
|----|------|--------------|-------------|
| 38 | PRODUCTS_VIEW | View Products | View product catalog and details |
| 39 | PRODUCTS_CREATE | Create Products | Add new products to catalog |
| 40 | PRODUCTS_EDIT | Edit Products | Modify existing product information |
| 41 | PRODUCTS_DELETE | Delete Products | Remove products from catalog |
| 42 | PRODUCTS_BULK_IMPORT | Bulk Import Products | Import products in bulk via CSV |
| 43 | PRODUCTS_BULK_EXPORT | Bulk Export Products | Export product data in bulk |
| 44 | PRODUCTS_CATEGORIES | Manage Categories | Manage product categories and classifications |
| 45 | PRODUCTS_PRICING | Manage Pricing | Update product prices and cost information |
| 46 | PRODUCTS_REPORTS | Product Reports | Generate and view product reports |
| 126 | products.view | View Products | View products |
| 127 | products.create | Create Products | Create new products |
| 128 | products.edit | Edit Products | Edit existing products |
| 129 | products.delete | Delete Products | Delete products |

### 7. OPERATIONS (6 permissions)
| ID | Name | Display Name | Description |
|----|------|--------------|-------------|
| 47 | OPERATIONS_DAMAGE_RECORD | Record Damage | Record damaged inventory items |
| 48 | OPERATIONS_DAMAGE_RECOVER | Recover Damage | Process damage recovery operations |
| 49 | OPERATIONS_WAREHOUSE_MANAGE | Manage Warehouses | Manage warehouse information and settings |
| 50 | OPERATIONS_STAFF_MANAGE | Manage Staff | Manage warehouse staff and assignments |
| 51 | OPERATIONS_QUALITY_CONTROL | Quality Control | Perform quality control checks |
| 52 | OPERATIONS_REPORTS | Operations Reports | Generate operational reports and analytics |

### 8. SYSTEM (10 permissions)
| ID | Name | Display Name | Description |
|----|------|--------------|-------------|
| 53 | SYSTEM_USER_MANAGEMENT | User Management | Manage system users and accounts |
| 54 | SYSTEM_ROLE_MANAGEMENT | Role Management | Manage user roles and permissions |
| 55 | SYSTEM_PERMISSION_MANAGEMENT | Permission Management | Manage system permissions |
| 56 | SYSTEM_SETTINGS | System Settings | Configure system settings and preferences |
| 57 | SYSTEM_BACKUP | System Backup | Perform system backups and data export |
| 58 | SYSTEM_RESTORE | System Restore | Restore system from backups |
| 59 | SYSTEM_AUDIT_LOG | Audit Log | View system audit logs and user activities |
| 60 | SYSTEM_MAINTENANCE | System Maintenance | Perform system maintenance tasks |
| 61 | SYSTEM_MONITORING | System Monitoring | Monitor system performance and health |
| 62 | SYSTEM_INTEGRATION | System Integration | Manage external system integrations |

### 9. DISPATCH (5 permissions)
| ID | Name | Display Name | Description |
|----|------|--------------|-------------|
| 134 | dispatch.view | View Dispatches | View dispatches |
| 135 | dispatch.create | Create Dispatch | Create new dispatch |
| 136 | dispatch.edit | Edit Dispatch | Edit dispatch details |
| 137 | dispatch.delete | Delete Dispatch | Delete dispatch |
| 138 | dispatch.status_update | Update Status | Update dispatch status |

### 10. SELF TRANSFER (2 permissions)
| ID | Name | Display Name | Description |
|----|------|--------------|-------------|
| 142 | self_transfer.view | View Self Transfers | View self transfers |
| 143 | self_transfer.create | Create Self Transfer | Create self transfer |

### 11. DAMAGE (3 permissions)
| ID | Name | Display Name | Description |
|----|------|--------------|-------------|
| 144 | damage.view | View Damage | View damage records |
| 145 | damage.report | Report Damage | Report damage |
| 146 | damage.recover | Recover Damage | Recover from damage |

### 12. RETURNS (2 permissions)
| ID | Name | Display Name | Description |
|----|------|--------------|-------------|
| 147 | returns.view | View Returns | View returns |
| 148 | returns.process | Process Returns | Process returns |

### 13. USERS (4 permissions)
| ID | Name | Display Name | Description |
|----|------|--------------|-------------|
| 149 | users.view | View Users | View users |
| 150 | users.create | Create Users | Create new users |
| 151 | users.edit | Edit Users | Edit user details |
| 152 | users.delete | Delete Users | Delete users |

### 14. PERMISSIONS (1 permission)
| ID | Name | Display Name | Description |
|----|------|--------------|-------------|
| 153 | permissions.manage | Manage Permissions | Manage permissions |

---

## Permission Categories Summary

| Category | Count | Description |
|----------|-------|-------------|
| DASHBOARD | 6 | Dashboard access and customization |
| INVENTORY | 15 | Inventory management and operations |
| ORDERS | 13 | Order processing and management |
| TRACKING | 6 | Shipment and delivery tracking |
| MESSAGES | 5 | Team communication system |
| PRODUCTS | 13 | Product catalog management |
| OPERATIONS | 6 | Operational tasks and warehouse management |
| SYSTEM | 10 | System administration and settings |
| DISPATCH | 5 | Dispatch order management |
| SELF_TRANSFER | 2 | Internal warehouse transfers |
| DAMAGE | 3 | Damage reporting and recovery |
| RETURNS | 2 | Return processing |
| USERS | 4 | User account management |
| PERMISSIONS | 1 | Permission system management |

---

## Database Schema

```sql
CREATE TABLE permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Notes

- All permissions are currently active (`is_active = 1`)
- Permissions are grouped by functional categories
- Some permissions have both old format (UPPERCASE) and new format (lowercase.action)
- The system supports hierarchical permission checking
- Permissions are linked to roles through the `role_permissions` table