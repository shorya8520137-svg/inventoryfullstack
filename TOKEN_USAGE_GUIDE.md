# 🔐 Token-Based Authentication Guide

## 📋 Overview
This guide shows how to use the admin credentials and JWT tokens to access the StockIQ API.

## 🔑 Admin Credentials
- **Email**: `admin@company.com`
- **Password**: `Admin@123`

## 🚀 Quick Start

### 1. Test Admin Login
```bash
node quick-admin-test.js
```

### 2. Get Full Token Details
```bash
node test-admin-login-with-token.js
```

### 3. Test All Authenticated Operations
```bash
node test-authenticated-operations.js
```

## 📡 API Endpoints

### Base URLs
- **Remote**: `https://54.179.63.233.nip.io/api`
- **Local**: `http://localhost:5000/api`

### Authentication Flow

#### Step 1: Login and Get Token
```bash
curl -X POST https://54.179.63.233.nip.io/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "Admin@123"
  }'
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@company.com",
    "role": "admin"
  }
}
```

#### Step 2: Use Token for API Calls
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  https://54.179.63.233.nip.io/api/users
```

## 🔗 Available Endpoints

### 👥 User Management
- `GET /users` - Get all users
- `POST /users` - Create new user
- `GET /auth/profile` - Get current user profile
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### 📦 Inventory Management
- `GET /products` - Get all products
- `POST /products` - Create new product
- `GET /products/:id` - Get product by ID
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product
- `GET /products/search?q=term` - Search products

### 📋 Order Management
- `GET /orders` - Get all orders
- `POST /orders` - Create new order
- `GET /orders/:id` - Get order by ID
- `PUT /orders/:id` - Update order
- `GET /dispatch` - Get dispatch records
- `POST /dispatch` - Create dispatch record

### 🔐 2FA Operations
- `GET /2fa/status` - Get 2FA status
- `POST /2fa/setup` - Generate 2FA setup
- `POST /2fa/verify-enable` - Enable 2FA
- `POST /2fa/verify` - Verify 2FA token
- `POST /2fa/disable` - Disable 2FA

### 📊 Audit & Notifications
- `GET /audit-logs` - Get audit logs
- `GET /notifications` - Get notifications
- `POST /notifications` - Create notification
- `PUT /notifications/:id/read` - Mark as read

### 🔒 Permissions
- `GET /permissions` - Get all permissions
- `GET /roles` - Get all roles
- `POST /roles` - Create new role
- `PUT /roles/:id` - Update role

## 💡 Usage Examples

### Create a New User
```bash
curl -X POST https://54.179.63.233.nip.io/api/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@company.com",
    "password": "SecurePass123",
    "role": "user"
  }'
```

### Create a New Product
```bash
curl -X POST https://54.179.63.233.nip.io/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop Computer",
    "sku": "LAP-001",
    "barcode": "1234567890123",
    "price": 999.99,
    "cost_price": 600.00,
    "category": "Electronics"
  }'
```

### Create an Order
```bash
curl -X POST https://54.179.63.233.nip.io/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Jane Smith",
    "customer_email": "jane@example.com",
    "items": [
      {
        "product_id": 1,
        "quantity": 2,
        "price": 999.99
      }
    ],
    "total_amount": 1999.98
  }'
```

### Get Audit Logs
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://54.179.63.233.nip.io/api/audit-logs?limit=50"
```

## 🛠️ Testing Scripts

### Available Test Scripts
1. **`quick-admin-test.js`** - Fast credential verification
2. **`test-admin-login-with-token.js`** - Complete login testing
3. **`test-authenticated-operations.js`** - Full API testing
4. **`comprehensive-api-test.js`** - All endpoints testing

### Run All Tests
```bash
# Quick test
node quick-admin-test.js

# Full authentication test
node test-admin-login-with-token.js

# Complete operations test
node test-authenticated-operations.js

# Or use the master automation
master-automation.cmd
# Then choose option 6 or 7
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Token Expired
**Error**: `401 Unauthorized - Token expired`
**Solution**: Login again to get a new token

#### 2. Invalid Credentials
**Error**: `401 Unauthorized - Invalid credentials`
**Solution**: Verify email and password are correct

#### 3. Insufficient Permissions
**Error**: `403 Forbidden`
**Solution**: Ensure user has required role/permissions

#### 4. API Not Accessible
**Error**: `ECONNREFUSED`
**Solution**: Check if server is running and accessible

### Debug Commands
```bash
# Check server status
curl https://54.179.63.233.nip.io/api/health

# Test local server
curl http://localhost:5000/api/health

# Verify token format
echo "YOUR_TOKEN" | base64 -d
```

## 📱 Frontend Integration

### JavaScript Example
```javascript
// Login function
async function login() {
  const response = await fetch('https://54.179.63.233.nip.io/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'admin@company.com',
      password: 'Admin@123'
    })
  });
  
  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data.token;
}

// API call with token
async function getUsers() {
  const token = localStorage.getItem('token');
  const response = await fetch('https://54.179.63.233.nip.io/api/users', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
}
```

## 🎯 Best Practices

1. **Store tokens securely** - Use secure storage methods
2. **Handle token expiration** - Implement refresh logic
3. **Use HTTPS** - Always use secure connections
4. **Validate responses** - Check for errors and handle appropriately
5. **Rate limiting** - Respect API rate limits
6. **Error handling** - Implement proper error handling

## 📞 Support

If you encounter issues:
1. Run the test scripts to diagnose problems
2. Check server logs: `pm2 logs`
3. Verify database connectivity
4. Ensure all services are running

---

**🎉 You're ready to use the StockIQ API with token authentication!**