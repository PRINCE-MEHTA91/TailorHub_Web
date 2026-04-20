require('dotenv').config();
const mysql = require('mysql2/promise');

async function main() {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log("Connected to DB.");

        await db.query(`
            CREATE TABLE IF NOT EXISTS feedbacks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                customer_id INT NOT NULL,
                tailor_id INT NOT NULL,
                rating INT NOT NULL CHECK(rating >= 1 AND rating <= 5),
                message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (tailor_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE KEY unique_order_feedback (order_id)
            )
        `);
        console.log("feedbacks table created or already exists.");

        // Check if users table has avgRating and totalReviews
        const [columns] = await db.query("SHOW COLUMNS FROM users");
        const colNames = columns.map(c => c.Field);
        
        if (!colNames.includes('avg_rating')) {
            await db.query("ALTER TABLE users ADD COLUMN avg_rating DECIMAL(3,2) DEFAULT 0.00");
            console.log("Added avg_rating to users table.");
        }
        if (!colNames.includes('total_reviews')) {
            await db.query("ALTER TABLE users ADD COLUMN total_reviews INT DEFAULT 0");
            console.log("Added total_reviews to users table.");
        }

        console.log("DB changes done.");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

main();
