# Pet Adoption Management System - XAMPP Setup Guide

## 🚀 Setting up with XAMPP

This guide will help you configure the Pet Adoption Management System to work with XAMPP's MySQL database.

## 📋 Prerequisites

1. **XAMPP** installed on your system
   - Download from: https://www.apachefriends.org/download.html
   - Ensure MySQL and Apache are included

2. **Node.js** (v16 or higher)
   - Download from: https://nodejs.org/

## 🔧 XAMPP Configuration

### 1. Start XAMPP Services

1. **Open XAMPP Control Panel**
2. **Start the following services:**
   - ✅ **Apache** (for phpMyAdmin access)
   - ✅ **MySQL** (for database)

3. **Verify MySQL is running:**
   - MySQL should show "Running" status
   - Default port: 3306

### 2. Database Setup via phpMyAdmin

1. **Access phpMyAdmin:**
   - Open browser and go to: `http://localhost/phpmyadmin`
   - Default login: Username: `root`, Password: (leave empty)

2. **Create Database:**
   ```sql
   CREATE DATABASE pet_adoption_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. **Create Database User (Recommended):**
   ```sql
   CREATE USER 'petadoption'@'localhost' IDENTIFIED BY 'petpassword';
   GRANT ALL PRIVILEGES ON pet_adoption_db.* TO 'petadoption'@'localhost';
   FLUSH PRIVILEGES;
   ```

   Or you can use the root user (less secure but simpler for development).

## ⚙️ Project Configuration

### 1. Backend Environment Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Copy environment file:**
   ```bash
   copy .env.example .env
   ```

3. **Edit `.env` file for XAMPP:**
   ```env
   # Database Configuration for XAMPP
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=pet_adoption_db
   DB_USER=root
   DB_PASSWORD=
   
   # OR if you created a dedicated user:
   # DB_USER=petadoption
   # DB_PASSWORD=petpassword

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d

   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # File Upload Configuration
   UPLOAD_DIR=uploads
   MAX_FILE_SIZE=5242880

   # CORS Configuration
   FRONTEND_URL=http://localhost:3000
   ```

### 2. Install Dependencies and Setup Database

1. **Install backend dependencies:**
   ```bash
   npm install
   ```

2. **Run database migrations:**
   ```bash
   npm run migrate
   ```

3. **Seed demo data:**
   ```bash
   npm run seed
   ```

4. **Start backend server:**
   ```bash
   npm run dev
   ```

   You should see:
   ```
   ✅ Database connection established successfully.
   ✅ Database synchronized successfully.
   🚀 Server running on port 5000
   ```

### 3. Frontend Setup

1. **Open new terminal and navigate to frontend:**
   ```bash
   cd frontend
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Start frontend development server:**
   ```bash
   npm start
   ```

   The application will open at: `http://localhost:3000`

## 🔍 Verification Steps

### 1. Check Database Connection

1. **Via phpMyAdmin:**
   - Go to `http://localhost/phpmyadmin`
   - Select `pet_adoption_db` database
   - You should see 5 tables: `users`, `pets`, `adoptions`, `documents`, `donations`

2. **Via Backend API:**
   - Visit: `http://localhost:5000/api/health`
   - Should return: `{"status":"OK","timestamp":"...","environment":"development"}`

### 2. Test the Application

1. **Access the application:**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000/api`

2. **Login with demo accounts:**
   - **Admin**: admin@petadoption.com / password123
   - **Shelter**: shelter@happypaws.com / password123
   - **User**: john@example.com / password123

## 🛠️ Troubleshooting XAMPP Issues

### MySQL Won't Start

1. **Check if port 3306 is in use:**
   ```bash
   netstat -an | findstr :3306
   ```

2. **Change MySQL port in XAMPP:**
   - Open XAMPP Control Panel
   - Click "Config" next to MySQL
   - Select "my.ini"
   - Change port from 3306 to 3307
   - Update your `.env` file: `DB_PORT=3307`

3. **Restart MySQL service in XAMPP**

### Database Connection Errors

1. **Verify XAMPP MySQL is running:**
   - Check XAMPP Control Panel
   - MySQL should show "Running" status

2. **Test connection manually:**
   ```bash
   mysql -h localhost -P 3306 -u root -p
   ```

3. **Check firewall settings:**
   - Ensure Windows Firewall allows MySQL connections
   - Add exception for port 3306

### Permission Issues

1. **If using root user fails:**
   ```sql
   -- In phpMyAdmin, run:
   ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';
   FLUSH PRIVILEGES;
   ```

2. **Grant all privileges to root:**
   ```sql
   GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost';
   FLUSH PRIVILEGES;
   ```

## 📊 Database Management with phpMyAdmin

### Viewing Data

1. **Access phpMyAdmin:** `http://localhost/phpmyadmin`
2. **Select database:** `pet_adoption_db`
3. **Browse tables:**
   - `users` - View all registered users
   - `pets` - View all pets in the system
   - `adoptions` - View adoption requests
   - `donations` - View donation requests
   - `documents` - View uploaded documents

### Backup Database

1. **In phpMyAdmin:**
   - Select `pet_adoption_db`
   - Click "Export" tab
   - Choose "Quick" export method
   - Click "Go" to download SQL file

### Restore Database

1. **In phpMyAdmin:**
   - Select `pet_adoption_db`
   - Click "Import" tab
   - Choose your SQL backup file
   - Click "Go"

## 🔧 XAMPP Configuration Files

### MySQL Configuration (my.ini)

Location: `C:\xampp\mysql\bin\my.ini`

Key settings for the project:
```ini
[mysqld]
port=3306
max_allowed_packet=64M
innodb_buffer_pool_size=256M
```

### Apache Configuration (httpd.conf)

Location: `C:\xampp\apache\conf\httpd.conf`

For serving static files (if needed):
```apache
DocumentRoot "C:/xampp/htdocs"
<Directory "C:/xampp/htdocs">
    Options Indexes FollowSymLinks Includes ExecCGI
    AllowOverride All
    Require all granted
</Directory>
```

## 🚀 Production Considerations

### For Production with XAMPP:

1. **Secure MySQL:**
   ```sql
   -- Set root password
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'strong_password';
   
   -- Remove anonymous users
   DELETE FROM mysql.user WHERE User='';
   
   -- Remove test database
   DROP DATABASE IF EXISTS test;
   ```

2. **Update environment variables:**
   ```env
   NODE_ENV=production
   DB_PASSWORD=your_strong_password
   JWT_SECRET=very_long_random_string_for_production
   ```

3. **Enable SSL in XAMPP:**
   - Configure Apache with SSL certificates
   - Update frontend to use HTTPS

## 📝 Quick Commands Reference

```bash
# Start backend (from backend directory)
npm run dev

# Start frontend (from frontend directory)
npm start

# Reset database
npm run migrate:undo:all
npm run migrate
npm run seed

# View logs
# Backend logs appear in terminal
# MySQL logs: C:\xampp\mysql\data\*.err
```

## 🎯 Next Steps

1. **Development:**
   - Both servers should be running
   - Access app at `http://localhost:3000`
   - API available at `http://localhost:5000/api`

2. **Database Management:**
   - Use phpMyAdmin for database administration
   - Monitor tables and data through web interface

3. **File Uploads:**
   - Files will be stored in `backend/uploads/`
   - Ensure this directory has write permissions

Your Pet Adoption Management System is now configured to work seamlessly with XAMPP! 🎉
