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

// Add this near the top of the file with other constants
const EV_INCENTIVES = [
  "2 Years Extra Insurance Coverage",
  "Free Home Charging Station Installation",
  "1 Year Free Public Charging Access",
  "Extended Battery Warranty (5 Years)",
  "Zero Registration Fees",
  "Priority Service Appointments",
  "Free Annual Maintenance (3 Years)",
  "Complimentary Winter Tire Package",
  "Government Tax Credit Assistance",
  "Free Software Updates for Life",
  "24/7 Roadside Assistance (3 Years)",
  "Exclusive EV Owner Events Access"
];

// Helper function to get random incentives
function getRandomIncentives(count = 3) {
  const shuffled = [...EV_INCENTIVES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Chatbot route
app.post('/api/chatbot', async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    // Get all cars from the database
    const stmt = db.prepare('SELECT * FROM cars ORDER BY createdAt DESC');
    const carsData = stmt.all();

    // Create a simplified version of the cars data with only essential fields
    const simplifiedCarsData = carsData.map(car => ({
      make: car.make,
      model: car.model,
      year: car.year,
      price: car.price,
      isEV: car.isEV,
      range: car.range
    }));

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
                    
Current Inventory Summary:
${JSON.stringify(simplifiedCarsData, null, 2)}

Use this information to provide accurate and relevant responses about the specific cars in our inventory as well as general automotive advice.`
        },
        { role: 'user', content: message }
      ],
      max_tokens: 500,
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
    const cars = stmt.all().map(car => {
      if (car.isEV) {
        car.evIncentives = getRandomIncentives();
      }
      return car;
    });
    res.json(cars);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single car by ID
app.get('/api/cars/:id', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT cars.*, users.name as sellerName 
      FROM cars 
      LEFT JOIN users ON cars.userId = users.id 
      WHERE cars.id = ?
    `);
    const car = stmt.get(req.params.id);
    
    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }
    
    // Add incentives if the car is an EV
    if (car.isEV) {
      car.evIncentives = getRandomIncentives();
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

// Update the test drive scheduling endpoint to include requesterId
app.post('/api/schedule-test-drive', (req, res) => {
  try {
    const { carId, date, time, userId } = req.body;
    
    const car = db.prepare('SELECT userId, make, model, year FROM cars WHERE id = ?').get(carId);
    
    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    const requester = db.prepare('SELECT name FROM users WHERE id = ?').get(userId);
    
    if (!requester) {
      return res.status(404).json({ error: 'User not found' });
    }

    const notificationType = db.prepare('SELECT id FROM notification_types WHERE type = ?').get('test_drive');

    const message = `${requester.name} requested a test drive for your ${car.year} ${car.make} ${car.model} on ${date} at ${time}`;
    
    // Updated insert to include requesterId and status
    const result = db.prepare(`
      INSERT INTO notifications (userId, message, typeId, relatedId, requesterId, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `).run(car.userId, message, notificationType.id, carId, userId);
    
    res.status(201).json({
      message: 'Test drive scheduled successfully',
      notificationId: result.lastInsertRowid
    });
    
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update the get notifications endpoint to include more details
app.get('/api/notifications/:userId', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT 
        n.*,
        nt.type as notificationType,
        u.name as requesterName
      FROM notifications n
      JOIN notification_types nt ON n.typeId = nt.id
      LEFT JOIN users u ON n.requesterId = u.id
      WHERE n.userId = ? 
      ORDER BY n.createdAt DESC
    `);
    const notifications = stmt.all(req.params.userId);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new endpoint to handle accept/decline actions
app.put('/api/notifications/:id/respond', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, responderId } = req.body; // status should be 'accepted' or 'declined'
    
    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Get the notification
    const notification = db.prepare(`
      SELECT n.*, nt.type as notificationType 
      FROM notifications n
      JOIN notification_types nt ON n.typeId = nt.id
      WHERE n.id = ?
    `).get(id);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Verify the responder is the notification recipient
    if (notification.userId !== responderId) {
      return res.status(403).json({ error: 'Unauthorized to respond to this notification' });
    }

    // Update notification status
    db.prepare(`
      UPDATE notifications 
      SET status = ?, isRead = 1 
      WHERE id = ?
    `).run(status, id);

    // Create a response notification for the requester
    const requester = db.prepare('SELECT name FROM users WHERE id = ?').get(notification.requesterId);
    const responder = db.prepare('SELECT name FROM users WHERE id = ?').get(responderId);

    const responseMessage = `${responder.name} has ${status} your test drive request.`;
    
    const notificationType = db.prepare('SELECT id FROM notification_types WHERE type = ?').get('test_drive');

    // Create notification for the original requester
    db.prepare(`
      INSERT INTO notifications (userId, message, typeId, relatedId, status)
      VALUES (?, ?, ?, ?, 'read')
    `).run(notification.requesterId, responseMessage, notificationType.id, notification.relatedId);

    res.json({ 
      message: 'Response recorded successfully',
      status: status
    });

  } catch (error) {
    console.error('Error responding to notification:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add endpoint to get user's notifications
app.get('/api/notifications/:userId', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT * FROM notifications 
      WHERE userId = ? 
      ORDER BY createdAt DESC
    `);
    const notifications = stmt.all(req.params.userId);
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.json([]);
  }
});

// Mark notification as read
app.put('/api/notifications/:id/read', (req, res) => {
  try {
    const stmt = db.prepare(`
      UPDATE notifications 
      SET isRead = 1 
      WHERE id = ?
    `);
    stmt.run(req.params.id);
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create notification for new message
app.post('/api/messages', async (req, res) => {
  try {
    const { senderId, receiverId, subject, content } = req.body;
    
    // First, insert the message
    const messageStmt = db.prepare(`
      INSERT INTO messages (senderId, receiverId, subject, content)
      VALUES (?, ?, ?, ?)
    `);
    const messageResult = messageStmt.run(senderId, receiverId, subject, content);

    // Then, create a notification for the receiver
    const senderStmt = db.prepare('SELECT name FROM users WHERE id = ?');
    const sender = senderStmt.get(senderId);

    const notificationStmt = db.prepare(`
      INSERT INTO notifications (userId, message, type, relatedId)
      VALUES (?, ?, ?, ?)
    `);
    notificationStmt.run(
      receiverId,
      `New message from ${sender.name}: ${subject}`,
      'message',
      messageResult.lastInsertRowid
    );

    res.status(201).json({ 
      message: 'Message sent successfully',
      messageId: messageResult.lastInsertRowid 
    });
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
    const users = db.prepare(`
      SELECT id, name, email, isAdmin 
      FROM users
    `).all();
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

// Add this temporary test endpoint to create a test notification
app.post('/api/test-notification', (req, res) => {
  try {
    const { userId } = req.body;
    
    const stmt = db.prepare(`
      INSERT INTO notifications (userId, message, type, relatedId)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      userId,
      'This is a test notification',
      'test',
      1
    );
    
    res.status(201).json({
      message: 'Test notification created',
      notificationId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Error creating test notification:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add this endpoint to check notifications for a user
app.get('/api/check-notifications/:userId', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM notifications WHERE userId = ?');
    const notifications = stmt.all(req.params.userId);
    res.json({
      count: notifications.length,
      notifications: notifications
    });
  } catch (error) {
    console.error('Error checking notifications:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { isAdmin } = req.body;
    
    console.log('Updating user:', id, 'isAdmin:', isAdmin); // Debug log

    // First check if user exists
    const userExists = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user's admin status
    const updateStmt = db.prepare(`
      UPDATE users 
      SET isAdmin = ? 
      WHERE id = ?
    `);
    
    const result = updateStmt.run(isAdmin ? 1 : 0, id);

    if (result.changes > 0) {
      // Fetch and return the updated user
      const updatedUser = db.prepare(`
        SELECT id, name, email, isAdmin 
        FROM users 
        WHERE id = ?
      `).get(id);
      
      console.log('Updated user:', updatedUser); // Debug log
      res.json(updatedUser);
    } else {
      res.status(500).json({ message: 'Failed to update user' });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      message: 'Error updating user', 
      error: error.message 
    });
  }
});

app.get('/api/cars/user/:userId', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM cars WHERE userId = ? ORDER BY createdAt DESC');
    const cars = stmt.all(req.params.userId);
    res.json(cars);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete car route
app.delete('/api/cars/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // First, check if the car exists
    const car = db.prepare('SELECT * FROM cars WHERE id = ?').get(id);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Delete the car from the database
    const stmt = db.prepare('DELETE FROM cars WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes > 0) {
      res.json({ message: 'Car deleted successfully' });
    } else {
      res.status(500).json({ message: 'Failed to delete car' });
    }
  } catch (error) {
    console.error('Error deleting car:', error);
    res.status(500).json({ message: 'Error deleting car', error: error.message });
  }
});

// Update car route
app.put('/api/cars/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Check if car exists
    const car = db.prepare('SELECT * FROM cars WHERE id = ?').get(id);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Update car details
    const stmt = db.prepare(`
      UPDATE cars 
      SET make = ?, model = ?, year = ?, price = ?, 
          color = ?, description = ?, isEV = ?, range = ?
      WHERE id = ?
    `);

    stmt.run(
      updates.make,
      updates.model,
      updates.year,
      updates.price,
      updates.color,
      updates.description,
      updates.isEV ? 1 : 0,
      updates.range,
      id
    );

    // Fetch and return updated car
    const updatedCar = db.prepare('SELECT * FROM cars WHERE id = ?').get(id);
    res.json(updatedCar);
  } catch (error) {
    console.error('Error updating car:', error);
    res.status(500).json({ message: 'Error updating car', error: error.message });
  }
});

// Update the get sold cars count endpoint
app.get('/api/users/:userId/sold-cars-count', (req, res) => {
  try {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM cars WHERE userId = ? AND isSold = 1');
    const result = stmt.get(req.params.userId);
    res.json({ count: result.count });
  } catch (error) {
    console.error('Error fetching sold cars count:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update the cars/:id/sold endpoint to increment cars_sold counter
app.put('/api/cars/:id/sold', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, isSold } = req.body;
    
    // Start a transaction since we're updating multiple tables
    db.prepare('BEGIN TRANSACTION').run();

    // Update the car's sold status
    const updateCarStmt = db.prepare('UPDATE cars SET isSold = ? WHERE id = ? AND userId = ?');
    const carResult = updateCarStmt.run(isSold ? 1 : 0, id, userId);

    if (carResult.changes === 0) {
      db.prepare('ROLLBACK').run();
      throw new Error('Car not found or unauthorized');
    }

    // Update the user's cars_sold count
    const updateUserStmt = db.prepare('UPDATE users SET cars_sold = cars_sold + 1 WHERE id = ?');
    const userResult = updateUserStmt.run(userId);

    if (userResult.changes === 0) {
      db.prepare('ROLLBACK').run();
      throw new Error('User not found');
    }

    // Commit the transaction
    db.prepare('COMMIT').run();

    res.json({ message: 'Car marked as sold successfully' });
  } catch (error) {
    // Rollback on error
    db.prepare('ROLLBACK').run();
    console.error('Error marking car as sold:', error);
    res.status(500).json({ message: 'Error updating car status', error: error.message });
  }
});

// Delete user
app.delete('/api/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // First, delete all cars associated with the user
    const deleteCarStmt = db.prepare('DELETE FROM cars WHERE userId = ?');
    deleteCarStmt.run(id);
    
    // Then, delete all messages associated with the user
    const deleteMessagesStmt = db.prepare('DELETE FROM messages WHERE senderId = ? OR receiverId = ?');
    deleteMessagesStmt.run(id, id);
    
    // Finally, delete the user
    const deleteUserStmt = db.prepare('DELETE FROM users WHERE id = ?');
    const result = deleteUserStmt.run(id);

    if (result.changes > 0) {
      res.json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

// Add new trade-in endpoint
app.post('/api/trade-in-estimate', async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const { message, targetCarPrice, previousMessages } = req.body;

    // Add debug logging
    console.log('Received trade-in request:', {
      message,
      targetCarPrice,
      previousMessagesCount: previousMessages?.length
    });

    // Convert previous messages to OpenAI format
    const messageHistory = previousMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // If this is the first message, add the initial prompt
    if (messageHistory.length === 0) {
      messageHistory.push({
        role: 'assistant',
        content: "I'll help you estimate your trade-in value. Please tell me the make, model, and year of your current vehicle."
      });
    }

    // Add the user's new message
    messageHistory.push({ role: 'user', content: message });

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a car trade-in value estimator. Ask questions about the user's current vehicle to determine its value. 
            Consider factors like: make, model, year, mileage, condition, accident history, and maintenance.
            After gathering sufficient information, provide an estimated trade-in value range.
            The customer is interested in a vehicle priced at $${targetCarPrice}.
            Be conservative with estimates and explain your reasoning. DONT GIVE TOO MUCH DETAILS JUST THE ESTIMATED PRICE AND A BREIF REASONING`
          },
          ...messageHistory
        ],
        max_tokens: 500,
      });

      let reply = response.choices[0].message.content;
      let estimatedValue = null;

      // Extract estimate if present
      const estimateMatch = reply.match(/\[ESTIMATE\](.*?)\[\/ESTIMATE\]/);
      if (estimateMatch) {
        try {
          const estimateData = JSON.parse(estimateMatch[1]);
          estimatedValue = estimateData.value;
          // Remove the JSON from the reply
          reply = reply.replace(/\[ESTIMATE\].*?\[\/ESTIMATE\]/, '');
        } catch (e) {
          console.error('Error parsing estimate:', e);
        }
      }

      // Add debug logging
      console.log('OpenAI Response:', {
        reply: reply.trim(),
        estimatedValue
      });

      res.json({ 
        reply: reply.trim(),
        estimatedValue 
      });

    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error(`OpenAI API Error: ${error.message}`);
    }

  } catch (error) {
    console.error('Trade-in Error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to process trade-in request'
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});