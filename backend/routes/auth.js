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
    const [existingUsers] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert user
    const [result] = await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    console.log('User registered successfully:', result);
    res.status(201).json({ message: 'Registration successful' });

  } catch (error) {
    console.error('Detailed registration error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router; 