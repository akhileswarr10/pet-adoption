const express = require('express');
const multer = require('multer');
const { body, query, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Pet, User, Document, Adoption } = require('../models');
const { authenticateToken, requireShelterOrAdmin, requireAdmin, optionalAuth } = require('../middleware/auth');

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
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5 // Maximum 5 files
  }
});

// Helper function to convert buffer to base64 data URL
const bufferToBase64DataURL = (buffer, mimetype) => {
  const base64 = buffer.toString('base64');
  return `data:${mimetype};base64,${base64}`;
};

// Get all pets with filters and pagination
router.get('/', optionalAuth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('breed').optional().trim(),
  query('age_min').optional().isInt({ min: 0 }).withMessage('Minimum age must be non-negative'),
  query('age_max').optional().isInt({ min: 0 }).withMessage('Maximum age must be non-negative'),
  query('gender').optional().isIn(['male', 'female']).withMessage('Gender must be male or female'),
  query('size').optional().isIn(['small', 'medium', 'large']).withMessage('Size must be small, medium, or large'),
  query('health_status').optional().isIn(['healthy', 'needs_care', 'recovering']),
  query('adoption_status').optional().isIn(['available', 'pending', 'adopted']),
  query('good_with_kids').optional().isBoolean(),
  query('good_with_pets').optional().isBoolean(),
  query('energy_level').optional().isIn(['low', 'medium', 'high']),
  query('search').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      page = 1,
      limit = 12,
      breed,
      age_min,
      age_max,
      gender,
      size,
      health_status,
      adoption_status = 'available',
      good_with_kids,
      good_with_pets,
      energy_level,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Apply filters
    if (breed) where.breed = { [Op.iLike]: `%${breed}%` };
    if (age_min) where.age = { ...where.age, [Op.gte]: age_min };
    if (age_max) where.age = { ...where.age, [Op.lte]: age_max };
    if (gender) where.gender = gender;
    if (size) where.size = size;
    if (health_status) where.health_status = health_status;
    if (adoption_status) where.adoption_status = adoption_status;
    if (good_with_kids !== undefined) where.good_with_kids = good_with_kids === 'true';
    if (good_with_pets !== undefined) where.good_with_pets = good_with_pets === 'true';
    if (energy_level) where.energy_level = energy_level;

    // Search functionality
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { breed: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: pets } = await Pet.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'email', 'role']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      pets,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get pets error:', error);
    res.status(500).json({ error: 'Failed to fetch pets' });
  }
});

// Get single pet by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const pet = await Pet.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'email', 'role', 'phone']
        },
        {
          model: Document,
          as: 'documents',
          attributes: ['id', 'file_name', 'document_type', 'is_verified']
        }
      ]
    });

    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    res.json({ pet });

  } catch (error) {
    console.error('Get pet error:', error);
    res.status(500).json({ error: 'Failed to fetch pet' });
  }
});

// Create new pet (shelter/admin only)
router.post('/', authenticateToken, requireShelterOrAdmin, upload.array('images', 5), [
  body('name').trim().notEmpty().withMessage('Pet name is required'),
  body('breed').trim().notEmpty().withMessage('Breed is required'),
  body('age').isInt({ min: 0, max: 30 }).withMessage('Age must be between 0 and 30'),
  body('gender').isIn(['male', 'female']).withMessage('Gender must be male or female'),
  body('size').isIn(['small', 'medium', 'large']).withMessage('Size must be small, medium, or large'),
  body('color').optional().trim(),
  body('description').optional().trim(),
  body('health_status').optional().isIn(['healthy', 'needs_care', 'recovering']),
  body('vaccination_status').optional().isBoolean(),
  body('spayed_neutered').optional().isBoolean(),
  body('adoption_fee').optional().isDecimal().withMessage('Adoption fee must be a valid decimal'),
  body('special_needs').optional().trim(),
  body('good_with_kids').optional().isBoolean(),
  body('good_with_pets').optional().isBoolean(),
  body('energy_level').optional().isIn(['low', 'medium', 'high'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    // Process uploaded images and convert to base64
    const imageBase64Array = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const base64DataURL = bufferToBase64DataURL(file.buffer, file.mimetype);
        imageBase64Array.push(base64DataURL);
      });
    }

    const petData = {
      ...req.body,
      uploaded_by: req.user.id,
      images: imageBase64Array
    };

    const pet = await Pet.create(petData);

    // Fetch the created pet with associations
    const createdPet = await Pet.findByPk(pet.id, {
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'email', 'role']
        }
      ]
    });

    res.status(201).json({
      message: 'Pet added successfully',
      pet: createdPet
    });

  } catch (error) {
    console.error('Create pet error:', error);
    res.status(500).json({ error: 'Failed to create pet' });
  }
});

