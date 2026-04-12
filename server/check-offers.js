require('dotenv').config();
const mysql = require('mysql2');
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
});

db.connect(err => {
  if (err) { console.error('DB error:', err.message); process.exit(1); }
  console.log('Connected to DB');

  db.query('SELECT id, full_name, email, role FROM users WHERE role = "tailor"', (e, tailors) => {
    if (e) { console.error('Query error:', e.message); db.end(); return; }
    console.log('\n=== TAILORS ===');
    console.log(JSON.stringify(tailors, null, 2));

    db.query('SELECT * FROM offers', (e2, offers) => {
      if (e2) { console.error('Offers query error:', e2.message); db.end(); return; }
      console.log('\n=== OFFERS IN DB ===');
      console.log(JSON.stringify(offers, null, 2));
      console.log('Total offers:', offers.length);

      db.query('SELECT user_id, shop_name, JSON_LENGTH(deals) as deal_count FROM tailor_profiles', (e3, profiles) => {
        if (e3) { console.error('Profiles query error:', e3.message); db.end(); return; }
        console.log('\n=== PROFILES (deal counts) ===');
        console.log(JSON.stringify(profiles, null, 2));

        // If no tailors, just exit
        if (!tailors || tailors.length === 0) {
          console.log('\nNo tailors found - cannot insert test offer');
          db.end();
          return;
        }

        // Insert a test offer for the first tailor if no offers exist
        if (offers.length === 0) {
          const tailorId = tailors[0].id;
          const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
          const futureDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // +60 days

          const sql = `INSERT INTO offers (tailor_id, title, description, discount, discount_type, start_date, end_date)
                       VALUES (?, ?, ?, ?, ?, ?, ?)`;
          db.query(sql, [
            tailorId,
            'Summer Special Sale',
            'Flat 30% off on all stitching services this summer!',
            '30',
            'percent',
            today,
            futureDate
          ], (insertErr, result) => {
            if (insertErr) {
              console.error('\nInsert error:', insertErr.message);
            } else {
              console.log('\n✅ Test offer inserted! ID:', result.insertId);
              console.log('   Tailor:', tailors[0].full_name, '(id:', tailorId + ')');
              console.log('   Valid:', today, 'to', futureDate);
            }
            db.end();
          });
        } else {
          console.log('\nOffers already exist - no insert needed');
          db.end();
        }
      });
    });
  });
});
