# Pet Adoption Management System - Setup Instructions

## Prerequisites

Before setting up the Pet Adoption Management System, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MySQL** (v8 or higher) - [Download here](https://dev.mysql.com/downloads/mysql/)
  - **OR XAMPP** (includes MySQL + phpMyAdmin) - [Download here](https://www.apachefriends.org/download.html)
- **Git** - [Download here](https://git-scm.com/downloads)

## 🚀 XAMPP Setup (Alternative to standalone MySQL)

If you prefer using XAMPP, see the dedicated **[XAMPP Setup Guide](XAMPP_SETUP_GUIDE.md)** for detailed instructions.

### Quick XAMPP Start:
1. Install XAMPP and start MySQL service
2. Run the automated setup: `xampp-start.bat`
3. Access the app at `http://localhost:3000`

## Quick Setup Guide

### 1. Clone and Navigate to Project

```bash
# If you have the project files, navigate to the project directory
cd pet-adoption-system
```

### 2. Database Setup

1. **Start MySQL Server**
   - On Windows: Start MySQL service from Services or MySQL Workbench
   - On macOS: `brew services start mysql`
   - On Linux: `sudo systemctl start mysql`

2. **Create Database**
   ```sql
   mysql -u root -p
   CREATE DATABASE pet_adoption_db;
   EXIT;
   ```

### 3. Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   ```

4. **Edit the .env file with your database credentials**
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=pet_adoption_db
   DB_USER=root
   DB_PASSWORD=your_mysql_password

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

5. **Run database migrations**
   ```bash
   npm run migrate
   ```

6. **Seed demo data**
   ```bash
   npm run seed
   ```

7. **Start the backend server**
   ```bash
   npm run dev
   ```

   The backend server will start on http://localhost:5000

### 4. Frontend Setup

1. **Open a new terminal and navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the frontend development server**
   ```bash
   npm start
   ```

   The frontend will start on http://localhost:3000

## Demo Accounts

Once the system is running, you can use these demo accounts to test different features:

### Admin Account
- **Email**: admin@petadoption.com
- **Password**: password123
- **Features**: Full system access, user management, approval workflows

### Shelter Account
- **Email**: shelter@happypaws.com
- **Password**: password123
- **Features**: Pet management, adoption tracking, document uploads

### User Account
- **Email**: john@example.com
- **Password**: password123
- **Features**: Pet browsing, adoption applications, profile management

## System Features

### For Users
- Browse available pets with advanced filters
- Submit adoption applications
- Track application status
- Donate pets to shelters
- Manage profile and preferences

### For Shelters
- Add and manage pets
- Review adoption applications
- Upload and manage documents
- Process donation requests
- Track pet adoption status

### For Admins
- Manage all users and shelters
- Approve/reject adoption requests
- Verify documents
- View system analytics
- Monitor platform activity

## API Documentation

The backend provides RESTful APIs for all operations:

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Pet Management
- `GET /api/pets` - Get all pets (with filters)
- `GET /api/pets/:id` - Get single pet
- `POST /api/pets` - Add new pet (shelter/admin)
- `PUT /api/pets/:id` - Update pet
- `DELETE /api/pets/:id` - Delete pet

### Adoption System
- `GET /api/adoptions` - Get adoption requests
- `POST /api/adoptions` - Submit adoption request
- `PUT /api/adoptions/:id` - Update adoption status (admin)
- `DELETE /api/adoptions/:id` - Cancel adoption request

### Document Management
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/pet/:petId` - Get pet documents
- `GET /api/documents/download/:id` - Download document
- `PUT /api/documents/:id/verify` - Verify document (admin)

### Donation System
- `GET /api/donations` - Get donation requests
- `POST /api/donations` - Submit donation request
- `PUT /api/donations/:id` - Update donation status

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify MySQL is running
   - Check database credentials in .env file
   - Ensure database exists

2. **Port Already in Use**
   - Change PORT in backend .env file
   - Update FRONTEND_URL accordingly

3. **Dependencies Installation Issues**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall: `rm -rf node_modules && npm install`

4. **Migration Errors**
   - Ensure database exists
   - Check database user permissions
   - Verify Sequelize configuration

### Development Commands

**Backend Commands:**
```bash
npm run dev          # Start development server
npm run migrate      # Run database migrations
npm run seed         # Seed demo data
npm test            # Run tests
```

**Frontend Commands:**
```bash
npm start           # Start development server
npm run build       # Build for production
npm test           # Run tests
```

## Production Deployment

### Backend Deployment
1. Set NODE_ENV=production in .env
2. Use a production MySQL database
3. Configure proper JWT secrets
4. Set up file upload storage (AWS S3, etc.)
5. Use PM2 or similar for process management

### Frontend Deployment
1. Build the React app: `npm run build`
2. Serve static files with nginx or similar
3. Configure API base URL for production

## Security Considerations

- Change default JWT secret in production
- Use HTTPS in production
- Implement rate limiting
- Validate and sanitize all inputs
- Use environment variables for sensitive data
- Regular security updates

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review error logs in terminal
3. Ensure all prerequisites are installed
4. Verify environment configuration

## Technology Stack

- **Frontend**: React 18, Tailwind CSS, Framer Motion, React Query
- **Backend**: Node.js, Express.js, Sequelize ORM
- **Database**: MySQL
- **Authentication**: JWT tokens
- **File Upload**: Multer
- **Validation**: Yup (frontend), Express Validator (backend)

The system is designed to be scalable, secure, and user-friendly, providing a complete solution for pet adoption management.
