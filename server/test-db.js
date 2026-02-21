require('dotenv').config();
const mysql = require('mysql2');

console.log('Connecting with:');
console.log('  host:', process.env.DB_HOST);
console.log('  user:', process.env.DB_USER);
console.log('  database:', process.env.DB_NAME);
console.log('  port:', process.env.DB_PORT || 3306);
console.log('  password set:', !!process.env.DB_PASSWORD);

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
});

db.connect((err) => {
    if (err) {
        console.error('\n❌ DB CONNECTION FAILED:', err.code, '-', err.message);
        if (err.code === 'ER_BAD_DB_ERROR') {
            console.error('   → Database "' + process.env.DB_NAME + '" does NOT exist. Run the db.sql script first.');
        } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('   → Wrong username/password in .env');
        } else if (err.code === 'ECONNREFUSED') {
            console.error('   → MySQL is not running, or wrong host/port');
        }
        process.exit(1);
    }

    console.log('\n✅ Connected to MySQL OK\n');

    // Check if users table exists with correct columns
    db.query("DESCRIBE users", (err2, rows) => {
        if (err2) {
            console.error('❌ users table error:', err2.message);
            console.error('   → Run the db.sql script to create the table');
            db.end();
            return;
        }
        console.log('✅ users table columns:');
        rows.forEach(r => console.log('  -', r.Field, '|', r.Type, '|', r.Null === 'NO' ? 'NOT NULL' : 'NULLABLE'));

        // Test INSERT
        console.log('\nTesting INSERT...');
        db.query(
            "INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)",
            ['Test User', 'test_' + Date.now() + '@test.com', 'hashedpassword'],
            (err3, result) => {
                if (err3) {
                    console.error('❌ INSERT failed:', err3.code, '-', err3.message);
                } else {
                    console.log('✅ INSERT succeeded, new user id:', result.insertId);
                    // Clean up test row
                    db.query("DELETE FROM users WHERE id = ?", [result.insertId], () => {
                        console.log('✅ Cleaned up test row');
                    });
                }
                db.end();
            }
        );
    });
});
