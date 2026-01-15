#!/bin/bash

echo "🔐 JWT & AUTHENTICATION ANALYSIS"
echo "================================="
echo ""

OUTPUT="JWT_AUTH_ANALYSIS.md"

cat > $OUTPUT << 'HEADER'
# 🔐 JWT & Authentication Analysis

---

HEADER

echo "## 1. JWT Package Check" >> $OUTPUT
echo "" >> $OUTPUT
echo "Checking if jsonwebtoken is installed..." >> $OUTPUT
if grep -q "jsonwebtoken" package.json; then
    echo "✅ jsonwebtoken found in package.json" >> $OUTPUT
    grep "jsonwebtoken" package.json >> $OUTPUT
else
    echo "❌ jsonwebtoken NOT found in package.json" >> $OUTPUT
fi
echo "" >> $OUTPUT

echo "## 2. JWT Usage in Backend" >> $OUTPUT
echo "" >> $OUTPUT
echo "### Files using JWT:" >> $OUTPUT
grep -r "require.*jsonwebtoken\|require.*jwt\|import.*jwt" --include="*.js" . 2>/dev/null >> $OUTPUT
echo "" >> $OUTPUT

echo "### JWT Sign/Verify Usage:" >> $OUTPUT
grep -r "jwt.sign\|jwt.verify\|jwt.decode" --include="*.js" . 2>/dev/null >> $OUTPUT
echo "" >> $OUTPUT

echo "## 3. Authentication Middleware" >> $OUTPUT
echo "" >> $OUTPUT
if [ -d "middleware" ]; then
    echo "### Middleware files:" >> $OUTPUT
    ls -la middleware/ >> $OUTPUT
    echo "" >> $OUTPUT
    
    for file in middleware/*.js; do
        if grep -q "auth\|token\|jwt" "$file"; then
            echo "### $file (contains auth logic):" >> $OUTPUT
            echo "\`\`\`javascript" >> $OUTPUT
            cat "$file" >> $OUTPUT
            echo "\`\`\`" >> $OUTPUT
            echo "" >> $OUTPUT
        fi
    done
else
    echo "❌ No middleware directory found" >> $OUTPUT
fi
echo "" >> $OUTPUT

echo "## 4. Protected Routes" >> $OUTPUT
echo "" >> $OUTPUT
echo "### Routes with authentication:" >> $OUTPUT
grep -r "authenticate\|verifyToken\|checkAuth\|requireAuth" --include="*.js" routes/ 2>/dev/null >> $OUTPUT
echo "" >> $OUTPUT

echo "## 5. Frontend Token Storage" >> $OUTPUT
echo "" >> $OUTPUT
echo "### LocalStorage usage:" >> $OUTPUT
grep -r "localStorage.*token\|sessionStorage.*token" --include="*.jsx" --include="*.js" src/ 2>/dev/null | head -20 >> $OUTPUT
echo "" >> $OUTPUT

echo "### Token in API calls:" >> $OUTPUT
grep -r "Authorization.*Bearer\|headers.*token" --include="*.jsx" --include="*.js" src/ 2>/dev/null | head -20 >> $OUTPUT
echo "" >> $OUTPUT

echo "## 6. Auth Context/Provider" >> $OUTPUT
echo "" >> $OUTPUT
find src -name "*uth*ontext*" -o -name "*uth*rovider*" >> $OUTPUT
echo "" >> $OUTPUT

echo "## 7. Login/Logout Implementation" >> $OUTPUT
echo "" >> $OUTPUT
echo "### Backend auth routes:" >> $OUTPUT
if [ -f "routes/authRoutes.js" ]; then
    echo "\`\`\`javascript" >> $OUTPUT
    cat routes/authRoutes.js >> $OUTPUT
    echo "\`\`\`" >> $OUTPUT
fi
echo "" >> $OUTPUT

echo "### Frontend login pages:" >> $OUTPUT
find src -name "*ogin*" >> $OUTPUT
echo "" >> $OUTPUT

echo "## 8. JWT Secret Configuration" >> $OUTPUT
echo "" >> $OUTPUT
echo "### Checking .env for JWT_SECRET:" >> $OUTPUT
if grep -q "JWT_SECRET" .env 2>/dev/null; then
    echo "✅ JWT_SECRET found in .env" >> $OUTPUT
    grep "JWT_SECRET" .env >> $OUTPUT
else
    echo "❌ JWT_SECRET NOT found in .env" >> $OUTPUT
fi
echo "" >> $OUTPUT

echo "## 9. Current Authentication Flow" >> $OUTPUT
echo "" >> $OUTPUT
echo "### Summary:" >> $OUTPUT
echo "" >> $OUTPUT

# Check if JWT is being used
if grep -q "jsonwebtoken" package.json; then
    echo "- ✅ JWT package installed" >> $OUTPUT
else
    echo "- ❌ JWT package NOT installed" >> $OUTPUT
fi

if [ -d "middleware" ] && grep -q "auth\|token" middleware/*.js 2>/dev/null; then
    echo "- ✅ Authentication middleware exists" >> $OUTPUT
else
    echo "- ❌ No authentication middleware found" >> $OUTPUT
fi

if grep -q "JWT_SECRET" .env 2>/dev/null; then
    echo "- ✅ JWT_SECRET configured" >> $OUTPUT
else
    echo "- ❌ JWT_SECRET not configured" >> $OUTPUT
fi

if grep -r "localStorage.*token" src/ 2>/dev/null | grep -q .; then
    echo "- ✅ Frontend stores tokens" >> $OUTPUT
else
    echo "- ❌ Frontend doesn't store tokens" >> $OUTPUT
fi

echo "" >> $OUTPUT

echo "✅ Analysis complete! Report saved to: $OUTPUT"
cat $OUTPUT
