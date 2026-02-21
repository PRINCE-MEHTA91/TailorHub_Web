require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    multipleStatements: true,
});

db.connect((err) => {
    if (err) { console.error('CONNECT FAIL:', err.message); process.exit(1); }
    console.log('Connected OK');

    // Drop and recreate with exactly the right schema
    const recreate = `
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    reset_token VARCHAR(255) DEFAULT NULL,
    reset_token_expiry DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;
    db.query(recreate, (err2) => {
        if (err2) { console.error('RECREATE FAIL:', err2.message); db.end(); return; }
        console.log('Table recreated OK');

        // Verify
        db.query("DESCRIBE users", (e3, rows) => {
            if (e3) { console.error('DESCRIBE FAIL:', e3.message); db.end(); return; }
            console.log('\nNew table columns:');
            rows.forEach(r => console.log(' -', r.Field, '| Null=' + r.Null + ' | Default=' + r.Default));

            // Test INSERT
            db.query(
                "INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)",
                ['FixUser', 'fix_' + Date.now() + '@test.com', 'hashed'],
                (e4, r4) => {
                    if (e4) { console.error('\n❌ INSERT STILL FAILING:', e4.sqlMessage); }
                    else {
                        console.log('\n✅ INSERT works! id:', r4.insertId);
                        db.query("DELETE FROM users WHERE id=?", [r4.insertId], () => {
                            console.log('✅ Cleaned up.\n\nSignup should now work!');
                        });
                    }
                    db.end();
                }
            );
        });
    });
});
