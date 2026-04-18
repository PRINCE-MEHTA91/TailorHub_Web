require('dotenv').config();

// ── Global crash guards — keep the server alive even on unhandled errors ──
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception (server kept alive):', err.message);
});
process.on('unhandledRejection', (reason) => {
    console.error('❌ Unhandled Rejection (server kept alive):', reason);
});

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3001';

app.use(cors({
    origin: [CLIENT_URL, 'http://localhost:3001', 'http://127.0.0.1:3001'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(express.static(__dirname));

console.log(`⏳ Attempting to connect to MySQL database at host: ${process.env.DB_HOST}`);

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Test pool connectivity + auto-create tables on startup
db.getConnection((connErr, connection) => {
    if (connErr) {
        console.error('❌ DB connection error: Failed to connect to MySQL.');
        console.error('❌ Exact Error Message:', connErr.message);
        console.error('❌ Exact Error Code:', connErr.code);
        return;
    }
    console.log('✅ Connected successfully to MySQL database (pool)');
    connection.release();

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

    // ── Soft-migrate: add new profile columns if they don't exist yet ──────────
    const newCols = [
        `ALTER TABLE tailor_profiles ADD COLUMN shop_name VARCHAR(255) DEFAULT ''`,
        `ALTER TABLE tailor_profiles ADD COLUMN tagline VARCHAR(255) DEFAULT ''`,
        `ALTER TABLE tailor_profiles ADD COLUMN bio TEXT`,
        `ALTER TABLE tailor_profiles ADD COLUMN experience VARCHAR(100) DEFAULT ''`,
        `ALTER TABLE tailor_profiles ADD COLUMN specialities JSON DEFAULT NULL`,
        `ALTER TABLE tailor_profiles ADD COLUMN timings JSON DEFAULT NULL`,
        `ALTER TABLE tailor_profiles ADD COLUMN deals JSON DEFAULT NULL`,
        `ALTER TABLE tailor_profiles ADD COLUMN price_listings JSON DEFAULT NULL`,
        `ALTER TABLE tailor_profiles ADD COLUMN latitude DECIMAL(10,7) DEFAULT NULL`,
        `ALTER TABLE tailor_profiles ADD COLUMN longitude DECIMAL(10,7) DEFAULT NULL`,
    ];
    newCols.forEach(sql => {
        db.query(sql, (err) => {
            if (err && err.code !== 'ER_DUP_FIELDNAME') console.warn('Column migration warning:', err.message);
        });
    });

    // Auto-create customer_profiles table if it doesn't exist
    const createCustomerProfileTable = `
        CREATE TABLE IF NOT EXISTS customer_profiles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL UNIQUE,
            phone VARCHAR(20) DEFAULT '',
            whatsapp VARCHAR(20) DEFAULT '',
            street VARCHAR(255) DEFAULT '',
            city VARCHAR(100) DEFAULT '',
            state VARCHAR(100) DEFAULT '',
            pin VARCHAR(10) DEFAULT '',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `;
    db.query(createCustomerProfileTable, (tableErr) => {
        if (tableErr) console.error('Error creating customer_profiles table:', tableErr.message);
        else console.log('✅ customer_profiles table ready');
    });

    // Auto-create offers table
    const createOffersTable = `
        CREATE TABLE IF NOT EXISTS offers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            tailor_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT DEFAULT NULL,
            discount VARCHAR(100) NOT NULL,
            discount_type ENUM('percent','flat') DEFAULT 'percent',
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (tailor_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `;
    db.query(createOffersTable, (tableErr) => {
        if (tableErr) console.error('Error creating offers table:', tableErr.message);
        else console.log('✅ offers table ready');
    });

    // Auto-create orders table
    const createOrdersTable = `
        CREATE TABLE IF NOT EXISTS orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            tailor_id INT NOT NULL,
            customer_id INT NOT NULL,
            product_name VARCHAR(255) NOT NULL,
            total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
            advance_payment DECIMAL(10,2) NOT NULL DEFAULT 0,
            remaining_amount DECIMAL(10,2) GENERATED ALWAYS AS (total_amount - advance_payment) STORED,
            delivery_date DATE DEFAULT NULL,
            current_status VARCHAR(100) NOT NULL DEFAULT 'Order Placed',
            notes TEXT DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (tailor_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `;
    db.query(createOrdersTable, (tableErr) => {
        if (tableErr) console.error('Error creating orders table:', tableErr.message);
        else {
            console.log('✅ orders table ready');
            db.query('ALTER TABLE orders ADD COLUMN notes TEXT DEFAULT NULL', (err) => {
                if (err && err.code !== 'ER_DUP_FIELDNAME') console.warn('Order notes migration warning:', err.message);
            });
            db.query("ALTER TABLE orders ADD COLUMN current_status VARCHAR(100) NOT NULL DEFAULT 'Order Placed'", (err) => {
                if (err && err.code !== 'ER_DUP_FIELDNAME') console.warn('Order status migration warning:', err.message);
            });
        }
    });

    // Auto-create order_status_history table
    const createOrderStatusHistoryTable = `
        CREATE TABLE IF NOT EXISTS order_status_history (
            id INT AUTO_INCREMENT PRIMARY KEY,
            order_id INT NOT NULL,
            status VARCHAR(100) NOT NULL,
            note TEXT DEFAULT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
        )
    `;
    db.query(createOrderStatusHistoryTable, (tableErr) => {
        if (tableErr) console.error('Error creating order_status_history table:', tableErr.message);
        else console.log('✅ order_status_history table ready');
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

// Safely parse a MySQL JSON field which may already be a parsed object
const safeParseJSON = (val, fallback = []) => {
    if (val === null || val === undefined) return fallback;
    if (typeof val === 'object') return val;
    try { return JSON.parse(val); } catch { return fallback; }
};

// Normalize profile_img: strip any http://.../ prefix, keep only /uploads/... or null
const normalizeImgPath = (img) => {
    if (!img) return null;
    // If a full URL was accidentally stored, strip everything up to /uploads/
    const match = img.match(/(\/uploads\/[^?#]+)/);
    if (match) return match[1];
    // If it's already a relative /uploads/... path
    if (img.startsWith('/uploads/')) return img;
    // If it starts with http but has no /uploads/ segment, return as-is (external URL)
    if (img.startsWith('http')) return img;
    return img;
};

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
            const resetLink = `${CLIENT_URL}/reset-password/${rawToken}`;
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

// ── Redirect browser from backend URL to React frontend for password reset ──
app.get('/reset-password/:token', (req, res) => {
    res.redirect(`${CLIENT_URL}/reset-password/${req.params.token}`);
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

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, 'tailor_' + req.userId + '_' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/api/upload/profile-image', verifyToken, requireRole('tailor'), upload.single('profile_img'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    res.json({ message: 'Image uploaded successfully', imageUrl: `/uploads/${req.file.filename}` });
});

app.post('/api/upload/gallery-image', verifyToken, requireRole('tailor'), upload.single('gallery_img'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    res.json({ message: 'Gallery image uploaded', imageUrl: `/uploads/${req.file.filename}` });
});

app.post('/api/upload/pricing-image', verifyToken, requireRole('tailor'), upload.single('pricing_img'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    res.json({ message: 'Pricing image uploaded', imageUrl: `/uploads/${req.file.filename}` });
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
    const {
        phone, whatsapp, instagram, street, city, state, pin,
        products, gallery, profile_img,
        shop_name, tagline, bio, experience, specialities, timings, deals, price_listings,
        latitude, longitude
    } = req.body;

    db.query('SELECT role FROM users WHERE id = ?', [req.userId], (err, rows) => {
        if (err || rows.length === 0) return res.status(500).json({ message: 'Server error' });
        if (rows[0].role !== 'tailor') return res.status(403).json({ message: 'Only tailors can update a tailor profile' });

        const sql = `
            INSERT INTO tailor_profiles
                (user_id, phone, whatsapp, instagram, street, city, state, pin,
                 products, gallery, profile_img,
                 shop_name, tagline, bio, experience, specialities, timings, deals, price_listings,
                 latitude, longitude)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                phone=VALUES(phone), whatsapp=VALUES(whatsapp), instagram=VALUES(instagram),
                street=VALUES(street), city=VALUES(city), state=VALUES(state), pin=VALUES(pin),
                products=VALUES(products), gallery=VALUES(gallery), profile_img=VALUES(profile_img),
                shop_name=VALUES(shop_name), tagline=VALUES(tagline), bio=VALUES(bio),
                experience=VALUES(experience), specialities=VALUES(specialities), timings=VALUES(timings),
                deals=VALUES(deals), price_listings=VALUES(price_listings),
                latitude=VALUES(latitude), longitude=VALUES(longitude)
        `;
        const lat = (latitude !== undefined && latitude !== '' && latitude !== null) ? parseFloat(latitude) : null;
        const lng = (longitude !== undefined && longitude !== '' && longitude !== null) ? parseFloat(longitude) : null;
        const params = [
            req.userId,
            phone || '', whatsapp || '', instagram || '',
            street || '', city || '', state || '', pin || '',
            JSON.stringify(products || []),
            JSON.stringify(gallery || []),
            profile_img || null,
            shop_name || '', tagline || '', bio || '', experience || '',
            JSON.stringify(specialities || []),
            JSON.stringify(timings || {}),
            JSON.stringify(deals || []),
            JSON.stringify(price_listings || []),
            lat, lng,
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
               tp.products, tp.gallery, tp.profile_img,
               tp.shop_name, tp.tagline, tp.bio, tp.experience, tp.specialities, tp.timings, tp.deals,
               tp.price_listings, tp.latitude, tp.longitude
        FROM tailor_profiles tp WHERE tp.user_id = ?
    `;
    db.query(sql, [req.userId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        if (results.length === 0) return res.json({ profile: null });
        const p = results[0];
        res.json({
            profile: {
                ...p,
                profile_img:    normalizeImgPath(p.profile_img),
                products:       safeParseJSON(p.products, []),
                gallery:        safeParseJSON(p.gallery, []).map(normalizeImgPath),
                specialities:   safeParseJSON(p.specialities, []),
                timings:        safeParseJSON(p.timings, null),
                deals:          safeParseJSON(p.deals, []),
                price_listings: safeParseJSON(p.price_listings, []),
                latitude:       p.latitude != null ? parseFloat(p.latitude) : null,
                longitude:      p.longitude != null ? parseFloat(p.longitude) : null,
            }
        });
    });
});

// ── Tailor Deals: Save deals separately ────────────────────────────────────
app.post('/api/tailor/deals', verifyToken, (req, res) => {
    const { deals } = req.body;
    db.query('SELECT role FROM users WHERE id = ?', [req.userId], (err, rows) => {
        if (err || rows.length === 0) return res.status(500).json({ message: 'Server error' });
        if (rows[0].role !== 'tailor') return res.status(403).json({ message: 'Only tailors can update deals' });
        const sql = `INSERT INTO tailor_profiles (user_id, deals) VALUES (?, ?)
            ON DUPLICATE KEY UPDATE deals = VALUES(deals)`;
        db.query(sql, [req.userId, JSON.stringify(deals || [])], (err2) => {
            if (err2) return res.status(500).json({ message: 'Failed to save deals' });
            res.json({ message: 'Deals saved successfully' });
        });
    });
});

// ── Tailor Deals: Get own deals ─────────────────────────────────────────────
app.get('/api/tailor/deals', verifyToken, (req, res) => {
    db.query('SELECT deals FROM tailor_profiles WHERE user_id = ?', [req.userId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        const deals = results.length > 0 ? safeParseJSON(results[0].deals, []) : [];
        res.json({ deals });
    });
});

// ── Tailor Deals: Get by tailor ID (public for customers) ──────────────────
app.get('/api/tailors/:id/deals', (req, res) => {
    const { id } = req.params;
    const sql = `SELECT tp.deals FROM tailor_profiles tp
        INNER JOIN users u ON u.id = tp.user_id WHERE u.id = ? AND u.role = 'tailor'`;
    db.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        const deals = results.length > 0 ? safeParseJSON(results[0].deals, []) : [];
        res.json({ deals });
    });
});

// ── Price Listings: Save (tailor only, dedicated endpoint) ─────────────────
app.post('/api/tailor/price-listings', verifyToken, (req, res) => {
    const { price_listings } = req.body;
    db.query('SELECT role FROM users WHERE id = ?', [req.userId], (err, rows) => {
        if (err || rows.length === 0) return res.status(500).json({ message: 'Server error' });
        if (rows[0].role !== 'tailor') return res.status(403).json({ message: 'Only tailors can update price listings' });
        const sql = `INSERT INTO tailor_profiles (user_id, price_listings) VALUES (?, ?)
            ON DUPLICATE KEY UPDATE price_listings = VALUES(price_listings)`;
        db.query(sql, [req.userId, JSON.stringify(price_listings || [])], (err2) => {
            if (err2) {
                console.error('Price listings save error:', err2);
                return res.status(500).json({ message: 'Failed to save price listings' });
            }
            res.json({ message: 'Price listings saved successfully' });
        });
    });
});

// ── Tailor Profiles: Fetch all (for customer dashboard) ────────────────────
app.get('/api/tailors', (req, res) => {
    const sql = `
        SELECT u.id, u.full_name, u.email,
               tp.phone, tp.whatsapp, tp.instagram,
               tp.street, tp.city, tp.state, tp.pin,
               tp.products, tp.gallery, tp.profile_img,
               tp.shop_name, tp.tagline, tp.bio, tp.experience, tp.specialities, tp.timings,
               tp.price_listings, tp.deals, tp.latitude, tp.longitude
        FROM users u
        INNER JOIN tailor_profiles tp ON u.id = tp.user_id
        WHERE u.role = 'tailor'
        ORDER BY tp.updated_at DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        const tailors = results.map(t => ({
            ...t,
            profile_img:    normalizeImgPath(t.profile_img),
            products:       safeParseJSON(t.products, []),
            gallery:        safeParseJSON(t.gallery, []).map(normalizeImgPath),
            specialities:   safeParseJSON(t.specialities, []),
            timings:        safeParseJSON(t.timings, null),
            price_listings: safeParseJSON(t.price_listings, []),
            deals:          safeParseJSON(t.deals, []),
            latitude:       t.latitude != null ? parseFloat(t.latitude) : null,
            longitude:      t.longitude != null ? parseFloat(t.longitude) : null,
        }));
        res.json({ tailors });
    });
});

// ── Tailor Profiles: Get by ID ─────────────────────────────────────────────
app.get('/api/tailors/:id', (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT u.id as user_id, u.full_name, u.email,
               tp.phone, tp.whatsapp, tp.instagram,
               tp.street, tp.city, tp.state, tp.pin,
               tp.products, tp.gallery, tp.profile_img,
               tp.shop_name, tp.tagline, tp.bio, tp.experience, tp.specialities, tp.timings,
               tp.price_listings, tp.deals, tp.latitude, tp.longitude
        FROM users u
        INNER JOIN tailor_profiles tp ON u.id = tp.user_id
        WHERE u.role = 'tailor' AND u.id = ?
    `;
    db.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        if (results.length === 0) return res.status(404).json({ message: 'Tailor not found' });
        const t = results[0];
        res.json({
            tailor: {
                ...t,
                profile_img:    normalizeImgPath(t.profile_img),
                products:       safeParseJSON(t.products, []),
                gallery:        safeParseJSON(t.gallery, []).map(normalizeImgPath),
                specialities:   safeParseJSON(t.specialities, []),
                timings:        safeParseJSON(t.timings, null),
                price_listings: safeParseJSON(t.price_listings, []),
                deals:          safeParseJSON(t.deals, []),
                latitude:       t.latitude != null ? parseFloat(t.latitude) : null,
                longitude:      t.longitude != null ? parseFloat(t.longitude) : null,
            }
        });
    });
});

// ── Customer Profile: Save (upsert) ──────────────────────────────────────────
app.post('/api/customer/profile', verifyToken, (req, res) => {
    const { phone, whatsapp, street, city, state, pin } = req.body;

    db.query('SELECT role FROM users WHERE id = ?', [req.userId], (err, rows) => {
        if (err || rows.length === 0) return res.status(500).json({ message: 'Server error' });
        if (rows[0].role !== 'customer') return res.status(403).json({ message: 'Only customers can update a customer profile' });

        const sql = `
            INSERT INTO customer_profiles (user_id, phone, whatsapp, street, city, state, pin)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                phone = VALUES(phone), whatsapp = VALUES(whatsapp),
                street = VALUES(street), city = VALUES(city), state = VALUES(state), pin = VALUES(pin)
        `;
        const params = [req.userId, phone || '', whatsapp || '', street || '', city || '', state || '', pin || ''];
        db.query(sql, params, (insertErr) => {
            if (insertErr) {
                console.error('Customer profile save error:', insertErr);
                return res.status(500).json({ message: 'Failed to save profile' });
            }
            res.json({ message: 'Profile saved successfully' });
        });
    });
});

// ── Customer Profile: Get own profile ────────────────────────────────────────
app.get('/api/customer/profile', verifyToken, (req, res) => {
    const sql = 'SELECT phone, whatsapp, street, city, state, pin FROM customer_profiles WHERE user_id = ?';
    db.query(sql, [req.userId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        if (results.length === 0) return res.json({ profile: null });
        res.json({ profile: results[0] });
    });
});

// ── Bookings: Submit & Send Email Notification ─────────────────────────────
app.post('/api/bookings', verifyToken, (req, res) => {
    const { tailor_id, service, date, time, notes, tailor_name } = req.body;
    
    // Get the logged-in customer's details (email, name, phone from profile if exists)
    const sqlCustomer = `
        SELECT u.email, u.full_name, c.phone 
        FROM users u 
        LEFT JOIN customer_profiles c ON u.id = c.user_id 
        WHERE u.id = ?
    `;
    db.query(sqlCustomer, [req.userId], (err, customerResults) => {
        if (err || customerResults.length === 0) {
            return res.status(500).json({ message: 'User not found or server error' });
        }
        
        const customer = customerResults[0];
        
        // Find tailor email (skip if a fallback 'f1', 'f2' string ID)
        const sqlTailor = 'SELECT email, full_name FROM users WHERE id = ? AND role = "tailor"';
        db.query(sqlTailor, [tailor_id], (err2, tailorResults) => {
            const tailorEmail = !err2 && tailorResults.length > 0 ? tailorResults[0].email : null;
            
            // 1. Send confirmation to the Customer
            const mailOptionsCustomer = {
                from: `"TailorHub" <${process.env.EMAIL_USER}>`,
                to: customer.email,
                subject: 'TailorHub – Appointment Booking Confirmed',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
                        <h2 style="color: #10b981;">✅ Booking Confirmed!</h2>
                        <p style="color: #374151;">Hi <strong>${customer.full_name}</strong>,</p>
                        <p style="color: #374151;">Your appointment with <strong>${tailor_name || 'Tailor'}</strong> has been successfully booked.</p>
                        
                        <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin-top: 0; color: #4b5563;">Booking Details:</h3>
                            <p style="margin: 4px 0;"><strong>Service:</strong> ${service}</p>
                            <p style="margin: 4px 0;"><strong>Date:</strong> ${date}</p>
                            <p style="margin: 4px 0;"><strong>Time:</strong> ${time}</p>
                            ${notes ? `<p style="margin: 4px 0;"><strong>Notes:</strong> ${notes}</p>` : ''}
                        </div>
                        
                        <p style="color: #6b7280; font-size: 14px;">Please arrive on time. You can contact your tailor through the TailorHub dashboard if you need to reschedule.</p>
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                        <p style="color: #9ca3af; font-size: 12px;">TailorHub – Custom Tailoring Platform</p>
                    </div>
                `,
            };
            
            transporter.sendMail(mailOptionsCustomer, (mailErr) => {
                if (mailErr) console.error('❌ Email send error (Customer):', mailErr.message);
                else console.log('✅ Booking email sent to customer:', customer.email);
            });

            // 2. Send notification to the Tailor
            if (tailorEmail) {
                const mailOptionsTailor = {
                    from: `"TailorHub" <${process.env.EMAIL_USER}>`,
                    to: tailorEmail,
                    subject: 'TailorHub – New Appointment Booking!',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
                            <h2 style="color: #6366f1;">📅 New Booking Received!</h2>
                            <p style="color: #374151;">Hi <strong>${tailorResults[0].full_name}</strong>,</p>
                            <p style="color: #374151;">You have a new appointment booking request from <strong>${customer.full_name}</strong>.</p>
                            
                            <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="margin-top: 0; color: #4b5563;">Booking Details:</h3>
                                <p style="margin: 4px 0;"><strong>Customer Name:</strong> ${customer.full_name}</p>
                                <p style="margin: 4px 0;"><strong>Customer Email:</strong> ${customer.email}</p>
                                ${customer.phone ? `<p style="margin: 4px 0;"><strong>Customer Phone:</strong> ${customer.phone}</p>` : ''}
                                <p style="margin: 4px 0;"><strong>Service:</strong> ${service}</p>
                                <p style="margin: 4px 0;"><strong>Date:</strong> ${date}</p>
                                <p style="margin: 4px 0;"><strong>Time:</strong> ${time}</p>
                                ${notes ? `<p style="margin: 4px 0;"><strong>Notes:</strong> ${notes}</p>` : ''}
                            </div>
                            
                            <p style="color: #6b7280; font-size: 14px;">Please review this appointment. You can view more details in your TailorHub dashboard.</p>
                            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                            <p style="color: #9ca3af; font-size: 12px;">TailorHub – Custom Tailoring Platform</p>
                        </div>
                    `,
                };
                
                transporter.sendMail(mailOptionsTailor, (mailErr) => {
                    if (mailErr) console.error('❌ Email send error (Tailor):', mailErr.message);
                    else console.log('✅ Booking email sent to tailor:', tailorEmail);
                });
            }

            res.json({ message: 'Booking confirmed and emails sent successfully!' });
        });
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

// ═══════════════════════════════════════════════════════════════
// OFFERS ENDPOINTS
// ═══════════════════════════════════════════════════════════════

// ── POST /api/tailor/offers — Create a new offer ───────────────
app.post('/api/tailor/offers', verifyToken, (req, res) => {
    const { title, description, discount, discount_type, start_date, end_date } = req.body;

    // Validate required fields
    if (!title || !discount || !start_date || !end_date)
        return res.status(400).json({ message: 'title, discount, start_date and end_date are required' });

    // Validate dates: end_date must be >= start_date
    if (new Date(end_date) < new Date(start_date))
        return res.status(400).json({ message: 'end_date must be on or after start_date' });

    // Ensure user is a tailor
    db.query('SELECT role FROM users WHERE id = ?', [req.userId], (err, rows) => {
        if (err || rows.length === 0) return res.status(500).json({ message: 'Server error' });
        if (rows[0].role !== 'tailor') return res.status(403).json({ message: 'Only tailors can create offers' });

        const sql = `INSERT INTO offers (tailor_id, title, description, discount, discount_type, start_date, end_date)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;
        db.query(sql, [
            req.userId, title, description || '', discount,
            discount_type || 'percent', start_date, end_date
        ], (insertErr, result) => {
            if (insertErr) {
                console.error('Offer insert error:', insertErr.message);
                return res.status(500).json({ message: 'Failed to save offer' });
            }
            res.json({ message: 'Offer created successfully', id: result.insertId });
        });
    });
});

// ── GET /api/tailor/offers — Own offers with active status ─────
app.get('/api/tailor/offers', verifyToken, (req, res) => {
    const sql = `
        SELECT id, title, description, discount, discount_type, start_date, end_date, created_at,
               (CURDATE() >= start_date AND CURDATE() <= end_date) AS is_active,
               DATEDIFF(end_date, CURDATE()) AS days_left
        FROM offers WHERE tailor_id = ?
        ORDER BY end_date ASC
    `;
    db.query(sql, [req.userId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        const toDateStr = (val) => {
            if (!val) return null;
            if (val instanceof Date) return val.toISOString().split('T')[0];
            return String(val).split('T')[0];
        };
        const offers = results.map(o => ({
            ...o,
            start_date: toDateStr(o.start_date),
            end_date:   toDateStr(o.end_date),
            days_left:  Number(o.days_left),
            is_active:  Boolean(o.is_active),
        }));
        res.json({ offers });
    });
});

// ── DELETE /api/tailor/offers/:id — Delete own offer ──────────
app.delete('/api/tailor/offers/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    db.query('SELECT tailor_id FROM offers WHERE id = ?', [id], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        if (rows.length === 0) return res.status(404).json({ message: 'Offer not found' });
        if (rows[0].tailor_id !== req.userId) return res.status(403).json({ message: 'Not authorized' });
        db.query('DELETE FROM offers WHERE id = ?', [id], (delErr) => {
            if (delErr) return res.status(500).json({ message: 'Failed to delete offer' });
            res.json({ message: 'Offer deleted successfully' });
        });
    });
});

// ── GET /api/offers/active — Public: all active offers with tailor info ──
app.get('/api/offers/active', (req, res) => {
    const sql = `
        SELECT o.id, o.title, o.description, o.discount, o.discount_type,
               o.start_date, o.end_date,
               DATEDIFF(o.end_date, CURDATE()) AS days_left,
               u.id AS tailor_id, u.full_name,
               tp.shop_name, tp.city, tp.profile_img
        FROM offers o
        INNER JOIN users u ON u.id = o.tailor_id AND u.role = 'tailor'
        LEFT JOIN tailor_profiles tp ON tp.user_id = o.tailor_id
        WHERE CURDATE() >= o.start_date AND CURDATE() <= o.end_date
        ORDER BY o.end_date ASC
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching active offers:', err.message);
            return res.status(500).json({ message: 'Server error', error: err.message });
        }
        // mysql2 may return DATE columns as JS Date objects — serialize them to YYYY-MM-DD strings
        const toDateStr = (val) => {
            if (!val) return null;
            if (val instanceof Date) return val.toISOString().split('T')[0];
            return String(val).split('T')[0]; // already a string, trim any time part
        };
        const offers = results.map(o => ({
            id: o.id,
            title: o.title,
            description: o.description || '',
            discount: o.discount,
            discount_type: o.discount_type || 'percent',
            start_date: toDateStr(o.start_date),
            end_date:   toDateStr(o.end_date),
            days_left:  Number(o.days_left),
            tailor_id:  o.tailor_id,
            full_name:  o.full_name,
            shop_name:  o.shop_name || o.full_name || 'Tailor Shop',
            city:       o.city || '',
            profile_img: normalizeImgPath(o.profile_img),
            discount_label: o.discount_type === 'percent'
                ? `${o.discount}% OFF`
                : `₹${Number(o.discount).toLocaleString('en-IN')} OFF`,
        }));
        console.log(`[/api/offers/active] returning ${offers.length} active offers`);
        res.json({ offers });
    });
});

// ═══════════════════════════════════════════════════════════════
// ORDERS ENDPOINTS
// ═══════════════════════════════════════════════════════════════

// ── GET /api/tailor/verify-customer — Find customer by email or phone ──
app.get('/api/tailor/verify-customer', verifyToken, requireRole('tailor'), (req, res) => {
    const { query } = req.query; // this can be email or phone
    if (!query) return res.status(400).json({ message: 'Please provide email or phone to search' });

    const sql = `
        SELECT u.id, u.full_name, u.email, c.phone 
        FROM users u 
        LEFT JOIN customer_profiles c ON u.id = c.user_id 
        WHERE u.role = 'customer' AND (u.email = ? OR c.phone = ?)
    `;
    db.query(sql, [query, query], (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        if (results.length === 0) return res.status(404).json({ message: 'Customer not found. Please register first.' });
        res.json({ customer: results[0] });
    });
});

// ── POST /api/orders — Create a new order (Tailor only) ──
app.post('/api/orders', verifyToken, requireRole('tailor'), async (req, res) => {
    try {
        console.log('📦 Create Order Request Body:', req.body);
        const { customer_id, product_name, total_amount, advance_payment, delivery_date, notes } = req.body;
        
        if (!customer_id || !product_name || total_amount === undefined || advance_payment === undefined || !delivery_date) {
            return res.status(400).json({ message: 'All required fields must be provided' });
        }

        // Ensure customerId exists
        const [customerCheck] = await db.promise().query('SELECT id FROM users WHERE id = ?', [customer_id]);
        if (customerCheck.length === 0) {
            return res.status(404).json({ message: 'Customer does not exist' });
        }

        const sql = `
            INSERT INTO orders (tailor_id, customer_id, product_name, total_amount, advance_payment, delivery_date, notes) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            req.userId, 
            customer_id, 
            product_name, 
            parseFloat(total_amount), 
            parseFloat(advance_payment), 
            delivery_date, 
            notes || null
        ];
        
        const [result] = await db.promise().query(sql, params);
        console.log('✅ DB Query Result:', result);
        
        const orderId = result.insertId;
        // Insert initial status into history
        await db.promise().query('INSERT INTO order_status_history (order_id, status, note) VALUES (?, "Order Placed", "Order initially placed by tailor.")', [orderId]);
        
        res.status(201).json({ message: 'Order created successfully', order_id: orderId });
    } catch (err) {
        console.error('❌ Create order error:', err);
        res.status(500).json({ message: err.message || 'Failed to create order' });
    }
});

// ── GET /api/orders/tailor — Get all orders for the logged in tailor ──
app.get('/api/orders/tailor', verifyToken, requireRole('tailor'), (req, res) => {
    const sql = `
        SELECT o.*, u.full_name AS customer_name, u.email AS customer_email, c.phone AS customer_phone 
        FROM orders o 
        JOIN users u ON o.customer_id = u.id 
        LEFT JOIN customer_profiles c ON u.id = c.user_id 
        WHERE o.tailor_id = ?
        ORDER BY o.created_at DESC
    `;
    db.query(sql, [req.userId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        res.json({ orders: results });
    });
});

// ── GET /api/orders/customer — Get all orders for logged in customer ──
app.get('/api/orders/customer', verifyToken, requireRole('customer'), (req, res) => {
    const sql = `
        SELECT o.*, u.full_name AS tailor_name, tp.shop_name 
        FROM orders o 
        JOIN users u ON o.tailor_id = u.id 
        LEFT JOIN tailor_profiles tp ON u.id = tp.user_id 
        WHERE o.customer_id = ?
        ORDER BY o.created_at DESC
    `;
    db.query(sql, [req.userId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        res.json({ orders: results });
    });
});

// ── GET /api/orders/:id/history — Get status history for an order ──
app.get('/api/orders/:id/history', verifyToken, (req, res) => {
    const orderId = req.params.id;
    console.log(`[GET History] Request for orderId: ${orderId}, userRole: ${req.userRole}, userId: ${req.userId}`);
    // Verify ownership (tailor or customer of the order)
    db.query('SELECT tailor_id, customer_id FROM orders WHERE id = ?', [orderId], (err, rows) => {
        if (err) {
            console.error('[GET History] Verify query err:', err);
            return res.status(404).json({ message: 'Order not found error' });
        }
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }
        const { tailor_id, customer_id } = rows[0];
        if (req.userRole === 'tailor' && req.userId !== tailor_id) return res.status(403).json({ message: 'Access denied' });
        if (req.userRole === 'customer' && req.userId !== customer_id) return res.status(403).json({ message: 'Access denied' });

        db.query('SELECT id, order_id, status, note, created_at as updated_at FROM order_status_history WHERE order_id = ? ORDER BY created_at ASC', [orderId], (errHistory, results) => {
            if (errHistory) {
                console.error('[History fetch error]:', errHistory);
                return res.status(500).json({ message: 'Server error fetching history DB' });
            }
            console.log('[GET History] Success sending results:', results.length);
            res.json({ history: results });
        });
    });
});

// ── PUT /api/orders/:id/status — Update order status and add history (Tailor only) ──
app.put('/api/orders/:id/status', verifyToken, requireRole('tailor'), (req, res) => {
    const orderId = req.params.id;
    const { status, note, delivery_date } = req.body;
    console.log(`[Update Order] Request for orderId ${orderId} by tailor ${req.userId}. Body:`, req.body);
    
    // First, verify order belongs to tailor and fetch associated names and emails
    const verifySql = `
        SELECT o.id, o.product_name, u.email AS customer_email, u.full_name AS customer_name, t.full_name AS tailor_name
        FROM orders o
        JOIN users u ON o.customer_id = u.id
        JOIN users t ON o.tailor_id = t.id
        WHERE o.id = ? AND o.tailor_id = ?
    `;
    db.query(verifySql, [orderId, req.userId], (err, rows) => {
        if (err) {
            console.error('[Update Order] verifySql error:', err);
            return res.status(500).json({ message: 'Server error during verification' });
        }
        if (rows.length === 0) {
            console.log(`[Update Order] Order not found or unauthorized for orderId ${orderId}, tailor_id ${req.userId}`);
            return res.status(404).json({ message: 'Order not found or unauthorized' });
        }
        
        const orderInfo = rows[0];
        console.log('[Update Order] Order Info fetched:', orderInfo);

        // Treat empty delivery_date as null to avoid invalid date syntax in MySQL
        const finalDeliveryDate = delivery_date === '' ? null : delivery_date;
        let updateSql = 'UPDATE orders SET current_status = ?';
        let params = [status];
        if (finalDeliveryDate !== undefined) {
            updateSql += ', delivery_date = ?';
            params.push(finalDeliveryDate);
        }
        updateSql += ' WHERE id = ?';
        params.push(orderId);
        
        console.log('[Update Order] Executing UPDATE:', updateSql, params);
        db.query(updateSql, params, (updateErr) => {
            if (updateErr) {
                console.error('[Update Order] updateSql error:', updateErr);
                return res.status(500).json({ message: 'Failed to update order' });
            }

            
            // Insert into history
            db.query('INSERT INTO order_status_history (order_id, status, note) VALUES (?, ?, ?)', [orderId, status, note || null], (histErr) => {
                if (histErr) return res.status(500).json({ message: 'Updated order but failed to log history' });

                // Send email to customer
                if (orderInfo.customer_email) {
                    const mailOptions = {
                        from: `"TailorHub" <${process.env.EMAIL_USER}>`,
                        to: orderInfo.customer_email,
                        subject: `TailorHub – Order Status Updated to: ${status}`,
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
                                <h2 style="color: #6366f1;">📦 Order Status Updated</h2>
                                <p style="color: #374151;">Hi <strong>${orderInfo.customer_name}</strong>,</p>
                                <p style="color: #374151;">Your tailor <strong>${orderInfo.tailor_name}</strong> has updated the status of your order.</p>
                                
                                <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 20px 0;">
                                    <h3 style="margin-top: 0; color: #4b5563;">Order details:</h3>
                                    <p style="margin: 4px 0;"><strong>Product:</strong> ${orderInfo.product_name}</p>
                                    <p style="margin: 4px 0;"><strong>New Status:</strong> <span style="display:inline-block; padding: 2px 8px; background: #e0e7ff; color: #4338ca; border-radius: 12px; font-weight: bold; font-size: 12px;">${status}</span></p>
                                    ${delivery_date ? `<p style="margin: 4px 0;"><strong>Expected Delivery:</strong> ${delivery_date}</p>` : ''}
                                    ${note ? `<p style="margin: 4px 0;"><strong>Tailor's Note:</strong> ${note}</p>` : ''}
                                </div>
                                
                                <p style="color: #6b7280; font-size: 14px;">You can view more details in your TailorHub dashboard.</p>
                                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                                <p style="color: #9ca3af; font-size: 12px;">TailorHub – Custom Tailoring Platform</p>
                            </div>
                        `,
                    };
                    transporter.sendMail(mailOptions, (mailErr) => {
                        if (mailErr) console.error('❌ Email send error (Order Update):', mailErr.message);
                        else console.log('✅ Order update email sent to:', orderInfo.customer_email);
                    });
                }

                res.json({ message: 'Order status updated' });
            });
        });
    });
});

// ── PUT /api/orders/:id/payment — Update payment details (Tailor only) ──
app.put('/api/orders/:id/payment', verifyToken, requireRole('tailor'), (req, res) => {
    const orderId = req.params.id;
    const { total_amount, advance_payment } = req.body;
    
    if (total_amount === undefined || advance_payment === undefined) {
        return res.status(400).json({ message: 'total_amount and advance_payment required' });
    }

    db.query('UPDATE orders SET total_amount = ?, advance_payment = ? WHERE id = ? AND tailor_id = ?', 
             [total_amount, advance_payment, orderId, req.userId], (err, result) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Order not found or unauthorized' });
        res.json({ message: 'Payment updated successfully' });
    });
});


app.listen(PORT, () => {
    console.log(`✅ Server running and listening on port ${PORT}`);
});
