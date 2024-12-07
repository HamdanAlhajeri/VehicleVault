@echo off
echo Starting Vehicle Vault deployment...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker is not running! Please start Docker Desktop and try again.
    pause
    exit /b
)

REM Create necessary directories and files
if not exist "backend\.env" (
    echo Creating .env file...
    (
        echo PORT=3001
        echo OPENAI_API_KEY=your_openai_api_key
        echo EMAIL_USER=your_email@gmail.com
        echo EMAIL_PASSWORD=your_email_app_password
    ) > backend\.env
)

REM Build and start containers
echo Building and starting containers...
docker compose down
docker compose build --no-cache
docker compose up -d

REM Wait for services to start
echo Waiting for services to start...
timeout /t 20 /nobreak

REM Open the application
echo Opening Vehicle Vault...
start http://localhost:3000

echo Deployment complete! The application should open in your default browser.
echo If the page doesn't load immediately, please wait a few seconds and refresh.
pause