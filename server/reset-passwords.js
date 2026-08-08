require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function main() {
    const newPassword = 'Prince@123';
    const hashed = bcrypt.hashSync(newPassword, 10);
    
    const emails = [
        'princekumar009142@gmail.com',
        'princekumar01zc@gmail.com',
        'sm72788150@gmail.com',
        'testcheck99@test.com'
    ];
    
    for (const email of emails) {
        try {
            const r = await pool.query(
                'UPDATE users SET password = $1 WHERE email = $2 RETURNING email, role',
                [hashed, email]
            );
            if (r.rows.length > 0) {
                console.log(`✅ Reset password for: ${r.rows[0].email} (${r.rows[0].role})`);
            } else {
                console.log(`⚠️  No user found with email: ${email}`);
            }
        } catch (err) {
            console.error(`❌ Error for ${email}:`, err.message);
        }
    }
    
    console.log('\n🔑 New password for all above accounts: Prince@123');
    await pool.end();
}

main();
