CREATE DATABASE IF NOT EXISTS tailorhub_db;

USE tailorhub_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('customer', 'tailor') NOT NULL DEFAULT 'customer',
  reset_token VARCHAR(255) DEFAULT NULL,
  reset_token_expiry DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Run this if the DB already exists (migration):
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS role ENUM('customer', 'tailor') NOT NULL DEFAULT 'customer';

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(255)
);

ALTER TABLE users 
  ADD COLUMN full_name VARCHAR(255) NOT NULL DEFAULT '' AFTER id,
  ADD COLUMN reset_token VARCHAR(255) DEFAULT NULL,
  ADD COLUMN reset_token_expiry DATETIME DEFAULT NULL;

