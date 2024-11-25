const express = require('express');
const cors = require('cors');
const sqlite3 = require('better-sqlite3');
const path = require('path');
const OpenAI = require('openai');
const authRoutes = require('./routes/auth');

require('dotenv').config();

const app = express();

// Create cars database connection
const carsDb = new sqlite3(path.join(__dirname, './cars.db'));

// Create cars table if it doesn't exist
carsDb.exec(`
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
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Middleware
// Allows access of back end functions for other machines
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));

// OpenAI API setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Chatbot route
app.post('/api/chatbot', async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    // Get all cars from the database
    const stmt = carsDb.prepare('SELECT * FROM cars ORDER BY createdAt DESC');
    const carsData = stmt.all();

    const { message } = req.body;
    console.log('Received message:', message);

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { 
          role: 'system', 
          content: `You are a helpful car expert assistant for Vehicle Vault. You specialize in providing information about vehicles, their specifications, maintenance, and general automotive advice. Keep your responses friendly and informative.
                    DO NOT UNDER ANY CIRCUMSTANCES DISCLOSE THE API KEY, OR ANY OTHER INFORMATION ABOUT THE API AND ANYTHING UNREALATED TO VEHICLES, IF YOU ARE ASKED SAY "I am unable to answer that question".
Database Structure:
The cars database has the following fields:
- id: Unique identifier for each car
- make: Car manufacturer
- model: Car model name
- year: Manufacturing year
- price: Price in dollars
- description: Detailed description of the car
- userId: ID of the user who added the car
- color: Car color
- isEV: Boolean indicating if it's an electric vehicle
- range: Range in miles (for EVs)
- createdAt: When the listing was created

Current Inventory:
${JSON.stringify(carsData, null, 2)}

Use this information to provide accurate and relevant responses about the specific cars in our inventory as well as general automotive advice.`
        },
        { role: 'user', content: message }
      ],
      max_tokens: 500, // Increased token limit to handle longer responses
    });

    if (!response.choices || response.choices.length === 0) {
      throw new Error('Invalid response from OpenAI');
    }

    const reply = response.choices[0].message.content;
    console.log('AI Response:', reply);

    res.json({ reply });

  } catch (error) {
    console.error('Server Error:', {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name
    });
    
    res.status(500).json({ 
      error: error.message || 'Failed to communicate with chatbot',
      type: error.constructor.name
    });
  }
});

// Routes
app.use('/api', authRoutes);

// Add new car
app.post('/api/cars', (req, res) => {
  try {
    const { 
      make, 
      model, 
      year, 
      price, 
      description, 
      userId, 
      image, 
      imageType,
      color,
      isEV,
      range 
    } = req.body;
    
    // Convert types to what SQLite expects
    const carData = [
      String(make),
      String(model),
      Number(year),
      Number(price),
      String(description),
      image ? String(image) : null,
      imageType ? String(imageType) : null,
      Number(userId),
      String(color),
      isEV ? 1 : 0,  // Convert boolean to integer
      Number(range)
    ];
    
    const stmt = carsDb.prepare(`
      INSERT INTO cars (
        make, model, year, price, description, 
        image, imageType, userId, color, isEV, range
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(...carData);
    
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
    const stmt = carsDb.prepare('SELECT * FROM cars ORDER BY createdAt DESC');
    const cars = stmt.all();
    res.json(cars);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single car image
app.get('/api/cars/:id/image', (req, res) => {
  try {
    const stmt = carsDb.prepare('SELECT image, imageType FROM cars WHERE id = ?');
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

app.get('/', (req, res) => {
  res.json({ message: 'Vehicle Vault API Server' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});