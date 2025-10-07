const express = require('express');
const { Favorite, Pet, User } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user's favorite pets
router.get('/', authenticateToken, async (req, res) => {
  try {
    const favorites = await Favorite.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Pet,
          as: 'pet',
          include: [
            {
              model: User,
              as: 'uploader',
              attributes: ['id', 'name', 'role']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const favoritePets = favorites.map(fav => ({
      favoriteId: fav.id,
      favoritedAt: fav.created_at,
      ...fav.pet.toJSON()
    }));

    res.json({
      message: 'Favorites retrieved successfully',
      favorites: favoritePets,
      count: favoritePets.length
    });

  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Failed to retrieve favorites' });
  }
});

// Add pet to favorites
router.post('/:petId', authenticateToken, async (req, res) => {
  try {
    const { petId } = req.params;
    const userId = req.user.id;

    // Check if pet exists
    const pet = await Pet.findByPk(petId);
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
      where: { user_id: userId, pet_id: petId }
    });

    if (existingFavorite) {
      return res.status(400).json({ error: 'Pet is already in favorites' });
    }

    // Create favorite
    const favorite = await Favorite.create({
      user_id: userId,
      pet_id: petId
    });

    // Get the created favorite with pet details
    const createdFavorite = await Favorite.findByPk(favorite.id, {
      include: [
        {
          model: Pet,
          as: 'pet',
          include: [
            {
              model: User,
              as: 'uploader',
              attributes: ['id', 'name', 'role']
            }
          ]
        }
      ]
    });

    res.status(201).json({
      message: 'Pet added to favorites successfully',
      favorite: {
        favoriteId: createdFavorite.id,
        favoritedAt: createdFavorite.created_at,
        ...createdFavorite.pet.toJSON()
      }
    });

  } catch (error) {
    console.error('Add favorite error:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Pet is already in favorites' });
    }
    
    res.status(500).json({ error: 'Failed to add pet to favorites' });
  }
});

// Remove pet from favorites
router.delete('/:petId', authenticateToken, async (req, res) => {
  try {
    const { petId } = req.params;
    const userId = req.user.id;

    const favorite = await Favorite.findOne({
      where: { user_id: userId, pet_id: petId }
    });

    if (!favorite) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    await favorite.destroy();

    res.json({
      message: 'Pet removed from favorites successfully'
    });

  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Failed to remove pet from favorites' });
  }
});

// Check if pet is favorited by user
router.get('/check/:petId', authenticateToken, async (req, res) => {
  try {
    const { petId } = req.params;
    const userId = req.user.id;

    const favorite = await Favorite.findOne({
      where: { user_id: userId, pet_id: petId }
    });

    res.json({
      isFavorited: !!favorite,
      favoriteId: favorite?.id || null
    });

  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ error: 'Failed to check favorite status' });
  }
});

// Get favorites statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const totalFavorites = await Favorite.count({
      where: { user_id: userId }
    });

    const availableFavorites = await Favorite.count({
      where: { user_id: userId },
      include: [
        {
          model: Pet,
          as: 'pet',
          where: { adoption_status: 'available' }
        }
      ]
    });

    const adoptedFavorites = await Favorite.count({
      where: { user_id: userId },
      include: [
        {
          model: Pet,
          as: 'pet',
          where: { adoption_status: 'adopted' }
        }
      ]
    });

    res.json({
      total: totalFavorites,
      available: availableFavorites,
      adopted: adoptedFavorites,
      pending: totalFavorites - availableFavorites - adoptedFavorites
    });

  } catch (error) {
    console.error('Get favorites stats error:', error);
    res.status(500).json({ error: 'Failed to get favorites statistics' });
  }
});

module.exports = router;
