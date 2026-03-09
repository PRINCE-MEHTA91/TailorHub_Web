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

const allowedOrigins = [CLIENT_URL, 'http://127.0.0.1:3001', 'http://localhost:3001'];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all for dev, to prevent CORS issues
        }
    },
    credentials: true
}));
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

    // Auto-create tailor_profiles table if it doesn't exist
    const createProfileTable = `
        CREATE TABLE IF NOT EXISTS tailor_profiles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL UNIQUE,
            phone VARCHAR(20) DEFAULT '',
            whatsapp VARCHAR(20) DEFAULT '',
            instagram VARCHAR(100) DEFAULT '',
            street VARCHAR(255) DEFAULT '',
            city VARCHAR(100) DEFAULT '',
            state VARCHAR(100) DEFAULT '',
            pin VARCHAR(10) DEFAULT '',
            products JSON DEFAULT NULL,
            gallery JSON DEFAULT NULL,
            profile_img TEXT DEFAULT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `;
    db.query(createProfileTable, (tableErr) => {
        if (tableErr) console.error('Error creating tailor_profiles table:', tableErr.message);
        else console.log('✅ tailor_profiles table ready');
    });
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

transporter.verify((err) => {
    if (err) {
        console.error('❌ Gmail SMTP config error:', err.message);
        console.error('   → Make sure EMAIL_USER and EMAIL_PASS are set correctly in .env');
        console.error('   → EMAIL_PASS must be a 16-character Gmail App Password (not your account password)');
    } else {
        console.log('✅ Gmail SMTP is ready to send emails');
    }
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

// Role-guard middleware — usage: requireRole('tailor') or requireRole('customer')
const requireRole = (role) => (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Invalid or expired token' });
        const sql = 'SELECT id, role FROM users WHERE id = ?';
        db.query(sql, [decoded.id], (dbErr, results) => {
            if (dbErr || results.length === 0) return res.status(500).json({ message: 'Server error' });
            if (results[0].role !== role) return res.status(403).json({ message: `Access denied. ${role} role required.` });
            req.userId = decoded.id;
            req.userRole = results[0].role;
            next();
        });
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
    const { full_name, email, password, role } = req.body;
    if (!full_name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const validRoles = ['customer', 'tailor'];
    const userRole = validRoles.includes(role) ? role : 'customer';
    const hashedPassword = bcrypt.hashSync(password, 10);
    const sql = 'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)';
    db.query(sql, [full_name, email, hashedPassword, userRole], (err) => {
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
        res.json({ message: 'Login successful', user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role } });
    });
});

app.get('/api/auth/me', verifyToken, (req, res) => {
    const sql = 'SELECT id, full_name, email, role FROM users WHERE id = ?';
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
            const resetLink = `http://localhost:3000/reset-password/${rawToken}`;
            console.log('📧 Attempting to send password reset email to:', email);
            console.log('🔗 Reset link:', resetLink);
            transporter.sendMail({
                from: `"TailorHub" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'TailorHub – Password Reset Request',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
                        <h2 style="color: #1f2937;">🔐 Reset Your Password</h2>
                        <p style="color: #374151;">You requested a password reset for your TailorHub account.</p>
                        <p style="color: #374151;">Click the button below to reset your password. This link expires in <strong>15 minutes</strong>.</p>
                        <a href="${resetLink}" style="display: inline-block; margin: 16px 0; padding: 12px 24px; background: #1f2937; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
                        <p style="color: #6b7280; font-size: 13px;">If you did not request this, you can safely ignore this email. Your password will not change.</p>
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                        <p style="color: #9ca3af; font-size: 12px;">TailorHub – Custom Tailoring Platform</p>
                    </div>
                `,
            }, (mailErr, info) => {
                if (mailErr) {
                    console.error('❌ Email send error:', mailErr.message);
                    return res.status(500).json({ message: 'Failed to send reset email. Please try again later.' });
                }
                console.log('✅ Password reset email sent to:', email, '| Message ID:', info.messageId);
                res.json({ message: 'If this email exists, a reset link has been sent' });
            });
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

// ── Tailor Profile: Save (upsert) ──────────────────────────────────────────
app.post('/api/tailor/profile', verifyToken, (req, res) => {
    const { phone, whatsapp, instagram, street, city, state, pin, products, gallery, profile_img } = req.body;

    // Verify the logged-in user is a tailor
    db.query('SELECT role FROM users WHERE id = ?', [req.userId], (err, rows) => {
        if (err || rows.length === 0) return res.status(500).json({ message: 'Server error' });
        if (rows[0].role !== 'tailor') return res.status(403).json({ message: 'Only tailors can update a tailor profile' });

        const sql = `
            INSERT INTO tailor_profiles (user_id, phone, whatsapp, instagram, street, city, state, pin, products, gallery, profile_img)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                phone = VALUES(phone), whatsapp = VALUES(whatsapp), instagram = VALUES(instagram),
                street = VALUES(street), city = VALUES(city), state = VALUES(state), pin = VALUES(pin),
                products = VALUES(products), gallery = VALUES(gallery), profile_img = VALUES(profile_img)
        `;
        const params = [
            req.userId, phone || '', whatsapp || '', instagram || '',
            street || '', city || '', state || '', pin || '',
            JSON.stringify(products || []),
            JSON.stringify(gallery || []),
            profile_img || null,
        ];
        db.query(sql, params, (insertErr) => {
            if (insertErr) {
                console.error('Tailor profile save error:', insertErr);
                return res.status(500).json({ message: 'Failed to save profile' });
            }
            res.json({ message: 'Profile saved successfully' });
        });
    });
});

// ── Tailor Profile: Get own profile ────────────────────────────────────────
app.get('/api/tailor/profile', verifyToken, (req, res) => {
    const sql = `
        SELECT tp.phone, tp.whatsapp, tp.instagram,
               tp.street, tp.city, tp.state, tp.pin,
               tp.products, tp.gallery, tp.profile_img
        FROM tailor_profiles tp
        WHERE tp.user_id = ?
    `;
    db.query(sql, [req.userId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        if (results.length === 0) return res.json({ profile: null });
        const p = results[0];
        res.json({
            profile: {
                ...p,
                products: p.products ? JSON.parse(p.products) : [],
                gallery: p.gallery ? JSON.parse(p.gallery) : [],
            }
        });
    });
});

// ── Tailor Profiles: Fetch all (for customer dashboard) ────────────────────
app.get('/api/tailors', (req, res) => {
    const sql = `
        SELECT u.id, u.full_name, u.email,
               tp.phone, tp.whatsapp, tp.instagram,
               tp.street, tp.city, tp.state, tp.pin,
               tp.products, tp.gallery, tp.profile_img
        FROM users u
        INNER JOIN tailor_profiles tp ON u.id = tp.user_id
        WHERE u.role = 'tailor'
        ORDER BY tp.updated_at DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        // Parse JSON fields
        const tailors = results.map(t => ({
            ...t,
            products: t.products ? JSON.parse(t.products) : [],
            gallery: t.gallery ? JSON.parse(t.gallery) : [],
        }));
        res.json({ tailors });
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
