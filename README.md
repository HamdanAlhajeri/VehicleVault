# Vehicle Vault

A full-stack web application for buying and selling vehicles, with features for both dealers and customers.

## Quick Start 🚀

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Windows 10/11 or newer

### One-Click Deployment

1. Download and install Docker Desktop
2. Start Docker Desktop
3. Double-click `run.bat` (or `run.ps1` for PowerShell)

That's it! The application will automatically:
- Create necessary configuration files
- Build and start all services
- Open the application in your default browser

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Configuration (Optional)

To enable all features, edit `backend/.env` with your API keys:

```env
PORT=3001
OPENAI_API_KEY=your_openai_api_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password
```

### Setting Up Gmail App Password

To use email features, you'll need to create an App Password for Gmail:

1. Go to your Google Account settings
   - Visit [Google Account Security](https://myaccount.google.com/security)
   - Make sure 2-Step Verification is enabled

2. Create App Password
   - Scroll to "2-Step Verification"
   - Scroll to the bottom and click on "App passwords"
   - Click "Select app" and choose "Mail"
   - Click "Select device" and choose "Other"
   - Enter "Vehicle Vault" as the name
   - Click "Generate"

3. Copy the generated 16-character password
   - This is your `EMAIL_PASSWORD` for the .env file
   - The password looks like: xxxx xxxx xxxx xxxx

4. Update your .env file
   - Set `EMAIL_USER` to your Gmail address
   - Set `EMAIL_PASSWORD` to the generated app password

Note: Keep your app password secure and never share it. You can revoke app passwords at any time from your Google Account settings.

## Features

### Car Listings
- Create and manage vehicle listings
- Image upload support for car photos
- Special EV (Electric Vehicle) support with range information
- Detailed car information (make, model, year, price, color)
- Car status tracking (Available/Sold)

### User Features
- Secure user authentication (login/register)
- Personal dashboard for managing listings
- Direct messaging system between users
- Test drive scheduling
- Trade-in value estimation with AI assistance
- Finance calculator with customizable loan terms
- Real-time chat support with AI assistant

### Admin Features
- Comprehensive user management
  - View all users
  - Grant/revoke admin privileges
  - Delete user accounts
- Car listing management
  - Edit any car listing
  - Remove inappropriate listings
  - Track listing status
- Admin dashboard for system overview

### AI Integration
- OpenAI-powered chatbot for customer support
- Intelligent trade-in value estimation
- Smart pricing suggestions based on market data

### Security
- Secure password hashing with bcrypt
- Protected admin routes
- User authentication state management
- Input validation and sanitization

### Database
- SQLite3 with better-sqlite3 for reliable data storage
- Structured data model for:
  - Users and authentication
  - Car listings
  - Messages
  - Notifications
  - Test drive requests

### Technical Features
- Docker containerization
- Responsive design for mobile and desktop
- Real-time updates for messages
- Email notifications for important events
- RESTful API architecture

## Technical Stack

### Frontend
- **React.js 18.3.1** - Core framework
- **React Router 6.27.0** - Client-side routing
- **React Range 1.10.0** - Range slider components
- **CSS3** - Styling with flexbox/grid layouts
- **Web Vitals** - Performance monitoring

### Backend
- **Node.js** - Runtime environment
- **Express 4.21.1** - Web application framework
- **SQLite3** with **better-sqlite3 11.5.0** - Database
- **bcrypt 5.1.1** - Password hashing
- **OpenAI API 4.72.0** - AI integration
- **Nodemailer 6.9.16** - Email service
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment configuration

### Development Tools
- **Docker** - Containerization
  - Node 20-slim base image
  - Multi-container setup
- **Docker Compose** - Service orchestration
  - Development environment configuration
  - Volume mapping for hot reloading

### Database Schema
- Users
  - Authentication data
  - Profile information
  - Admin status
- Cars
  - Vehicle details
  - Image storage
  - EV specifications
- Messages
  - User communications
  - Read status
- Notifications
  - System notifications
  - Test drive requests
  - Message alerts

### Security Features
- Secure password hashing
- Environment variable protection
- CORS configuration
- Input validation
- XSS protection

### Development Features
- Hot reloading for both frontend and backend
- Docker volume persistence
- Automated database initialization
- Development/Production environment separation

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
  - Required fields: name, email, password
- `POST /api/login` - Authenticate user
  - Required fields: email, password
- `POST /api/set-admin` - Set admin status (development only)
  - Required fields: email

### Cars
- `GET /api/cars` - Get all car listings
- `GET /api/cars/:id` - Get specific car details
- `POST /api/cars` - Create new car listing
  - Required fields: make, model, year, price
  - Optional fields: description, image, color, isEV, range
- `PUT /api/cars/:id` - Update car listing
- `DELETE /api/cars/:id` - Delete car listing

### Users
- `GET /api/users` - Get all users (admin only)
- `PUT /api/users/:id` - Update user details
  - Updateable fields: email, password, isAdmin
- `DELETE /api/users/:id` - Delete user (admin only)
- `PUT /api/users/:id/update` - Update user profile
  - Updateable fields: email, password

### Messages
- `POST /api/messages` - Send message
  - Required fields: senderId, receiverId, subject, content
- `GET /api/messages/:userId` - Get user's messages
- `PUT /api/messages/:messageId/read` - Mark message as read

### Notifications
- `GET /api/notifications/:userId` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/:id/respond` - Respond to notification
  - Required fields: status (accept/decline)

### AI Chat Support
- `POST /api/chatbot` - Interact with AI assistant
  - Required fields: message

### Response Formats
All endpoints return JSON responses with the following structure:
```json
{
  "success": true/false,
  "data": {}, // Response data
  "message": "Status message" // Optional
}
```

### Error Responses
Error responses follow the format:
```json
{
  "success": false,
  "message": "Error description",
  "error": {} // Detailed error info (development only)
}
```

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
```## In backend/.env

```bash
PORT=3001
OPENAI_API_KEY=your_openai_api_key
```
