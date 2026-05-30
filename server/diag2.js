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

        // Get full table column description
        const colRes = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'users' AND table_schema = 'public'
            ORDER BY ordinal_position
        `);
        console.log('\n=== users TABLE COLUMNS ===');
        console.log(JSON.stringify(colRes.rows, null, 2));

        // Try the exact same INSERT as server.js
        try {
            const insertRes = await client.query(
                'INSERT INTO users (full_name, email, password) VALUES ($1, $2, $3) RETURNING id',
                ['TestUser', 'diag2_' + Date.now() + '@x.com', 'pwd']
            );
            console.log('\n=== INSERT result ===');
            console.log('SUCCESS insertId:', insertRes.rows[0].id);
            await client.query('DELETE FROM users WHERE id = $1', [insertRes.rows[0].id]);
        } catch (insertErr) {
            console.log('\n=== INSERT result ===');
            console.log('ERROR code:', insertErr.code);
            console.log('ERROR message:', insertErr.message);
        }

        process.exit(0);
    } catch (err) {
        console.error('Connection error:', err.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

main();
