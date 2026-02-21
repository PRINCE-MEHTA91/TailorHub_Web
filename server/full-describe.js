require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
});

db.connect((err) => {
    if (err) { console.error('CONNECT FAIL:', err.message); process.exit(1); }

    db.query("DESCRIBE users", (e, rows) => {
        if (e) { console.error('DESCRIBE FAIL:', e.message); db.end(); return; }
        console.log('ALL COLUMNS IN LIVE users TABLE:');
        rows.forEach(r => {
            console.log(`  ${r.Field} | ${r.Type} | Null=${r.Null} | Default=${r.Default} | Extra=${r.Extra}`);
        });

        // Also check sql_mode
        db.query("SELECT @@sql_mode as mode", (e2, r2) => {
            console.log('\nSQL MODE:', r2 && r2[0] && r2[0].mode);
            db.end();
        });
    });
});
