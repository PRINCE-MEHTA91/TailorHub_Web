CREATE DATABASE tailorhub_db;
USE tailorhub_db;
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50),
    image_url VARCHAR(255)
);
INSERT INTO products (product_name, price, category, image_url)
VALUES 
('YAHWEH YIRIH T-Shirt', 19.99, 'Clothing', 'tshirt.jpg'),
('Oxford Leather Shoes', 49.99, 'Footwear', 'shoes.jpg');

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

SELECT * FROM products;