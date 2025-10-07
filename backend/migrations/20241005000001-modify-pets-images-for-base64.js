'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Modify the images column to store base64 data as LONGTEXT
    await queryInterface.changeColumn('pets', 'images', {
      type: Sequelize.TEXT('long'), // LONGTEXT for large base64 strings
      allowNull: true,
      defaultValue: null,
      comment: 'Base64 encoded images stored as JSON array'
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert back to JSON type
    await queryInterface.changeColumn('pets', 'images', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: null
    });
  }
};
