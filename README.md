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
```## In backend/.env

```bash
PORT=3001
OPENAI_API_KEY=your_openai_api_key
```
