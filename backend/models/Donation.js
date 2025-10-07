module.exports = (sequelize, DataTypes) => {
  const Donation = sequelize.define('Donation', {
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
    shelter_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    donor_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    donor_email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    donor_phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    donation_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    pet_background: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'completed'),
      allowNull: false,
      defaultValue: 'pending'
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    pickup_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    admin_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    processed_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    processed_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'donations'
  });

  Donation.associate = function(models) {
    Donation.belongsTo(models.Pet, {
      foreignKey: 'pet_id',
      as: 'pet'
    });
    
    Donation.belongsTo(models.User, {
      foreignKey: 'shelter_id',
      as: 'shelter'
    });
    
    Donation.belongsTo(models.User, {
      foreignKey: 'processed_by',
      as: 'processor'
    });
  };

  return Donation;
};
