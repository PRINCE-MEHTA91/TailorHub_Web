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

        // Check PostgreSQL current date and timezone
        const dtRes = await client.query("SELECT CURRENT_DATE as today, NOW() as now, current_setting('TIMEZONE') as tz");
        console.log('PostgreSQL date/time info:', JSON.stringify(dtRes.rows[0], null, 2));

        // Check offer dates vs CURRENT_DATE
        const offersRes = await client.query(`
            SELECT id, title, start_date, end_date,
                   CURRENT_DATE as today,
                   CURRENT_DATE >= start_date AS started,
                   CURRENT_DATE <= end_date AS not_expired,
                   (end_date - CURRENT_DATE) AS days_left
            FROM offers
        `);

        console.log('\nOffer date analysis:');
        offersRes.rows.forEach(r => {
            const toStr = v => v instanceof Date ? v.toISOString().split('T')[0] : String(v).split('T')[0];
            console.log(`\nOffer ${r.id}: "${r.title}"`);
            console.log(`  start_date: ${toStr(r.start_date)}`);
            console.log(`  end_date:   ${toStr(r.end_date)}`);
            console.log(`  CURRENT_DATE: ${toStr(r.today)}`);
            console.log(`  started (CURRENT_DATE>=start): ${r.started}`);
            console.log(`  not_expired (CURRENT_DATE<=end): ${r.not_expired}`);
            console.log(`  days_left: ${r.days_left}`);
            console.log(`  ACTIVE: ${r.started && r.not_expired ? 'YES ✅' : 'NO ❌'}`);
        });

        // Delete old test offers and insert fresh ones
        await client.query('DELETE FROM offers WHERE id IN (1, 2)');
        console.log('\nDeleted old offers (1, 2)');

        const today = new Date();
        const todayLocal = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
        const futureDate = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);
        const futureDateLocal = `${futureDate.getFullYear()}-${String(futureDate.getMonth()+1).padStart(2,'0')}-${String(futureDate.getDate()).padStart(2,'0')}`;

        console.log(`\nInserting new offers valid ${todayLocal} to ${futureDateLocal}`);

        const inserts = [
            [4, 'Summer Special Sale', 'Flat 30% off on all stitching services this summer!', '30', 'percent', todayLocal, futureDateLocal],
            [7, 'New Customer Discount', 'Get 20% off on your first order with us', '20', 'percent', todayLocal, futureDateLocal],
        ];

        for (const [tailor_id, title, desc, discount, type, start, end] of inserts) {
            try {
                const ir = await client.query(
                    'INSERT INTO offers (tailor_id, title, description, discount, discount_type, start_date, end_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
                    [tailor_id, title, desc, discount, type, start, end]
                );
                console.log(`✅ Inserted offer "${title}" for tailor ${tailor_id}, id=${ir.rows[0].id}`);
            } catch (ie) {
                console.error('Insert err:', ie.message);
            }
        }

        // Verify final state
        const verifyRes = await client.query(`
            SELECT id, title, start_date, end_date,
                   CURRENT_DATE >= start_date AS started,
                   CURRENT_DATE <= end_date AS not_expired
            FROM offers
        `);
        console.log('\n=== FINAL OFFERS IN DB ===');
        console.log(JSON.stringify(verifyRes.rows, null, 2));

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
