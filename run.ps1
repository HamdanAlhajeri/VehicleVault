Write-Host "Starting Vehicle Vault deployment..." -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "Docker is not running! Please start Docker Desktop and try again." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit
}

# Create necessary directories and files
if (-not (Test-Path "backend\.env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    @"
PORT=3001
OPENAI_API_KEY=your_openai_api_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password
"@ | Out-File -FilePath "backend\.env" -Encoding UTF8
}

# Build and start containers
Write-Host "Building and starting containers..." -ForegroundColor Yellow
docker compose down
docker compose build --no-cache
docker compose up -d

# Wait for services to start
Write-Host "Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# Open the application
Write-Host "Opening Vehicle Vault..." -ForegroundColor Yellow
Start-Process "http://localhost:3000"

Write-Host "Deployment complete! The application should open in your default browser." -ForegroundColor Green
Write-Host "If the page doesn't load immediately, please wait a few seconds and refresh." -ForegroundColor Yellow
Read-Host "Press Enter to exit" 