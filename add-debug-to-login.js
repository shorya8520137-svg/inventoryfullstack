/**
 * ADD DEBUG LOGGING TO LOGIN PAGE
 * This will add console.log statements to see what's happening
 */

const fs = require('fs');

console.log('🔧 ADDING DEBUG LOGGING TO LOGIN PAGE');
console.log('='.repeat(50));

try {
    // Read the current login page
    const loginPagePath = 'src/app/login/page.jsx';
    let loginPageContent = fs.readFileSync(loginPagePath, 'utf8');
    
    console.log('✅ Read login page successfully');
    
    // Add debug logging to the handleSubmit function
    const originalHandleSubmit = `    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const apiBase = process.env.NEXT_PUBLIC_API_BASE;`;
            
    const debugHandleSubmit = `    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('🚀 LOGIN BUTTON CLICKED!');
        console.log('Email:', email);
        console.log('Password length:', password.length);
        
        setError("");
        setLoading(true);
        console.log('✅ Loading state set to true');

        try {
            const apiBase = process.env.NEXT_PUBLIC_API_BASE;
            console.log('🔗 API Base:', apiBase);
            
            if (!apiBase) {
                console.error('❌ API_BASE is undefined!');
                throw new Error('API_BASE environment variable not found');
            }`;
    
    // Replace the handleSubmit function
    if (loginPageContent.includes(originalHandleSubmit)) {
        loginPageContent = loginPageContent.replace(originalHandleSubmit, debugHandleSubmit);
        console.log('✅ Added debug logging to handleSubmit');
    } else {
        console.log('❌ Could not find handleSubmit function to modify');
    }
    
    // Add more debug logging to the fetch call
    const originalFetch = `            const response = await fetch(\`\${apiBase}/api/auth/login\`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });`;
            
    const debugFetch = `            console.log('📡 Making API call to:', \`\${apiBase}/api/auth/login\`);
            console.log('📦 Request body:', requestBody);
            
            const response = await fetch(\`\${apiBase}/api/auth/login\`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });
            
            console.log('📊 Response status:', response.status);
            console.log('📊 Response ok:', response.ok);`;
    
    if (loginPageContent.includes('const response = await fetch(`${apiBase}/api/auth/login`, {')) {
        loginPageContent = loginPageContent.replace(
            /const response = await fetch\(`\$\{apiBase\}\/api\/auth\/login`, \{[\s\S]*?\}\);/,
            debugFetch
        );
        console.log('✅ Added debug logging to fetch call');
    }
    
    // Add debug logging to the response handling
    const originalDataHandling = `            const data = await response.json();

            if (data.success) {`;
            
    const debugDataHandling = `            const data = await response.json();
            console.log('📋 Response data:', data);

            if (data.success) {
                console.log('✅ Login successful!');`;
    
    if (loginPageContent.includes(originalDataHandling)) {
        loginPageContent = loginPageContent.replace(originalDataHandling, debugDataHandling);
        console.log('✅ Added debug logging to response handling');
    }
    
    // Add debug logging to the catch block
    const originalCatch = `        } catch (error) {
            setError("Login failed. Please try again.");`;
            
    const debugCatch = `        } catch (error) {
            console.error('❌ Login error:', error);
            console.error('Error message:', error.message);
            console.error('Error type:', error.name);
            setError("Login failed. Please try again.");`;
    
    if (loginPageContent.includes(originalCatch)) {
        loginPageContent = loginPageContent.replace(originalCatch, debugCatch);
        console.log('✅ Added debug logging to catch block');
    }
    
    // Write the modified file
    fs.writeFileSync(loginPagePath, loginPageContent);
    console.log('✅ Updated login page with debug logging');
    
    console.log('');
    console.log('🎯 NEXT STEPS:');
    console.log('1. Rebuild and redeploy frontend:');
    console.log('   npm run build');
    console.log('   vercel --prod');
    console.log('');
    console.log('2. Open browser console (F12) on login page');
    console.log('3. Try to login and watch console messages');
    console.log('4. You will see exactly what happens when you click Sign In');
    
} catch (error) {
    console.error('❌ Error:', error.message);
}