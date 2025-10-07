@echo off
echo ========================================
echo Pet Adoption System - XAMPP Startup
echo ========================================
echo.

echo Starting XAMPP services...
echo Please make sure XAMPP Control Panel is open and MySQL is running.
echo.

echo Checking if Node.js is installed...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

echo Setting up backend...
cd backend

echo Installing backend dependencies...
if not exist node_modules (
    npm install
)

echo Checking database connection...
echo Please ensure XAMPP MySQL is running before proceeding.
pause

echo Running database migrations...
npm run migrate

echo Seeding demo data...
npm run seed

echo.
echo ========================================
echo Starting Backend Server...
echo ========================================
echo Backend will start on http://localhost:5000
echo API endpoints available at http://localhost:5000/api
echo.

start cmd /k "npm run dev"

echo.
echo ========================================
echo Starting Frontend...
echo ========================================
cd ..\frontend

echo Installing frontend dependencies...
if not exist node_modules (
    npm install
)

echo Frontend will start on http://localhost:3000
echo Note: Use 'npm start' (not 'npm run dev') for frontend
echo.

start cmd /k "npm start"

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:5000/api
echo phpMyAdmin: http://localhost/phpmyadmin
echo.
echo Demo Accounts:
echo - Admin: admin@petadoption.com / password123
echo - Shelter: shelter@happypaws.com / password123
echo - User: john@example.com / password123
echo.
echo Press any key to exit this window...
pause >nul
