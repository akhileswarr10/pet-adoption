@echo off
echo ========================================
echo Pet Adoption Management System - Local
echo ========================================
echo.

echo Starting local development servers...
echo.

echo 1. Starting Backend Server (Port 5000)...
start "Backend Server" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 3 /nobreak >nul

echo 2. Starting Frontend Server (Port 3000)...
start "Frontend Server" cmd /k "cd /d %~dp0frontend && npm start"

timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo Servers are starting up...
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Demo Accounts:
echo - Admin:   admin@petadoption.com / password123
echo - Shelter: shelter@happypaws.com / password123  
echo - User:    john@example.com / password123
echo.
echo Press any key to open the application...
pause >nul

start http://localhost:3000

echo.
echo Application opened in your default browser!
echo Keep both server windows open while using the app.
echo.
echo Press any key to exit...
pause >nul
