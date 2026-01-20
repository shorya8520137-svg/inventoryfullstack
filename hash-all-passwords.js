const mysql = require('mysql2/promise');
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

        console.log(`Found ${users.length} users to process...`);

        for (const user of users) {
            // Check if password is already hashed (bcrypt hashes start with $2)
            if (user.password.startsWith('$2')) {
                console.log(`✅ ${user.email}: Already hashed`);
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

            console.log(`✅ ${user.email}: Password hashed`);
        }

        console.log('\n🎉 All passwords are now securely hashed!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await connection.end();
    }
}

hashAllPasswords();