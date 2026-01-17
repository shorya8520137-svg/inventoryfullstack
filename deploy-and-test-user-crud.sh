#!/bin/bash

echo "🚀 DEPLOYING AND TESTING USER CRUD OPERATIONS"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Pull latest code from GitHub
echo -e "\n${BLUE}📥 Step 1: Pulling latest code from GitHub...${NC}"
git pull origin main

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Code pulled successfully${NC}"
else
    echo -e "${RED}❌ Failed to pull code${NC}"
    exit 1
fi

# Step 2: Install dependencies (if needed)
echo -e "\n${BLUE}📦 Step 2: Installing dependencies...${NC}"
npm install

# Step 3: Restart server
echo -e "\n${BLUE}🔄 Step 3: Restarting server...${NC}"
pkill -f "node server.js" || true
sleep 2
nohup node server.js > server.log 2>&1 &
sleep 5

# Check if server is running
if pgrep -f "node server.js" > /dev/null; then
    echo -e "${GREEN}✅ Server restarted successfully${NC}"
else
    echo -e "${RED}❌ Server failed to start${NC}"
    exit 1
fi

# Step 4: Test server health
echo -e "\n${BLUE}🏥 Step 4: Testing server health...${NC}"
curl -s https://13.51.56.188.nip.io/api/health > /dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Server health check passed${NC}"
else
    echo -e "${RED}❌ Server health check failed${NC}"
    exit 1
fi

# Step 5: Run comprehensive user CRUD test
echo -e "\n${BLUE}🧪 Step 5: Running User CRUD Tests...${NC}"
node test-user-crud-complete.js

echo -e "\n${GREEN}🎉 DEPLOYMENT AND TESTING COMPLETED!${NC}"
echo "=============================================="