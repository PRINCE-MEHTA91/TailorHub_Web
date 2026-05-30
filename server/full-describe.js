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

        // List all columns in the live users table
        const colRes = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default, character_maximum_length
            FROM information_schema.columns
            WHERE table_name = 'users' AND table_schema = 'public'
            ORDER BY ordinal_position
        `);
        console.log('ALL COLUMNS IN LIVE users TABLE:');
        colRes.rows.forEach(r => {
            const type = r.character_maximum_length
                ? `${r.data_type}(${r.character_maximum_length})`
                : r.data_type;
            console.log(`  ${r.column_name} | ${type} | Null=${r.is_nullable} | Default=${r.column_default}`);
        });

        // Also check search_path and current database
        const dbRes = await client.query("SELECT current_database() as db, current_schema() as schema");
        console.log('\nCurrent DB:', dbRes.rows[0].db, '| Schema:', dbRes.rows[0].schema);

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
