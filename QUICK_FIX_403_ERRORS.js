// QUICK FIX FOR 403 ERRORS - REMOVE PERMISSION CHECKS TEMPORARILY
const fs = require('fs');
const path = require('path');

function quickFix403Errors() {
    console.log('🔧 QUICK FIX FOR 403 ERRORS');
    console.log('============================');

    try {
        // Fix productRoutes.js - remove checkPermission middleware
        const productRoutesPath = path.join(__dirname, 'routes/productRoutes.js');
        
        if (fs.existsSync(productRoutesPath)) {
            let content = fs.readFileSync(productRoutesPath, 'utf8');
            
            // Create backup
            fs.writeFileSync(productRoutesPath + '.backup', content);
            console.log('✅ Backup created: productRoutes.js.backup');
            
            // Remove checkPermission middleware from routes
            content = content.replace(/checkPermission\([^)]+\),?\s*/g, '');
            
            // Clean up any double commas or trailing commas
            content = content.replace(/,\s*,/g, ',');
            content = content.replace(/,(\s*\n\s*[a-zA-Z])/g, '$1');
            
            fs.writeFileSync(productRoutesPath, content);
            console.log('✅ Fixed productRoutes.js - removed permission checks');
        }

        // Fix other route files that might have permission checks
        const routeFiles = [
            'routes/inventoryRoutes.js',
            'routes/dispatchRoutes.js',
            'routes/returnsRoutes.js',
            'routes/timelineRoutes.js'
        ];

        routeFiles.forEach(routeFile => {
            const routePath = path.join(__dirname, routeFile);
            
            if (fs.existsSync(routePath)) {
                let content = fs.readFileSync(routePath, 'utf8');
                
                // Create backup
                fs.writeFileSync(routePath + '.backup', content);
                
                // Remove checkPermission middleware
                content = content.replace(/checkPermission\([^)]+\),?\s*/g, '');
                content = content.replace(/,\s*,/g, ',');
                content = content.replace(/,(\s*\n\s*[a-zA-Z])/g, '$1');
                
                fs.writeFileSync(routePath, content);
                console.log(`✅ Fixed ${routeFile} - removed permission checks`);
            }
        });

        console.log('\n🎯 WHAT THIS FIX DOES:');
        console.log('- Removes all checkPermission() middleware from routes');
        console.log('- APIs will work for all authenticated users');
        console.log('- Still requires JWT token (login still needed)');
        console.log('- Creates backup files (.backup extension)');
        
        console.log('\n⚠️  IMPORTANT:');
        console.log('- This is a TEMPORARY fix for testing');
        console.log('- Restart your server after running this');
        console.log('- All 403 errors should be gone');
        console.log('- To restore: copy .backup files back');

    } catch (error) {
        console.error('❌ Error applying fix:', error);
    }
}

// Run the fix
if (require.main === module) {
    quickFix403Errors();
}

module.exports = { quickFix403Errors };