require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function main() {
    const client = await pool.connect();
    try {
        console.log('Connected to PostgreSQL (Neon).\n');

        // Check current columns in users table
        const colRes = await client.query(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'users' AND table_schema = 'public'
            ORDER BY ordinal_position
        `);
        const cols = colRes.rows.map(r => r.column_name);
        console.log('Current columns:', cols.join(', '));

        const hasUsername = cols.includes('username');
        const hasName     = cols.includes('name');
        const hasFullName = cols.includes('full_name');

        if (hasFullName) {
            console.log('\n✅ full_name column already exists — no ALTER needed.');
            console.log('   The server should be restarted. Run: node server.js');
        } else if (hasUsername) {
            console.log('\n⚠️  Found "username", renaming to "full_name"...');
            await client.query('ALTER TABLE users RENAME COLUMN username TO full_name');
            console.log('✅ Renamed "username" → "full_name" successfully!');
            await verifyInsert(client);
        } else if (hasName) {
            console.log('\n⚠️  Found "name", renaming to "full_name"...');
            await client.query('ALTER TABLE users RENAME COLUMN name TO full_name');
            console.log('✅ Renamed "name" → "full_name" successfully!');
            await verifyInsert(client);
        } else {
            console.log('\n❌ Cannot find a name-related column. Columns:', cols.join(', '));
            console.log('   You may need to drop and recreate the users table.');
            console.log('   Run server/db.sql against your Neon database.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

async function verifyInsert(client) {
    try {
        const res = await client.query(
            'INSERT INTO users (full_name, email, password) VALUES ($1, $2, $3) RETURNING id',
            ['Test Fix User', 'fix_verify_' + Date.now() + '@test.com', 'hashedpw']
        );
        console.log('\n✅ INSERT verified! signup will now work.');
        await client.query('DELETE FROM users WHERE id = $1', [res.rows[0].id]);
        console.log('✅ Test row cleaned up.\n');
        console.log('👉 Now restart your server:  node server.js');
    } catch (err) {
        console.error('\n❌ INSERT still failing after fix:', err.message);
    }
}

main();
