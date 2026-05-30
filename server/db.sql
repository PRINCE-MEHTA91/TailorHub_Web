-- ═══════════════════════════════════════════════════════════════
-- TailorHub PostgreSQL Schema (Neon-compatible)
-- Converted from MySQL — run this in your Neon SQL editor or
-- via psql to initialise a fresh database.
-- ═══════════════════════════════════════════════════════════════

-- ── users ────────────────────────────────────────────────────
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
);

-- ── products ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    price       DECIMAL(10,2) NOT NULL,
    image_url   VARCHAR(255)
);

-- ── tailor_profiles ──────────────────────────────────────────
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
);

-- ── customer_profiles ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customer_profiles (
    id          SERIAL PRIMARY KEY,
    user_id     INT         NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    phone       VARCHAR(20) DEFAULT '',
    whatsapp    VARCHAR(20) DEFAULT '',
    street      VARCHAR(255) DEFAULT '',
    city        VARCHAR(100) DEFAULT '',
    state       VARCHAR(100) DEFAULT '',
    pin         VARCHAR(10)  DEFAULT '',
    profile_img TEXT         DEFAULT NULL,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ── offers ────────────────────────────────────────────────────
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
);

-- ── orders ────────────────────────────────────────────────────
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
);

-- ── order_status_history ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_status_history (
    id         SERIAL PRIMARY KEY,
    order_id   INT          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status     VARCHAR(100) NOT NULL,
    note       TEXT         DEFAULT NULL,
    updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ── messages ──────────────────────────────────────────────────
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
);

-- ── notifications ─────────────────────────────────────────────
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
);

-- ── feedbacks ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feedbacks (
    id          SERIAL PRIMARY KEY,
    order_id    INT  NOT NULL UNIQUE,
    customer_id INT  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tailor_id   INT  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating      INT  NOT NULL CHECK (rating >= 1 AND rating <= 5),
    message     TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
