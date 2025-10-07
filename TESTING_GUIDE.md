# Pet Adoption Management System - Testing Guide

## 🚀 System Overview

This is a comprehensive Pet Adoption Management System with multi-role authentication and complete CRUD functionality.

## 🔧 System Status

### Backend Server
- **Port:** 5000
- **Status:** ✅ Running
- **API Base:** http://localhost:5000/api

### Frontend Server  
- **Port:** 3000
- **Status:** ✅ Running
- **URL:** http://localhost:3000

### Database
- **Type:** MySQL
- **Status:** ✅ Connected
- **Seeded:** ✅ Demo data loaded

## 👥 Demo Accounts

### Admin Account
- **Email:** `admin@petadoption.com`
- **Password:** `password123`
- **Access:** Full system administration

### Shelter Accounts
- **Email:** `shelter@happypaws.com`
- **Password:** `password123`
- **Access:** Pet management, adoption reviews, donations

- **Email:** `contact@lovinghearts.org`
- **Password:** `password123`
- **Access:** Pet management, adoption reviews, donations

### User Accounts
- **Email:** `john@example.com`
- **Password:** `password123`
- **Access:** Browse pets, submit adoptions

- **Email:** `jane@example.com`
- **Password:** `password123`
- **Access:** Browse pets, submit adoptions

## 🧪 Testing Scenarios

### 1. Admin Dashboard Testing
1. **Login as Admin**
   - Go to: http://localhost:3000/login
   - Use: `admin@petadoption.com` / `password123`
   
2. **Verify Statistics**
   - Should show: Total Users, Total Pets, Pending Adoptions, Total Donations
   - All numbers should be real data (not "Error")
   
3. **Test Admin Functions**
   - View all users: `/dashboard/admin/users`
   - View all adoptions: `/dashboard/admin/adoptions`
   - View all donations: `/dashboard/admin/donations`

### 2. Shelter Dashboard Testing
1. **Login as Shelter**
   - Use: `shelter@happypaws.com` / `password123`
   
2. **Test Shelter Functions**
   - Dashboard overview: `/dashboard/shelter`
   - Manage pets: `/dashboard/shelter/pets`
   - Add new pet: `/dashboard/shelter/add-pet`
   - Review adoptions: `/dashboard/shelter/adoptions`
   - Process donations: `/dashboard/shelter/donations`
   - Update profile: `/dashboard/shelter/profile`

### 3. User Experience Testing
1. **Login as User**
   - Use: `john@example.com` / `password123`
   
2. **Test User Functions**
   - Browse pets: `/pets`
   - View pet details: Click any pet
   - Submit adoption: Click "Adopt" button
   - View applications: `/dashboard/user`

### 4. Public Features Testing
1. **Browse Without Login**
   - Homepage: `/`
   - Pet listings: `/pets`
   - Pet details: `/pets/:id`
   
2. **Donation Submission**
   - Donate pet: `/donate`
   - Fill form and submit

## 🔍 Debugging Information

### Browser Console Logs
When testing, check browser console for:
```
👤 Current user: { name: "Admin User", role: "admin", ... }
🔄 Fetching admin stats...
📊 Admin stats received: { users: {...}, pets: {...} }
```

### Backend Console Logs
Check backend terminal for:
```
📊 User stats request - User: Admin User (admin)
📊 Pet stats calculated: { total: 8, available: 5, ... }
🔐 Login attempt for: admin@petadoption.com
✅ Password validated for: admin@petadoption.com
```

## ⚠️ Troubleshooting

### Login Issues
- **Problem:** Can't login
- **Solution:** Check if JWT_SECRET is set in backend/.env
- **Check:** Backend logs for authentication errors

### Statistics Showing "Error"
- **Problem:** Admin dashboard shows "Error" instead of numbers
- **Solution:** Check browser console for specific error details
- **Check:** Backend logs for API endpoint errors

### Server Not Running
- **Backend:** Run `npm run dev` in `/backend` directory
- **Frontend:** Run `npm start` in `/frontend` directory

## 📊 Expected Data

### Demo Data Includes:
- **7 Users** (1 admin, 3 shelters, 3 regular users)
- **8 Pets** (various breeds and statuses)
- **3 Adoption Requests** (different statuses)
- **3 Donation Requests** (pending review)

## 🎯 Key Features to Test

### ✅ Authentication
- Multi-role login/logout
- Role-based access control
- Protected routes

### ✅ Pet Management
- CRUD operations for pets
- Image upload (up to 5 images)
- Status management (available, pending, adopted)

### ✅ Adoption Workflow
- Submit adoption applications
- Shelter review and approval
- Status tracking (pending → approved → completed)

### ✅ Donation System
- Submit pet donations
- Shelter acceptance/rejection
- Pickup scheduling

### ✅ Real-time Updates
- Dashboard statistics refresh
- Live notifications
- Auto-updating data

### ✅ Responsive Design
- Mobile-friendly interface
- Tablet optimization
- Desktop full features

## 🚀 Production Ready Features

- JWT authentication with secure tokens
- Input validation on client and server
- Error handling and user feedback
- Loading states and animations
- SEO-friendly routing
- Security best practices
- Docker deployment ready

---

**System is fully functional and ready for production use!** 🎉
