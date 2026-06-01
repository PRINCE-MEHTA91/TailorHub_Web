require('dotenv').config();

// ── Global crash guards — keep the server alive even on unhandled errors ──
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception (server kept alive):', err.message);
});
process.on('unhandledRejection', (reason) => {
    console.error('❌ Unhandled Rejection (server kept alive):', reason);
});

const express = require('express');
const http = require('http');
const { Server: SocketIOServer } = require('socket.io');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3001';

const isAllowedOrigin = (origin, callback) => {
    if (!origin) return callback(null, true);
    if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return callback(null, true);
    if (origin.startsWith(CLIENT_URL) || origin.includes('vercel.app')) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
};

// ── Socket.IO real-time server ──────────────────────────────────────────────
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: isAllowedOrigin,
        credentials: true,
    },
    connectionStateRecovery: {},
});

app.use(cors({
    origin: isAllowedOrigin,
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(express.static(__dirname));

// ── PostgreSQL Pool (Neon) ──────────────────────────────────────────────────
console.log('⏳ Attempting to connect to PostgreSQL database (Neon)...');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

// ── Auto-create tables on startup ──────────────────────────────────────────
async function initDB() {
    const client = await pool.connect();
    try {
        console.log('✅ Connected successfully to PostgreSQL database (Neon)');

        // ── users ──────────────────────────────────────────────────────────
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id               SERIAL PRIMARY KEY,
                full_name        VARCHAR(255) NOT NULL,
                email            VARCHAR(255) NOT NULL UNIQUE,
                password         VARCHAR(255) NOT NULL,
                role             VARCHAR(20)  NOT NULL DEFAULT 'customer'
                                     CHECK (role IN ('customer', 'tailor')),
                avg_rating       DECIMAL(3,2) DEFAULT 0.00,
                total_reviews    INT          DEFAULT 0,
                reset_token      VARCHAR(255) DEFAULT NULL,
                reset_token_expiry TIMESTAMP  DEFAULT NULL,
                created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ users table ready');

        // ── tailor_profiles ────────────────────────────────────────────────
        await client.query(`
            CREATE TABLE IF NOT EXISTS tailor_profiles (
                id             SERIAL PRIMARY KEY,
                user_id        INT          NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
                phone          VARCHAR(20)  DEFAULT '',
                whatsapp       VARCHAR(20)  DEFAULT '',
                instagram      VARCHAR(100) DEFAULT '',
                street         VARCHAR(255) DEFAULT '',
                city           VARCHAR(100) DEFAULT '',
                state          VARCHAR(100) DEFAULT '',
                pin            VARCHAR(10)  DEFAULT '',
                products       JSONB        DEFAULT NULL,
                gallery        JSONB        DEFAULT NULL,
                profile_img    TEXT         DEFAULT NULL,
                shop_name      VARCHAR(255) DEFAULT '',
                tagline        VARCHAR(255) DEFAULT '',
                bio            TEXT,
                experience     VARCHAR(100) DEFAULT '',
                specialities   JSONB        DEFAULT NULL,
                timings        JSONB        DEFAULT NULL,
                deals          JSONB        DEFAULT NULL,
                price_listings JSONB        DEFAULT NULL,
                latitude       DECIMAL(10,7) DEFAULT NULL,
                longitude      DECIMAL(10,7) DEFAULT NULL,
                updated_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ tailor_profiles table ready');

        // ── customer_profiles ──────────────────────────────────────────────
        await client.query(`
            CREATE TABLE IF NOT EXISTS customer_profiles (
                id          SERIAL PRIMARY KEY,
                user_id     INT         NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
                phone       VARCHAR(20)  DEFAULT '',
                whatsapp    VARCHAR(20)  DEFAULT '',
                street      VARCHAR(255) DEFAULT '',
                city        VARCHAR(100) DEFAULT '',
                state       VARCHAR(100) DEFAULT '',
                pin         VARCHAR(10)  DEFAULT '',
                profile_img TEXT         DEFAULT NULL,
                updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ customer_profiles table ready');

        // ── offers ─────────────────────────────────────────────────────────
        await client.query(`
            CREATE TABLE IF NOT EXISTS offers (
                id            SERIAL PRIMARY KEY,
                tailor_id     INT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                title         VARCHAR(255) NOT NULL,
                description   TEXT         DEFAULT NULL,
                discount      VARCHAR(100) NOT NULL,
                discount_type VARCHAR(10)  NOT NULL DEFAULT 'percent'
                                  CHECK (discount_type IN ('percent', 'flat')),
                start_date    DATE         NOT NULL,
                end_date      DATE         NOT NULL,
                created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ offers table ready');

        // ── orders ─────────────────────────────────────────────────────────
        await client.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id               SERIAL PRIMARY KEY,
                tailor_id        INT            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                customer_id      INT            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                product_name     VARCHAR(255)   NOT NULL,
                total_amount     DECIMAL(10,2)  NOT NULL DEFAULT 0,
                advance_payment  DECIMAL(10,2)  NOT NULL DEFAULT 0,
                discount_amount  DECIMAL(10,2)  NOT NULL DEFAULT 0,
                final_amount     DECIMAL(10,2)  DEFAULT NULL,
                remaining_amount DECIMAL(10,2)  GENERATED ALWAYS AS
                                     (COALESCE(final_amount, total_amount) - advance_payment) STORED,
                delivery_date    DATE           DEFAULT NULL,
                current_status   VARCHAR(100)   NOT NULL DEFAULT 'Order Placed',
                notes            TEXT           DEFAULT NULL,
                offer_id         INT            DEFAULT NULL,
                created_at       TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
                updated_at       TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ orders table ready');

        // ── order_status_history ───────────────────────────────────────────
        await client.query(`
            CREATE TABLE IF NOT EXISTS order_status_history (
                id         SERIAL PRIMARY KEY,
                order_id   INT          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
                status     VARCHAR(100) NOT NULL,
                note       TEXT         DEFAULT NULL,
                updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ order_status_history table ready');

        // ── messages ───────────────────────────────────────────────────────
        await client.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id          SERIAL PRIMARY KEY,
                sender_id   INT         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                receiver_id INT         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                message     TEXT        NOT NULL,
                is_read     BOOLEAN     NOT NULL DEFAULT FALSE,
                is_edited   BOOLEAN     NOT NULL DEFAULT FALSE,
                file_url    TEXT        DEFAULT NULL,
                file_type   VARCHAR(50) DEFAULT NULL,
                file_name   VARCHAR(255) DEFAULT NULL,
                created_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ messages table ready');

        // ── notifications ──────────────────────────────────────────────────
        await client.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id           SERIAL PRIMARY KEY,
                user_id      INT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                type         VARCHAR(60)  DEFAULT 'system',
                title        VARCHAR(255) NOT NULL,
                body         TEXT         DEFAULT NULL,
                action_url   VARCHAR(255) DEFAULT NULL,
                action_label VARCHAR(100) DEFAULT NULL,
                is_read      BOOLEAN      NOT NULL DEFAULT FALSE,
                created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ notifications table ready');

        // ── feedbacks ──────────────────────────────────────────────────────
        await client.query(`
            CREATE TABLE IF NOT EXISTS feedbacks (
                id          SERIAL PRIMARY KEY,
                order_id    INT  NOT NULL UNIQUE,
                customer_id INT  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                tailor_id   INT  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                rating      INT  NOT NULL CHECK (rating >= 1 AND rating <= 5),
                message     TEXT,
                created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ feedbacks table ready');

        // ── products ───────────────────────────────────────────────────────
        await client.query(`
            CREATE TABLE IF NOT EXISTS products (
                id          SERIAL PRIMARY KEY,
                name        VARCHAR(255) NOT NULL,
                description TEXT,
                price       DECIMAL(10,2) NOT NULL,
                image_url   VARCHAR(255)
            )
        `);
        console.log('✅ products table ready');

    } catch (err) {
        console.error('❌ DB initialisation error:', err.message);
    } finally {
        client.release();
    }
}

initDB();

// ── Nodemailer ──────────────────────────────────────────────────────────────
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

// ── Helpers ─────────────────────────────────────────────────────────────────

// Safely parse a PostgreSQL JSONB field which may already be a parsed object
const safeParseJSON = (val, fallback = []) => {
    if (val === null || val === undefined) return fallback;
    if (typeof val === 'object') return val;
    try { return JSON.parse(val); } catch { return fallback; }
};

// Normalize profile_img: strip any http://.../ prefix, keep only /uploads/... or null
const normalizeImgPath = (img) => {
    if (!img) return null;
    const match = img.match(/(\/uploads\/[^?#]+)/);
    if (match) return match[1];
    if (img.startsWith('/uploads/')) return img;
    if (img.startsWith('http')) return img;
    return img;
};

// ── Middleware ───────────────────────────────────────────────────────────────

const verifyToken = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        console.warn(`⚠️  401 Unauthorized: Missing token for ${req.method} ${req.originalUrl}`);
        return res.status(401).json({ message: 'Not authenticated' });
    }
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        if (err) {
            console.warn(`⚠️  401 Unauthorized: Invalid token for ${req.method} ${req.originalUrl} - ${err.message}`);
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
        try {
            const result = await pool.query('SELECT id, role FROM users WHERE id = $1', [decoded.id]);
            if (result.rows.length === 0) return res.status(500).json({ message: 'Server error' });
            req.userId = decoded.id;
            req.userRole = result.rows[0].role;
            next();
        } catch (dbErr) {
            return res.status(500).json({ message: 'Server error' });
        }
    });
};

// Role-guard middleware — usage: requireRole('tailor') or requireRole('customer')
const requireRole = (role) => async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        console.warn(`⚠️  401 Unauthorized: Missing token for ${req.method} ${req.originalUrl}`);
        return res.status(401).json({ message: 'Not authenticated' });
    }
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        if (err) {
            console.warn(`⚠️  401 Unauthorized: Invalid token for ${req.method} ${req.originalUrl} - ${err.message}`);
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
        try {
            const result = await pool.query('SELECT id, role FROM users WHERE id = $1', [decoded.id]);
            if (result.rows.length === 0) return res.status(500).json({ message: 'Server error' });
            if (result.rows[0].role !== role) {
                console.warn(`⚠️  403 Forbidden: User ${decoded.id} lacks role ${role} for ${req.method} ${req.originalUrl}`);
                return res.status(403).json({ message: `Access denied. ${role} role required.` });
            }
            req.userId = decoded.id;
            req.userRole = result.rows[0].role;
            next();
        } catch (dbErr) {
            return res.status(500).json({ message: 'Server error' });
        }
    });
};

const setTokenCookie = (res, userId) => {
    const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};

// ═══════════════════════════════════════════════════════════════
// AUTH ENDPOINTS
// ═══════════════════════════════════════════════════════════════

app.post('/api/auth/signup', async (req, res) => {
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
    try {
        await pool.query(
            'INSERT INTO users (full_name, email, password, role) VALUES ($1, $2, $3, $4)',
            [full_name, email, hashedPassword, userRole]
        );
        res.status(201).json({ message: 'Account created successfully' });
    } catch (err) {
        console.error('Signup DB error:', err);
        if (err.code === '23505') {
            return res.status(409).json({ message: 'Email already in use' });
        }
        return res.status(500).json({ message: 'Error creating account' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const user = result.rows[0];
        const valid = bcrypt.compareSync(password, user.password);
        if (!valid) return res.status(401).json({ message: 'Invalid email or password' });
        setTokenCookie(res, user.id);
        res.json({ message: 'Login successful', user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role } });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/auth/me', verifyToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT id, full_name, email, role FROM users WHERE id = $1', [req.userId]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json({ user: result.rows[0] });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'none' });
    res.json({ message: 'Logged out successfully' });
});

app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.json({ message: 'If this email exists, a reset link has been sent' });
        }
        const user = result.rows[0];
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expiry = new Date(Date.now() + 15 * 60 * 1000);
        await pool.query(
            'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
            [tokenHash, expiry, user.id]
        );
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
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
});

// ── Redirect browser from backend URL to React frontend for password reset ──
app.get('/reset-password/:token', (req, res) => {
    res.redirect(`${CLIENT_URL}/reset-password/${req.params.token}`);
});

app.post('/api/auth/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    if (!password || password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()',
            [tokenHash]
        );
        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Reset link is invalid or has expired' });
        }
        const user = result.rows[0];
        const hashed = bcrypt.hashSync(password, 10);
        await pool.query(
            'UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
            [hashed, user.id]
        );
        res.json({ message: 'Password reset successfully' });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
});

// ═══════════════════════════════════════════════════════════════
// FILE UPLOAD (multer — unchanged)
// ═══════════════════════════════════════════════════════════════

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const prefix = (req._uploadPrefix || 'tailor');
        cb(null, prefix + '_' + req.userId + '_' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed'));
        }
        cb(null, true);
    }
});

// ── Chat file upload multer (images + documents) ─────────────────────────────
const chatFileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, 'uploads', 'chat');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, 'chat_' + req.userId + '_' + Date.now() + '_' + safeName);
    }
});
const ALLOWED_CHAT_TYPES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
];
const chatUpload = multer({
    storage: chatFileStorage,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB max
    fileFilter: (req, file, cb) => {
        if (!ALLOWED_CHAT_TYPES.includes(file.mimetype)) {
            return cb(new Error('File type not allowed. Allowed: images, PDF, Word, Excel, TXT.'));
        }
        cb(null, true);
    }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Handle multer errors (file too large, wrong type, etc.)
const handleUploadError = (err, req, res, next) => {
    if (err && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ message: 'File too large. Maximum size is 10MB.' });
    }
    if (err) {
        return res.status(400).json({ message: err.message || 'Upload error' });
    }
    next();
};

app.post('/api/upload/profile-image', verifyToken, requireRole('tailor'), (req, res, next) => { req._uploadPrefix = 'tailor'; next(); }, upload.single('profile_img'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    res.json({ message: 'Image uploaded successfully', imageUrl: `/uploads/${req.file.filename}` });
});

app.post('/api/upload/gallery-image', verifyToken, requireRole('tailor'), (req, res, next) => { req._uploadPrefix = 'tailor'; next(); }, upload.single('gallery_img'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    res.json({ message: 'Gallery image uploaded', imageUrl: `/uploads/${req.file.filename}` });
});

app.post('/api/upload/pricing-image', verifyToken, requireRole('tailor'), (req, res, next) => { req._uploadPrefix = 'tailor'; next(); }, upload.single('pricing_img'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    res.json({ message: 'Pricing image uploaded', imageUrl: `/uploads/${req.file.filename}` });
});

// ── Customer Profile Image: Upload & Save ────────────────────────────────────
app.post('/api/customer/upload/profile-image',
    verifyToken,
    (req, res, next) => { req._uploadPrefix = 'customer'; next(); },
    upload.single('profile_img'),
    handleUploadError,
    async (req, res) => {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        const imageUrl = `/uploads/${req.file.filename}`;
        try {
            await pool.query(
                `INSERT INTO customer_profiles (user_id, profile_img)
                 VALUES ($1, $2)
                 ON CONFLICT (user_id) DO UPDATE SET profile_img = EXCLUDED.profile_img`,
                [req.userId, imageUrl]
            );
            res.json({ message: 'Profile image updated successfully', imageUrl });
        } catch (err) {
            console.error('Customer profile_img save error:', err);
            return res.status(500).json({ message: 'Image uploaded but failed to save to profile' });
        }
    }
);

// ═══════════════════════════════════════════════════════════════
// PRODUCTS ENDPOINT
// ═══════════════════════════════════════════════════════════════

app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products');
        res.json(result.rows);
    } catch (err) {
        return res.status(500).json(err);
    }
});

// ═══════════════════════════════════════════════════════════════
// TAILOR PROFILE ENDPOINTS
// ═══════════════════════════════════════════════════════════════

// ── Tailor Profile: Save (upsert) ──────────────────────────────────────────
app.post('/api/tailor/profile', verifyToken, async (req, res) => {
    const {
        phone, whatsapp, instagram, street, city, state, pin,
        products, gallery, profile_img,
        shop_name, tagline, bio, experience, specialities, timings, deals, price_listings,
        latitude, longitude
    } = req.body;

    try {
        const userRes = await pool.query('SELECT role FROM users WHERE id = $1', [req.userId]);
        if (userRes.rows.length === 0) return res.status(500).json({ message: 'Server error' });
        if (userRes.rows[0].role !== 'tailor') return res.status(403).json({ message: 'Only tailors can update a tailor profile' });

        const lat = (latitude !== undefined && latitude !== '' && latitude !== null) ? parseFloat(latitude) : null;
        const lng = (longitude !== undefined && longitude !== '' && longitude !== null) ? parseFloat(longitude) : null;

        await pool.query(`
            INSERT INTO tailor_profiles
                (user_id, phone, whatsapp, instagram, street, city, state, pin,
                 products, gallery, profile_img,
                 shop_name, tagline, bio, experience, specialities, timings, deals, price_listings,
                 latitude, longitude)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
            ON CONFLICT (user_id) DO UPDATE SET
                phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, instagram=EXCLUDED.instagram,
                street=EXCLUDED.street, city=EXCLUDED.city, state=EXCLUDED.state, pin=EXCLUDED.pin,
                products=EXCLUDED.products, gallery=EXCLUDED.gallery, profile_img=EXCLUDED.profile_img,
                shop_name=EXCLUDED.shop_name, tagline=EXCLUDED.tagline, bio=EXCLUDED.bio,
                experience=EXCLUDED.experience, specialities=EXCLUDED.specialities, timings=EXCLUDED.timings,
                deals=EXCLUDED.deals, price_listings=EXCLUDED.price_listings,
                latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
                updated_at=CURRENT_TIMESTAMP
        `, [
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
        ]);
        res.json({ message: 'Profile saved successfully' });
    } catch (err) {
        console.error('Tailor profile save error:', err);
        return res.status(500).json({ message: 'Failed to save profile' });
    }
});

// ── Tailor Profile: Get own profile ────────────────────────────────────────
app.get('/api/tailor/profile', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT u.full_name, u.email, u.avg_rating, u.total_reviews,
                   tp.phone, tp.whatsapp, tp.instagram,
                   tp.street, tp.city, tp.state, tp.pin,
                   tp.products, tp.gallery, tp.profile_img,
                   tp.shop_name, tp.tagline, tp.bio, tp.experience, tp.specialities, tp.timings, tp.deals,
                   tp.price_listings, tp.latitude, tp.longitude,
                   (SELECT COUNT(*) FROM orders WHERE tailor_id = u.id) AS total_orders,
                   (SELECT COUNT(DISTINCT customer_id) FROM orders WHERE tailor_id = u.id) AS total_clients
            FROM users u
            LEFT JOIN tailor_profiles tp ON u.id = tp.user_id
            WHERE u.id = $1 AND u.role = 'tailor'
        `, [req.userId]);
        if (result.rows.length === 0) return res.json({ profile: null });
        const p = result.rows[0];
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
                total_orders:   Number(p.total_orders) || 0,
                total_clients:  Number(p.total_clients) || 0,
            }
        });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
});

// ── Tailor Deals: Save deals separately ────────────────────────────────────
app.post('/api/tailor/deals', verifyToken, async (req, res) => {
    const { deals } = req.body;
    try {
        const userRes = await pool.query('SELECT role FROM users WHERE id = $1', [req.userId]);
        if (userRes.rows.length === 0) return res.status(500).json({ message: 'Server error' });
        if (userRes.rows[0].role !== 'tailor') return res.status(403).json({ message: 'Only tailors can update deals' });
        await pool.query(
            `INSERT INTO tailor_profiles (user_id, deals) VALUES ($1, $2)
             ON CONFLICT (user_id) DO UPDATE SET deals = EXCLUDED.deals`,
            [req.userId, JSON.stringify(deals || [])]
        );
        res.json({ message: 'Deals saved successfully' });
    } catch (err) {
        return res.status(500).json({ message: 'Failed to save deals' });
    }
});

// ── Tailor Deals: Get own deals ─────────────────────────────────────────────
app.get('/api/tailor/deals', verifyToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT deals FROM tailor_profiles WHERE user_id = $1', [req.userId]);
        const deals = result.rows.length > 0 ? safeParseJSON(result.rows[0].deals, []) : [];
        res.json({ deals });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
});

// ── Tailor Deals: Get by tailor ID (public for customers) ──────────────────
app.get('/api/tailors/:id/deals', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `SELECT tp.deals FROM tailor_profiles tp
             INNER JOIN users u ON u.id = tp.user_id WHERE u.id = $1 AND u.role = 'tailor'`,
            [id]
        );
        const deals = result.rows.length > 0 ? safeParseJSON(result.rows[0].deals, []) : [];
        res.json({ deals });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
});

// ── Price Listings: Save (tailor only, dedicated endpoint) ─────────────────
app.post('/api/tailor/price-listings', verifyToken, async (req, res) => {
    const { price_listings } = req.body;
    try {
        const userRes = await pool.query('SELECT role FROM users WHERE id = $1', [req.userId]);
        if (userRes.rows.length === 0) return res.status(500).json({ message: 'Server error' });
        if (userRes.rows[0].role !== 'tailor') return res.status(403).json({ message: 'Only tailors can update price listings' });
        await pool.query(
            `INSERT INTO tailor_profiles (user_id, price_listings) VALUES ($1, $2)
             ON CONFLICT (user_id) DO UPDATE SET price_listings = EXCLUDED.price_listings`,
            [req.userId, JSON.stringify(price_listings || [])]
        );
        res.json({ message: 'Price listings saved successfully' });
    } catch (err) {
        console.error('Price listings save error:', err);
        return res.status(500).json({ message: 'Failed to save price listings' });
    }
});

// ── Tailor Profiles: Fetch all (for customer dashboard) ────────────────────
app.get('/api/tailors', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT u.id, u.full_name, u.email, u.avg_rating, u.total_reviews,
                   tp.phone, tp.whatsapp, tp.instagram,
                   tp.street, tp.city, tp.state, tp.pin,
                   tp.products, tp.gallery, tp.profile_img,
                   tp.shop_name, tp.tagline, tp.bio, tp.experience, tp.specialities, tp.timings,
                   tp.price_listings, tp.deals, tp.latitude, tp.longitude
            FROM users u
            INNER JOIN tailor_profiles tp ON u.id = tp.user_id
            WHERE u.role = 'tailor'
            ORDER BY tp.updated_at DESC
        `);
        const tailors = result.rows.map(t => ({
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
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
});

// ── Tailor Profiles: Get by ID ─────────────────────────────────────────────
app.get('/api/tailors/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT u.id as user_id, u.full_name, u.email, u.avg_rating, u.total_reviews,
                   tp.phone, tp.whatsapp, tp.instagram,
                   tp.street, tp.city, tp.state, tp.pin,
                   tp.products, tp.gallery, tp.profile_img,
                   tp.shop_name, tp.tagline, tp.bio, tp.experience, tp.specialities, tp.timings,
                   tp.price_listings, tp.deals, tp.latitude, tp.longitude
            FROM users u
            INNER JOIN tailor_profiles tp ON u.id = tp.user_id
            WHERE u.role = 'tailor' AND u.id = $1
        `, [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Tailor not found' });
        const t = result.rows[0];
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
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
});

// ═══════════════════════════════════════════════════════════════
// CUSTOMER PROFILE ENDPOINTS
// ═══════════════════════════════════════════════════════════════

// ── Customer Profile: Save (upsert) ──────────────────────────────────────────
app.post('/api/customer/profile', verifyToken, async (req, res) => {
    const { phone, whatsapp, street, city, state, pin } = req.body;
    try {
        const userRes = await pool.query('SELECT role FROM users WHERE id = $1', [req.userId]);
        if (userRes.rows.length === 0) return res.status(500).json({ message: 'Server error' });
        if (userRes.rows[0].role !== 'customer') return res.status(403).json({ message: 'Only customers can update a customer profile' });

        await pool.query(`
            INSERT INTO customer_profiles (user_id, phone, whatsapp, street, city, state, pin)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (user_id) DO UPDATE SET
                phone = EXCLUDED.phone, whatsapp = EXCLUDED.whatsapp,
                street = EXCLUDED.street, city = EXCLUDED.city,
                state = EXCLUDED.state, pin = EXCLUDED.pin
        `, [req.userId, phone || '', whatsapp || '', street || '', city || '', state || '', pin || '']);
        res.json({ message: 'Profile saved successfully' });
    } catch (err) {
        console.error('Customer profile save error:', err);
        return res.status(500).json({ message: 'Failed to save profile' });
    }
});

// ── Customer Profile: Get own profile ────────────────────────────────────────
app.get('/api/customer/profile', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT phone, whatsapp, street, city, state, pin, profile_img FROM customer_profiles WHERE user_id = $1',
            [req.userId]
        );
        if (result.rows.length === 0) return res.json({ profile: null });
        const p = result.rows[0];
        res.json({ profile: { ...p, profile_img: normalizeImgPath(p.profile_img) } });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
});

