const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const { Document, Pet, User } = require('../models');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/documents');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow common document and image formats
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and image files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  }
});

// Upload document
router.post('/upload', authenticateToken, upload.single('document'), [
  body('pet_id').optional().isInt().withMessage('Pet ID must be an integer'),
  body('document_type').isIn([
    'vaccination_record',
    'health_certificate',
    'medical_history',
    'adoption_contract',
    'identification',
    'other'
  ]).withMessage('Invalid document type'),
  body('description').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Clean up uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { pet_id, document_type, description } = req.body;

    // If pet_id is provided, verify the pet exists and user has access
    if (pet_id) {
      const pet = await Pet.findByPk(pet_id);
      if (!pet) {
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ error: 'Pet not found' });
      }

      // Check if user can upload documents for this pet
      if (req.user.role !== 'admin' && pet.uploaded_by !== req.user.id) {
        fs.unlinkSync(req.file.path);
        return res.status(403).json({ 
          error: 'You can only upload documents for your own pets' 
        });
      }
    }

    // Create document record
    const document = await Document.create({
      pet_id: pet_id || null,
      user_id: req.user.id,
      file_name: req.file.originalname,
      file_path: req.file.path,
      file_size: req.file.size,
      mime_type: req.file.mimetype,
      document_type,
      description
    });

    // Fetch the created document with associations
    const createdDocument = await Document.findByPk(document.id, {
      include: [
        {
          model: Pet,
          as: 'pet',
          attributes: ['id', 'name', 'breed']
        },
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: createdDocument
    });

  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Upload document error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Get documents for a pet
router.get('/pet/:petId', authenticateToken, async (req, res) => {
  try {
    const { petId } = req.params;

    const pet = await Pet.findByPk(petId);
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    // Check access permissions
    if (req.user.role !== 'admin' && pet.uploaded_by !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const documents = await Document.findAll({
      where: { pet_id: petId },
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'verifier',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ documents });

  } catch (error) {
    console.error('Get pet documents error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Get user's documents
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check access permissions
    if (req.user.role !== 'admin' && req.user.id !== parseInt(userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const documents = await Document.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Pet,
          as: 'pet',
          attributes: ['id', 'name', 'breed']
        },
        {
          model: User,
          as: 'verifier',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ documents });

  } catch (error) {
    console.error('Get user documents error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Download document
router.get('/download/:id', authenticateToken, async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id, {
      include: [
        {
          model: Pet,
          as: 'pet'
        }
      ]
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check access permissions
    const canAccess = req.user.role === 'admin' || 
                     document.user_id === req.user.id ||
                     (document.pet && document.pet.uploaded_by === req.user.id);

    if (!canAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if file exists
    if (!fs.existsSync(document.file_path)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    res.download(document.file_path, document.file_name);

  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({ error: 'Failed to download document' });
  }
});

// Verify document (admin only)
router.put('/:id/verify', authenticateToken, requireAdmin, [
  body('is_verified').isBoolean().withMessage('Verification status must be boolean'),
  body('verification_notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { is_verified, verification_notes } = req.body;

    const document = await Document.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    await document.update({
      is_verified,
      verification_notes,
      verified_by: req.user.id,
      verified_at: is_verified ? new Date() : null
    });

    const updatedDocument = await Document.findByPk(document.id, {
      include: [
        {
          model: Pet,
          as: 'pet',
          attributes: ['id', 'name', 'breed']
        },
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'verifier',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.json({
      message: 'Document verification updated successfully',
      document: updatedDocument
    });

  } catch (error) {
    console.error('Verify document error:', error);
    res.status(500).json({ error: 'Failed to verify document' });
  }
});

// Delete document
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id, {
      include: [{ model: Pet, as: 'pet' }]
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check permissions
    const canDelete = req.user.role === 'admin' || 
                     document.user_id === req.user.id ||
                     (document.pet && document.pet.uploaded_by === req.user.id);

    if (!canDelete) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete file from filesystem
    if (fs.existsSync(document.file_path)) {
      fs.unlinkSync(document.file_path);
    }

    // Delete database record
    await document.destroy();

    res.json({ message: 'Document deleted successfully' });

  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// Get all documents (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      document_type,
      is_verified
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (document_type) where.document_type = document_type;
    if (is_verified !== undefined) where.is_verified = is_verified === 'true';

    const { count, rows: documents } = await Document.findAndCountAll({
      where,
      include: [
        {
          model: Pet,
          as: 'pet',
          attributes: ['id', 'name', 'breed']
        },
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'verifier',
          attributes: ['id', 'name', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      documents,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get all documents error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Get all documents for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const documents = await Document.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Pet,
          as: 'pet',
          attributes: ['id', 'name', 'breed']
        },
        {
          model: User,
          as: 'verifier',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ documents });

  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Delete document
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && document.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete file from filesystem
    if (fs.existsSync(document.file_path)) {
      fs.unlinkSync(document.file_path);
    }

    // Delete database record
    await document.destroy();

    res.json({ message: 'Document deleted successfully' });

  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

module.exports = router;
