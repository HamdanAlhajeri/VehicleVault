# Vehicle Vault

A full-stack web application for buying and selling vehicles, with features for both dealers and customers.

## Features

### Car Listings
- Advanced search functionality
- Comprehensive filtering options (price, make, model, year, mileage)
- Dynamic sorting capabilities
- Detailed car views with multiple images
- Categorization (New/Used, Make, Body Type)
- Special EV (Electric Vehicle) support with range information

### User Features
- Secure authentication (login/register)
- Personal dashboard
- Saved/favorite cars functionality
- Real-time messaging system between buyers and sellers
- User ratings and reviews
- Complete selling/buying history

### Selling Features
- Intuitive car listing creation
- Multi-image upload support
- Smart pricing suggestions based on market data
- Status tracking system (Available, Pending, Sold)
- Seller analytics

### Buying Features
- Direct inquiry system
- Offer submission
- Secure payment integration
- Test drive scheduling
- Buyer protection features

### Safety & Trust
- User verification system
- Car history reports integration
- Secure payment processing
- Suspicious listing reporting
- Comprehensive review system
- Real-time chat support with AI assistant

## Technical Stack

### Frontend
- React.js
- React Router for navigation
- Modern CSS with flexbox/grid layouts
- Responsive design
- Real-time updates

### Backend
- Node.js with Express
- SQLite3 database with better-sqlite3
- OpenAI integration for chat support
- JWT authentication
- RESTful API architecture

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User authentication

### Cars
- `GET /api/cars` - Fetch all car listings
- `GET /api/cars/:id` - Get specific car details
- `POST /api/cars` - Create new car listing
- `PUT /api/cars/:id` - Update car listing
- `DELETE /api/cars/:id` - Remove car listing

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/:userId` - Get user conversations
- `PUT /api/messages/:messageId/read` - Mark message as read

### Notifications
- `GET /api/notifications/:userId` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/:id/respond` - Respond to notification

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user profile

### AI Chat Support
- `POST /api/chatbot` - Interact with AI assistant

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- SQLite3

### Installation

1. Clone the repository

```bash
git clone https://github.com/HamdanAlHajeri/vehicle-vault.git
```


2. Install backend dependencies

```bash
cd backend
npm install
```

3. Install frontend dependencies

```bash
cd frontend/myapp
npm install
```
## In backend/.env

```bash
PORT=3001
OPENAI_API_KEY=your_openai_api_key
```