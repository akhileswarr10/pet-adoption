# Pet Adoption Management System - API Documentation

## 🔗 Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## 🔐 Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## 📋 Response Format

### Success Response
```json
{
  "message": "Operation successful",
  "data": { ... },
  "pagination": { ... } // For paginated responses
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": [ ... ] // Validation errors if applicable
}
```

## 🔑 Authentication Endpoints

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user", // "user", "shelter", "admin"
  "phone": "+1234567890", // optional
  "address": "123 Main St" // optional
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login User
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "phone": "+1234567890",
    "address": "123 Main St"
  }
}
```

### Update Profile
```http
PUT /auth/profile
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Smith",
  "phone": "+1234567891",
  "address": "456 Oak Ave"
}
```

### Change Password
```http
PUT /auth/change-password
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

## 🐾 Pet Endpoints

### Get All Pets
```http
GET /pets?page=1&limit=12&breed=Golden&age_min=1&age_max=5
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 12, max: 100)
- `search` (optional): Search by name or breed
- `breed` (optional): Filter by breed
- `age_min` (optional): Minimum age
- `age_max` (optional): Maximum age
- `gender` (optional): "male" or "female"
- `size` (optional): "small", "medium", or "large"
- `health_status` (optional): "healthy", "needs_care", or "recovering"
- `adoption_status` (optional): "available", "pending", or "adopted"
- `good_with_kids` (optional): true/false
- `good_with_pets` (optional): true/false
- `energy_level` (optional): "low", "medium", or "high"

**Response:**
```json
{
  "pets": [
    {
      "id": 1,
      "name": "Buddy",
      "breed": "Golden Retriever",
      "age": 3,
      "gender": "male",
      "size": "large",
      "color": "Golden",
      "description": "Friendly and energetic dog...",
      "health_status": "healthy",
      "vaccination_status": true,
      "spayed_neutered": true,
      "adoption_status": "available",
      "adoption_fee": 250.00,
      "images": ["/uploads/pets/buddy1.jpg"],
      "good_with_kids": true,
      "good_with_pets": true,
      "energy_level": "high",
      "uploader": {
        "id": 2,
        "name": "Happy Paws Shelter",
        "role": "shelter"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 12
  }
}
```

### Get Single Pet
```http
GET /pets/:id
```

**Response:**
```json
{
  "pet": {
    "id": 1,
    "name": "Buddy",
    // ... all pet fields
    "uploader": {
      "id": 2,
      "name": "Happy Paws Shelter",
      "email": "shelter@happypaws.com",
      "phone": "+1234567891"
    },
    "documents": [
      {
        "id": 1,
        "file_name": "vaccination_record.pdf",
        "document_type": "vaccination_record",
        "is_verified": true
      }
    ]
  }
}
```

### Add New Pet (Shelter/Admin Only)
```http
POST /pets
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Max",
  "breed": "German Shepherd",
  "age": 2,
  "gender": "male",
  "size": "large",
  "color": "Black and Tan",
  "description": "Loyal and protective dog...",
  "health_status": "healthy",
  "vaccination_status": true,
  "spayed_neutered": true,
  "adoption_fee": 300.00,
  "special_needs": "Requires experienced handler",
  "good_with_kids": true,
  "good_with_pets": true,
  "energy_level": "medium"
}
```

### Update Pet
```http
PUT /pets/:id
Authorization: Bearer <token>
```

**Request Body:** Same as create pet (partial updates allowed)

### Delete Pet
```http
DELETE /pets/:id
Authorization: Bearer <token>
```

## 💝 Adoption Endpoints

### Get Adoption Requests
```http
GET /adoptions?status=pending&page=1&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): "pending", "approved", "rejected", "completed"
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "adoptions": [
    {
      "id": 1,
      "status": "pending",
      "application_message": "I would love to adopt this pet...",
      "contact_phone": "+1234567893",
      "contact_address": "123 User Lane",
      "experience_with_pets": "I have owned dogs before...",
      "living_situation": "House with large yard...",
      "other_pets": "No other pets",
      "created_at": "2024-10-02T10:30:00Z",
      "pet": {
        "id": 1,
        "name": "Buddy",
        "breed": "Golden Retriever"
      },
      "adopter": {
        "id": 4,
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "pagination": { ... }
}
```

### Submit Adoption Request
```http
POST /adoptions
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "pet_id": 1,
  "application_message": "I would love to adopt this pet because...",
  "contact_phone": "+1234567893",
  "contact_address": "123 User Lane, City, State",
  "experience_with_pets": "I have owned dogs for 10 years...",
  "living_situation": "I live in a house with a large fenced yard...",
  "other_pets": "I have one cat who is friendly with dogs"
}
```

### Update Adoption Status (Admin Only)
```http
PUT /adoptions/:id
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "approved", // "pending", "approved", "rejected", "completed"
  "admin_notes": "Great application, approved after home visit",
  "rejection_reason": "Incomplete application" // only for rejected status
}
```

### Cancel Adoption Request
```http
DELETE /adoptions/:id
Authorization: Bearer <token>
```

## 📄 Document Endpoints

### Upload Document
```http
POST /documents/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `document`: File (PDF, DOC, DOCX, or images)
- `pet_id` (optional): Pet ID if document is for a specific pet
- `document_type`: "vaccination_record", "health_certificate", "medical_history", "adoption_contract", "identification", "other"
- `description` (optional): Document description

