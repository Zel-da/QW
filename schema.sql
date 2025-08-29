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
CREATE TABLE Inspections (
    id INT PRIMARY KEY IDENTITY(1,1),
    company_id INT FOREIGN KEY REFERENCES Companies(id),
    product_id INT FOREIGN KEY REFERENCES Products(id),
    user_id INT FOREIGN KEY REFERENCES Users(id),
    product_count INT NOT NULL,
    defect_reason NVARCHAR(MAX) NULL,
    solution NVARCHAR(MAX) NULL,
    received_date DATE NOT NULL DEFAULT GETDATE(),
    target_date DATE NULL,
    is_completed BIT NOT NULL DEFAULT 0,
    progress_percentage TINYINT NOT NULL DEFAULT 0,
    CONSTRAINT CHK_progress_percentage CHECK (progress_percentage >= 0 AND progress_percentage <= 100)
);