// ═══════════════════════════════════════════════════════════════
// BOOKINGS ENDPOINT
// ═══════════════════════════════════════════════════════════════

// ── Bookings: Submit & Send Email Notification ─────────────────────────────
app.post('/api/bookings', verifyToken, async (req, res) => {
    const { tailor_id, service, date, time, notes, tailor_name } = req.body;

    try {
        // Get the logged-in customer's details (email, name, phone from profile if exists)
        const customerRes = await pool.query(`
            SELECT u.email, u.full_name, c.phone
            FROM users u
            LEFT JOIN customer_profiles c ON u.id = c.user_id
            WHERE u.id = $1
        `, [req.userId]);

        if (customerRes.rows.length === 0) {
            return res.status(500).json({ message: 'User not found or server error' });
        }
        const customer = customerRes.rows[0];

        // Find tailor email
        let tailorEmail = null;
        let tailorFullName = null;
        try {
            const tailorRes = await pool.query(
                'SELECT email, full_name FROM users WHERE id = $1 AND role = \'tailor\'',
                [tailor_id]
            );
            if (tailorRes.rows.length > 0) {
                tailorEmail = tailorRes.rows[0].email;
                tailorFullName = tailorRes.rows[0].full_name;
            }
        } catch (e) { /* proceed without tailor email */ }

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
                        <p style="color: #374151;">Hi <strong>${tailorFullName}</strong>,</p>
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
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
});

// ── Button click endpoints ──────────────────────────────────────────────────
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
app.post('/api/tailor/offers', verifyToken, async (req, res) => {
    const { title, description, discount, discount_type, start_date, end_date } = req.body;

    if (!title || !discount || !start_date || !end_date)
        return res.status(400).json({ message: 'title, discount, start_date and end_date are required' });

    if (new Date(end_date) < new Date(start_date))
        return res.status(400).json({ message: 'end_date must be on or after start_date' });

    try {
        const userRes = await pool.query('SELECT role FROM users WHERE id = $1', [req.userId]);
        if (userRes.rows.length === 0) return res.status(500).json({ message: 'Server error' });
        if (userRes.rows[0].role !== 'tailor') return res.status(403).json({ message: 'Only tailors can create offers' });

        const result = await pool.query(
            `INSERT INTO offers (tailor_id, title, description, discount, discount_type, start_date, end_date)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            [req.userId, title, description || '', discount, discount_type || 'percent', start_date, end_date]
        );
        res.json({ message: 'Offer created successfully', id: result.rows[0].id });
    } catch (err) {
        console.error('Offer insert error:', err.message);
        return res.status(500).json({ message: 'Failed to save offer' });
    }
});

// ── GET /api/tailor/offers — Own offers with active status ─────
app.get('/api/tailor/offers', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, title, description, discount, discount_type, start_date, end_date, created_at,
                   (CURRENT_DATE >= start_date AND CURRENT_DATE <= end_date) AS is_active,
                   (end_date - CURRENT_DATE) AS days_left
            FROM offers WHERE tailor_id = $1
            ORDER BY end_date ASC
        `, [req.userId]);
        const toDateStr = (val) => {
            if (!val) return null;
            if (val instanceof Date) return val.toISOString().split('T')[0];
            return String(val).split('T')[0];
        };
        const offers = result.rows.map(o => ({
            ...o,
            start_date: toDateStr(o.start_date),
            end_date:   toDateStr(o.end_date),
            days_left:  Number(o.days_left),
            is_active:  Boolean(o.is_active),
        }));
        res.json({ offers });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
});

// ── DELETE /api/tailor/offers/:id — Delete own offer ──────────
app.delete('/api/tailor/offers/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const offerRes = await pool.query('SELECT tailor_id FROM offers WHERE id = $1', [id]);
        if (offerRes.rows.length === 0) return res.status(404).json({ message: 'Offer not found' });
        if (offerRes.rows[0].tailor_id !== req.userId) return res.status(403).json({ message: 'Not authorized' });
        await pool.query('DELETE FROM offers WHERE id = $1', [id]);
        res.json({ message: 'Offer deleted successfully' });
    } catch (err) {
        return res.status(500).json({ message: 'Failed to delete offer' });
    }
});

