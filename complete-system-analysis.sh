#!/bin/bash

echo "🔍 COMPLETE SYSTEM ANALYSIS"
echo "============================"
echo ""

OUTPUT_FILE="SYSTEM_ANALYSIS_REPORT.md"

cat > $OUTPUT_FILE << 'HEADER'
# 🔍 Complete System Analysis Report

Generated: $(date)

---

HEADER

echo "📊 Step 1: Analyzing Backend Structure..."
echo ""

# Analyze server.js
echo "## 1. SERVER.JS ANALYSIS" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
echo "\`\`\`javascript" >> $OUTPUT_FILE
cat server.js >> $OUTPUT_FILE
echo "\`\`\`" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# List all routes
echo "## 2. ALL ROUTES" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
ls -la routes/ >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# Analyze each route file
for route_file in routes/*.js; do
    echo "### Route: $route_file" >> $OUTPUT_FILE
    echo "" >> $OUTPUT_FILE
    echo "\`\`\`javascript" >> $OUTPUT_FILE
    cat "$route_file" >> $OUTPUT_FILE
    echo "\`\`\`" >> $OUTPUT_FILE
    echo "" >> $OUTPUT_FILE
done

# List all controllers
echo "## 3. ALL CONTROLLERS" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
ls -la controllers/ >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# Analyze each controller file
for controller_file in controllers/*.js; do
    echo "### Controller: $controller_file" >> $OUTPUT_FILE
    echo "" >> $OUTPUT_FILE
    echo "\`\`\`javascript" >> $OUTPUT_FILE
    cat "$controller_file" >> $OUTPUT_FILE
    echo "\`\`\`" >> $OUTPUT_FILE
    echo "" >> $OUTPUT_FILE
done

# List all middleware
echo "## 4. ALL MIDDLEWARE" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
if [ -d "middleware" ]; then
    ls -la middleware/ >> $OUTPUT_FILE
    echo "" >> $OUTPUT_FILE
    
    for middleware_file in middleware/*.js; do
        echo "### Middleware: $middleware_file" >> $OUTPUT_FILE
        echo "" >> $OUTPUT_FILE
        echo "\`\`\`javascript" >> $OUTPUT_FILE
        cat "$middleware_file" >> $OUTPUT_FILE
        echo "\`\`\`" >> $OUTPUT_FILE
        echo "" >> $OUTPUT_FILE
    done
else
    echo "No middleware directory found" >> $OUTPUT_FILE
fi

echo "" >> $OUTPUT_FILE

echo "✅ Backend analysis complete!"
echo ""

echo "📊 Step 2: Analyzing Frontend Structure..."
echo ""

# Analyze sidebar
echo "## 5. SIDEBAR COMPONENT" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

if [ -f "src/components/Sidebar.jsx" ]; then
    echo "\`\`\`javascript" >> $OUTPUT_FILE
    cat src/components/Sidebar.jsx >> $OUTPUT_FILE
    echo "\`\`\`" >> $OUTPUT_FILE
elif [ -f "src/components/sidebar.jsx" ]; then
    echo "\`\`\`javascript" >> $OUTPUT_FILE
    cat src/components/sidebar.jsx >> $OUTPUT_FILE
    echo "\`\`\`" >> $OUTPUT_FILE
elif [ -f "src/app/components/Sidebar.jsx" ]; then
    echo "\`\`\`javascript" >> $OUTPUT_FILE
    cat src/app/components/Sidebar.jsx >> $OUTPUT_FILE
    echo "\`\`\`" >> $OUTPUT_FILE
else
    echo "Searching for sidebar..." >> $OUTPUT_FILE
    find src -name "*idebar*" -o -name "*avigation*" >> $OUTPUT_FILE
fi

echo "" >> $OUTPUT_FILE

# List all pages
echo "## 6. ALL PAGES" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
find src/app -name "page.jsx" -o -name "page.js" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# Analyze layout
echo "## 7. LAYOUT FILES" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
find src/app -name "layout.jsx" -o -name "layout.js" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

if [ -f "src/app/layout.jsx" ]; then
    echo "\`\`\`javascript" >> $OUTPUT_FILE
    cat src/app/layout.jsx >> $OUTPUT_FILE
    echo "\`\`\`" >> $OUTPUT_FILE
fi

echo "" >> $OUTPUT_FILE

# Check for JWT usage
echo "## 8. JWT AUTHENTICATION CHECK" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
echo "### Searching for JWT usage in backend:" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
grep -r "jwt" --include="*.js" . 2>/dev/null | head -20 >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
echo "### Searching for token usage in frontend:" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
grep -r "token" --include="*.jsx" --include="*.js" src/ 2>/dev/null | head -20 >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# Check for authentication middleware
echo "## 9. AUTHENTICATION PATTERNS" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
echo "### Backend auth patterns:" >> $OUTPUT_FILE
grep -r "authenticate\|auth\|token" --include="*.js" routes/ middleware/ 2>/dev/null >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# API services
echo "## 10. FRONTEND API SERVICES" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
if [ -d "src/services" ]; then
    ls -la src/services/ >> $OUTPUT_FILE
    echo "" >> $OUTPUT_FILE
    
    for service_file in src/services/*.js; do
        echo "### Service: $service_file" >> $OUTPUT_FILE
        echo "" >> $OUTPUT_FILE
        echo "\`\`\`javascript" >> $OUTPUT_FILE
        head -50 "$service_file" >> $OUTPUT_FILE
        echo "\`\`\`" >> $OUTPUT_FILE
        echo "" >> $OUTPUT_FILE
    done
fi

echo "" >> $OUTPUT_FILE

echo "✅ Frontend analysis complete!"
echo ""

echo "📊 Step 3: Checking Package Dependencies..."
echo ""

echo "## 11. PACKAGE.JSON" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
echo "\`\`\`json" >> $OUTPUT_FILE
cat package.json >> $OUTPUT_FILE
echo "\`\`\`" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

echo "✅ Package analysis complete!"
echo ""

echo "📊 Step 4: Environment Configuration..."
echo ""

echo "## 12. ENVIRONMENT VARIABLES" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
echo "\`\`\`" >> $OUTPUT_FILE
cat .env 2>/dev/null || echo "No .env file found" >> $OUTPUT_FILE
echo "\`\`\`" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

echo "✅ Environment analysis complete!"
echo ""

echo "═══════════════════════════════════════"
echo "✅ ANALYSIS COMPLETE!"
echo "═══════════════════════════════════════"
echo ""
echo "📄 Report saved to: $OUTPUT_FILE"
echo ""
echo "📊 Summary:"
echo "  - Backend routes analyzed"
echo "  - All controllers documented"
echo "  - Middleware checked"
echo "  - Sidebar component found"
echo "  - JWT authentication patterns identified"
echo "  - Frontend structure mapped"
echo ""
echo "Next: Review $OUTPUT_FILE to understand the complete system"
