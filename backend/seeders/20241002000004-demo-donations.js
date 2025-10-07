'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('donations', [
      {
        id: 1,
        pet_id: 4, // Bella (Labrador Mix)
        shelter_id: 6, // Pet Paradise Shelter
        donor_name: 'Sarah Johnson',
        donor_email: 'sarah.johnson@email.com',
        donor_phone: '+1234567896',
        donation_reason: 'Moving to apartment that doesn\'t allow pets',
        pet_background: 'Bella has been with our family since she was 8 weeks old. She is house trained and knows basic commands. Very friendly with children.',
        status: 'completed',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        pickup_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        notes: 'Please find her a loving family with children',
        admin_notes: 'Healthy puppy, all documentation provided',
        processed_by: 1, // Admin User
        processed_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        id: 2,
        pet_id: 6, // Rocky (Bulldog)
        shelter_id: 2, // Happy Paws Shelter
        donor_name: 'Michael Brown',
        donor_email: 'mike.brown@email.com',
        donor_phone: '+1234567897',
        donation_reason: 'Unable to care for senior dog due to work commitments',
        pet_background: 'Rocky is 6 years old and has been a wonderful companion. He has some arthritis but is otherwise healthy. Very gentle with everyone.',
        status: 'accepted',
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        pickup_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        notes: 'Rocky needs his arthritis medication twice daily',
        admin_notes: 'Senior dog with medical needs, suitable for experienced adopters',
        processed_by: 1, // Admin User
        processed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        id: 3,
        pet_id: 7, // Mia (Border Collie)
        shelter_id: 6, // Pet Paradise Shelter
        donor_name: 'Lisa Wilson',
        donor_email: 'lisa.wilson@email.com',
        donor_phone: '+1234567898',
        donation_reason: 'Family emergency requires relocation',
        pet_background: 'Mia is very intelligent and active. She knows many tricks and needs mental stimulation. Great with other dogs.',
        status: 'pending',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        notes: 'Mia needs an active family who can provide mental stimulation',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('donations', null, {});
  }
};
