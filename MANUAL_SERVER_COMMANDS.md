# 🔧 MANUAL SERVER COMMANDS TO RUN

Since the automated scripts are having issues, here are the exact commands to run manually on your server.

## 📋 **SSH to Your Server First:**
```bash
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150
cd /home/ubuntu/inventoryfullstack
```

## 🔍 **Step 1: Database Analysis**

### Check Users Table:
```bash
mysql -u inventory_user -pStrongPass@123 inventory_db -e "SELECT * FROM users LIMIT 5;"
```

### Count Users:
```bash
mysql -u inventory_user -pStrongPass@123 inventory_db -e "SELECT COUNT(*) as total_users FROM users;"
```

### Check Roles Table:
```bash
mysql -u inventory_user -pStrongPass@123 inventory_db -e "SELECT * FROM roles LIMIT 5;"
```

### Check Permissions Table:
```bash
mysql -u inventory_user -pStrongPass@123 inventory_db -e "SELECT * FROM permissions LIMIT 5;"
```

## 🧪 **Step 2: API Testing**

### Test Health:
```bash
curl -s http://localhost:5000/
```

### Test Login (Method 1):
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"admin123"}'
```

### Test Login (Method 2):
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### If Login Works, Test Protected APIs:
```bash
# Replace TOKEN with actual token from login response
TOKEN="your_jwt_token_here"

# Test Users API
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/users

# Test Roles API  
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/roles

# Test Permissions API
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/permissions

# Test Products API
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/products
```

## 🔧 **Step 3: Check Code Files**

### Check Auth Controller:
```bash
head -20 controllers/authController.js
```

### Check Auth Routes:
```bash
head -20 routes/authRoutes.js
```

### Check Middleware:
```bash
head -20 middleware/auth.js
```

## 📊 **Step 4: Server Status**

### Check Process:
```bash
ps aux | grep node
```

### Check Port:
```bash
ss -tlnp | grep :5000
```

### Check Logs:
```bash
tail -50 /var/log/syslog | grep node
```

## 🎯 **Expected Results:**

1. **Users table should show existing users**
2. **Login should return a JWT token**
3. **Protected APIs should work with the token**
4. **If any step fails, we'll know exactly what to fix**

## 📝 **Report Back:**

After running these commands, let me know:
1. How many users are in the database?
2. What does the login API return?
3. Are there any error messages?
4. Which APIs work and which don't?

This will give us the complete picture to fix any issues!