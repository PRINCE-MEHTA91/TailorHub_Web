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

        await client.query(`
            CREATE TABLE IF NOT EXISTS feedbacks (
                id          SERIAL PRIMARY KEY,
                order_id    INT  NOT NULL UNIQUE,
                customer_id INT  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                tailor_id   INT  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                rating      INT  NOT NULL CHECK (rating >= 1 AND rating <= 5),
                message     TEXT,
                created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('feedbacks table created or already exists.');

        // Check if users table has avg_rating and total_reviews
        const colRes = await client.query(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'users' AND table_schema = 'public'
        `);
        const colNames = colRes.rows.map(r => r.column_name);

        if (!colNames.includes('avg_rating')) {
            await client.query('ALTER TABLE users ADD COLUMN avg_rating DECIMAL(3,2) DEFAULT 0.00');
            console.log('Added avg_rating to users table.');
        }
        if (!colNames.includes('total_reviews')) {
            await client.query('ALTER TABLE users ADD COLUMN total_reviews INT DEFAULT 0');
            console.log('Added total_reviews to users table.');
        }

        console.log('DB changes done.');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

main();
