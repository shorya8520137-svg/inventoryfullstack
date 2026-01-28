# NOTIFICATION SYSTEM - DATABASE TABLES & COLUMNS

## 📋 TABLE 1: NOTIFICATIONS (Main notification storage)

| Column Name | Data Type | Null | Key | Default | Extra | Description |
|-------------|-----------|------|-----|---------|-------|-------------|
| `id` | INT | NO | PRI | NULL | AUTO_INCREMENT | Primary key |
| `title` | VARCHAR(255) | NO | | NULL | | Notification title |
| `message` | TEXT | NO | | NULL | | Notification message content |
| `type` | VARCHAR(50) | NO | MUL | NULL | | Notification type (LOGIN, DISPATCH, RETURN, etc.) |
| `priority` | ENUM('low','medium','high') | NO | | 'medium' | | Notification priority level |
| `user_id` | INT | YES | MUL | NULL | | Target user ID (NULL for broadcast) |
| `related_entity_type` | VARCHAR(50) | YES | | NULL | | Related entity type (dispatch, return, etc.) |
| `related_entity_id` | INT | YES | | NULL | | Related entity ID |
| `data` | JSON | YES | | NULL | | Additional notification data |
| `is_read` | BOOLEAN | NO | | FALSE | | Read status |
| `read_at` | TIMESTAMP | YES | | NULL | | When notification was read |
| `expires_at` | TIMESTAMP | YES | | NULL | | Expiration time |
| `created_at` | TIMESTAMP | NO | | CURRENT_TIMESTAMP | | Creation time |
| `updated_at` | TIMESTAMP | NO | | CURRENT_TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last update time |

**Indexes:**
- PRIMARY KEY (`id`)
- INDEX `idx_user_id` (`user_id`)
- INDEX `idx_type` (`type`)
- INDEX `idx_created_at` (`created_at`)
- INDEX `idx_is_read` (`is_read`)

---

## 📋 TABLE 2: FIREBASE_TOKENS (Push notification tokens)

| Column Name | Data Type | Null | Key | Default | Extra | Description |
|-------------|-----------|------|-----|---------|-------|-------------|
| `id` | INT | NO | PRI | NULL | AUTO_INCREMENT | Primary key |
| `user_id` | INT | NO | MUL | NULL | | User ID |
| `token` | VARCHAR(500) | NO | UNI | NULL | | Firebase FCM token |
| `device_type` | VARCHAR(20) | NO | | 'web' | | Device type (web, android, ios) |
| `device_info` | JSON | YES | | NULL | | Device information |
| `is_active` | BOOLEAN | NO | | TRUE | | Token active status |
| `last_used_at` | TIMESTAMP | YES | | NULL | | Last time token was used |
| `created_at` | TIMESTAMP | NO | | CURRENT_TIMESTAMP | | Creation time |
| `updated_at` | TIMESTAMP | NO | | CURRENT_TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last update time |

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE KEY `unique_user_token` (`user_id`, `token`)
- INDEX `idx_user_id` (`user_id`)
- INDEX `idx_is_active` (`is_active`)

---

## 📋 TABLE 3: NOTIFICATION_SETTINGS (User notification preferences)

| Column Name | Data Type | Null | Key | Default | Extra | Description |
|-------------|-----------|------|-----|---------|-------|-------------|
| `id` | INT | NO | PRI | NULL | AUTO_INCREMENT | Primary key |
| `user_id` | INT | NO | UNI | NULL | | User ID |
| `login_notifications` | BOOLEAN | NO | | TRUE | | Enable login notifications |
| `dispatch_notifications` | BOOLEAN | NO | | TRUE | | Enable dispatch notifications |
| `return_notifications` | BOOLEAN | NO | | TRUE | | Enable return notifications |
| `damage_notifications` | BOOLEAN | NO | | TRUE | | Enable damage notifications |
| `product_notifications` | BOOLEAN | NO | | TRUE | | Enable product notifications |
| `inventory_notifications` | BOOLEAN | NO | | TRUE | | Enable inventory notifications |
| `system_notifications` | BOOLEAN | NO | | TRUE | | Enable system notifications |
| `push_enabled` | BOOLEAN | NO | | TRUE | | Enable push notifications |
| `email_enabled` | BOOLEAN | NO | | FALSE | | Enable email notifications |
| `created_at` | TIMESTAMP | NO | | CURRENT_TIMESTAMP | | Creation time |
| `updated_at` | TIMESTAMP | NO | | CURRENT_TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last update time |

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE KEY (`user_id`)

---

## 📋 TABLE 4: NOTIFICATION_PREFERENCES (Detailed user preferences)

