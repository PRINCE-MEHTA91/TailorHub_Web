const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// MySQL Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'your_username', // Replace with your MySQL username
    password: 'your_password', // Replace with your MySQL password
    database: 'tailorhub_db'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database.');
});

// API endpoint to get all products
app.get('/api/products', (req, res) => {
    const sql = 'SELECT * FROM products';
    db.query(sql, (err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(results);
        }
    });
});

// Placeholder for login
app.post('/api/login', (req, res) => {
    console.log('Login attempt:', req.body);
    // In a real app, you'd validate credentials and return a token
    res.json({ message: 'Login successful (placeholder)' });
});

// Signup endpoint
app.post('/api/signup', (req, res) => {
    const { username, email, password } = req.body;

    // IMPORTANT: In a real application, you MUST hash the password before storing it.
    // The following is for demonstration purposes only.
    // Example using bcrypt (you would need to `npm install bcrypt`):
    // const saltRounds = 10;
    // bcrypt.hash(password, saltRounds, (err, hash) => {
    //     if (err) {
    //         return res.status(500).json({ message: "Error hashing password" });
    //     }
    //     const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    //     db.query(sql, [username, email, hash], (err, result) => {
    //         if (err) {
    //             console.error('Error inserting user:', err);
    //             return res.status(500).json({ message: 'Error creating user' });
    //         }
    //         res.status(201).json({ message: 'User created successfully' });
    //     });
    // });

    const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(sql, [username, email, password], (err, result) => {
        if (err) {
            console.error('Error inserting user:', err);
            // Handle specific errors, like duplicate entry
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'Username or email already exists.' });
            }
            return res.status(500).json({ message: 'Error creating user' });
        }
        res.status(201).json({ message: 'User created successfully' });
    });
});

const buttons = [
    'categories-btn',
    'deals-btn',
    'new-arrivals-btn',
    'trending-btn',
    'shirts-service-btn',
    'pants-service-btn',
    'kurtas-service-btn',
    'suits-service-btn',
    'dresses-service-btn',
    'accessories-service-btn',
    'book-appointment-btn',
    'home-btn',
    'clothing-btn',
    'tailors-btn',
    'account-btn'
];

buttons.forEach(buttonId => {
    app.post(`/api/${buttonId}`, (req, res) => {
        console.log(`${buttonId} clicked`);
        res.json({ message: `${buttonId} click received` });
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
