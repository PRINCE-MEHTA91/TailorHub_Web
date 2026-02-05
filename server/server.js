const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

const JWT_SECRET = 'your_jwt_secret'; // TODO: Replace with environment variable

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'NayaPassword123', // TODO: Replace with environment variable
    database: 'tailorhub_db',
    port: 3306
});

db.connect(err => {
    if (err) {
        console.error(err.message);
        return;
    }
    console.log('Connected to the MySQL database');
});

app.get('/api/products', (req, res) => {
    const sql = 'SELECT * FROM products';
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.json(results);
    });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error logging in' });
        }
        if (results.length > 0) {
            const user = results[0];
            const passwordIsValid = bcrypt.compareSync(password, user.password);
            if (!passwordIsValid) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }
            const token = jwt.sign({ id: user.id }, JWT_SECRET, {
                expiresIn: 86400 // 24 hours
            });
            res.json({ message: 'Login successful', token });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    });
});

app.post('/api/signup', (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);
    const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(sql, [username, email, hashedPassword], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'Username or email already exists' });
            }
            return res.status(500).json({ message: 'Error creating user' });
        }
        res.status(201).json({ message: 'User created successfully' });
    });
});

const verifyToken = (req, res, next) => {
    const token = req.headers['x-access-token'];

    if (!token) {
        return res.status(403).send({ message: 'No token provided!' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'Unauthorized!' });
        }
        req.userId = decoded.id;
        next();
    });
};

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
        res.json({ message: `${buttonId} click received` });
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
