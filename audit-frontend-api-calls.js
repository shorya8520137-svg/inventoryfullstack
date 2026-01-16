const fs = require('fs');
const path = require('path');

console.log('================================================================================');
console.log('COMPLETE FRONTEND API AUDIT');
console.log('================================================================================');
console.log('Checking all active modules for API calls and Authorization headers');
console.log('Date:', new Date().toISOString());
console.log();

// Active modules based on sidebar/navigation
const activeModules = [
    // Main pages
    { name: 'Login', path: 'src/app/login/page.jsx' },
    { name: 'Dashboard', path: 'src/app/dashboard/page.jsx' },
    
    // Products Module
    { name: 'Products Manager', path: 'src/app/products/ProductManager.jsx' },
    { name: 'Products Page', path: 'src/app/products/page.jsx' },
    { name: 'Transfer Form', path: 'src/app/products/TransferForm.jsx' },
    
    // Inventory Module
    { name: 'Inventory Sheet', path: 'src/app/inventory/InventorySheet.jsx' },
    { name: 'Product Tracker', path: 'src/app/inventory/ProductTracker.jsx' },
    { name: 'Self Transfer', path: 'src/app/inventory/selftransfer/SelfTransfer.jsx' },
    { name: 'Damage Recovery Modal', path: 'src/app/inventory/selftransfer/DamageRecoveryModal.jsx' },
    { name: 'Return Modal', path: 'src/app/inventory/selftransfer/ReturnModal.jsx' },
    { name: 'Store Inventory', path: 'src/app/inventory/store/store.js' },
    
    // Orders Module
    { name: 'Order Sheet', path: 'src/app/order/OrderSheet.jsx' },
    { name: 'Dispatch Form', path: 'src/app/order/dispatch/DispatchForm.jsx' },
    { name: 'Website Order', path: 'src/app/order/websiteorder/websiteorder.jsx' },
    
    // Permissions Module
    { name: 'Permissions Page', path: 'src/app/permissions/page.jsx' },
    { name: 'Enhanced Audit Tab', path: 'src/app/permissions/EnhancedAuditTab.jsx' },
    
    // API Services
    { name: 'API Utils', path: 'src/utils/api.js' },
    { name: 'Products API', path: 'src/services/api/products.js' },
    { name: 'Dispatch API', path: 'src/services/api/dispatch.js' },
    { name: 'Damage Recovery API', path: 'src/services/api/damageRecovery.js' },
    { name: 'Returns API', path: 'src/services/api/returns.js' },
    { name: 'Bulk Upload API', path: 'src/services/api/bulkUpload.js' },
    { name: 'Index API', path: 'src/services/api/index.js' },
];

const issues = [];
const summary = {
    totalFiles: 0,
    filesChecked: 0,
    filesNotFound: 0,
    totalFetchCalls: 0,
    fetchWithAuth: 0,
    fetchWithoutAuth: 0,
    apiRequestCalls: 0,
    issues: []
};

