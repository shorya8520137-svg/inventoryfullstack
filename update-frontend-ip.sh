#!/bin/bash
cd /home/ubuntu/inventoryfullstack

echo "🔄 Updating frontend API base URLs from 16.171.161.150 to 13.51.56.188..."

# Update all files in src/ directory
find src -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/16\.171\.161\.150/13.51.56.188/g' {} +

# Also update environment files if they exist
if [ -f ".env" ]; then
    sed -i 's/16\.171\.161\.150/13.51.56.188/g' .env
    echo "✅ Updated .env file"
fi

if [ -f ".env.local" ]; then
    sed -i 's/16\.171\.161\.150/13.51.56.188/g' .env.local
    echo "✅ Updated .env.local file"
fi

if [ -f ".env.production" ]; then
    sed -i 's/16\.171\.161\.150/13.51.56.188/g' .env.production
    echo "✅ Updated .env.production file"
fi

echo "✅ Frontend IP update completed!"

# Verify the changes
echo "🔍 Verifying changes..."
grep -r "13.51.56.188" src/ | wc -l | xargs echo "Found new IP in files:"
grep -r "16.171.161.150" src/ | wc -l | xargs echo "Remaining old IP references:"

echo "📋 Sample of updated files:"
grep -r "13.51.56.188" src/ | head -5