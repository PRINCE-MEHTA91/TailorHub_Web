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
    if (err) { console.error('Connect error:', err.message); process.exit(1); }
    console.log('Connected.');

    db.query('DESCRIBE users', (e, rows) => {
        if (e) { console.error('DESCRIBE error:', e.message); db.end(); process.exit(1); }
        const cols = rows.map((r) => r.Field);
        console.log('Current columns:', cols.join(', '));

        const toAdd = [];
        if (!cols.includes('full_name')) toAdd.push("ADD COLUMN full_name VARCHAR(255) NOT NULL DEFAULT '' AFTER id");
        if (!cols.includes('reset_token')) toAdd.push('ADD COLUMN reset_token VARCHAR(255) DEFAULT NULL');
        if (!cols.includes('reset_token_expiry')) toAdd.push('ADD COLUMN reset_token_expiry DATETIME DEFAULT NULL');

        if (toAdd.length === 0) {
            console.log('Schema is already up to date!');
            db.end();
            return;
        }

        const alter = `ALTER TABLE users ${toAdd.join(', ')}`;
        console.log('Running:', alter);
        db.query(alter, (alterErr) => {
            if (alterErr) {
                console.error('ALTER error:', alterErr.message);
            } else {
                console.log('Schema updated successfully!');
            }
            db.end();
        });
    });
});
