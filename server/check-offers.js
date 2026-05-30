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

        const tailorsRes = await client.query("SELECT id, full_name, email, role FROM users WHERE role = 'tailor'");
        console.log('\n=== TAILORS ===');
        console.log(JSON.stringify(tailorsRes.rows, null, 2));

        const offersRes = await client.query('SELECT * FROM offers');
        console.log('\n=== OFFERS IN DB ===');
        console.log(JSON.stringify(offersRes.rows, null, 2));
        console.log('Total offers:', offersRes.rows.length);

        const profilesRes = await client.query(
            'SELECT user_id, shop_name, jsonb_array_length(COALESCE(deals, \'[]\'::jsonb)) as deal_count FROM tailor_profiles'
        );
        console.log('\n=== PROFILES (deal counts) ===');
        console.log(JSON.stringify(profilesRes.rows, null, 2));

        const tailors = tailorsRes.rows;
        const offers  = offersRes.rows;

        // If no tailors, just exit
        if (!tailors || tailors.length === 0) {
            console.log('\nNo tailors found - cannot insert test offer');
            process.exit(0);
        }

        // Insert a test offer for the first tailor if no offers exist
        if (offers.length === 0) {
            const tailorId = tailors[0].id;
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            const futureDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // +60 days

            try {
                const insertRes = await client.query(
                    'INSERT INTO offers (tailor_id, title, description, discount, discount_type, start_date, end_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
                    [tailorId, 'Summer Special Sale', 'Flat 30% off on all stitching services this summer!', '30', 'percent', today, futureDate]
                );
                console.log('\n✅ Test offer inserted! ID:', insertRes.rows[0].id);
                console.log('   Tailor:', tailors[0].full_name, '(id:', tailorId + ')');
                console.log('   Valid:', today, 'to', futureDate);
            } catch (insertErr) {
                console.error('\nInsert error:', insertErr.message);
            }
        } else {
            console.log('\nOffers already exist - no insert needed');
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