**Response:**
```json
{
  "message": "Document uploaded successfully",
  "document": {
    "id": 1,
    "file_name": "vaccination_record.pdf",
    "file_size": 1024000,
    "mime_type": "application/pdf",
    "document_type": "vaccination_record",
    "is_verified": false,
    "pet": {
      "id": 1,
      "name": "Buddy"
    }
  }
}
```

### Get Pet Documents
```http
GET /documents/pet/:petId
Authorization: Bearer <token>
```

### Download Document
```http
GET /documents/download/:id
Authorization: Bearer <token>
```

### Verify Document (Admin Only)
```http
PUT /documents/:id/verify
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "is_verified": true,
  "verification_notes": "Document verified and approved"
}
```

## 🎁 Donation Endpoints

### Submit Donation Request
```http
POST /donations
```

**Request Body:**
```json
{
  "pet_id": 1,
  "shelter_id": 2,
  "donor_name": "Sarah Johnson",
  "donor_email": "sarah@example.com",
  "donor_phone": "+1234567896",
  "donation_reason": "Moving to apartment that doesn't allow pets",
  "pet_background": "Bella has been with our family since she was 8 weeks old...",
  "pickup_date": "2024-10-15T10:00:00Z",
  "notes": "Please find her a loving family with children"
}
```

### Get Donation Requests
```http
GET /donations?status=pending
Authorization: Bearer <token>
```

### Update Donation Status (Shelter/Admin Only)
```http
PUT /donations/:id
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "accepted", // "pending", "accepted", "rejected", "completed"
  "admin_notes": "Healthy puppy, all documentation provided",
  "pickup_date": "2024-10-15T14:00:00Z"
}
```

## 👥 User Management Endpoints (Admin Only)

### Get All Users
```http
GET /users?role=shelter&is_active=true&page=1&limit=20
Authorization: Bearer <token>
```

### Get User by ID
```http
GET /users/:id
Authorization: Bearer <token>
```

### Update User
```http
PUT /users/:id
Authorization: Bearer <token>
```

### Get Shelters List (Public)
```http
GET /users/shelters/list
```

**Response:**
```json
{
  "shelters": [
    {
      "id": 2,
      "name": "Happy Paws Shelter",
      "email": "shelter@happypaws.com",
      "phone": "+1234567891",
      "address": "456 Shelter Avenue"
    }
  ]
}
```

## 📊 Statistics Endpoints

### User Statistics (Admin Only)
```http
GET /users/stats/overview
Authorization: Bearer <token>
```

### Adoption Statistics (Admin Only)
```http
GET /adoptions/stats/overview
Authorization: Bearer <token>
```

### Donation Statistics (Admin Only)
```http
GET /donations/stats/overview
Authorization: Bearer <token>
```

## 🔍 Health Check

### System Health
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-10-02T10:30:00Z",
  "environment": "development"
}
```

## ⚠️ Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## 🔒 Rate Limiting

- **Default**: 100 requests per 15 minutes per IP
- **File Upload**: 10 uploads per hour per user
- **Authentication**: 5 failed attempts per 15 minutes per IP

## 📝 Notes

1. All timestamps are in ISO 8601 format (UTC)
2. File uploads are limited to 5MB per file
3. Supported file types: PDF, DOC, DOCX, JPG, JPEG, PNG, GIF
4. Pagination starts from page 1
5. All monetary values are in USD with 2 decimal places
6. Boolean values should be sent as actual booleans, not strings

## 🧪 Testing with Postman

Import the following environment variables:
- `base_url`: http://localhost:5000/api
- `token`: (set after login)

Example login request to get token:
```javascript
// In Postman Tests tab for login request
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("token", response.token);
}
```
