const sqlite3 = require('better-sqlite3');
const path = require('path');

// Create single database instance
const db = new sqlite3(path.join(__dirname, '../database.sqlite'));

// Create users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create cars table
db.exec(`
  CREATE TABLE IF NOT EXISTS cars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    image BLOB,
    imageType TEXT,
    userId INTEGER,
    color TEXT,
    isEV BOOLEAN DEFAULT 0,
    range INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
  )
`);

// Create notifications table
db.exec(`
  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    message TEXT NOT NULL,
    carId INTEGER NOT NULL,
    isRead BOOLEAN DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (carId) REFERENCES cars(id)
  )
`);

// Add this after the other table creations
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    senderId INTEGER NOT NULL,
    receiverId INTEGER NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    unread BOOLEAN DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (senderId) REFERENCES users(id),
    FOREIGN KEY (receiverId) REFERENCES users(id)
  )
`);

module.exports = db; 