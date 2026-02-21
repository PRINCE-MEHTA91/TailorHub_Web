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
    if (err) { console.error('Connection failed:', err.message); process.exit(1); }
    console.log('Connected OK\n');

    // Check what name column actually is
    db.query("DESCRIBE users", (e, rows) => {
        if (e) { console.error('DESCRIBE failed:', e.message); db.end(); return; }

        const cols = rows.map(r => r.Field);
        console.log('Current columns:', cols.join(', '));

        const hasUsername = cols.includes('username');
        const hasName = cols.includes('name');
        const hasFullName = cols.includes('full_name');

        if (hasFullName) {
            console.log('\n✅ full_name column already exists — no ALTER needed.');
            console.log('   The server should be restarted. Run: node server.js');
            db.end();
        } else if (hasUsername) {
            console.log('\n⚠️  Found "username", renaming to "full_name"...');
            db.query("ALTER TABLE users CHANGE COLUMN `username` `full_name` VARCHAR(255) NOT NULL", (e2) => {
                if (e2) { console.error('❌ ALTER failed:', e2.message); db.end(); return; }
                console.log('✅ Renamed "username" → "full_name" successfully!');
                verifyInsert(db);
            });
        } else if (hasName) {
            console.log('\n⚠️  Found "name", renaming to "full_name"...');
            db.query("ALTER TABLE users CHANGE COLUMN `name` `full_name` VARCHAR(255) NOT NULL", (e2) => {
                if (e2) { console.error('❌ ALTER failed:', e2.message); db.end(); return; }
                console.log('✅ Renamed "name" → "full_name" successfully!');
                verifyInsert(db);
            });
        } else {
            console.log('\n❌ Cannot find a name-related column. Columns:', cols.join(', '));
            console.log('   You may need to drop and recreate the users table.');
            console.log('   Run server/db.sql against your database.');
            db.end();
        }
    });
});

function verifyInsert(db) {
    db.query(
        "INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)",
        ['Test Fix User', 'fix_verify_' + Date.now() + '@test.com', 'hashedpw'],
        (e3, r3) => {
            if (e3) {
                console.error('\n❌ INSERT still failing after fix:', e3.sqlMessage);
            } else {
                console.log('\n✅ INSERT verified! signup will now work.');
                db.query("DELETE FROM users WHERE id=?", [r3.insertId], () => {
                    console.log('✅ Test row cleaned up.\n');
                    console.log('👉 Now restart your server:  node server.js');
                });
            }
            db.end();
        }
    );
}
