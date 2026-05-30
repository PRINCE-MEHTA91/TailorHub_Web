require('dotenv').config();
const { Pool } = require('pg');

console.log('Connecting to Neon PostgreSQL:');
console.log('  DATABASE_URL set:', !!process.env.DATABASE_URL);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function main() {
    const client = await pool.connect();
    try {
        console.log('\n✅ Connected to PostgreSQL OK\n');

        // Check if users table exists and list columns
        const colRes = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'users' AND table_schema = 'public'
            ORDER BY ordinal_position
        `);

        if (colRes.rows.length === 0) {
            console.error('❌ users table not found.');
            console.error('   → Run the db.sql script against your Neon database.');
            process.exit(1);
        }

        console.log('✅ users table columns:');
        colRes.rows.forEach(r => console.log(`  - ${r.column_name} | ${r.data_type} | ${r.is_nullable === 'NO' ? 'NOT NULL' : 'NULLABLE'}`));

        // Test INSERT
        console.log('\nTesting INSERT...');
        const insertRes = await client.query(
            'INSERT INTO users (full_name, email, password) VALUES ($1, $2, $3) RETURNING id',
            ['Test User', 'test_' + Date.now() + '@test.com', 'hashedpassword']
        );
        console.log('✅ INSERT succeeded, new user id:', insertRes.rows[0].id);

        // Clean up test row
        await client.query('DELETE FROM users WHERE id = $1', [insertRes.rows[0].id]);
        console.log('✅ Cleaned up test row');

        process.exit(0);
    } catch (err) {
        console.error('\n❌ DB ERROR:', err.message);
        if (err.message.includes('connect')) {
            console.error('   → Check your DATABASE_URL in .env');
        } else if (err.message.includes('password')) {
            console.error('   → Wrong password in DATABASE_URL');
        }
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

main();