// ── GET /api/offers/active — Public: all active offers with tailor info ──
app.get('/api/offers/active', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT o.id, o.title, o.description, o.discount, o.discount_type,
                   o.start_date, o.end_date,
                   (o.end_date - CURRENT_DATE) AS days_left,
                   u.id AS tailor_id, u.full_name,
                   tp.shop_name, tp.city, tp.profile_img
            FROM offers o
            INNER JOIN users u ON u.id = o.tailor_id AND u.role = 'tailor'
            LEFT JOIN tailor_profiles tp ON tp.user_id = o.tailor_id
            WHERE CURRENT_DATE >= o.start_date AND CURRENT_DATE <= o.end_date
            ORDER BY o.end_date ASC
        `);
        const toDateStr = (val) => {
            if (!val) return null;
            if (val instanceof Date) return val.toISOString().split('T')[0];
            return String(val).split('T')[0];
        };
        const offers = result.rows.map(o => ({
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
    } catch (err) {
        console.error('Error fetching active offers:', err.message);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ── GET /api/tailor/offers/active-for-order — Active offers for logged-in tailor (for order creation)
app.get('/api/tailor/offers/active-for-order', verifyToken, requireRole('tailor'), async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, title, description, discount, discount_type, start_date, end_date
            FROM offers
            WHERE tailor_id = $1 AND CURRENT_DATE >= start_date AND CURRENT_DATE <= end_date
            ORDER BY end_date ASC
        `, [req.userId]);
        const toDateStr = (val) => {
            if (!val) return null;
            if (val instanceof Date) return val.toISOString().split('T')[0];
            return String(val).split('T')[0];
        };
        const offers = result.rows.map(o => ({
            ...o,
            start_date: toDateStr(o.start_date),
            end_date:   toDateStr(o.end_date),
            discount:   Number(o.discount),
        }));
        res.json({ offers });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
});

