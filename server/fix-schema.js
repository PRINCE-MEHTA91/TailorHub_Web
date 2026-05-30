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

        // List current columns in users table
        const colRes = await client.query(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'users' AND table_schema = 'public'
        `);
        const cols = colRes.rows.map(r => r.column_name);
        console.log('Current columns:', cols.join(', '));

        const toAdd = [];
        if (!cols.includes('full_name')) toAdd.push("ADD COLUMN full_name VARCHAR(255) NOT NULL DEFAULT ''");
        if (!cols.includes('reset_token')) toAdd.push('ADD COLUMN reset_token VARCHAR(255) DEFAULT NULL');
        if (!cols.includes('reset_token_expiry')) toAdd.push('ADD COLUMN reset_token_expiry TIMESTAMP DEFAULT NULL');

        if (toAdd.length === 0) {
            console.log('Schema is already up to date!');
        } else {
            const alter = `ALTER TABLE users ${toAdd.join(', ')}`;
            console.log('Running:', alter);
            await client.query(alter);
            console.log('Schema updated successfully!');
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

main();
