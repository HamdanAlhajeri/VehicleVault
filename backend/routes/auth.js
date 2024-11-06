const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../config/db');

router.post('/register', async (req, res) => {
  try {
    console.log('Received registration request:', req.body);

    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user exists
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const existingUsers = stmt.all(email);

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert user
    const insertStmt = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
    const result = insertStmt.run(name, email, hashedPassword);

    console.log('User registered successfully:', result);
    res.status(201).json({ message: 'Registration successful' });

  } catch (error) {
    console.error('Detailed registration error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    console.log('Received login request:', req.body);

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user exists
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(email);

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Simulate a user object to return
    const userData = { id: user.id, email: user.email, name: user.name };
    res.json({ user: userData });

  } catch (error) {
    console.error('Detailed login error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router; 