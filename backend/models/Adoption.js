module.exports = (sequelize, DataTypes) => {
  const Adoption = sequelize.define('Adoption', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    pet_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'pets',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'completed'),
      allowNull: false,
      defaultValue: 'pending'
    },
    application_message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    admin_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    approved_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    contact_phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    contact_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    experience_with_pets: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    living_situation: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    other_pets: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'adoptions'
  });

  Adoption.associate = function(models) {
    Adoption.belongsTo(models.Pet, {
      foreignKey: 'pet_id',
      as: 'pet'
    });
    
    Adoption.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'adopter'
    });
    
    Adoption.belongsTo(models.User, {
      foreignKey: 'approved_by',
      as: 'approver'
    });
  };

  return Adoption;
};
