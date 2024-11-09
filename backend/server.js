const express = require('express');
const cors = require('cors');
const db = require('./config/db');  // Use the existing db connection
const authRoutes = require('./routes/auth');

const app = express();

// Create cars table if it doesn't exist
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
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api', authRoutes);

// Add new car
app.post('/api/cars', (req, res) => {
  try {
    const { make, model, year, price, description, userId, image, imageType } = req.body;
    
    const stmt = db.prepare(`
      INSERT INTO cars (make, model, year, price, description, image, imageType, userId) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(make, model, year, price, description, image, imageType, userId);
    
    res.status(201).json({
      message: 'Car added successfully',
      carId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all cars
app.get('/api/cars', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM cars ORDER BY createdAt DESC');
    const cars = stmt.all();
    res.json(cars);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single car image
app.get('/api/cars/:id/image', (req, res) => {
  try {
    const stmt = db.prepare('SELECT image, imageType FROM cars WHERE id = ?');
    const row = stmt.get(req.params.id);
    
    if (!row || !row.image) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    res.setHeader('Content-Type', row.imageType);
    res.send(Buffer.from(row.image, 'base64'));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});