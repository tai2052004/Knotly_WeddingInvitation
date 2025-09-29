create database Knotly

use Knotly

CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) ,
    email VARCHAR(100) NOT NULL UNIQUE,
    role INT NOT NULL CHECK (role BETWEEN 1 AND 3)
);
INSERT INTO Users (username, password, email, role)
VALUES ('aQ', '12345', 'aQ@example.com', 1);
INSERT INTO Users (username, password, email, role)
VALUES ('admin', 'admin123', 'admin@example.com', 2);

SELECT * FROM Users;
ALTER TABLE Users
ALTER COLUMN password VARCHAR(255) NULL;