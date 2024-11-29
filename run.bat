docker compose up -d
timeout /t 20
start cmd /c "start http://localhost:3000"