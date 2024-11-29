const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const path = require('path');
const authRoutes = require('./routes/auth');
const db = require('./config/db');

require('dotenv').config();

const app = express();

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
    const stmt = db.prepare('SELECT * FROM cars ORDER BY createdAt DESC');
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
    
    const stmt = db.prepare(`
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
    const stmt = db.prepare('SELECT * FROM cars ORDER BY createdAt DESC');
    const cars = stmt.all();
    res.json(cars);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single car by ID
app.get('/api/cars/:id', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM cars WHERE id = ?');
    const car = stmt.get(req.params.id);
    
    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }
    
    res.json(car);
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

// Add test drive scheduling endpoint
app.post('/api/schedule-test-drive', (req, res) => {
  try {
    const { carId, date, time } = req.body;
    
    // Get car details and owner
    const car = db.prepare('SELECT userId, make, model, year FROM cars WHERE id = ?').get(carId);
    
    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    // Create notification message
    const message = `New test drive request for your ${car.year} ${car.make} ${car.model} on ${date} at ${time}`;
    
    // Insert notification
    const result = db.prepare(`
      INSERT INTO notifications (userId, message, carId)
      VALUES (?, ?, ?)
    `).run(car.userId, message, carId);
    
    res.status(201).json({
      message: 'Test drive scheduled successfully',
      notificationId: result.lastInsertRowid
    });
    
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add endpoint to get user's notifications
app.get('/api/notifications/:userId', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC');
    const notifications = stmt.all(req.params.userId);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Vehicle Vault API Server' });
});

// Add messages table creation to db.js first
app.post('/api/messages', async (req, res) => {
  try {
    const { senderId, receiverId, subject, content } = req.body;
    const stmt = db.prepare(`
      INSERT INTO messages (senderId, receiverId, subject, content)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(senderId, receiverId, subject, content);
    res.status(201).json({ 
      message: 'Message sent successfully',
      messageId: result.lastInsertRowid 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/messages/:userId', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT 
        m.*,
        sender.name as senderName,
        receiver.name as receiverName
      FROM messages m
      JOIN users sender ON m.senderId = sender.id
      JOIN users receiver ON m.receiverId = receiver.id
      WHERE m.receiverId = ? OR m.senderId = ?
      ORDER BY m.createdAt DESC
    `);
    const messages = stmt.all(req.params.userId, req.params.userId);
    
    // Group messages by conversation
    const conversations = messages.reduce((acc, message) => {
      const otherUserId = message.senderId === Number(req.params.userId) 
        ? message.receiverId 
        : message.senderId;
      
      if (!acc[otherUserId]) {
        acc[otherUserId] = {
          otherUserId,
          otherUserName: message.senderId === Number(req.params.userId) 
            ? message.receiverName 
            : message.senderName,
          messages: []
        };
      }
      acc[otherUserId].messages.push(message);
      return acc;
    }, {});

    res.json(Object.values(conversations));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users
app.get('/api/users', (req, res) => {
  try {
    const stmt = db.prepare('SELECT id, name, email FROM users');
    const users = stmt.all();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add after line 277
app.put('/api/messages/:messageId/read', (req, res) => {
  try {
    const stmt = db.prepare(`
      UPDATE messages 
      SET unread = 0 
      WHERE id = ?
    `);
    stmt.run(req.params.messageId);
    res.json({ message: 'Message marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});