# Pet Adoption Management System

A comprehensive **local** web application for managing pet adoptions, built with React and Node.js.

## Features

- **Multi-role Authentication** - Admin, Shelter, and User accounts
- **Pet Management** - Add, edit, and manage pet listings with photos
- **Adoption System** - Complete adoption workflow with applications
- **Donation System** - Pet donation management for shelters
- **Admin Dashboard** - Real-time statistics and system management
- **Shelter Dashboard** - Pet and adoption management for shelters
- **Responsive Design** - Works on desktop, tablet, and mobile

## Quick Start (Local)

### 1. **Prerequisites**
- Node.js (v16+)
- MySQL (XAMPP recommended)
- Git

### 2. **One-Click Start**
```bash
# Double-click this file to start everything:
start-local.bat
```

### 3. **Manual Start**
cd backend
npm run migrate
```

7. Seed demo data
```bash
npm run seed
```

8. Start the application
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Pets
- `GET /api/pets` - Get all pets with filters
- `POST /api/pets` - Add new pet (shelter only)
- `PUT /api/pets/:id` - Update pet
- `DELETE /api/pets/:id` - Delete pet

### Adoptions
- `POST /api/adoptions` - Request adoption
- `GET /api/adoptions` - Get adoption requests
- `PUT /api/adoptions/:id` - Update adoption status

### Documents
- `POST /api/documents/upload` - Upload documents
- `GET /api/documents/:petId` - Get pet documents

## Database Schema

- **users**: User accounts with role-based access
- **pets**: Pet information and status
- **documents**: File uploads and metadata
- **adoptions**: Adoption requests and status
- **donations**: Donation records

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License
