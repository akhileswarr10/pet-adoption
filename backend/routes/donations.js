const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { Donation, Pet, User } = require('../models');
const { authenticateToken, requireAdmin, requireShelterOrAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configure multer for in-memory file uploads
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow only image files
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1 * 1024 * 1024, // 1MB per file to prevent packet size issues
    files: 3 // Maximum 3 files to keep total size manageable
  }
});

// Helper function to convert buffer to base64 data URL
const bufferToBase64DataURL = (buffer, mimetype) => {
  const base64 = buffer.toString('base64');
  return `data:${mimetype};base64,${base64}`;
};

// Get all donations with filters
router.get('/', authenticateToken, [
  query('status').optional().isIn(['pending', 'accepted', 'rejected', 'completed']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    console.log(`🎁 Donations request - User: ${req.user.name} (${req.user.role})`);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      status,
      page = 1,
      limit = 10
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (status) where.status = status;

    // Shelters can only see donations to their shelter
    if (req.user.role === 'shelter') {
      where.shelter_id = req.user.id;
      console.log(`🏠 Shelter filter applied - showing donations for shelter ${req.user.id}`);
    } else if (req.user.role === 'admin') {
      console.log(`👑 Admin access - showing all donations`);
    }

    const { count, rows: donations } = await Donation.findAndCountAll({
      where,
      include: [
        {
          model: Pet,
          as: 'pet'
        },
        {
          model: User,
          as: 'shelter',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: User,
          as: 'processor',
          attributes: ['id', 'name', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    console.log(`📊 Found ${count} total donations, returning ${donations.length} for page ${page}`);
    
    res.json({
      donations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({ error: 'Failed to fetch donations' });
  }
});

// Get single donation
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const donation = await Donation.findByPk(req.params.id, {
      include: [
        {
          model: Pet,
          as: 'pet'
        },
        {
          model: User,
          as: 'shelter',
          attributes: ['id', 'name', 'email', 'phone', 'address']
        },
        {
          model: User,
          as: 'processor',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    // Check access permissions
    if (req.user.role === 'shelter' && donation.shelter_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ donation });

  } catch (error) {
    console.error('Get donation error:', error);
    res.status(500).json({ error: 'Failed to fetch donation' });
  }
});

// Create user donation request (with pet information)
router.post('/user-donation', authenticateToken, upload.array('images', 5), [
  // Pet information
  body('pet_name').trim().notEmpty().withMessage('Pet name is required'),
  body('pet_breed').trim().notEmpty().withMessage('Pet breed is required'),
  body('pet_age').custom(value => {
    const age = parseInt(value);
    return !isNaN(age) && age >= 0 && age <= 30;
  }).withMessage('Pet age must be between 0 and 30'),
  body('pet_gender').isIn(['male', 'female']).withMessage('Pet gender must be male or female'),
  body('pet_size').isIn(['small', 'medium', 'large']).withMessage('Invalid pet size'),
  body('pet_color').trim().notEmpty().withMessage('Pet color is required'),
  body('pet_description').trim().notEmpty().withMessage('Pet description is required'),
  body('health_status').isIn(['healthy', 'needs_care', 'recovering']).withMessage('Invalid health status'),
  body('vaccination_status').custom(value => {
    return value === 'true' || value === 'false' || value === true || value === false || value === undefined;
  }).withMessage('Vaccination status must be boolean'),
  body('spayed_neutered').custom(value => {
    return value === 'true' || value === 'false' || value === true || value === false || value === undefined;
  }).withMessage('Spayed/neutered status must be boolean'),
  body('good_with_kids').custom(value => {
    return value === 'true' || value === 'false' || value === true || value === false || value === undefined;
  }).withMessage('Good with kids must be boolean'),
  body('good_with_pets').custom(value => {
    return value === 'true' || value === 'false' || value === true || value === false || value === undefined;
  }).withMessage('Good with pets must be boolean'),
  body('energy_level').isIn(['low', 'medium', 'high']).withMessage('Invalid energy level'),
  
  // Donor information
  body('shelter_id').custom(value => {
    const id = parseInt(value);
    return !isNaN(id) && id > 0;
  }).withMessage('Valid shelter ID is required'),
  body('donor_name').trim().notEmpty().withMessage('Donor name is required'),
  body('donor_email').isEmail().normalizeEmail().withMessage('Valid donor email is required'),
  body('donor_phone').trim().notEmpty().withMessage('Donor phone is required'),
  body('donation_reason').trim().notEmpty().withMessage('Donation reason is required'),
  body('pet_background').trim().notEmpty().withMessage('Pet background is required'),
  body('pickup_date').isISO8601().withMessage('Valid pickup date is required'),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    console.log('=== DONATION REQUEST RECEIVED ===');
    console.log('User:', req.user?.id, req.user?.name, req.user?.role);
    console.log('Body keys:', Object.keys(req.body));
    console.log('Files count:', req.files?.length || 0);
    console.log('=== END REQUEST INFO ===');
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('User donation validation errors:', errors.array());
      console.log('Request body:', req.body);
      console.log('Files:', req.files);
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { shelter_id } = req.body;

    // Verify shelter exists and has shelter role
    const shelter = await User.findOne({
      where: {
        id: shelter_id,
        role: 'shelter',
        is_active: true
      }
    });

    if (!shelter) {
      return res.status(404).json({ error: 'Shelter not found or inactive' });
    }

    // Process uploaded images - limit size and compress
    const imageBase64Array = [];
    if (req.files && req.files.length > 0) {
      console.log('Processing', req.files.length, 'uploaded files');
      
      req.files.forEach((file, index) => {
        console.log(`File ${index + 1}: ${file.originalname}, Size: ${file.size} bytes, Type: ${file.mimetype}`);
        
        // Skip files larger than 1MB to prevent packet size issues
        if (file.size > 1024 * 1024) {
          console.log(`⚠️ Skipping large file: ${file.originalname} (${file.size} bytes)`);
          return;
        }
        
        const base64DataURL = bufferToBase64DataURL(file.buffer, file.mimetype);
        
        // Check base64 size (base64 is ~33% larger than original)
        if (base64DataURL.length > 1.5 * 1024 * 1024) {
          console.log(`⚠️ Skipping large base64 image: ${file.originalname}`);
          return;
        }
        
        imageBase64Array.push(base64DataURL);
        console.log(`✅ Added image ${index + 1}: ${file.originalname}`);
      });
      
      console.log(`Final image array length: ${imageBase64Array.length}`);
    }

    // First create the pet record with pending status
    const petData = {
      name: req.body.pet_name,
      breed: req.body.pet_breed,
      age: parseInt(req.body.pet_age),
      gender: req.body.pet_gender,
      size: req.body.pet_size,
      color: req.body.pet_color,
      description: req.body.pet_description,
      health_status: req.body.health_status,
      vaccination_status: req.body.vaccination_status === 'true' || req.body.vaccination_status === true,
      spayed_neutered: req.body.spayed_neutered === 'true' || req.body.spayed_neutered === true,
      good_with_kids: req.body.good_with_kids === 'true' || req.body.good_with_kids === true,
      good_with_pets: req.body.good_with_pets === 'true' || req.body.good_with_pets === true,
      energy_level: req.body.energy_level,
      adoption_status: 'pending', // Will be changed to 'available' when donation is approved
      uploaded_by: req.user.id, // Use the authenticated user ID
      images: imageBase64Array
    };

    console.log('=== CREATING PET WITH DATA ===');
    console.log('Pet data:', JSON.stringify(petData, null, 2));
    console.log('Images array length:', imageBase64Array.length);
    console.log('User ID for uploaded_by:', req.user.id);
    console.log('=== END PET DATA ===');

    const pet = await Pet.create(petData);
    console.log('✅ Pet created successfully with ID:', pet.id);

    // Then create the donation request
    const donationData = {
      pet_id: pet.id,
      shelter_id: shelter_id,
      donor_name: req.body.donor_name,
      donor_email: req.body.donor_email,
      donor_phone: req.body.donor_phone,
      donation_reason: req.body.donation_reason,
      pet_background: req.body.pet_background,
      pickup_date: req.body.pickup_date,
      notes: req.body.notes,
      status: 'pending'
    };

    console.log('=== CREATING DONATION WITH DATA ===');
    console.log('Donation data:', JSON.stringify(donationData, null, 2));
    console.log('=== END DONATION DATA ===');

    const donation = await Donation.create(donationData);
    console.log('✅ Donation created successfully with ID:', donation.id);

    // Fetch the created donation with associations
    const createdDonation = await Donation.findByPk(donation.id, {
      include: [
        {
          model: Pet,
          as: 'pet'
        },
        {
          model: User,
          as: 'shelter',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ]
    });

    res.status(201).json({
      message: 'Donation request submitted successfully',
      donation: createdDonation
    });

  } catch (error) {
    console.error('=== DONATION CREATION ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error name:', error.name);
    console.error('Error stack:', error.stack);
    console.error('Request body keys:', Object.keys(req.body));
    console.error('Request body:', req.body);
    console.error('Files count:', req.files?.length || 0);
    console.error('Shelter ID from body:', req.body.shelter_id);
    console.error('User from auth:', req.user?.id, req.user?.role);
    console.error('=== END ERROR DEBUG ===');
    
    // Send more specific error message
    if (error.name === 'SequelizeValidationError') {
      console.error('Sequelize validation errors:', error.errors);
      return res.status(400).json({ 
        error: 'Database validation failed', 
        details: error.errors.map(e => ({ field: e.path, message: e.message, value: e.value }))
      });
    }
    
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      console.error('Foreign key constraint error:', error.fields);
      return res.status(400).json({ 
        error: 'Invalid reference data', 
        details: `Invalid ${error.fields?.join(', ') || 'foreign key'}`
      });
    }
    
    if (error.name === 'SequelizeConnectionError') {
      console.error('Database connection error');
      return res.status(500).json({ 
        error: 'Database connection failed', 
        details: 'Please try again later'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create donation request', 
      details: error.message,
      type: error.name 
    });
  }
});

// Update donation status (shelter or admin)
router.put('/:id', authenticateToken, requireShelterOrAdmin, [
  body('status').isIn(['pending', 'accepted', 'rejected', 'completed']),
  body('admin_notes').optional().trim(),
  body('pickup_date').optional().custom((value) => {
    if (value === null || value === undefined || value === '') {
      return true; // Allow null/empty values
    }
    if (new Date(value).toString() === 'Invalid Date') {
      throw new Error('Invalid pickup date format');
    }
    return true;
  })
], async (req, res) => {
  try {
    console.log(`🔄 Donation update request - User: ${req.user.name} (${req.user.role}), Donation ID: ${req.params.id}`);
    console.log(`📝 Request body:`, req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
        received: req.body
      });
    }

    const { status, admin_notes, pickup_date } = req.body;

    const donation = await Donation.findByPk(req.params.id);
    if (!donation) {
      console.log(`❌ Donation not found: ${req.params.id}`);
      return res.status(404).json({ error: 'Donation not found' });
    }

    console.log(`📋 Found donation: ${donation.id}, shelter_id: ${donation.shelter_id}, status: ${donation.status}`);

    // Check permissions - shelter can only update their own donations
    if (req.user.role === 'shelter' && donation.shelter_id !== req.user.id) {
      console.log(`❌ Permission denied - shelter ${req.user.id} trying to update donation for shelter ${donation.shelter_id}`);
      return res.status(403).json({ error: 'You can only update donations to your shelter' });
    }

    console.log(`✅ Permission check passed for ${req.user.role}`);

    const updateData = {
      status,
      admin_notes,
      processed_by: req.user.id,
      processed_at: new Date()
    };

    if (pickup_date) {
      updateData.pickup_date = pickup_date;
    }

    await donation.update(updateData);

    // If donation is accepted, update pet status to available
    if (status === 'accepted') {
      await Pet.update(
        { adoption_status: 'available' },
        { where: { id: donation.pet_id } }
      );
    }

    // Fetch updated donation with associations
    const updatedDonation = await Donation.findByPk(donation.id, {
      include: [
        {
          model: Pet,
          as: 'pet'
        },
        {
          model: User,
          as: 'shelter',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: User,
          as: 'processor',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.json({
      message: 'Donation status updated successfully',
      donation: updatedDonation
    });

  } catch (error) {
    console.error('Update donation error:', error);
    res.status(500).json({ error: 'Failed to update donation status' });
  }
});

// Delete donation (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const donation = await Donation.findByPk(req.params.id);
    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    await donation.destroy();

    res.json({ message: 'Donation deleted successfully' });

  } catch (error) {
    console.error('Delete donation error:', error);
    res.status(500).json({ error: 'Failed to delete donation' });
  }
});

// Get donation statistics (admin only)
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log(`📊 Donation stats request - User: ${req.user.name} (${req.user.role})`);
    const { Op } = require('sequelize');
    
    // Current month date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const stats = await Promise.all([
      Donation.count({ where: { status: 'pending' } }),
      Donation.count({ where: { status: 'accepted' } }),
      Donation.count({ where: { status: 'completed' } }),
      Donation.count({ where: { status: 'rejected' } }),
      Donation.count({
        where: {
          created_at: {
            [Op.between]: [startOfMonth, endOfMonth]
          }
        }
      })
    ]);

    const totalDonations = stats[0] + stats[1] + stats[2] + stats[3];

    const response = {
      pending: stats[0],
      accepted: stats[1],
      completed: stats[2],
      rejected: stats[3],
      total: totalDonations,
      thisMonth: stats[4]
    };

    console.log(`✅ Donation stats response:`, response);
    res.json(response);

  } catch (error) {
    console.error('Get donation stats error:', error);
    res.status(500).json({ error: 'Failed to fetch donation statistics' });
  }
});

// Test route to debug Pet creation
router.post('/test-pet', authenticateToken, async (req, res) => {
  try {
    console.log('=== TEST PET CREATION ===');
    console.log('User:', req.user.id, req.user.name);
    
    const testPetData = {
      name: 'Test Pet',
      breed: 'Test Breed',
      age: 2,
      gender: 'male',
      size: 'medium',
      color: 'brown',
      description: 'Test description',
      health_status: 'healthy',
      vaccination_status: true,
      spayed_neutered: false,
      good_with_kids: true,
      good_with_pets: true,
      energy_level: 'medium',
      adoption_status: 'pending',
      uploaded_by: req.user.id,
      images: []
    };
    
    console.log('Creating test pet with data:', testPetData);
    const pet = await Pet.create(testPetData);
    console.log('✅ Test pet created:', pet.id);
    
    res.json({ success: true, petId: pet.id });
  } catch (error) {
    console.error('❌ Test pet creation failed:', error.message);
    console.error('Error details:', error);
    res.status(500).json({ error: error.message, details: error });
  }
});

module.exports = router;
