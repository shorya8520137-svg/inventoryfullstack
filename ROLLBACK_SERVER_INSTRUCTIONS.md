# 🔄 SERVER ROLLBACK INSTRUCTIONS

## Quick Rollback Options

### Option 1: Run Bash Script on Server
```bash
# Copy the script to your server
scp rollback-server-from-github.sh root@your-server-ip:/tmp/

# SSH to server and run
ssh root@your-server-ip
cd /tmp
chmod +x rollback-server-from-github.sh
./rollback-server-from-github.sh
```

### Option 2: Manual Commands on Server
SSH to your server and run these commands:

```bash
# Navigate to project
cd /var/www/stockiqfullstacktest

# Stop service
sudo systemctl stop stockiq-backend

# Rollback code
git restore .
git clean -fd
git pull origin main

# Install dependencies
npm install

# Restart service
sudo systemctl start stockiq-backend

# Check status
sudo systemctl status stockiq-backend
curl http://localhost:5000/
```

### Option 3: Using PM2 (if you're using PM2)
```bash
cd /var/www/stockiqfullstacktest
git restore .
git clean -fd
git pull origin main
npm install
pm2 restart stockiq-backend
pm2 logs stockiq-backend
```

## Verification Steps

1. **Check Service Status:**
   ```bash
   sudo systemctl status stockiq-backend
   ```

2. **Check Logs:**
   ```bash
   sudo journalctl -u stockiq-backend -f
   ```

3. **Test API:**
   ```bash
   curl http://localhost:5000/
   curl http://your-server-ip:5000/
   ```

## Troubleshooting

If the service fails to start:

1. **Check logs for errors:**
   ```bash
   sudo journalctl -u stockiq-backend --no-pager -l
   ```

2. **Check if port is in use:**
   ```bash
   sudo netstat -tlnp | grep :5000
   ```

3. **Kill any hanging processes:**
   ```bash
   sudo pkill -f "node server.js"
   sudo pkill -f "stockiq"
   ```

4. **Restart the service:**
   ```bash
   sudo systemctl restart stockiq-backend
   ```

## Important Notes

- ⚠️ This will **PERMANENTLY DELETE** all local changes on the server
- ✅ This will restore the exact code from GitHub
- 🔄 Dependencies will be reinstalled
- 🚀 Service will be restarted automatically

## After Rollback

Your server should now have the same working code as your local machine that was just rolled back from GitHub.