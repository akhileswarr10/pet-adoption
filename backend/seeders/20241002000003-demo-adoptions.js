'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('adoptions', [
      {
        id: 1,
        pet_id: 3, // Max (German Shepherd)
        user_id: 4, // John Doe
        status: 'pending',
        application_message: 'I have experience with large dogs and would love to give Max a loving home. I have a large backyard and plenty of time for training and exercise.',
        contact_phone: '+1234567893',
        contact_address: '321 User Lane, City, State 12345',
        experience_with_pets: 'I have owned German Shepherds before and understand their needs for exercise and mental stimulation.',
        living_situation: 'I live in a house with a large fenced backyard. I work from home so I can provide plenty of attention.',
        other_pets: 'No other pets currently',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        pet_id: 1, // Buddy (Golden Retriever)
        user_id: 5, // Jane Smith
        status: 'approved',
        application_message: 'My family and I are looking for a friendly dog to join our household. We have two children who would love a playful companion.',
        admin_notes: 'Great family match. Approved after home visit.',
        approved_by: 1, // Admin User
        approved_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        contact_phone: '+1234567894',
        contact_address: '654 Adopter Street, City, State 12345',
        experience_with_pets: 'We had a Golden Retriever for 10 years until he passed away last year.',
        living_situation: 'Family home with children ages 8 and 12, large yard, suburban neighborhood.',
        other_pets: 'None currently',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: 3,
        pet_id: 2, // Luna (Siamese Cat)
        user_id: 4, // John Doe
        status: 'rejected',
        application_message: 'I would like to adopt Luna as I work from home and can provide constant companionship.',
        admin_notes: 'Applicant already has pending application for another pet.',
        rejection_reason: 'Multiple pending applications not allowed. Please complete current adoption process first.',
        approved_by: 1, // Admin User
        contact_phone: '+1234567893',
        contact_address: '321 User Lane, City, State 12345',
        experience_with_pets: 'Limited experience with cats but willing to learn.',
        living_situation: 'Apartment living, quiet environment.',
        other_pets: 'None',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('adoptions', null, {});
  }
};
