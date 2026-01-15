# QUICK FIX - CORS Issue

## Run these commands on your EC2 server:

```bash
# SSH into server
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150

# Go to project directory
cd ~/inventoryfullstack

# Pull latest code
git pull origin main

# Run the CORS fix
chmod +x fix-nginx-cors.sh
sudo ./fix-nginx-cors.sh

# Verify nginx config
sudo nginx -t

# If test passes, restart nginx
sudo systemctl restart nginx

# Test the API
curl -I https://16.171.161.150.nip.io/api/inventory?limit=10
```

## What to look for in the curl output:

You should see **ONLY ONE** `Access-Control-Allow-Origin` header:
```
Access-Control-Allow-Origin: *
```

If you see it **twice**, the fix didn't apply.

## Manual fix if script doesn't work:

```bash
sudo nano /etc/nginx/sites-available/inventory
```

Find and **DELETE** these lines (around line 12-14):
```nginx
add_header 'Access-Control-Allow-Origin' '*' always;
add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
```

Save (Ctrl+X, Y, Enter), then:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

## After fixing, test from Vercel:

The CORS error should be gone and your inventory page should load data.
