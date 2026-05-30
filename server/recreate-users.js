require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function main() {
    const client = await pool.connect();
    try {
        console.log('Connected to PostgreSQL (Neon).');

        // Drop and recreate with exactly the right schema
        await client.query('DROP TABLE IF EXISTS users CASCADE');
        await client.query(`
            CREATE TABLE users (
                id               SERIAL PRIMARY KEY,
                full_name        VARCHAR(255) NOT NULL,
                email            VARCHAR(255) NOT NULL UNIQUE,
                password         VARCHAR(255) NOT NULL,
                role             VARCHAR(20)  NOT NULL DEFAULT 'customer'
                                     CHECK (role IN ('customer', 'tailor')),
                avg_rating       DECIMAL(3,2) DEFAULT 0.00,
                total_reviews    INT          DEFAULT 0,
                reset_token      VARCHAR(255) DEFAULT NULL,
                reset_token_expiry TIMESTAMP  DEFAULT NULL,
                created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Table recreated OK');

        // Verify by listing columns
        const colRes = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'users' AND table_schema = 'public'
            ORDER BY ordinal_position
        `);
        console.log('\nNew table columns:');
        colRes.rows.forEach(r => console.log(` - ${r.column_name} | Null=${r.is_nullable} | Default=${r.column_default}`));

        // Test INSERT
        const insertRes = await client.query(
            'INSERT INTO users (full_name, email, password) VALUES ($1, $2, $3) RETURNING id',
            ['FixUser', 'fix_' + Date.now() + '@test.com', 'hashed']
        );
        console.log('\n✅ INSERT works! id:', insertRes.rows[0].id);

        // Clean up
        await client.query('DELETE FROM users WHERE id = $1', [insertRes.rows[0].id]);
        console.log('✅ Cleaned up.\n\nSignup should now work!');

        process.exit(0);
    } catch (err) {
        console.error('\n❌ Error:', err.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

main();