// ═══════════════════════════════════════════════════════════════
// ORDERS ENDPOINTS
// ═══════════════════════════════════════════════════════════════

// ── GET /api/tailor/verify-customer — Find customer by email or phone ──
app.get('/api/tailor/verify-customer', verifyToken, requireRole('tailor'), async (req, res) => {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: 'Please provide email or phone to search' });

    try {
        const result = await pool.query(`
            SELECT u.id, u.full_name, u.email, c.phone
            FROM users u
            LEFT JOIN customer_profiles c ON u.id = c.user_id
            WHERE u.role = 'customer' AND (u.email = $1 OR c.phone = $2)
        `, [query, query]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Customer not found. Please register first.' });
        res.json({ customer: result.rows[0] });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
});

// ── POST /api/orders — Create a new order (Tailor only) ──
app.post('/api/orders', verifyToken, requireRole('tailor'), async (req, res) => {
    try {
        console.log('📦 Create Order Request Body:', req.body);
        const { customer_id, product_name, total_amount, advance_payment, delivery_date, notes, offer_id, discount_amount, final_amount } = req.body;

        if (!customer_id || !product_name || total_amount === undefined || advance_payment === undefined || !delivery_date) {
            return res.status(400).json({ message: 'All required fields must be provided' });
        }

        // Ensure customerId exists
        const customerCheck = await pool.query('SELECT id FROM users WHERE id = $1', [customer_id]);
        if (customerCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Customer does not exist' });
        }

        // Validate offer if provided
        let resolvedOfferId = offer_id || null;
        let resolvedDiscount = parseFloat(discount_amount) || 0;
        let resolvedFinalAmount = final_amount !== undefined ? parseFloat(final_amount) : parseFloat(total_amount);

        if (resolvedOfferId) {
            const offerCheck = await pool.query(
                'SELECT id FROM offers WHERE id = $1 AND tailor_id = $2 AND CURRENT_DATE >= start_date AND CURRENT_DATE <= end_date',
                [resolvedOfferId, req.userId]
            );
            if (offerCheck.rows.length === 0) {
                resolvedOfferId = null;
                resolvedDiscount = 0;
                resolvedFinalAmount = parseFloat(total_amount);
            }
        }

        const result = await pool.query(`
            INSERT INTO orders (tailor_id, customer_id, product_name, total_amount, advance_payment, delivery_date, notes, offer_id, discount_amount, final_amount)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id
        `, [
            req.userId,
            customer_id,
            product_name,
            parseFloat(total_amount),
            parseFloat(advance_payment),
            delivery_date,
            notes || null,
            resolvedOfferId,
            resolvedDiscount,
            resolvedFinalAmount
        ]);
        console.log('✅ DB Query Result:', result.rows[0]);

        const orderId = result.rows[0].id;
        // Insert initial status into history
        await pool.query(
            'INSERT INTO order_status_history (order_id, status, note) VALUES ($1, $2, $3)',
            [orderId, 'Order Placed', 'Order initially placed by tailor.']
        );

        res.status(201).json({ message: 'Order created successfully', order_id: orderId });
    } catch (err) {
        console.error('❌ Create order error:', err);
        res.status(500).json({ message: err.message || 'Failed to create order' });
    }
});

