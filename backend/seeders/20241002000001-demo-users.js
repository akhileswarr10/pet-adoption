'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('password123', 12);

    await queryInterface.bulkInsert('users', [
      {
        id: 1,
        name: 'Admin User',
        email: 'admin@petadoption.com',
        password: hashedPassword,
        role: 'admin',
        phone: '+1234567890',
        address: '123 Admin Street, City, State 12345',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        name: 'Happy Paws Shelter',
        email: 'shelter@happypaws.com',
        password: hashedPassword,
        role: 'shelter',
        phone: '+1234567891',
        address: '456 Shelter Avenue, City, State 12345',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        name: 'Loving Hearts Animal Rescue',
        email: 'contact@lovinghearts.org',
        password: hashedPassword,
        role: 'shelter',
        phone: '+1234567892',
        address: '789 Rescue Road, City, State 12345',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 4,
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
        role: 'user',
        phone: '+1234567893',
        address: '321 User Lane, City, State 12345',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 5,
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: hashedPassword,
        role: 'user',
        phone: '+1234567894',
        address: '654 Adopter Street, City, State 12345',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 6,
        name: 'Pet Paradise Shelter',
        email: 'info@petparadise.com',
        password: hashedPassword,
        role: 'shelter',
        phone: '+1234567895',
        address: '987 Paradise Blvd, City, State 12345',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
