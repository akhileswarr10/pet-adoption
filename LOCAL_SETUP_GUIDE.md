# Pet Adoption Management System - Local Setup Guide

## 🏠 Local Development Only

This guide helps you run the Pet Adoption Management System on your local machine for personal use.

## 📋 Prerequisites

### Required Software:
- **Node.js** (v16 or higher)
- **MySQL** (v8.0 or higher) 
- **Git** (for version control)

### Recommended Tools:
- **XAMPP** (includes MySQL and phpMyAdmin)
- **VS Code** (code editor)
- **Postman** (API testing - optional)

## 🚀 Quick Start (5 Minutes)

### 1. **Start Database**
```bash
# If using XAMPP:
# - Start XAMPP Control Panel
# - Start Apache and MySQL services
# - Database will be available at localhost:3306
```

### 2. **Start Backend Server**
```bash
cd backend
npm install
npm run dev
```
**Backend runs on:** http://localhost:5000

### 3. **Start Frontend Server**
```bash
cd frontend  
npm install
npm start
```
**Frontend runs on:** http://localhost:3000

### 4. **Access Your Application**
- **Main App:** http://localhost:3000
- **Admin Login:** admin@petadoption.com / password123
- **Shelter Login:** shelter@happypaws.com / password123
- **User Login:** john@example.com / password123

## 🔧 Local Configuration

### Backend Environment (.env):
```env
# Database (Local MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=pet_adoption_db
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT (Local Security)
JWT_SECRET=your_local_secret_key_123
JWT_EXPIRES_IN=7d

# Server (Local Only)
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment (.env):
```env
# API (Local Backend)
REACT_APP_API_URL=/api
```

## 📊 Local Features

### ✅ **What Works Locally:**
- **User Authentication** - Login/logout/register
- **Pet Management** - Add, edit, delete pets
- **Adoption System** - Submit and manage applications
- **Donation System** - Pet donations to shelters
- **Admin Dashboard** - System statistics and management
- **Shelter Dashboard** - Pet and adoption management
- **File Uploads** - Pet images (stored locally)
- **Real-time Updates** - Live dashboard updates

### 🏠 **Local-Only Benefits:**
- **Fast Performance** - No network latency
- **Private Data** - All data stays on your machine
- **Offline Access** - Works without internet
- **Full Control** - Customize as needed
- **No Hosting Costs** - Completely free

## 🗄️ Database Management

### Access Database:
- **phpMyAdmin:** http://localhost/phpmyadmin
- **Database Name:** pet_adoption_db
- **Tables:** users, pets, adoptions, donations, documents

### Reset Database:
```bash
cd backend
npm run migrate:fresh  # Recreate all tables
npm run seed           # Add demo data
```

### Backup Database:
```bash
mysqldump -u root -p pet_adoption_db > backup.sql
```

## 👥 Demo Accounts (Local)

### Admin Account:
- **Email:** admin@petadoption.com
- **Password:** password123
- **Access:** Full system administration

### Shelter Accounts:
- **Happy Paws:** shelter@happypaws.com / password123
- **Loving Hearts:** contact@lovinghearts.org / password123
- **Safe Haven:** info@safehavenshelter.com / password123

### User Accounts:
- **John Doe:** john@example.com / password123
- **Jane Smith:** jane@example.com / password123
- **Mike Johnson:** mike@example.com / password123

## 🔍 Troubleshooting

### Common Issues:

#### **"Can't connect to database"**
- ✅ Start MySQL service in XAMPP
- ✅ Check database credentials in backend/.env
- ✅ Create database: `CREATE DATABASE pet_adoption_db;`

#### **"Login failed"**
- ✅ Run database seeder: `npm run seed`
- ✅ Check JWT_SECRET in backend/.env
- ✅ Restart backend server

#### **"Network Error"**
- ✅ Check backend is running on port 5000
- ✅ Check frontend proxy in package.json
- ✅ Restart both servers

#### **"Statistics not loading"**
- ✅ Login as admin user
- ✅ Check backend console for errors
- ✅ Verify database has demo data

## 📁 Project Structure (Local)

```
pet-adoption-system/
├── backend/           # Node.js API server
│   ├── models/        # Database models
│   ├── routes/        # API endpoints
│   ├── migrations/    # Database structure
│   └── seeders/       # Demo data
├── frontend/          # React web app
│   ├── src/pages/     # Application pages
│   ├── src/components/ # Reusable components
│   └── src/store/     # State management
└── uploads/           # Local file storage
```

## 🎯 Local Usage Tips

### **Development Workflow:**
1. **Start XAMPP** → MySQL database
2. **Start Backend** → API server (port 5000)
3. **Start Frontend** → Web app (port 3000)
4. **Open Browser** → http://localhost:3000

### **Data Management:**
- **Add Pets** → Login as shelter, go to "Add Pet"
- **Manage Users** → Login as admin, go to "Users"
- **Process Adoptions** → Login as shelter, go to "Adoptions"
- **View Statistics** → Login as admin, see dashboard

### **Customization:**
- **Colors/Themes** → Edit `tailwind.config.js`
- **Features** → Modify React components
- **Database** → Update models and migrations
- **API** → Modify backend routes

## 🎉 You're All Set!

Your Pet Adoption Management System is now running locally on your machine!

**Access URLs:**
- **Main Application:** http://localhost:3000
- **Database Admin:** http://localhost/phpmyadmin
- **API Documentation:** Available in API_DOCUMENTATION.md

**Need Help?**
- Check console logs for errors
- Review TESTING_GUIDE.md for features
- All data stays private on your local machine

---

**Enjoy your local Pet Adoption Management System!** 🐾❤️
