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
    if (err) { console.error('Connection failed:', err); process.exit(1); }
    console.log('Connected OK');

    // Get full table description
    db.query("DESCRIBE users", (e1, rows) => {
        console.log('\n=== DESCRIBE users ===');
        console.log(JSON.stringify(rows, null, 2));

        // Try the exact same INSERT as server.js
        db.query(
            "INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)",
            ['TestUser', 'diag2_' + Date.now() + '@x.com', 'pwd'],
            (e2, r2) => {
                console.log('\n=== INSERT result ===');
                if (e2) {
                    console.log('ERROR code:', e2.code);
                    console.log('ERROR sqlMessage:', e2.sqlMessage);
                    console.log('ERROR errno:', e2.errno);
                } else {
                    console.log('SUCCESS insertId:', r2.insertId);
                    db.query("DELETE FROM users WHERE id=?", [r2.insertId], () => { });
                }
                db.end();
            }
        );
    });
});
