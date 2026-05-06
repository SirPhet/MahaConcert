@echo off
echo ==========================================
echo    MahaConcert Application Starter
echo ==========================================
echo.
echo 1. Starting Docker containers...
docker-compose up -d

echo.
echo 2. Waiting for services to initialize (8s)...
timeout /t 8 /nobreak > nul

echo.
echo 3. Initializing Database (Seeding Data)...
docker exec mahaconcert-backend node seed.js

echo.
echo 4. Opening your web browser...
start http://localhost:5173

echo.
echo ==========================================
echo    Application is now running at:
echo    http://localhost:5173
echo.
echo    Username: admin / Pass: admin123
echo    Username: user / Pass: user123
echo.
echo    Press any key to close this window.
echo ==========================================
pause > nul
