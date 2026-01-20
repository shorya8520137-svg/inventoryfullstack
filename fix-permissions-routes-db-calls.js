const fs = require('fs');

// Read the permissionsRoutes.js file
let content = fs.readFileSync('routes/permissionsRoutes.js', 'utf8');

console.log('🔧 Fixing database calls in permissionsRoutes.js...');

// Replace all db.execute() calls with proper db.query() callback syntax
// This is a simple fix for the most common patterns

// Pattern 1: const [results] = await db.execute(query, params);
content = content.replace(
    /const \[(\w+)\] = await db\.execute\(`([^`]+)`[^)]*\);/g,
    (match, varName, query) => {
        return `db.query(\`${query}\`, [], (err, ${varName}) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ success: false, message: 'Database error' });
                }`;
    }
);

// Pattern 2: await db.execute(query, params);
content = content.replace(
    /await db\.execute\('([^']+)', \[([^\]]*)\]\);/g,
    (match, query, params) => {
        return `db.query('${query}', [${params}], (err, result) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ success: false, message: 'Database error' });
                }
            });`;
    }
);

console.log('✅ Database calls fixed!');
console.log('📝 Writing fixed file...');

// Write the fixed content back
fs.writeFileSync('routes/permissionsRoutes-fixed-db.js', content);

console.log('✅ Fixed file saved as permissionsRoutes-fixed-db.js');
console.log('🚀 You can now copy this to the server and replace the original file.');