// Patterns to search for
const patterns = {
    fetch: /fetch\s*\([^)]+\)/g,
    authHeader: /Authorization.*Bearer|Bearer.*token/gi,
    apiRequest: /apiRequest\s*\(/g,
    localStorage: /localStorage\.getItem\s*\(\s*['"]token['"]\s*\)/g,
};

function analyzeFile(filePath, moduleName) {
    if (!fs.existsSync(filePath)) {
        summary.filesNotFound++;
        issues.push({
            module: moduleName,
            severity: 'WARNING',
            issue: 'File not found',
            file: filePath
        });
        return null;
    }
    
    summary.filesChecked++;
    const content = fs.readFileSync(filePath, 'utf8');
    
    const analysis = {
        module: moduleName,
        file: filePath,
        fetchCalls: [],
        hasAuth: false,
        usesApiRequest: false,
        issues: []
    };
    
    // Find all fetch calls
    const fetchMatches = content.match(patterns.fetch) || [];
    summary.totalFetchCalls += fetchMatches.length;
    
    // Check for Authorization headers
    const hasAuthHeader = patterns.authHeader.test(content);
    const hasLocalStorage = patterns.localStorage.test(content);
    analysis.hasAuth = hasAuthHeader || hasLocalStorage;
    
    // Check for apiRequest usage
    const apiRequestMatches = content.match(patterns.apiRequest) || [];
    analysis.usesApiRequest = apiRequestMatches.length > 0;
    summary.apiRequestCalls += apiRequestMatches.length;
    
    // Analyze each fetch call
    fetchMatches.forEach((fetchCall, index) => {
        const lineNumber = content.substring(0, content.indexOf(fetchCall)).split('\n').length;
        
        // Extract URL from fetch call
        const urlMatch = fetchCall.match(/fetch\s*\(\s*[`'"](.*?)[`'"]/);
        const url = urlMatch ? urlMatch[1] : 'Unknown URL';
        
        // Check if this specific fetch has auth
        const contextStart = Math.max(0, content.indexOf(fetchCall) - 500);
        const contextEnd = Math.min(content.length, content.indexOf(fetchCall) + 500);
        const context = content.substring(contextStart, contextEnd);
        
        const hasAuthInContext = /Authorization.*Bearer|Bearer.*token/i.test(context);
        const hasTokenVar = /const\s+token\s*=\s*localStorage\.getItem/i.test(context);
        
        if (hasAuthInContext || hasTokenVar) {
            summary.fetchWithAuth++;
        } else {
            summary.fetchWithoutAuth++;
            
            // Check if it's a login or public endpoint
            const isPublicEndpoint = /login|auth\/login|public/i.test(url);
            
            if (!isPublicEndpoint) {
                analysis.issues.push({
                    line: lineNumber,
                    type: 'MISSING_AUTH',
                    url: url,
                    fetchCall: fetchCall.substring(0, 100) + '...'
                });
                
                issues.push({
                    module: moduleName,
                    severity: 'HIGH',
                    issue: 'Fetch call without Authorization header',
                    file: filePath,
                    line: lineNumber,
                    url: url
                });
            }
        }
        
        analysis.fetchCalls.push({
            line: lineNumber,
            url: url,
            hasAuth: hasAuthInContext || hasTokenVar
        });
    });
    
    return analysis;
}

// Run audit
console.log('Scanning active modules...\n');

const results = [];
summary.totalFiles = activeModules.length;

activeModules.forEach(module => {
    const analysis = analyzeFile(module.path, module.name);
    if (analysis) {
        results.push(analysis);
    }
});

// Print results
console.log('================================================================================');
console.log('AUDIT RESULTS BY MODULE');
console.log('================================================================================\n');

results.forEach(result => {
    const statusIcon = result.issues.length === 0 ? '✅' : '⚠️';
    const authStatus = result.hasAuth || result.usesApiRequest ? '✅ Has Auth' : '❌ No Auth';
    
    console.log(`${statusIcon} ${result.module}`);
    console.log(`   File: ${result.file}`);
    console.log(`   Fetch Calls: ${result.fetchCalls.length}`);
    console.log(`   Uses apiRequest: ${result.usesApiRequest ? 'Yes' : 'No'}`);
    console.log(`   Auth Status: ${authStatus}`);
    
    if (result.issues.length > 0) {
        console.log(`   ⚠️  Issues Found: ${result.issues.length}`);
        result.issues.forEach(issue => {
            console.log(`      - Line ${issue.line}: ${issue.type}`);
            console.log(`        URL: ${issue.url}`);
        });
    }
    console.log();
});

// Print issues summary
if (issues.length > 0) {
    console.log('================================================================================');
    console.log('ISSUES FOUND');
    console.log('================================================================================\n');
    
    const highIssues = issues.filter(i => i.severity === 'HIGH');
    const warningIssues = issues.filter(i => i.severity === 'WARNING');
    
    if (highIssues.length > 0) {
        console.log('🔴 HIGH PRIORITY ISSUES:\n');
        highIssues.forEach((issue, index) => {
            console.log(`${index + 1}. ${issue.module}`);
            console.log(`   Issue: ${issue.issue}`);
            console.log(`   File: ${issue.file}`);
            if (issue.line) console.log(`   Line: ${issue.line}`);
            if (issue.url) console.log(`   URL: ${issue.url}`);
            console.log();
        });
    }
    
    if (warningIssues.length > 0) {
        console.log('⚠️  WARNINGS:\n');
        warningIssues.forEach((issue, index) => {
            console.log(`${index + 1}. ${issue.module}: ${issue.issue}`);
        });
        console.log();
    }
}

// Print summary
console.log('================================================================================');
console.log('SUMMARY');
console.log('================================================================================\n');

console.log('Files:');
console.log(`  Total Modules: ${summary.totalFiles}`);
console.log(`  Files Checked: ${summary.filesChecked}`);
console.log(`  Files Not Found: ${summary.filesNotFound}`);
console.log();

console.log('API Calls:');
console.log(`  Total fetch() Calls: ${summary.totalFetchCalls}`);
console.log(`  With Authorization: ${summary.fetchWithAuth} (${((summary.fetchWithAuth / summary.totalFetchCalls) * 100).toFixed(1)}%)`);
console.log(`  Without Authorization: ${summary.fetchWithoutAuth} (${((summary.fetchWithoutAuth / summary.totalFetchCalls) * 100).toFixed(1)}%)`);
console.log(`  Using apiRequest(): ${summary.apiRequestCalls}`);
console.log();

console.log('Issues:');
console.log(`  High Priority: ${issues.filter(i => i.severity === 'HIGH').length}`);
console.log(`  Warnings: ${issues.filter(i => i.severity === 'WARNING').length}`);
console.log(`  Total: ${issues.length}`);
console.log();

// Final verdict
const criticalIssues = issues.filter(i => i.severity === 'HIGH').length;
if (criticalIssues === 0 && summary.filesNotFound === 0) {
    console.log('✅ AUDIT PASSED - All API calls have proper authorization!');
} else if (criticalIssues === 0) {
    console.log('⚠️  AUDIT PASSED WITH WARNINGS - Some files not found but no critical issues');
} else {
    console.log(`❌ AUDIT FAILED - ${criticalIssues} critical issues found`);
    console.log('   Fix missing Authorization headers before deployment!');
}

console.log();
console.log('================================================================================');
console.log('Audit Complete -', new Date().toISOString());
console.log('================================================================================');

// Save detailed report
const report = {
    timestamp: new Date().toISOString(),
    summary,
    results,
    issues
};

fs.writeFileSync('FRONTEND_AUDIT_REPORT.json', JSON.stringify(report, null, 2));
console.log('\n📄 Detailed report saved to: FRONTEND_AUDIT_REPORT.json');
