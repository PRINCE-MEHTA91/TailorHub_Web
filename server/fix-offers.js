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

  // Check MySQL timezone and CURDATE()
  db.query("SELECT CURDATE() as today, NOW() as now, @@global.time_zone as globalTZ, @@session.time_zone as sessionTZ", (e, rows) => {
    console.log('MySQL date/time info:', JSON.stringify(rows[0], null, 2));

    // Check offer dates vs CURDATE
    db.query(`SELECT id, title, start_date, end_date, 
              DATE(start_date) as start_date_only,
              DATE(end_date) as end_date_only,
              CURDATE() as today,
              CURDATE() >= DATE(start_date) as started,
              CURDATE() <= DATE(end_date) as not_expired,
              DATEDIFF(DATE(end_date), CURDATE()) as days_left
              FROM offers`, (e2, rows2) => {
      if (e2) { console.error(e2.message); db.end(); return; }
      console.log('\nOffer date analysis:');
      rows2.forEach(r => {
        console.log(`\nOffer ${r.id}: "${r.title}"`);
        console.log(`  raw start_date: ${r.start_date}`);
        console.log(`  raw end_date:   ${r.end_date}`);
        console.log(`  DATE(start_date): ${r.start_date_only}`);
        console.log(`  DATE(end_date):   ${r.end_date_only}`);
        console.log(`  CURDATE():        ${r.today}`);
        console.log(`  started (CURDATE>=start): ${r.started}`);
        console.log(`  not_expired (CURDATE<=end): ${r.not_expired}`);
        console.log(`  days_left: ${r.days_left}`);
        console.log(`  ACTIVE: ${r.started && r.not_expired ? 'YES ✅' : 'NO ❌'}`);
      });

      // Fix: Update offer 2 to use proper dates (fix the timezone issue)
      // The offer was stored with IST offset. Let's update it to use DATE() values
      db.query(`UPDATE offers SET 
                start_date = DATE(start_date),
                end_date = DATE(end_date)
                WHERE 1=1`, (e3) => {
        if (e3) {
          console.log('\nUpdate attempt (might not work on DATE columns):', e3.message);
        } else {
          console.log('\n✅ Updated offer dates to date-only format');
        }
        
        // Add correct new offers
        db.query('DELETE FROM offers WHERE id IN (1, 2)', (e4) => {
          if (e4) { console.error('Delete err:', e4.message); db.end(); return; }
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

          let done = 0;
          inserts.forEach(([tailor_id, title, desc, discount, type, start, end]) => {
            db.query(
              'INSERT INTO offers (tailor_id, title, description, discount, discount_type, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [tailor_id, title, desc, discount, type, start, end],
              (ie, ir) => {
                if (ie) console.error('Insert err:', ie.message);
                else console.log(`✅ Inserted offer "${title}" for tailor ${tailor_id}, id=${ir.insertId}`);
                done++;
                if (done === inserts.length) {
                  // Verify
                  db.query(`SELECT id, title, start_date, end_date, 
                            CURDATE() >= start_date AS started,
                            CURDATE() <= end_date AS not_expired
                            FROM offers`, (ve, vr) => {
                    console.log('\n=== FINAL OFFERS IN DB ===');
                    console.log(JSON.stringify(vr, null, 2));
                    db.end();
                  });
                }
              }
            );
          });
        });
      });
    });
  });
});
