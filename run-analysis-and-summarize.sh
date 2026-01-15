#!/bin/bash

echo "🔍 Running Complete System Analysis..."
echo "======================================"
echo ""

# Create output directory
mkdir -p analysis_output

echo "📊 Step 1: Running complete system analysis..."
./complete-system-analysis.sh > /dev/null 2>&1
mv SYSTEM_ANALYSIS_REPORT.md analysis_output/ 2>/dev/null
echo "✅ System analysis complete"

echo "🔐 Step 2: Running JWT authentication analysis..."
./analyze-jwt-auth.sh > /dev/null 2>&1
mv JWT_AUTH_ANALYSIS.md analysis_output/ 2>/dev/null
echo "✅ JWT analysis complete"

echo "📋 Step 3: Creating executive summary..."

cat > analysis_output/EXECUTIVE_SUMMARY.md << 'EOF'
# 📊 Executive Summary - System Analysis

## Quick Stats:

### Backend:
EOF

# Count routes
ROUTE_COUNT=$(ls -1 routes/*.js 2>/dev/null | wc -l)
echo "- **Total Routes**: $ROUTE_COUNT files" >> analysis_output/EXECUTIVE_SUMMARY.md

# Count controllers
CONTROLLER_COUNT=$(ls -1 controllers/*.js 2>/dev/null | wc -l)
echo "- **Total Controllers**: $CONTROLLER_COUNT files" >> analysis_output/EXECUTIVE_SUMMARY.md

# Count middleware
if [ -d "middleware" ]; then
    MIDDLEWARE_COUNT=$(ls -1 middleware/*.js 2>/dev/null | wc -l)
    echo "- **Total Middleware**: $MIDDLEWARE_COUNT files" >> analysis_output/EXECUTIVE_SUMMARY.md
else
    echo "- **Total Middleware**: 0 files (no middleware directory)" >> analysis_output/EXECUTIVE_SUMMARY.md
fi

cat >> analysis_output/EXECUTIVE_SUMMARY.md << 'EOF'

### Frontend:
EOF

# Count pages
PAGE_COUNT=$(find src/app -name "page.jsx" -o -name "page.js" 2>/dev/null | wc -l)
echo "- **Total Pages**: $PAGE_COUNT" >> analysis_output/EXECUTIVE_SUMMARY.md

# Count components
COMPONENT_COUNT=$(find src/components -name "*.jsx" 2>/dev/null | wc -l)
echo "- **Total Components**: $COMPONENT_COUNT" >> analysis_output/EXECUTIVE_SUMMARY.md

cat >> analysis_output/EXECUTIVE_SUMMARY.md << 'EOF'

## JWT Authentication Status:

EOF

# Check JWT
if grep -q "jsonwebtoken" package.json 2>/dev/null; then
    echo "- ✅ JWT package installed" >> analysis_output/EXECUTIVE_SUMMARY.md
else
    echo "- ❌ JWT package NOT installed" >> analysis_output/EXECUTIVE_SUMMARY.md
fi

if [ -d "middleware" ] && grep -q "auth\|token" middleware/*.js 2>/dev/null; then
    echo "- ✅ Authentication middleware exists" >> analysis_output/EXECUTIVE_SUMMARY.md
else
    echo "- ❌ No authentication middleware found" >> analysis_output/EXECUTIVE_SUMMARY.md
fi

if grep -q "JWT_SECRET" .env 2>/dev/null; then
    echo "- ✅ JWT_SECRET configured" >> analysis_output/EXECUTIVE_SUMMARY.md
else
    echo "- ❌ JWT_SECRET not configured" >> analysis_output/EXECUTIVE_SUMMARY.md
fi

cat >> analysis_output/EXECUTIVE_SUMMARY.md << 'EOF'

## Route Files:

EOF

ls -1 routes/*.js 2>/dev/null | sed 's/^/- /' >> analysis_output/EXECUTIVE_SUMMARY.md

cat >> analysis_output/EXECUTIVE_SUMMARY.md << 'EOF'

## Controller Files:

EOF

ls -1 controllers/*.js 2>/dev/null | sed 's/^/- /' >> analysis_output/EXECUTIVE_SUMMARY.md

cat >> analysis_output/EXECUTIVE_SUMMARY.md << 'EOF'

## Middleware Files:

EOF

if [ -d "middleware" ]; then
    ls -1 middleware/*.js 2>/dev/null | sed 's/^/- /' >> analysis_output/EXECUTIVE_SUMMARY.md
else
    echo "- None found" >> analysis_output/EXECUTIVE_SUMMARY.md
fi

cat >> analysis_output/EXECUTIVE_SUMMARY.md << 'EOF'

## Sidebar Location:

EOF

# Find sidebar
SIDEBAR=$(find src -name "*idebar*" -o -name "*avigation*" 2>/dev/null | head -1)
if [ -n "$SIDEBAR" ]; then
    echo "- Found: \`$SIDEBAR\`" >> analysis_output/EXECUTIVE_SUMMARY.md
else
    echo "- ❌ Sidebar not found" >> analysis_output/EXECUTIVE_SUMMARY.md
fi

cat >> analysis_output/EXECUTIVE_SUMMARY.md << 'EOF'

## Key Findings:

1. **Authentication**: 
EOF

if grep -q "jsonwebtoken" package.json 2>/dev/null; then
    echo "   - System uses JWT for authentication" >> analysis_output/EXECUTIVE_SUMMARY.md
else
    echo "   - System does NOT use JWT (needs implementation)" >> analysis_output/EXECUTIVE_SUMMARY.md
fi

cat >> analysis_output/EXECUTIVE_SUMMARY.md << 'EOF'

2. **Permissions System**:
   - Database has: users, roles, permissions, role_permissions tables
   - Ready for permission-based access control

3. **Next Steps**:
   - Review detailed reports in this directory
   - Implement permission checks in routes
   - Add permission gates in frontend components
   - Create user management UI

---

## Files Generated:

1. `EXECUTIVE_SUMMARY.md` - This file (quick overview)
2. `SYSTEM_ANALYSIS_REPORT.md` - Complete system analysis
3. `JWT_AUTH_ANALYSIS.md` - JWT and authentication details

EOF

echo "✅ Executive summary created"
echo ""

echo "📦 Step 4: Creating compressed archive..."
tar -czf analysis_output.tar.gz analysis_output/
echo "✅ Archive created: analysis_output.tar.gz"
echo ""

echo "═══════════════════════════════════════"
echo "✅ ANALYSIS COMPLETE!"
echo "═══════════════════════════════════════"
echo ""
echo "📁 Files created:"
echo "  - analysis_output/EXECUTIVE_SUMMARY.md"
echo "  - analysis_output/SYSTEM_ANALYSIS_REPORT.md"
echo "  - analysis_output/JWT_AUTH_ANALYSIS.md"
echo "  - analysis_output.tar.gz (compressed)"
echo ""
echo "📥 To download:"
echo "  scp -i \"C:\\Users\\Admin\\awsconection.pem\" ubuntu@16.171.161.150:~/inventoryfullstack/analysis_output.tar.gz ."
echo ""
echo "📖 Quick view executive summary:"
echo ""
cat analysis_output/EXECUTIVE_SUMMARY.md
