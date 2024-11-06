const sqlite3 = require('better-sqlite3');
const path = require('path');

// Create database in the backend directory
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

module.exports = db; 