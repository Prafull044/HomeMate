CREATE DATABASE IF NOT EXISTS HomeMate CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE HomeMate;

CREATE TABLE IF NOT EXISTS ID_Sequences (
    entity_name VARCHAR(60) PRIMARY KEY,
    next_number INT NOT NULL DEFAULT 101
);

INSERT INTO ID_Sequences (entity_name, next_number)
VALUES
    ('Users', 101),
    ('User_Profile', 101),
    ('User_Preferences', 101),
    ('New_User', 101),
    ('Existing_User', 101),
    ('Owner', 101),
    ('Rooms', 101),
    ('Location', 101),
    ('Room_Facilities', 101),
    ('Room_Requirements', 101),
    ('Room_Request', 101),
    ('Roommate_Request', 101),
    ('Review', 101)
ON DUPLICATE KEY UPDATE entity_name = entity_name;

CREATE TABLE IF NOT EXISTS Users (
    user_id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL UNIQUE,
    password_hash CHAR(128) NOT NULL,
    age INT NULL,
    gender VARCHAR(40) NULL,
    mob_num VARCHAR(30) NULL,
    role ENUM('new', 'existing', 'owner') NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS User_Profile (
    profile_id VARCHAR(20) PRIMARY KEY,
    user_id VARCHAR(20) NOT NULL UNIQUE,
    occupation VARCHAR(120),
    education VARCHAR(160),
    bio VARCHAR(600),
    profile_image VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS User_Preferences (
    preference_id VARCHAR(20) PRIMARY KEY,
    user_id VARCHAR(20) NOT NULL UNIQUE,
    preferred_location VARCHAR(120),
    min_budget DECIMAL(10,2),
    max_budget DECIMAL(10,2),
    preferred_room_type VARCHAR(60),
    lifestyle VARCHAR(160),
    food_preference VARCHAR(80),
    caste VARCHAR(80),
    religion VARCHAR(80),
    smoking VARCHAR(30),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS New_User (
    new_user_id VARCHAR(20) PRIMARY KEY,
    user_id VARCHAR(20) NOT NULL UNIQUE,
    looking_for VARCHAR(80) DEFAULT 'Room',
    move_in_date DATE NULL,
    status VARCHAR(30) DEFAULT 'Active',
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Existing_User (
    existing_user_id VARCHAR(20) PRIMARY KEY,
    user_id VARCHAR(20) NOT NULL UNIQUE,
    current_room_id VARCHAR(20) NULL,
    roommate_required BOOLEAN DEFAULT TRUE,
    available_from DATE NULL,
    current_rent_share DECIMAL(10,2) NULL,
    status VARCHAR(30) DEFAULT 'Active',
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Owner (
    owner_id VARCHAR(20) PRIMARY KEY,
    user_id VARCHAR(20) NOT NULL UNIQUE,
    owner_type VARCHAR(80) DEFAULT 'Individual',
    verification_status VARCHAR(30) DEFAULT 'Pending',
    ownership_document VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Rooms (
    room_id VARCHAR(20) PRIMARY KEY,
    owner_id VARCHAR(20) NOT NULL,
    room_title VARCHAR(160) NOT NULL,
    room_type VARCHAR(60) NOT NULL,
    rent DECIMAL(10,2) NOT NULL,
    deposit DECIMAL(10,2),
    available_from DATE NULL,
    availability_status VARCHAR(30) DEFAULT 'Available',
    description VARCHAR(800),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES Owner(owner_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Location (
    location_id VARCHAR(20) PRIMARY KEY,
    room_id VARCHAR(20) NOT NULL UNIQUE,
    address VARCHAR(255),
    area VARCHAR(120),
    city VARCHAR(120) NOT NULL,
    state VARCHAR(100),
    pincode VARCHAR(15),
    FOREIGN KEY (room_id) REFERENCES Rooms(room_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Room_Facilities (
    facility_id VARCHAR(20) PRIMARY KEY,
    room_id VARCHAR(20) NOT NULL UNIQUE,
    wifi BOOLEAN DEFAULT FALSE,
    parking BOOLEAN DEFAULT FALSE,
    furnished BOOLEAN DEFAULT FALSE,
    kitchen BOOLEAN DEFAULT FALSE,
    attached_bathroom BOOLEAN DEFAULT FALSE,
    electricity BOOLEAN DEFAULT FALSE,
    water_supply BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (room_id) REFERENCES Rooms(room_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Room_Requirements (
    requirement_id VARCHAR(20) PRIMARY KEY,
    room_id VARCHAR(20) NOT NULL UNIQUE,
    preferred_gender VARCHAR(40),
    min_age INT,
    max_age INT,
    preferred_occupation VARCHAR(80),
    preferred_caste VARCHAR(80),
    preferred_religion VARCHAR(80),
    smoking_preference VARCHAR(30),
    food_preference VARCHAR(80),
    pets_allowed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (room_id) REFERENCES Rooms(room_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Room_Request (
    room_request_id VARCHAR(20) PRIMARY KEY,
    room_id VARCHAR(20) NOT NULL,
    requester_id VARCHAR(20) NOT NULL,
    owner_id VARCHAR(20) NOT NULL,
    message VARCHAR(500),
    request_status VARCHAR(30) DEFAULT 'Pending',
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (request_status IN ('Pending', 'Accepted', 'Rejected')),
    FOREIGN KEY (room_id) REFERENCES Rooms(room_id) ON DELETE CASCADE,
    FOREIGN KEY (requester_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Roommate_Request (
    roommate_request_id VARCHAR(20) PRIMARY KEY,
    sender_id VARCHAR(20) NOT NULL,
    receiver_id VARCHAR(20) NOT NULL,
    message VARCHAR(500),
    request_status VARCHAR(30) DEFAULT 'Pending',
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (request_status IN ('Pending', 'Accepted', 'Rejected')),
    FOREIGN KEY (sender_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Review (
    review_id VARCHAR(20) PRIMARY KEY,
    reviewer_id VARCHAR(20) NOT NULL,
    owner_id VARCHAR(20) NOT NULL,
    room_id VARCHAR(20) NOT NULL,
    rating TINYINT NOT NULL,
    review_text VARCHAR(500),
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reviewer_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES Rooms(room_id) ON DELETE CASCADE
);