| Column Name | Data Type | Null | Key | Default | Extra | Description |
|-------------|-----------|------|-----|---------|-------|-------------|
| `id` | INT | NO | PRI | NULL | AUTO_INCREMENT | Primary key |
| `user_id` | INT | NO | MUL | NULL | | User ID |
| `notification_type` | VARCHAR(50) | NO | | NULL | | Notification type |
| `enabled` | BOOLEAN | NO | | TRUE | | Preference enabled |
| `push_enabled` | BOOLEAN | NO | | TRUE | | Push notifications enabled |
| `email_enabled` | BOOLEAN | NO | | FALSE | | Email notifications enabled |
| `created_at` | TIMESTAMP | NO | | CURRENT_TIMESTAMP | | Creation time |
| `updated_at` | TIMESTAMP | NO | | CURRENT_TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last update time |

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE KEY `unique_user_type` (`user_id`, `notification_type`)
- INDEX `idx_user_id` (`user_id`)
- INDEX `idx_notification_type` (`notification_type`)

---

## 🔗 FOREIGN KEY RELATIONSHIPS

```sql
-- notifications table
ALTER TABLE notifications 
ADD CONSTRAINT fk_notifications_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- firebase_tokens table
ALTER TABLE firebase_tokens 
ADD CONSTRAINT fk_firebase_tokens_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- notification_settings table
ALTER TABLE notification_settings 
ADD CONSTRAINT fk_notification_settings_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- notification_preferences table
ALTER TABLE notification_preferences 
ADD CONSTRAINT fk_notification_preferences_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
```

---

## 📊 NOTIFICATION TYPES USED IN SYSTEM

| Type | Description | Priority | Example |
|------|-------------|----------|---------|
| `LOGIN` | User login notifications | low | "John Doe logged in from New York" |
| `DISPATCH` | Product dispatch notifications | medium | "5x Product A dispatched by Admin" |
| `RETURN` | Product return notifications | medium | "3x Product B returned by User" |
| `DAMAGE` | Damage report notifications | high | "Damage reported for Product C" |
| `RECOVERY` | Stock recovery notifications | medium | "2x Product D recovered" |
| `INVENTORY` | Inventory updates | low | "Stock level updated for Product E" |
| `SYSTEM` | System notifications | high | "System maintenance scheduled" |
| `USER` | User-related notifications | medium | "New user registered" |

---

## 🎯 SAMPLE DATA STRUCTURE

### Sample Notification Record:
```json
{
  "id": 1,
  "title": "📦 New Dispatch Created",
  "message": "Admin dispatched 5x Product A from New York",
  "type": "DISPATCH",
  "priority": "medium",
  "user_id": 2,
  "related_entity_type": "dispatch",
  "related_entity_id": 123,
  "data": {
    "action": "DISPATCH_CREATE",
    "user_name": "Admin",
    "product_name": "Product A",
    "quantity": 5,
    "location": "New York, NY, USA",
    "ip_address": "192.168.1.1",
    "timestamp": "2026-01-28T12:00:00.000Z"
  },
  "is_read": false,
  "read_at": null,
  "expires_at": null,
  "created_at": "2026-01-28T12:00:00.000Z",
  "updated_at": "2026-01-28T12:00:00.000Z"
}
```

### Sample Firebase Token Record:
```json
{
  "id": 1,
  "user_id": 2,
  "token": "dGhpcyBpcyBhIGZha2UgZmlyZWJhc2UgdG9rZW4...",
  "device_type": "web",
  "device_info": {
    "browser": "Chrome",
    "version": "120.0.0.0",
    "os": "Windows 10"
  },
  "is_active": true,
  "last_used_at": "2026-01-28T12:00:00.000Z",
  "created_at": "2026-01-28T10:00:00.000Z",
  "updated_at": "2026-01-28T12:00:00.000Z"
}
```

---

## 🔧 COMMON QUERIES

### Get User Notifications:
```sql
SELECT n.*, u.name as sender_name
FROM notifications n
LEFT JOIN users u ON JSON_EXTRACT(n.data, '$.user_id') = u.id
WHERE n.user_id = ? OR n.user_id IS NULL
ORDER BY n.created_at DESC
LIMIT 50;
```

### Get Unread Count:
```sql
SELECT COUNT(*) as unread_count 
FROM notifications 
WHERE user_id = ? AND is_read = FALSE;
```

### Mark as Read:
```sql
UPDATE notifications 
SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
WHERE id = ? AND user_id = ?;
```

### Get User Firebase Tokens:
```sql
SELECT token 
FROM firebase_tokens 
WHERE user_id = ? AND is_active = 1;
```