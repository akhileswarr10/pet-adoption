# Pet Adoption Management System - Database Schema Report

## Overview
This document provides a comprehensive overview of the database schema for the Pet Adoption Management System. The system uses MySQL as the primary database with Sequelize ORM for data modeling and migrations.

**Database Name:** `pet_adoption_db`
**Total Tables:** 5
**Created:** October 2024
**Last Updated:** October 2024

---

## Table Relationships Diagram

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    USERS    │    │    PETS     │    │  ADOPTIONS  │
│             │    │             │    │             │
│ id (PK)     │◄──┤ uploaded_by │    │ id (PK)     │
│ name        │    │ id (PK)     │◄──┤ pet_id (FK) │
│ email       │    │ name        │    │ user_id (FK)│──┐
│ role        │    │ breed       │    │ status      │  │
│ ...         │    │ ...         │    │ ...         │  │
└─────────────┘    └─────────────┘    └─────────────┘  │
       │                   │                           │
       │                   │                           │
       ▼                   ▼                           ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  DONATIONS  │    │ DOCUMENTS   │    │    USERS    │
│             │    │             │    │             │
│ id (PK)     │    │ id (PK)     │    │ (Reference) │
│ pet_id (FK) │    │ pet_id (FK) │    │             │
│ shelter_id  │    │ user_id (FK)│    │             │
│ status      │    │ file_path   │    │             │
│ ...         │    │ ...         │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
```

---

## 1. USERS Table

**Purpose:** Stores user accounts for the system including regular users, shelters, and administrators.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| `name` | STRING | NOT NULL | Full name of the user |
| `email` | STRING | NOT NULL, UNIQUE | Email address (login credential) |
| `password` | STRING | NOT NULL | Hashed password |
| `role` | ENUM | NOT NULL, DEFAULT 'user' | User role: 'user', 'shelter', 'admin' |
| `phone` | STRING | NULLABLE | Contact phone number |
| `address` | TEXT | NULLABLE | Physical address |
| `is_active` | BOOLEAN | DEFAULT true | Account status flag |
| `profile_image` | STRING | NULLABLE | Profile picture file path |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Account creation date |
| `updated_at` | TIMESTAMP | NOT NULL, AUTO UPDATE | Last modification date |

**Indexes:**
- `email` (Unique index for login)
- `role` (Query optimization for role-based access)

**Sample Data Count:** 6 demo users (2 admin, 2 shelter, 2 regular users)

---

## 2. PETS Table

**Purpose:** Central table storing all pet information available for adoption or donation.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique pet identifier |
| `name` | STRING | NOT NULL | Pet's name |
| `breed` | STRING | NOT NULL | Pet breed/species |
| `age` | INTEGER | NOT NULL | Pet age in years |
| `gender` | ENUM | NOT NULL | 'male' or 'female' |
| `size` | ENUM | NOT NULL | 'small', 'medium', 'large' |
| `color` | STRING | NULLABLE | Pet color/markings |
| `description` | TEXT | NULLABLE | Detailed pet description |
| `health_status` | ENUM | NOT NULL, DEFAULT 'healthy' | 'healthy', 'needs_care', 'recovering' |
| `vaccination_status` | BOOLEAN | DEFAULT false | Vaccination up-to-date flag |
| `spayed_neutered` | BOOLEAN | DEFAULT false | Spay/neuter status |
| `adoption_status` | ENUM | NOT NULL, DEFAULT 'available' | 'available', 'pending', 'adopted' |
| `uploaded_by` | INTEGER | NOT NULL, FK → users.id | User who added the pet |
| `adoption_fee` | DECIMAL(10,2) | DEFAULT 0.00 | Adoption fee amount |
| `images` | LONGTEXT | NULLABLE | JSON array of base64 images |
| `special_needs` | TEXT | NULLABLE | Special care requirements |
| `good_with_kids` | BOOLEAN | DEFAULT true | Child-friendly flag |
| `good_with_pets` | BOOLEAN | DEFAULT true | Pet-friendly flag |
| `energy_level` | ENUM | DEFAULT 'medium' | 'low', 'medium', 'high' |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation date |
| `updated_at` | TIMESTAMP | NOT NULL, AUTO UPDATE | Last modification date |

**Foreign Keys:**
- `uploaded_by` → `users.id` (CASCADE on UPDATE/DELETE)

**Indexes:**
- `adoption_status` (Query optimization for available pets)
- `breed` (Search optimization)
- `age` (Filter optimization)
- `uploaded_by` (Relationship optimization)

**Sample Data Count:** 8 demo pets with various statuses

---

## 3. ADOPTIONS Table

**Purpose:** Manages adoption applications and their workflow from application to completion.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique adoption request ID |
| `pet_id` | INTEGER | NOT NULL, FK → pets.id | Pet being adopted |
| `user_id` | INTEGER | NOT NULL, FK → users.id | Adopter's user ID |
| `status` | ENUM | NOT NULL, DEFAULT 'pending' | 'pending', 'approved', 'rejected', 'completed' |
| `application_message` | TEXT | NULLABLE | Adopter's application message |
| `admin_notes` | TEXT | NULLABLE | Internal admin notes |
| `approved_by` | INTEGER | NULLABLE, FK → users.id | Admin who approved |
| `approved_at` | TIMESTAMP | NULLABLE | Approval timestamp |
| `completed_at` | TIMESTAMP | NULLABLE | Completion timestamp |
| `rejection_reason` | TEXT | NULLABLE | Reason for rejection |
| `contact_phone` | STRING | NULLABLE | Adopter's contact phone |
| `contact_address` | TEXT | NULLABLE | Adopter's address |
| `experience_with_pets` | TEXT | NULLABLE | Pet experience details |
| `living_situation` | TEXT | NULLABLE | Housing situation |
| `other_pets` | TEXT | NULLABLE | Information about other pets |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Application date |
| `updated_at` | TIMESTAMP | NOT NULL, AUTO UPDATE | Last status change |

**Foreign Keys:**
- `pet_id` → `pets.id` (CASCADE on UPDATE/DELETE)
- `user_id` → `users.id` (CASCADE on UPDATE/DELETE)
- `approved_by` → `users.id` (SET NULL on DELETE)

**Indexes:**
- `pet_id` (Query optimization)
- `user_id` (User's applications)
- `status` (Status-based queries)

**Sample Data Count:** 3 demo adoption requests in various states

---

## 4. DONATIONS Table

**Purpose:** Handles pet donation requests from users to shelters.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique donation request ID |
| `pet_id` | INTEGER | NOT NULL, FK → pets.id | Pet being donated |
| `shelter_id` | INTEGER | NOT NULL, FK → users.id | Target shelter |
| `donor_name` | STRING | NULLABLE | Donor's full name |
| `donor_email` | STRING | NULLABLE | Donor's email address |
| `donor_phone` | STRING | NULLABLE | Donor's phone number |
| `donation_reason` | TEXT | NULLABLE | Reason for donation |
| `pet_background` | TEXT | NULLABLE | Pet's history and background |
| `status` | ENUM | NOT NULL, DEFAULT 'pending' | 'pending', 'accepted', 'rejected', 'completed' |
| `date` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Donation request date |
| `pickup_date` | TIMESTAMP | NULLABLE | Preferred pickup date |
| `notes` | TEXT | NULLABLE | Additional notes |
| `admin_notes` | TEXT | NULLABLE | Internal admin notes |
| `processed_by` | INTEGER | NULLABLE, FK → users.id | Admin who processed |
| `processed_at` | TIMESTAMP | NULLABLE | Processing timestamp |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation |
| `updated_at` | TIMESTAMP | NOT NULL, AUTO UPDATE | Last modification |

**Foreign Keys:**
- `pet_id` → `pets.id` (CASCADE on UPDATE/DELETE)
- `shelter_id` → `users.id` (CASCADE on UPDATE/DELETE)
- `processed_by` → `users.id` (SET NULL on DELETE)

**Indexes:**
- `pet_id` (Pet-specific donations)
- `shelter_id` (Shelter's donations)
- `status` (Status filtering)

**Sample Data Count:** 3 demo donation requests

---

## 5. DOCUMENTS Table

**Purpose:** Stores uploaded documents related to pets, adoptions, and user verification.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique document ID |
| `pet_id` | INTEGER | NULLABLE, FK → pets.id | Associated pet (optional) |
| `user_id` | INTEGER | NOT NULL, FK → users.id | User who uploaded |
| `file_name` | STRING | NOT NULL | Original filename |
| `file_path` | STRING | NOT NULL | Server storage path |
| `file_size` | INTEGER | NOT NULL | File size in bytes |
| `mime_type` | STRING | NOT NULL | File MIME type |
| `document_type` | ENUM | NOT NULL, DEFAULT 'other' | Document category |
| `description` | TEXT | NULLABLE | Document description |
| `is_verified` | BOOLEAN | DEFAULT false | Admin verification status |
| `verified_by` | INTEGER | NULLABLE, FK → users.id | Verifying admin |
| `verified_at` | TIMESTAMP | NULLABLE | Verification timestamp |
| `verification_notes` | TEXT | NULLABLE | Admin verification notes |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Upload timestamp |
| `updated_at` | TIMESTAMP | NOT NULL, AUTO UPDATE | Last modification |

**Document Types (ENUM):**
- `vaccination_record` - Pet vaccination certificates
- `health_certificate` - Health clearance documents
- `medical_history` - Medical records and treatment history
- `adoption_contract` - Signed adoption agreements
- `identification` - ID documents, licenses
- `other` - Miscellaneous documents

**Foreign Keys:**
- `pet_id` → `pets.id` (CASCADE on UPDATE/DELETE)
- `user_id` → `users.id` (CASCADE on UPDATE/DELETE)
- `verified_by` → `users.id` (SET NULL on DELETE)

**Indexes:**
- `pet_id` (Pet-specific documents)
- `user_id` (User's documents)
- `document_type` (Type-based queries)

**Sample Data Count:** 0 (empty by default, populated through uploads)

---

## Database Statistics

| Table | Estimated Rows | Storage Type | Key Features |
|-------|---------------|--------------|--------------|
| users | 6+ | InnoDB | Authentication, Role-based access |
| pets | 8+ | InnoDB | Central entity, Image storage |
| adoptions | 3+ | InnoDB | Workflow management |
| donations | 3+ | InnoDB | Donation workflow |
| documents | 0+ | InnoDB | File management, Verification |

---

## Security Features

### Data Protection
- **Password Hashing:** All passwords stored using bcrypt
- **JWT Authentication:** Secure token-based authentication
- **Role-based Access:** User, Shelter, Admin role separation
- **Foreign Key Constraints:** Data integrity enforcement
- **Soft Deletes:** Account deactivation vs. hard deletion

### File Security
- **Upload Validation:** File type and size restrictions
- **Secure Storage:** Files stored outside web root
- **Access Control:** Document access based on ownership
- **Virus Scanning:** Ready for antivirus integration

---

## Performance Optimizations

### Indexing Strategy
- **Primary Keys:** All tables have auto-increment PKs
- **Foreign Keys:** Indexed for join performance
- **Search Fields:** breed, age, status fields indexed
- **Unique Constraints:** email uniqueness enforced

### Query Optimization
- **Eager Loading:** Sequelize associations for related data
- **Pagination:** Built-in pagination for large datasets
- **Caching:** Ready for Redis integration
- **Connection Pooling:** Database connection optimization

---

## Backup and Maintenance

### Recommended Backup Strategy
- **Daily Backups:** Full database backup
- **File Backups:** Document and image files
- **Transaction Logs:** Point-in-time recovery
- **Testing:** Regular backup restoration tests

### Maintenance Tasks
- **Index Optimization:** Monthly index analysis
- **Data Cleanup:** Archive old completed records
- **File Cleanup:** Remove orphaned files
- **Statistics Update:** Database statistics refresh

---

## Migration History

1. **20241002000001-create-users.js** - Initial user table
2. **20241002000002-create-pets.js** - Pet information table
3. **20241002000003-create-adoptions.js** - Adoption workflow
4. **20241002000004-create-documents.js** - Document management
5. **20241002000005-create-donations.js** - Donation system
6. **20241005000001-modify-pets-images-for-base64.js** - Image storage update

---

## Future Enhancements

### Planned Features
- **Audit Logs:** Track all data changes
- **Soft Deletes:** Implement soft delete pattern
- **Full-text Search:** Advanced search capabilities
- **Data Analytics:** Reporting and analytics tables
- **Notification System:** Email/SMS notification logs

### Scalability Considerations
- **Sharding:** Horizontal scaling strategy
- **Read Replicas:** Read performance optimization
- **Archiving:** Historical data management
- **CDN Integration:** Image delivery optimization

---

**Report Generated:** October 6, 2024
**Database Version:** MySQL 8.0+
**ORM:** Sequelize 6.x
**Total Storage:** ~50MB (with sample data)
