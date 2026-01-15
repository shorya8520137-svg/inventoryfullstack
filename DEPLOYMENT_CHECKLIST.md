# ✅ Deployment Checklist - Inventory App

## Backend (EC2 Server: 16.171.161.150)

### ✅ Completed Steps:
1. ✅ Backend server running on port 5000
2. ✅ Nginx installed and configured
3. ✅ HTTPS setup with self-signed certificate
4. ✅ Port 443 open in AWS Security Group
5. ✅ API responding: `https://16.171.161.150.nip.io/api/inventory`

### Test Backend:
```bash
# On server
curl -k https://localhost/api/inventory?limit=10

# From browser
https://16.171.161.150.nip.io/api/inventory?limit=10
```

---

## Frontend (Vercel)

### Configuration:
- **API Base URL**: `https://16.171.161.150.nip.io`
- **Environment Variable**: `NEXT_PUBLIC_API_BASE=https://16.171.161.150.nip.io`

### Deploy to Vercel:

1. **Push to GitHub** (Already done ✅)
   ```bash
   git push origin main
   ```

2. **Set Environment Variable in Vercel**:
   - Go to: https://vercel.com/your-project/settings/environment-variables
   - Add: `NEXT_PUBLIC_API_BASE` = `https://16.171.161.150.nip.io`
   - Apply to: Production, Preview, Development

3. **Redeploy**:
   - Go to: https://vercel.com/your-project/deployments
   - Click "Redeploy" on latest deployment
   - OR push a new commit to trigger auto-deploy

---

## API Endpoints Available:

### Inventory:
- `GET /api/inventory?limit=10000` - Get all inventory
- `GET /api/inventory?warehouse=GGM_WH` - Filter by warehouse
- `GET /api/inventory/export` - Export as CSV
- `POST /api/inventory/add-stock` - Add stock

### Products:
- `GET /api/products?page=1&limit=20` - Get products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Dispatch:
- `GET /api/dispatch` - Get all dispatches
- `POST /api/dispatch` - Create dispatch

### Order Tracking:
- `GET /api/order-tracking` - Get all orders
- `GET /api/order-tracking/:id/timeline` - Get order timeline

### Damage Recovery:
- `POST /api/damage-recovery/damage` - Record damage
- `POST /api/damage-recovery/recover` - Recover damaged items

### Returns:
- `GET /api/returns` - Get all returns
- `POST /api/returns` - Create return

### Self Transfer:
- `POST /api/self-transfer/create` - Create self transfer

---

## Troubleshooting:

### If API not responding:
```bash
# Check backend is running
ps aux | grep node

# Check nginx status
sudo systemctl status nginx

# Check nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart services
sudo systemctl restart nginx
```

### If frontend can't connect:
1. Check environment variable in Vercel
2. Redeploy after setting env var
3. Check browser console for CORS errors
4. Verify HTTPS is working: `https://16.171.161.150.nip.io/`

### Mixed Content Error:
- Make sure frontend uses HTTPS URL
- Make sure backend has HTTPS enabled
- Check `.env.local` has correct URL

---

## Quick Commands:

### On Server:
```bash
# Pull latest code
cd ~/inventoryfullstack
git pull origin main

# Restart backend
pm2 restart all
# OR
sudo systemctl restart nginx

# Test API
node test-api-connection.js
```

### Locally:
```bash
# Test API connection
node test-api-connection.js

# Push changes
git add .
git commit -m "Your message"
git push origin main
```

---

## ✅ Final Verification:

1. ✅ Backend API: https://16.171.161.150.nip.io/api/inventory?limit=10
2. ⏳ Frontend on Vercel: (Set env var and redeploy)
3. ⏳ Test full flow: Frontend → Backend → Database

---

## Next Steps:

1. **Set `NEXT_PUBLIC_API_BASE` in Vercel**
2. **Redeploy Vercel app**
3. **Test inventory page on Vercel**
4. **Verify all API calls work**

🎉 Once Vercel is redeployed with the correct env var, everything should work!
