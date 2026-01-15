# Deploy to EC2 Server (16.171.161.150)

## Step 1: SSH into your EC2 server
```bash
ssh -i your-key.pem ubuntu@16.171.161.150
# or
ssh ec2-user@16.171.161.150
```

## Step 2: Navigate to your project directory
```bash
cd /path/to/your/project
```

## Step 3: Pull latest changes from Git
```bash
git pull origin main
```

## Step 4: Install dependencies (if needed)
```bash
npm install
```

## Step 5: Set environment variables on server
Create or update `.env.local` on the server:
```bash
nano .env.local
```

Add this content:
```
NEXT_PUBLIC_API_BASE=https://16.171.161.150.nip.io
NODE_ENV=production
NEXT_PUBLIC_API_TIMEOUT=30000
```

## Step 6: Start the backend server
```bash
# Start backend on port 5000
node server.js &

# Or use PM2 for production
pm2 start server.js --name inventory-backend
pm2 save
```

## Step 7: Build and start Next.js
```bash
# Build Next.js app
npm run build

# Start Next.js on port 3000
npm start &

# Or use PM2
pm2 start npm --name inventory-frontend -- start
pm2 save
```

## Step 8: Configure Nginx for HTTPS (if not already done)

Create nginx config: `/etc/nginx/sites-available/inventory`
```nginx
server {
    listen 443 ssl;
    server_name 16.171.161.150.nip.io;

    # SSL certificates (use Let's Encrypt or self-signed)
    ssl_certificate /etc/ssl/certs/your-cert.crt;
    ssl_certificate_key /etc/ssl/private/your-key.key;

    # Frontend (Next.js on port 3000)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API (Node.js on port 5000)
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name 16.171.161.150.nip.io;
    return 301 https://$server_name$request_uri;
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/inventory /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Step 9: Open ports in AWS Security Group
Make sure these ports are open in your EC2 security group:
- Port 80 (HTTP)
- Port 443 (HTTPS)
- Port 22 (SSH)

## Step 10: Test the API
```bash
# Test from server
curl http://localhost:5000/
curl http://localhost:5000/api/inventory?limit=10

# Test from outside
curl https://16.171.161.150.nip.io/
curl https://16.171.161.150.nip.io/api/inventory?limit=10
```

## Quick Check Commands
```bash
# Check if backend is running
ps aux | grep node

# Check if nginx is running
sudo systemctl status nginx

# Check backend logs
pm2 logs inventory-backend

# Check frontend logs
pm2 logs inventory-frontend

# Restart services
pm2 restart all
sudo systemctl restart nginx
```