// ── GET /api/tailor/dashboard-stats — Real-time home tab stats for a tailor ──
app.get('/api/tailor/dashboard-stats', verifyToken, requireRole('tailor'), async (req, res) => {
    try {
        const uid = req.userId;

        // 1. Order counts and earnings in one query
        const orderStats = await pool.query(`
            SELECT
                COUNT(*) AS total_orders,
                COUNT(DISTINCT customer_id) AS total_clients,
                SUM(CASE WHEN current_status NOT IN ('Completed','Delivered') THEN 1 ELSE 0 END) AS pending_count,
                SUM(CASE WHEN current_status IN ('Completed','Delivered') THEN 1 ELSE 0 END) AS completed_count,
                SUM(COALESCE(final_amount, total_amount)) AS total_earnings
            FROM orders
            WHERE tailor_id = $1
        `, [uid]);

        // 2. Tailor profile for completion %
        const profileRes = await pool.query(`
            SELECT tp.phone, tp.shop_name, tp.profile_img, tp.bio, tp.experience,
                   tp.specialities, tp.timings, tp.city,
                   u.avg_rating, u.total_reviews
            FROM users u
            LEFT JOIN tailor_profiles tp ON tp.user_id = u.id
            WHERE u.id = $1
        `, [uid]);

        const profile = profileRes.rows[0] || {};

        // Compute profile completion (out of 8 key fields)
        const fields = [profile.phone, profile.shop_name, profile.profile_img, profile.bio,
                        profile.experience, profile.specialities, profile.timings, profile.city];
        const filled = fields.filter(f => f && f !== '[]' && f !== '{}').length;
        const profileCompletion = Math.round((filled / fields.length) * 100);

        // 3. Recent 5 orders
        const recentOrders = await pool.query(`
            SELECT o.id, o.product_name, o.current_status, o.delivery_date,
                   COALESCE(o.final_amount, o.total_amount) AS amount,
                   u.full_name AS customer_name
            FROM orders o
            JOIN users u ON o.customer_id = u.id
            WHERE o.tailor_id = $1
            ORDER BY o.created_at DESC
            LIMIT 5
        `, [uid]);

        const stats = orderStats.rows[0] || {};
        res.json({
            totalOrders:       Number(stats.total_orders) || 0,
            totalClients:      Number(stats.total_clients) || 0,
            pendingCount:      Number(stats.pending_count) || 0,
            completedCount:    Number(stats.completed_count) || 0,
            totalEarnings:     parseFloat(stats.total_earnings) || 0,
            avgRating:         parseFloat(profile.avg_rating) || 0,
            totalReviews:      Number(profile.total_reviews) || 0,
            profileCompletion,
            recentOrders:      recentOrders.rows,
        });
    } catch (err) {
        console.error('/api/tailor/dashboard-stats error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ── GET /api/orders/tailor — Get all orders for the logged in tailor ──
app.get('/api/orders/tailor', verifyToken, requireRole('tailor'), async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT o.*, u.full_name AS customer_name, u.email AS customer_email, c.phone AS customer_phone
            FROM orders o
            JOIN users u ON o.customer_id = u.id
            LEFT JOIN customer_profiles c ON u.id = c.user_id
            WHERE o.tailor_id = $1
            ORDER BY o.created_at DESC
        `, [req.userId]);
        const orders = result.rows.map(o => ({
            ...o,
            total_amount:     parseFloat(o.total_amount) || 0,
            advance_payment:  parseFloat(o.advance_payment) || 0,
            discount_amount:  parseFloat(o.discount_amount) || 0,
            final_amount:     parseFloat(o.final_amount) || parseFloat(o.total_amount) || 0,
            remaining_amount: parseFloat(o.remaining_amount) || 0,
        }));
        res.json({ orders });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
});

// ── GET /api/orders/customer — Get all orders for logged in customer ──
app.get('/api/orders/customer', verifyToken, requireRole('customer'), async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT o.*, u.full_name AS tailor_name, tp.shop_name,
                   (SELECT COUNT(*) FROM feedbacks f WHERE f.order_id = o.id) AS feedback_submitted
            FROM orders o
            JOIN users u ON o.tailor_id = u.id
            LEFT JOIN tailor_profiles tp ON u.id = tp.user_id
            WHERE o.customer_id = $1
            ORDER BY o.created_at DESC
        `, [req.userId]);
        const orders = result.rows.map(o => ({
            ...o,
            total_amount:     parseFloat(o.total_amount) || 0,
            advance_payment:  parseFloat(o.advance_payment) || 0,
            discount_amount:  parseFloat(o.discount_amount) || 0,
            final_amount:     parseFloat(o.final_amount) || parseFloat(o.total_amount) || 0,
            remaining_amount: parseFloat(o.remaining_amount) || 0,
        }));
        res.json({ orders });
    } catch (err) {
        console.error('Error fetching customer orders:', err);
        return res.status(500).json({ message: 'Server error' });
    }
});

// ── GET /api/orders/:id/history — Get status history for an order ──
app.get('/api/orders/:id/history', verifyToken, async (req, res) => {
    const orderId = req.params.id;
    console.log(`[GET History] Request for orderId: ${orderId}, userRole: ${req.userRole}, userId: ${req.userId}`);
    try {
        const orderRes = await pool.query('SELECT tailor_id, customer_id FROM orders WHERE id = $1', [orderId]);
        if (orderRes.rows.length === 0) return res.status(404).json({ message: 'Order not found' });
        const { tailor_id, customer_id } = orderRes.rows[0];
        if (req.userRole === 'tailor' && req.userId !== tailor_id) return res.status(403).json({ message: 'Access denied' });
        if (req.userRole === 'customer' && req.userId !== customer_id) return res.status(403).json({ message: 'Access denied' });

        const histResult = await pool.query(
            'SELECT id, order_id, status, note, updated_at FROM order_status_history WHERE order_id = $1 ORDER BY updated_at ASC',
            [orderId]
        );
        console.log('[GET History] Success sending results:', histResult.rows.length);
        res.json({ history: histResult.rows });
    } catch (err) {
        console.error('[History fetch error]:', err);
        return res.status(500).json({ message: 'Server error fetching history DB' });
    }
});

// ── PUT /api/orders/:id — Edit order details (Tailor only) ──
app.put('/api/orders/:id', verifyToken, requireRole('tailor'), async (req, res) => {
    try {
        const orderId = req.params.id;
        const { product_name, total_amount, advance_payment, delivery_date, notes, offer_id, discount_amount, final_amount } = req.body;

        // Verify ownership
        const ownerCheck = await pool.query('SELECT id FROM orders WHERE id = $1 AND tailor_id = $2', [orderId, req.userId]);
        if (ownerCheck.rows.length === 0) return res.status(404).json({ message: 'Order not found or unauthorized' });

        let resolvedOfferId = offer_id || null;
        let resolvedDiscount = parseFloat(discount_amount) || 0;
        let resolvedFinalAmount = final_amount !== undefined ? parseFloat(final_amount) : parseFloat(total_amount);

        if (resolvedOfferId) {
            const offerCheck = await pool.query(
                'SELECT id FROM offers WHERE id = $1 AND tailor_id = $2 AND CURRENT_DATE >= start_date AND CURRENT_DATE <= end_date',
                [resolvedOfferId, req.userId]
            );
            if (offerCheck.rows.length === 0) {
                resolvedOfferId = null;
                resolvedDiscount = 0;
                resolvedFinalAmount = parseFloat(total_amount);
            }
        }

        await pool.query(`
            UPDATE orders
            SET product_name = $1,
                total_amount = $2,
                advance_payment = $3,
                delivery_date = $4,
                notes = $5,
                offer_id = $6,
                discount_amount = $7,
                final_amount = $8,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $9
        `, [
            product_name,
            parseFloat(total_amount),
            parseFloat(advance_payment),
            delivery_date || null,
            notes || null,
            resolvedOfferId,
            resolvedDiscount,
            resolvedFinalAmount,
            orderId
        ]);
        res.json({ message: 'Order updated successfully' });
    } catch (err) {
        console.error('❌ Update order error:', err);
        res.status(500).json({ message: 'Failed to update order' });
    }
});

// ── PUT /api/orders/:id/status — Update order status and add history (Tailor only) ──
app.put('/api/orders/:id/status', verifyToken, requireRole('tailor'), async (req, res) => {
    const orderId = req.params.id;
    const { status, note, delivery_date } = req.body;
    console.log(`[Update Order] Request for orderId ${orderId} by tailor ${req.userId}. Body:`, req.body);

    try {
        // First, verify order belongs to tailor and fetch associated names and emails
        const verifyResult = await pool.query(`
            SELECT o.id, o.customer_id, o.product_name, u.email AS customer_email, u.full_name AS customer_name, t.full_name AS tailor_name
            FROM orders o
            JOIN users u ON o.customer_id = u.id
            JOIN users t ON o.tailor_id = t.id
            WHERE o.id = $1 AND o.tailor_id = $2
        `, [orderId, req.userId]);

        if (verifyResult.rows.length === 0) {
            console.log(`[Update Order] Order not found or unauthorized for orderId ${orderId}, tailor_id ${req.userId}`);
            return res.status(404).json({ message: 'Order not found or unauthorized' });
        }

        const orderInfo = verifyResult.rows[0];
        console.log('[Update Order] Order Info fetched:', orderInfo);

        // Treat empty delivery_date as null
        const finalDeliveryDate = delivery_date === '' ? null : delivery_date;
        let updateSql = 'UPDATE orders SET current_status = $1';
        let params = [status];
        let paramIdx = 2;
        if (finalDeliveryDate !== undefined) {
            updateSql += `, delivery_date = $${paramIdx++}`;
            params.push(finalDeliveryDate);
        }
        updateSql += `, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIdx}`;
        params.push(orderId);

        console.log('[Update Order] Executing UPDATE:', updateSql, params);
        await pool.query(updateSql, params);

        // Insert into history
        await pool.query(
            'INSERT INTO order_status_history (order_id, status, note) VALUES ($1, $2, $3)',
            [orderId, status, note || null]
        );

        // ── Insert in-app notification for the customer ──
        const notifType = status === 'Completed' ? 'order_completed'
                        : status === 'Delivered' ? 'order_delivered'
                        : 'order_update';
        const notifTitle = `Order "${orderInfo.product_name}" → ${status}`;
        const notifBody  = note ? `Note from tailor: ${note}` : `Your order status was updated by ${orderInfo.tailor_name}.`;

        const notifResult = await pool.query(
            'INSERT INTO notifications (user_id, type, title, body, action_url, action_label) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [orderInfo.customer_id, notifType, notifTitle, notifBody, '/customer/orders', 'View Orders']
        );
        if (notifResult.rows.length > 0) {
            io.to(`user_${orderInfo.customer_id}`).emit('new_notification', notifResult.rows[0]);
        }

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
    } catch (err) {
        console.error('[Update Order] error:', err);
        return res.status(500).json({ message: 'Failed to update order' });
    }
});

// ── PUT /api/orders/:id/payment — Update payment details (Tailor only) ──
app.put('/api/orders/:id/payment', verifyToken, requireRole('tailor'), async (req, res) => {
    const orderId = req.params.id;
    const { total_amount, advance_payment } = req.body;

    if (total_amount === undefined || advance_payment === undefined) {
        return res.status(400).json({ message: 'total_amount and advance_payment required' });
    }

    try {
        const result = await pool.query(
            'UPDATE orders SET total_amount = $1, advance_payment = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND tailor_id = $4',
            [total_amount, advance_payment, orderId, req.userId]
        );
        if (result.rowCount === 0) return res.status(404).json({ message: 'Order not found or unauthorized' });
        res.json({ message: 'Payment updated successfully' });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
});

// ═══════════════════════════════════════════════════════════════
// FEEDBACK ENDPOINTS
// ═══════════════════════════════════════════════════════════════

// ── POST /api/add-feedback ──
app.post('/api/add-feedback', verifyToken, async (req, res) => {
    const { orderId, customerId, tailorId, rating, message } = req.body;

    if (!orderId || !customerId || !tailorId || !rating) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        // Verify order status
        const orderRes = await pool.query('SELECT current_status FROM orders WHERE id = $1', [orderId]);
        if (orderRes.rows.length === 0) return res.status(404).json({ message: 'Order not found' });

        const status = orderRes.rows[0].current_status;
        if (status !== 'Delivered' && status !== 'Completed') {
            return res.status(400).json({ message: 'Feedback allowed only for Delivered or Completed orders' });
        }

        // Insert feedback
        try {
            await pool.query(
                'INSERT INTO feedbacks (order_id, customer_id, tailor_id, rating, message) VALUES ($1, $2, $3, $4, $5)',
                [orderId, customerId, tailorId, rating, message || '']
            );
        } catch (err2) {
            if (err2.code === '23505') {
                return res.status(400).json({ message: 'Feedback already submitted for this order' });
            }
            return res.status(500).json({ message: 'Error submitting feedback' });
        }

        // Recalculate tailor rating
        try {
            const ratingRes = await pool.query(
                'SELECT COUNT(*) as total_reviews, AVG(rating) as avg_rating FROM feedbacks WHERE tailor_id = $1',
                [tailorId]
            );
            if (ratingRes.rows.length > 0) {
                const { total_reviews, avg_rating } = ratingRes.rows[0];
                await pool.query(
                    'UPDATE users SET avg_rating = $1, total_reviews = $2 WHERE id = $3',
                    [avg_rating || 0, total_reviews || 0, tailorId]
                );
            }
        } catch (ratingErr) { /* non-critical */ }

        res.status(201).json({ message: 'Feedback submitted successfully' });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
});

// ── GET /api/tailor-feedback/:tailorId ──
app.get('/api/tailor-feedback/:tailorId', async (req, res) => {
    const { tailorId } = req.params;
    try {
        const result = await pool.query(`
            SELECT f.id as feedbackId, f.order_id, f.customer_id, f.tailor_id, f.rating, f.message, f.created_at,
                   u.full_name as customer_name,
                   o.product_name
            FROM feedbacks f
            JOIN users u ON f.customer_id = u.id
            JOIN orders o ON f.order_id = o.id
            WHERE f.tailor_id = $1
            ORDER BY f.created_at DESC
        `, [tailorId]);
        res.json({ feedbacks: result.rows });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
});

// ═══════════════════════════════════════════════════════════════
// CHAT ENDPOINTS
// ═══════════════════════════════════════════════════════════════

app.get('/api/chat/users', verifyToken, async (req, res) => {
    const isTailor = req.userRole === 'tailor';
    const orderJoinCond = isTailor ? 'o.tailor_id = $1 AND o.customer_id = u.id' : 'o.customer_id = $1 AND o.tailor_id = u.id';

    try {
        const result = await pool.query(`
            SELECT DISTINCT u.id, u.full_name, u.role,
                COALESCE(tp.profile_img, cp.profile_img) AS profile_img,
                (SELECT message FROM messages WHERE (sender_id = u.id AND receiver_id = $2) OR (sender_id = $3 AND receiver_id = u.id) ORDER BY created_at DESC LIMIT 1) as last_message,
                (SELECT created_at FROM messages WHERE (sender_id = u.id AND receiver_id = $4) OR (sender_id = $5 AND receiver_id = u.id) ORDER BY created_at DESC LIMIT 1) as last_message_time,
                (SELECT COUNT(*) FROM messages WHERE sender_id = u.id AND receiver_id = $6 AND is_read = FALSE) as unread_count
            FROM users u
            INNER JOIN orders o ON ${orderJoinCond}
            LEFT JOIN tailor_profiles tp ON tp.user_id = u.id AND u.role = 'tailor'
            LEFT JOIN customer_profiles cp ON cp.user_id = u.id AND u.role = 'customer'
            ORDER BY last_message_time DESC, u.full_name ASC
        `, [req.userId, req.userId, req.userId, req.userId, req.userId, req.userId]);
        const users = result.rows.map(u => ({ ...u, profile_img: normalizeImgPath(u.profile_img) }));
        res.json({ users });
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ── GET /api/chat/user/:userId — Look up a single user's info ──
app.get('/api/chat/user/:userId', verifyToken, async (req, res) => {
    const { userId } = req.params;
    const isTailor = req.userRole === 'tailor';
    const orderJoinCond = isTailor
        ? 'o.tailor_id = $1 AND o.customer_id = u.id'
        : 'o.customer_id = $1 AND o.tailor_id = u.id';

    try {
        const result = await pool.query(`
            SELECT DISTINCT u.id, u.full_name, u.role,
                COALESCE(tp.profile_img, cp.profile_img) AS profile_img
            FROM users u
            INNER JOIN orders o ON ${orderJoinCond}
            LEFT JOIN tailor_profiles tp ON tp.user_id = u.id AND u.role = 'tailor'
            LEFT JOIN customer_profiles cp ON cp.user_id = u.id AND u.role = 'customer'
            WHERE u.id = $2
            LIMIT 1
        `, [req.userId, userId]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'User not found or no order relationship' });
        const u = result.rows[0];
        res.json({ user: { ...u, profile_img: normalizeImgPath(u.profile_img), last_message: null } });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/chat/search-users', verifyToken, async (req, res) => {
    const { query } = req.query;
    if (!query) return res.json({ users: [] });

    const isTailor = req.userRole === 'tailor';
    const orderJoinCond = isTailor ? 'o.tailor_id = $1 AND o.customer_id = u.id' : 'o.customer_id = $1 AND o.tailor_id = u.id';

    try {
        const result = await pool.query(`
            SELECT DISTINCT u.id, u.full_name, u.email, u.role,
                COALESCE(tp.profile_img, cp.profile_img) AS profile_img
            FROM users u
            INNER JOIN orders o ON ${orderJoinCond}
            LEFT JOIN tailor_profiles tp ON tp.user_id = u.id AND u.role = 'tailor'
            LEFT JOIN customer_profiles cp ON cp.user_id = u.id AND u.role = 'customer'
            WHERE u.full_name ILIKE $2 OR u.email ILIKE $3
            LIMIT 10
        `, [req.userId, `%${query}%`, `%${query}%`]);
        const users = result.rows.map(u => ({ ...u, profile_img: normalizeImgPath(u.profile_img) }));
        res.json({ users });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/chat/:userId', verifyToken, async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await pool.query(`
            SELECT * FROM messages
            WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $3 AND receiver_id = $4)
            ORDER BY created_at ASC
        `, [req.userId, userId, userId, req.userId]);

        // Mark messages as read
        pool.query(
            'UPDATE messages SET is_read = TRUE WHERE receiver_id = $1 AND sender_id = $2 AND is_read = FALSE',
            [req.userId, userId]
        ).catch(updateErr => console.error('Failed to mark messages as read:', updateErr));

        res.json({ messages: result.rows });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
});

// ── POST /api/chat/upload — Upload a file attachment for chat ─────────────────
// MUST be defined BEFORE the wildcard POST /api/chat/:userId to avoid route collision
app.post('/api/chat/upload', verifyToken, chatUpload.single('file'), handleUploadError, (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const fileUrl = `/uploads/chat/${req.file.filename}`;
    const fileType = req.file.mimetype;
    const fileName = req.file.originalname;
    res.json({ fileUrl, fileType, fileName });
});

app.post('/api/chat/:userId', verifyToken, async (req, res) => {
    const { userId } = req.params;
    const { message } = req.body;
    if (!message || !message.trim()) return res.status(400).json({ message: 'Message is required' });

    try {
        const insertResult = await pool.query(
            'INSERT INTO messages (sender_id, receiver_id, message) VALUES ($1, $2, $3) RETURNING id',
            [req.userId, userId, message.trim()]
        );
        const msgResult = await pool.query('SELECT * FROM messages WHERE id = $1', [insertResult.rows[0].id]);
        if (msgResult.rows.length === 0) return res.status(500).json({ message: 'Server error' });
        res.status(201).json({ message: msgResult.rows[0] });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
});

// ── DELETE /api/chat/message/:id — Delete own message ──────────────────────
app.delete('/api/chat/message/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const msgRes = await pool.query('SELECT sender_id, receiver_id FROM messages WHERE id = $1', [id]);
        if (msgRes.rows.length === 0) return res.status(404).json({ message: 'Message not found' });
        if (msgRes.rows[0].sender_id !== req.userId) return res.status(403).json({ message: 'Not allowed' });
        const receiverId = msgRes.rows[0].receiver_id;
        await pool.query('DELETE FROM messages WHERE id = $1', [id]);
        // Real-time: notify both parties via Socket.IO
        io.to(`user_${req.userId}`).emit('message_deleted', { id: Number(id) });
        io.to(`user_${receiverId}`).emit('message_deleted', { id: Number(id) });
        res.json({ message: 'Message deleted' });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
});

// ── PUT /api/chat/message/:id — Edit own message ────────────────────────────
app.put('/api/chat/message/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { message } = req.body;
    if (!message || !message.trim()) return res.status(400).json({ message: 'Message is required' });
    try {
        const msgRes = await pool.query('SELECT sender_id, receiver_id FROM messages WHERE id = $1', [id]);
        if (msgRes.rows.length === 0) return res.status(404).json({ message: 'Message not found' });
        if (msgRes.rows[0].sender_id !== req.userId) return res.status(403).json({ message: 'Not allowed' });
        const receiverId = msgRes.rows[0].receiver_id;
        await pool.query('UPDATE messages SET message = $1, is_edited = TRUE WHERE id = $2', [message.trim(), id]);
        const updatedRes = await pool.query('SELECT * FROM messages WHERE id = $1', [id]);
        if (updatedRes.rows.length === 0) return res.status(500).json({ message: 'Server error' });
        const updated = updatedRes.rows[0];
        // Real-time: notify both parties
        io.to(`user_${req.userId}`).emit('message_updated', updated);
        io.to(`user_${receiverId}`).emit('message_updated', updated);
        res.json({ message: updated });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
});

// ═══════════════════════════════════════════════════════════════
// NOTIFICATIONS ENDPOINTS
// ═══════════════════════════════════════════════════════════════

app.get('/api/notifications', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
            [req.userId]
        );
        res.json({ notifications: result.rows });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/notifications/mark-all-read', verifyToken, async (req, res) => {
    try {
        await pool.query(
            'UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE',
            [req.userId]
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/notifications/:id/read', verifyToken, async (req, res) => {
    try {
        await pool.query(
            'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2',
            [req.params.id, req.userId]
        );
        res.json({ message: 'Notification marked as read' });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
});

// ═══════════════════════════════════════════════════════════════
// SOCKET.IO — REAL-TIME CHAT
// ═══════════════════════════════════════════════════════════════

// Track online users: userId → Set of socketIds
const onlineUsers = new Map();

io.use((socket, next) => {
    // Authenticate socket using JWT from cookie or handshake auth
    const token = socket.handshake.auth?.token ||
                  socket.handshake.headers?.cookie?.split(';')
                      .find(c => c.trim().startsWith('token='))?.split('=')[1];
    if (!token) return next(new Error('Not authenticated'));

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        if (err) return next(new Error('Invalid token'));
        try {
            const result = await pool.query('SELECT id, full_name, role FROM users WHERE id = $1', [decoded.id]);
            if (result.rows.length === 0) return next(new Error('User not found'));
            socket.userId   = result.rows[0].id;
            socket.userRole = result.rows[0].role;
            socket.userName = result.rows[0].full_name;
            next();
        } catch (dbErr) {
            return next(new Error('DB error'));
        }
    });
});

io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`🔌 Socket connected: user ${userId} (${socket.userName})`);

    // Join personal room so we can target this user precisely
    socket.join(`user_${userId}`);

    // Track online status
    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);
    io.emit('online_users', [...onlineUsers.keys()]);

    // ── Send a message in real-time + persist to PostgreSQL ──────────
    socket.on('send_message', async ({ receiverId, message, fileUrl, fileType, fileName }) => {
        const hasText  = message && message.trim();
        const hasFile  = fileUrl && fileType;
        if (!receiverId || (!hasText && !hasFile)) return;

        const text = hasText ? message.trim() : (fileName || 'Attachment');

        try {
            const insertResult = await pool.query(
                'INSERT INTO messages (sender_id, receiver_id, message, file_url, file_type, file_name) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
                [userId, receiverId, text, fileUrl || null, fileType || null, fileName || null]
            );

            const msgResult = await pool.query('SELECT * FROM messages WHERE id = $1', [insertResult.rows[0].id]);
            if (msgResult.rows.length === 0) return;
            const savedMsg = msgResult.rows[0];

            // Emit to sender (confirmation)
            socket.emit('receive_message', savedMsg);

            // Emit to receiver's room (real-time delivery)
            socket.to(`user_${receiverId}`).emit('receive_message', savedMsg);

            console.log(`💬 Message ${savedMsg.id}: user ${userId} → user ${receiverId}${hasFile ? ' [file: ' + fileName + ']' : ''}`);

            // ── Create in-app notification for the receiver ──────────────
            const notifTitle = `New message from ${socket.userName}`;
            const rawBody = hasFile
                ? (hasText ? text : `📎 ${fileName || 'File attachment'}`)
                : text;
            const notifBody = rawBody.length > 120 ? rawBody.slice(0, 117) + '...' : rawBody;

            try {
                const notifInsert = await pool.query(
                    'INSERT INTO notifications (user_id, type, title, body, action_url, action_label) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                    [receiverId, 'new_message', notifTitle, notifBody, '/chat', 'Open Chat']
                );
                if (notifInsert.rows.length > 0) {
                    io.to(`user_${receiverId}`).emit('new_notification', notifInsert.rows[0]);
                }
            } catch (notifErr) {
                console.warn('⚠️  Chat notification insert warning:', notifErr.message);
            }
        } catch (err) {
            console.error('❌ Message save error:', err.message);
            socket.emit('message_error', { error: 'Failed to save message' });
        }
    });

    // ── Typing indicators ────────────────────────────────────────
    socket.on('typing_start', ({ receiverId }) => {
        socket.to(`user_${receiverId}`).emit('typing_start', { senderId: userId });
    });
    socket.on('typing_stop', ({ receiverId }) => {
        socket.to(`user_${receiverId}`).emit('typing_stop', { senderId: userId });
    });

    // ── Disconnect ───────────────────────────────────────────────
    socket.on('disconnect', () => {
        const set = onlineUsers.get(userId);
        if (set) {
            set.delete(socket.id);
            if (set.size === 0) onlineUsers.delete(userId);
        }
        io.emit('online_users', [...onlineUsers.keys()]);
        console.log(`🔌 Socket disconnected: user ${userId}`);
    });
});

httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server is running on port ${PORT} (HTTP + Socket.IO)`);
});
