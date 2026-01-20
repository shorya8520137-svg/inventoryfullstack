const fs = require('fs');
const bcrypt = require('bcryptjs');

async function fixAuthControllerProperly() {
    console.log('🔧 Fixing Authentication Controller - PROPER SECURITY...\n');

    // Read current auth controller
    const authControllerPath = 'controllers/authController.js';
    let authController = fs.readFileSync(authControllerPath, 'utf8');

    // Replace the insecure password validation logic
    const oldPasswordLogic = `            // For demo purposes, allow simple passwords
            // In production, use proper bcrypt comparison
            let passwordValid = false;
            
            if (password === 'admin@123' && (user.role_name === 'admin' || user.role_name === 'super_admin')) {
                passwordValid = true;
            } else if (password === 'Admin@123' && (user.role_name === 'admin' || user.role_name === 'super_admin')) {
                passwordValid = true;
            } else {
                // Try bcrypt comparison for hashed passwords
                try {
                    passwordValid = await bcrypt.compare(password, user.password);
                } catch (bcryptError) {
                    // If bcrypt fails, try plain text comparison (for demo)
                    passwordValid = (password === user.password);
                }
            }`;

    const newPasswordLogic = `            // SECURE PASSWORD VALIDATION - BCRYPT ONLY
            let passwordValid = false;
            
            try {
                // Always use bcrypt for password comparison
                passwordValid = await bcrypt.compare(password, user.password);
            } catch (bcryptError) {
                console.error('Password validation error:', bcryptError);
                passwordValid = false;
            }`;

    // Replace the logic
    authController = authController.replace(oldPasswordLogic, newPasswordLogic);

    // Write the fixed controller
    fs.writeFileSync(authControllerPath, authController);
    console.log('✅ Fixed authController.js - Now uses ONLY bcrypt');

    // Now create a script to hash all existing plain text passwords
    console.log('\n🔐 Creating password hashing script...');
    
    const hashPasswordsScript = `const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function hashAllPasswords() {
    console.log('🔐 Hashing all plain text passwords...');

    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        user: 'inventory_user',
        password: 'StrongPass@123',
        database: 'inventory_db'
    });

    try {
        // Get all users with plain text passwords
        const [users] = await connection.execute(
            'SELECT id, email, password FROM users WHERE is_active = 1'
        );

        console.log(\`Found \${users.length} users to process...\`);

        for (const user of users) {
            // Check if password is already hashed (bcrypt hashes start with $2)
            if (user.password.startsWith('$2')) {
                console.log(\`✅ \${user.email}: Already hashed\`);
                continue;
            }

            // Hash the plain text password
            const saltRounds = 12; // Strong security
            const hashedPassword = await bcrypt.hash(user.password, saltRounds);

            // Update in database
            await connection.execute(
                'UPDATE users SET password = ? WHERE id = ?',
                [hashedPassword, user.id]
            );

            console.log(\`✅ \${user.email}: Password hashed\`);
        }

        console.log('\\n🎉 All passwords are now securely hashed!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await connection.end();
    }
}

hashAllPasswords();`;

    fs.writeFileSync('hash-all-passwords.js', hashPasswordsScript);
    console.log('✅ Created hash-all-passwords.js');

    console.log('\n📋 NEXT STEPS:');
    console.log('1. Upload fixed authController.js to server');
    console.log('2. Run hash-all-passwords.js on server to secure all passwords');
    console.log('3. Restart server');
    console.log('4. Test login with original passwords (they will be hashed automatically)');
}

fixAuthControllerProperly();