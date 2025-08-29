-- SQL Server script to create the tables for the Defect Management System

-- Users Table: Stores user account information for authentication and logging.
CREATE TABLE Users (
    id INT PRIMARY KEY IDENTITY(1,1),
    username NVARCHAR(50) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    last_login DATETIME NULL
);

-- Companies Table: Manages information about client companies to prevent data duplication.
CREATE TABLE Companies (
    id INT PRIMARY KEY IDENTITY(1,1),
    company_name NVARCHAR(100) NOT NULL UNIQUE
);

-- Products Table: Stores information about products to enable precise defect tracking.
CREATE TABLE Products (
    id INT PRIMARY KEY IDENTITY(1,1),
    product_name NVARCHAR(255) NOT NULL,
    product_code NVARCHAR(100) NOT NULL UNIQUE
);

-- Inspections Table: The core table that records all defect incidents and their resolution status.
-- NOTE: This schema has been updated to match the application code.
CREATE TABLE Inspections (
    id INT PRIMARY KEY IDENTITY(1,1),
    company_id INT FOREIGN KEY REFERENCES Companies(id),
    product_id INT FOREIGN KEY REFERENCES Products(id),
    user_id INT FOREIGN KEY REFERENCES Users(id),
    inspected_quantity INT NOT NULL,
    defective_quantity INT NOT NULL,
    actioned_quantity INT NULL,
    defect_reason NVARCHAR(MAX) NULL,
    solution NVARCHAR(MAX) NULL,
    received_date DATE NOT NULL DEFAULT GETDATE(),
    target_date DATE NULL,
    progress_percentage TINYINT NOT NULL DEFAULT 0,
    CONSTRAINT CHK_progress_percentage CHECK (progress_percentage >= 0 AND progress_percentage <= 100)
);


-- FileAttachments Table: Manages file attachments related to inspections.
CREATE TABLE FileAttachments (
    id INT PRIMARY KEY IDENTITY(1,1),
    inspection_id INT NOT NULL FOREIGN KEY REFERENCES Inspections(id),
    file_path NVARCHAR(255) NOT NULL,
    file_type NVARCHAR(50) NOT NULL, -- e.g., 'image', 'document'
    uploaded_at DATETIME NOT NULL DEFAULT GETDATE()
);

-- Initial Data Insertion (Example)
-- Insert a default user with a hashed password.
-- The password for 'admin' is 'admin123'.
-- You can generate a new hash using the provided `hash_password.py` script.
INSERT INTO Users (username, password_hash)
VALUES ('admin', 'pbkdf2:sha256:600000$cW9C9dD8eF7bA6a5$8b1e3a5e8d9f6b4c3e2a1b0d9e8f7a6c5d4b3a2a1b0d9e8f7a6c5d4b3a2a1b0d');

-- Insert sample companies
INSERT INTO Companies (company_name) VALUES ('Company A'), ('Company B');

-- Insert sample products
INSERT INTO Products (product_name, product_code) VALUES ('Product X', 'PX-001'), ('Product Y', 'PY-002');

-- Insert a sample inspection record
INSERT INTO Inspections (company_id, product_id, user_id, inspected_quantity, defective_quantity, defect_reason, target_date, progress_percentage)
VALUES (1, 1, 1, 1000, 50, 'Scratch on surface', '2024-09-30', 50);