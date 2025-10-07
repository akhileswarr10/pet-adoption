'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Get existing users and pets to create realistic favorites
    const users = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE role = 'user'",
      { type: Sequelize.QueryTypes.SELECT }
    );

    const pets = await queryInterface.sequelize.query(
      "SELECT id FROM pets LIMIT 6",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (users.length === 0 || pets.length === 0) {
      console.log('No users or pets found, skipping favorites seeding');
      return;
    }

    const favorites = [];
    const now = new Date();

    // Create some demo favorites
    // User 1 favorites (first user)
    if (users[0] && pets.length >= 3) {
      favorites.push(
        {
          user_id: users[0].id,
          pet_id: pets[0].id,
          created_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          updated_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        },
        {
          user_id: users[0].id,
          pet_id: pets[1].id,
          created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          updated_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
        },
        {
          user_id: users[0].id,
          pet_id: pets[2].id,
          created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          updated_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
        }
      );
    }

    // User 2 favorites (second user if exists)
    if (users[1] && pets.length >= 5) {
      favorites.push(
        {
          user_id: users[1].id,
          pet_id: pets[3].id,
          created_at: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
          updated_at: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000)
        },
        {
          user_id: users[1].id,
          pet_id: pets[4].id,
          created_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          updated_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
        }
      );
    }

    // Add some cross-favorites (users liking same pets)
    if (users.length >= 2 && pets.length >= 1) {
      favorites.push({
        user_id: users[1].id,
        pet_id: pets[0].id, // Same pet as user 1's first favorite
        created_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        updated_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000)
      });
    }

    if (favorites.length > 0) {
      await queryInterface.bulkInsert('favorites', favorites, {});
      console.log(`✅ Seeded ${favorites.length} demo favorites`);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('favorites', null, {});
  }
};