// Update pet
router.put('/:id', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    const pet = await Pet.findByPk(req.params.id);
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    // Check ownership or admin role
    if (req.user.role !== 'admin' && pet.uploaded_by !== req.user.id) {
      return res.status(403).json({ error: 'You can only update your own pets' });
    }

    const allowedUpdates = [
      'name', 'breed', 'age', 'gender', 'size', 'color', 'description',
      'health_status', 'vaccination_status', 'spayed_neutered',
      'adoption_fee', 'special_needs', 'good_with_kids', 'good_with_pets',
      'energy_level', 'images'
    ];

    // Admin can also update adoption_status
    if (req.user.role === 'admin') {
      allowedUpdates.push('adoption_status');
    }

    const updateData = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Process uploaded images if any
    if (req.files && req.files.length > 0) {
      const imageBase64Array = [];
      req.files.forEach(file => {
        const base64DataURL = bufferToBase64DataURL(file.buffer, file.mimetype);
        imageBase64Array.push(base64DataURL);
      });
      updateData.images = imageBase64Array;
    }

    await pet.update(updateData);

    const updatedPet = await Pet.findByPk(pet.id, {
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'email', 'role']
        }
      ]
    });

    res.json({
      message: 'Pet updated successfully',
      pet: updatedPet
    });

  } catch (error) {
    console.error('Update pet error:', error);
    res.status(500).json({ error: 'Failed to update pet' });
  }
});

// Delete pet
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const pet = await Pet.findByPk(req.params.id);
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    // Check ownership or admin role
    if (req.user.role !== 'admin' && pet.uploaded_by !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own pets' });
    }

    // Check if pet has pending adoptions
    const pendingAdoptions = await Adoption.count({
      where: {
        pet_id: pet.id,
        status: 'pending'
      }
    });

    if (pendingAdoptions > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete pet with pending adoption requests' 
      });
    }

    await pet.destroy();

    res.json({ message: 'Pet deleted successfully' });

  } catch (error) {
    console.error('Delete pet error:', error);
    res.status(500).json({ error: 'Failed to delete pet' });
  }
});

// Get pets by shelter/user
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user can access this data
    if (req.user.role !== 'admin' && req.user.id !== parseInt(userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const pets = await Pet.findAll({
      where: { uploaded_by: userId },
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'email', 'role']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ pets });

  } catch (error) {
    console.error('Get user pets error:', error);
    res.status(500).json({ error: 'Failed to fetch user pets' });
  }
});

// Get pet statistics (admin only)
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log(`📊 Pet stats request - User: ${req.user.name} (${req.user.role})`);
    const { Op } = require('sequelize');
    
    const stats = await Promise.all([
      Pet.count(), // Total pets
      Pet.count({ where: { adoption_status: 'available' } }), // Available pets
      Pet.count({ where: { adoption_status: 'pending' } }), // Pending adoption
      Pet.count({ where: { adoption_status: 'adopted' } }), // Adopted pets
      Pet.count({ 
        where: { 
          created_at: {
            [Op.gte]: new Date(new Date().setDate(new Date().getDate() - 30))
          }
        }
      }), // Pets added in last 30 days
      Pet.findAll({
        attributes: ['breed', [Pet.sequelize.fn('COUNT', Pet.sequelize.col('breed')), 'count']],
        group: ['breed'],
        order: [[Pet.sequelize.fn('COUNT', Pet.sequelize.col('breed')), 'DESC']],
        limit: 5
      }) // Top 5 breeds
    ]);

    const [total, available, pending, adopted, thisMonth, topBreeds] = stats;

    const result = {
      total,
      available,
      pending,
      adopted,
      thisMonth,
      topBreeds: topBreeds.map(breed => ({
        name: breed.breed,
        count: parseInt(breed.dataValues.count)
      }))
    };

    console.log(`📊 Pet stats calculated:`, result);
    res.json(result);

  } catch (error) {
    console.error('Pet stats error:', error);
    res.status(500).json({ error: 'Failed to fetch pet statistics' });
  }
});

module.exports = router;
