const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { User, Pet, Adoption, Donation } = require('../models');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, requireAdmin, [
  query('role').optional().isIn(['user', 'shelter', 'admin']),
  query('is_active').optional().isBoolean(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
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
      role,
      is_active,
      page = 1,
      limit = 20,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (role) where.role = role;
    if (is_active !== undefined) where.is_active = is_active === 'true';

    // Search functionality
    if (search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create user (admin only)
router.post('/', authenticateToken, requireAdmin, [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['user', 'shelter', 'admin']).withMessage('Invalid role'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  body('address').optional().trim().isLength({ max: 500 }).withMessage('Address too long'),
  body('is_active').optional().isBoolean().withMessage('Status must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, email, password, role, phone, address, is_active } = req.body;

    // Check if user with email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create user with default password if not provided
    const userData = {
      name,
      email,
      password: password || 'defaultpassword123', // Default password
      role: role || 'user',
      phone,
      address,
      is_active: is_active !== undefined ? is_active : true
    };

    const user = await User.create(userData);

    // Return user without password
    const { password: _, ...userResponse } = user.toJSON();

    res.status(201).json({
      message: 'User created successfully',
      user: userResponse
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Get user by ID (admin only)
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Pet,
          as: 'pets',
          attributes: ['id', 'name', 'breed', 'adoption_status']
        },
        {
          model: Adoption,
          as: 'adoptions',
          attributes: ['id', 'status', 'created_at'],
          include: [
            {
              model: Pet,
              as: 'pet',
              attributes: ['id', 'name', 'breed']
            }
          ]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user (admin only)
router.put('/:id', authenticateToken, requireAdmin, [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('role').optional().isIn(['user', 'shelter', 'admin']),
  body('phone').optional().isMobilePhone(),
  body('address').optional().trim().isLength({ max: 500 }),
  body('is_active').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent admin from deactivating themselves
    if (req.body.is_active === false && user.id === req.user.id) {
      return res.status(400).json({ error: 'You cannot deactivate your own account' });
    }

    const allowedUpdates = ['name', 'email', 'role', 'phone', 'address', 'is_active'];
    const updateData = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    await user.update(updateData);

    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (user.id === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    // Check if user has active pets or adoptions
    const activePets = await Pet.count({
      where: {
        uploaded_by: user.id,
        adoption_status: ['available', 'pending']
      }
    });

    const pendingAdoptions = await Adoption.count({
      where: {
        user_id: user.id,
        status: 'pending'
      }
    });

    if (activePets > 0 || pendingAdoptions > 0) {
      return res.status(400).json({
        error: 'Cannot delete user with active pets or pending adoptions',
        details: {
          activePets,
          pendingAdoptions
        }
      });
    }

    await user.destroy();

    res.json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get user statistics (admin only)
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log(`📊 User stats request - User: ${req.user.name} (${req.user.role})`);
    
    const stats = await Promise.all([
      User.count({ where: { role: 'user', is_active: true } }),
      User.count({ where: { role: 'shelter', is_active: true } }),
      User.count({ where: { role: 'admin', is_active: true } }),
      User.count({ where: { is_active: false } })
    ]);

    const result = {
      activeUsers: stats[0],
      activeShelters: stats[1],
      activeAdmins: stats[2],
      inactiveUsers: stats[3],
      totalUsers: stats[0] + stats[1] + stats[2] + stats[3]
    };

    console.log('📊 User stats calculated:', result);
    res.json(result);

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

// Get shelters list (public endpoint for donation form)
router.get('/shelters/list', async (req, res) => {
  try {
    const shelters = await User.findAll({
      where: {
        role: 'shelter',
        is_active: true
      },
      attributes: ['id', 'name', 'email', 'phone', 'address'],
      order: [['name', 'ASC']]
    });

    res.json({ shelters });

  } catch (error) {
    console.error('Get shelters error:', error);
    res.status(500).json({ error: 'Failed to fetch shelters' });
  }
});

// Activate/Deactivate user (admin only)
router.patch('/:id/status', authenticateToken, requireAdmin, [
  body('is_active').isBoolean().withMessage('Status must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { is_active } = req.body;

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent admin from deactivating themselves
    if (!is_active && user.id === req.user.id) {
      return res.status(400).json({ error: 'You cannot deactivate your own account' });
    }

    await user.update({ is_active });

    res.json({
      message: `User ${is_active ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        is_active: user.is_active
      }
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

module.exports = router;
