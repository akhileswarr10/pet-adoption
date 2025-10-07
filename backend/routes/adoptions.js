const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { Adoption, Pet, User } = require('../models');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get adoption requests with filters
router.get('/', authenticateToken, [
  query('status').optional().isIn(['pending', 'approved', 'rejected', 'completed']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    console.log(`🔍 Adoptions request - User: ${req.user.name} (${req.user.role}), Status filter: ${req.query.status || 'all'}`);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
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

    // Apply role-based filtering
    // Regular users can only see their own adoption requests
    if (req.user.role === 'user') {
      where.user_id = req.user.id;
      console.log(`👤 User filter applied - showing only adoptions for user ${req.user.id}`);
    }

    // Build include with conditional filter for shelters
    const petInclude = {
      model: Pet,
      as: 'pet',
      attributes: ['id', 'name', 'breed', 'age', 'gender', 'size', 'images', 'uploaded_by', 'adoption_status'],
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'email', 'role']
        }
      ]
    };

    // Shelters can only see adoption requests for pets they uploaded
    // Admins can see all adoption requests (no filtering)
    if (req.user.role === 'shelter') {
      petInclude.where = { uploaded_by: req.user.id };
      petInclude.required = true;
      console.log(`🏠 Shelter filter applied - showing only adoptions for pets uploaded by shelter ${req.user.id}`);
    } else if (req.user.role === 'admin') {
      console.log(`👑 Admin access - showing all adoption requests`);
    }

    const { count, rows: adoptions } = await Adoption.findAndCountAll({
      where,
      include: [
        petInclude,
        {
          model: User,
          as: 'adopter',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'name', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    console.log(`📊 Found ${count} total adoptions, returning ${adoptions.length} for page ${page}`);

    res.json({
      adoptions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get adoptions error:', error);
    res.status(500).json({ error: 'Failed to fetch adoption requests' });
  }
});

// Get single adoption request
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const adoption = await Adoption.findByPk(req.params.id, {
      include: [
        {
          model: Pet,
          as: 'pet',
          include: [
            {
              model: User,
              as: 'uploader',
              attributes: ['id', 'name', 'email', 'role']
            }
          ]
        },
        {
          model: User,
          as: 'adopter',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!adoption) {
      return res.status(404).json({ error: 'Adoption request not found' });
    }

    // Check access permissions
    if (req.user.role === 'user' && adoption.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.user.role === 'shelter' && adoption.pet.uploaded_by !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ adoption });

  } catch (error) {
    console.error('Get adoption error:', error);
    res.status(500).json({ error: 'Failed to fetch adoption request' });
  }
});

// Create adoption request
router.post('/', authenticateToken, [
  body('pet_id').isInt().withMessage('Pet ID is required'),
  body('application_message').trim().notEmpty().withMessage('Application message is required'),
  body('contact_phone').optional().trim(),
  body('contact_address').optional().trim(),
  body('experience_with_pets').optional().trim(),
  body('living_situation').optional().trim(),
  body('other_pets').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { pet_id } = req.body;

    // Check if pet exists and is available
    const pet = await Pet.findByPk(pet_id);
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    if (pet.adoption_status !== 'available') {
      return res.status(400).json({ error: 'Pet is not available for adoption' });
    }

    // Check if user already has a pending request for this pet
    const existingRequest = await Adoption.findOne({
      where: {
        pet_id,
        user_id: req.user.id,
        status: 'pending'
      }
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'You already have a pending adoption request for this pet' });
    }

    // Create adoption request
    const adoption = await Adoption.create({
      ...req.body,
      user_id: req.user.id,
      status: 'pending'
    });

    // Update pet status to pending
    await pet.update({ adoption_status: 'pending' });

    // Fetch the created adoption with associations
    const createdAdoption = await Adoption.findByPk(adoption.id, {
      include: [
        {
          model: Pet,
          as: 'pet'
        },
        {
          model: User,
          as: 'adopter',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ]
    });

    res.status(201).json({
      message: 'Adoption request submitted successfully',
      adoption: createdAdoption
    });

  } catch (error) {
    console.error('Create adoption error:', error);
    res.status(500).json({ error: 'Failed to create adoption request' });
  }
});

// Update adoption status (admin or shelter who owns the pet)
router.put('/:id', authenticateToken, [
  body('status').isIn(['pending', 'approved', 'rejected', 'completed']),
  body('admin_notes').optional().trim(),
  body('rejection_reason').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { status, admin_notes, rejection_reason } = req.body;

    const adoption = await Adoption.findByPk(req.params.id, {
      include: [{ model: Pet, as: 'pet', attributes: ['id', 'uploaded_by', 'adoption_status'] }]
    });

    if (!adoption) {
      return res.status(404).json({ error: 'Adoption request not found' });
    }

    // Authorization: admin or shelter who owns the pet
    if (req.user.role !== 'admin') {
      const pet = adoption.pet;
      if (!pet || pet.uploaded_by !== req.user.id) {
        return res.status(403).json({ error: 'You can only manage adoptions for your own pets' });
      }
    }

    const updateData = {
      status,
      admin_notes,
      approved_by: req.user.id
    };

    if (status === 'approved') {
      updateData.approved_at = new Date();
      // Update pet status to adopted
      await adoption.pet.update({ adoption_status: 'adopted' });
    } else if (status === 'rejected') {
      updateData.rejection_reason = rejection_reason;
      // Make pet available again
      await adoption.pet.update({ adoption_status: 'available' });
    } else if (status === 'completed') {
      updateData.completed_at = new Date();
    } else if (status === 'pending') {
      // Make pet pending again
      await adoption.pet.update({ adoption_status: 'pending' });
    }

    await adoption.update(updateData);

    // Fetch updated adoption with associations
    const updatedAdoption = await Adoption.findByPk(adoption.id, {
      include: [
        {
          model: Pet,
          as: 'pet'
        },
        {
          model: User,
          as: 'adopter',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.json({
      message: 'Adoption status updated successfully',
      adoption: updatedAdoption
    });

  } catch (error) {
    console.error('Update adoption error:', error);
    res.status(500).json({ error: 'Failed to update adoption status' });
  }
});

// Delete adoption request (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const adoption = await Adoption.findByPk(req.params.id, {
      include: [{ model: Pet, as: 'pet' }]
    });

    if (!adoption) {
      return res.status(404).json({ error: 'Adoption request not found' });
    }

    // If adoption was pending, make pet available again
    if (adoption.status === 'pending' && adoption.pet) {
      await adoption.pet.update({ adoption_status: 'available' });
    }

    await adoption.destroy();

    res.json({ message: 'Adoption request deleted successfully' });

  } catch (error) {
    console.error('Delete adoption error:', error);
    res.status(500).json({ error: 'Failed to delete adoption request' });
  }
});

// Get adoption statistics (admin only)
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log(`📊 Adoption stats request - User: ${req.user.name} (${req.user.role})`);
    const { Op } = require('sequelize');
    
    // Current month date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const stats = await Promise.all([
      Adoption.count({ where: { status: 'pending' } }),
      Adoption.count({ where: { status: 'approved' } }),
      Adoption.count({ where: { status: 'completed' } }),
      Adoption.count({ where: { status: 'rejected' } }),
      Adoption.count({
        where: {
          created_at: {
            [Op.between]: [startOfMonth, endOfMonth]
          }
        }
      })
    ]);

    const totalAdoptions = stats[0] + stats[1] + stats[2] + stats[3];

    const result = {
      pending: stats[0],
      approved: stats[1],
      completed: stats[2],
      rejected: stats[3],
      total: totalAdoptions,
      thisMonth: stats[4]
    };

    console.log('📊 Adoption stats calculated:', result);
    res.json(result);

  } catch (error) {
    console.error('Get adoption stats error:', error);
    res.status(500).json({ error: 'Failed to fetch adoption statistics' });
  }
});

module.exports = router;
