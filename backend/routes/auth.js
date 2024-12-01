const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db');

// Register route
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user with isAdmin defaulting to 0
    const stmt = db.prepare('INSERT INTO users (name, email, password, isAdmin) VALUES (?, ?, ?, 0)');
    const result = stmt.run(name, email, hashedPassword);

    res.status(201).json({ 
      message: 'User registered successfully',
      user: {
        id: result.lastInsertRowid,
        name,
        email,
        isAdmin: 0
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Add this login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Add console.log to debug
    console.log('User from database:', user);

    // Send user data (excluding password)
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login' });
  }
});

// Temporary route to set admin status (remove in production)
router.post('/set-admin', async (req, res) => {
  try {
    const { email } = req.body;
    const stmt = db.prepare('UPDATE users SET isAdmin = 1 WHERE email = ?');
    stmt.run(email);
    res.json({ message: 'Admin status updated' });
  } catch (error) {
    console.error('Error updating admin status:', error);
    res.status(500).json({ message: 'Error updating admin status' });
  }
});

module.exports = router; 