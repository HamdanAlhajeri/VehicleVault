#!/bin/bash

echo "Starting Vehicle Vault deployment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running! Please start Docker Desktop and try again."
    read -p "Press Enter to continue..."
    exit 1
fi

# Create necessary directories and files
if [ ! -f "backend/.env" ]; then
    echo "Creating .env file..."
    cat > backend/.env << EOL
PORT=3001
OPENAI_API_KEY=your_openai_api_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password
EOL
fi

# Build and start containers
echo "Building and starting containers..."
docker compose down
docker compose build --no-cache
docker compose up -d

# Wait for services to start
echo "Waiting for services to start..."
sleep 20

# Open the application
echo "Opening Vehicle Vault..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:3000
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:3000
else
    echo "Please open http://localhost:3000 in your browser"
fi

echo "Deployment complete! The application should open in your default browser."
echo "If the page doesn't load immediately, please wait a few seconds and refresh."
read -p "Press Enter to continue..."