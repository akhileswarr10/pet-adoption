'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      breed: {
        type: Sequelize.STRING,
        allowNull: false
      },
      age: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      gender: {
        type: Sequelize.ENUM('male', 'female'),
        allowNull: false
      },
      size: {
        type: Sequelize.ENUM('small', 'medium', 'large'),
        allowNull: false
      },
      color: {
        type: Sequelize.STRING,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      health_status: {
        type: Sequelize.ENUM('healthy', 'needs_care', 'recovering'),
        allowNull: false,
        defaultValue: 'healthy'
      },
      vaccination_status: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      spayed_neutered: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      adoption_status: {
        type: Sequelize.ENUM('available', 'pending', 'adopted'),
        allowNull: false,
        defaultValue: 'available'
      },
      uploaded_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      adoption_fee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00
      },
      images: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: '[]'
      },
      special_needs: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      good_with_kids: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      good_with_pets: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      energy_level: {
        type: Sequelize.ENUM('low', 'medium', 'high'),
        defaultValue: 'medium'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('pets', ['adoption_status']);
    await queryInterface.addIndex('pets', ['breed']);
    await queryInterface.addIndex('pets', ['age']);
    await queryInterface.addIndex('pets', ['uploaded_by']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('pets');
  }
};
