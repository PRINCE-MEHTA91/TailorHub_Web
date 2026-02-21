require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3001';

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(__dirname));

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
});

db.connect((err) => {
    if (err) {
        console.error('DB connection error:', err.message);
        return;
    }
    console.log('Connected to MySQL database');
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Invalid or expired token' });
        req.userId = decoded.id;
        next();
    });
};

const setTokenCookie = (res, userId) => {
    const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};

app.post('/api/auth/signup', (req, res) => {
    const { full_name, email, password } = req.body;
    if (!full_name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    const sql = 'INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)';
    db.query(sql, [full_name, email, hashedPassword], (err) => {
        if (err) {
            console.error('Signup DB error:', err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'Email already in use' });
            }
            return res.status(500).json({ message: 'Error creating account' });
        }
        res.status(201).json({ message: 'Account created successfully' });
    });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const user = results[0];
        const valid = bcrypt.compareSync(password, user.password);
        if (!valid) return res.status(401).json({ message: 'Invalid email or password' });
        setTokenCookie(res, user.id);
        res.json({ message: 'Login successful', user: { id: user.id, full_name: user.full_name, email: user.email } });
    });
});

app.get('/api/auth/me', verifyToken, (req, res) => {
    const sql = 'SELECT id, full_name, email FROM users WHERE id = ?';
    db.query(sql, [req.userId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        if (results.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json({ user: results[0] });
    });
});

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token', { httpOnly: true, sameSite: 'lax' });
    res.json({ message: 'Logged out successfully' });
});

app.post('/api/auth/forgot-password', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        if (results.length === 0) {
            return res.json({ message: 'If this email exists, a reset link has been sent' });
        }
        const user = results[0];
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expiry = new Date(Date.now() + 15 * 60 * 1000);
        const updateSql = 'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?';
        db.query(updateSql, [tokenHash, expiry, user.id], (updateErr) => {
            if (updateErr) return res.status(500).json({ message: 'Server error' });
            const resetLink = `${CLIENT_URL}/reset-password/${rawToken}`;
            console.log('Password reset link:', resetLink);
            transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'TailorHub - Password Reset',
                html: `<p>You requested a password reset.</p><p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 15 minutes.</p><p>If you did not request this, ignore this email.</p>`,
            }, (mailErr) => {
                if (mailErr) console.error('Email send error:', mailErr.message);
            });
            res.json({ message: 'If this email exists, a reset link has been sent' });
        });
    });
});

app.post('/api/auth/reset-password/:token', (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    if (!password || password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const sql = 'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()';
    db.query(sql, [tokenHash], (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        if (results.length === 0) {
            return res.status(400).json({ message: 'Reset link is invalid or has expired' });
        }
        const user = results[0];
        const hashed = bcrypt.hashSync(password, 10);
        const updateSql = 'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?';
        db.query(updateSql, [hashed, user.id], (updateErr) => {
            if (updateErr) return res.status(500).json({ message: 'Server error' });
            res.json({ message: 'Password reset successfully' });
        });
    });
});

app.get('/api/products', (req, res) => {
    const sql = 'SELECT * FROM products';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

const buttons = [
    'categories-btn', 'deals-btn', 'new-arrivals-btn', 'trending-btn',
    'shirts-service-btn', 'pants-service-btn', 'kurtas-service-btn',
    'suits-service-btn', 'dresses-service-btn', 'accessories-service-btn',
    'book-appointment-btn', 'home-btn', 'clothing-btn', 'tailors-btn', 'account-btn',
];

buttons.forEach((buttonId) => {
    app.post(`/api/${buttonId}`, (req, res) => {
        res.json({ message: `${buttonId} click received` });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
