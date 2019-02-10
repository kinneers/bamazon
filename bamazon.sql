DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products (
    item_id INT NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(50),
    department_name VARCHAR(50),
    price DECIMAL(20, 2) NOT NULL,
    stock_quantity INT(10) NOT NULL,
    product_sales DECIMAL(60, 2),
    PRIMARY KEY (item_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Tiger Woods' Golf Clubs", "Sports", 5000000, 2), ("Flock of Seagulls Signed Hair Dryer", "Personal Care", 5000000, 20), ("James Dean's Leather Jacket", "Clothing", 5400000000, 5), ("Tom Brady's Diamond and Platinum Superbowl Ring", "Jewelry", 1700000000, 3), ("Elton John's Diamond-Studded Jeans", "Clothing", 67000000, 4), ("Antique Pendant Worn by Queen Victoria", "Jewelry", 7000000000, 1), ("Elvis' Blue Suede Shoes", "Accessories", 40000000, 2), ("Grizzly Adams' Aftershave", "Personal Care", 35000000, 3), ("J.K. Rowling's Glasses", "Accessories", 9.75, 40), ("Michael Phelps' Goggles", "Sports", 3234.53, 10);

CREATE TABLE departments (
    department_id INT NOT NULL AUTO_INCREMENT,
    department_name VARCHAR(50) NOT NULL,
    over_head_costs DECIMAL(20, 2) NOT NULL,
    PRIMARY KEY (department_id)
);