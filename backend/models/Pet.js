module.exports = (sequelize, DataTypes) => {
  const Pet = sequelize.define('Pet', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100]
      }
    },
    breed: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 30
      }
    },
    gender: {
      type: DataTypes.ENUM('male', 'female'),
      allowNull: false
    },
    size: {
      type: DataTypes.ENUM('small', 'medium', 'large'),
      allowNull: false
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    health_status: {
      type: DataTypes.ENUM('healthy', 'needs_care', 'recovering'),
      allowNull: false,
      defaultValue: 'healthy'
    },
    vaccination_status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    spayed_neutered: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    adoption_status: {
      type: DataTypes.ENUM('available', 'pending', 'adopted'),
      allowNull: false,
      defaultValue: 'available'
    },
    uploaded_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    adoption_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00
    },
    images: {
      type: DataTypes.TEXT('long'), // LONGTEXT for base64 images
      allowNull: true,
      defaultValue: null,
      get() {
        const value = this.getDataValue('images');
        if (!value) return [];
        try {
          return JSON.parse(value);
        } catch (error) {
          console.error('Error parsing images JSON:', error);
          return [];
        }
      },
      set(value) {
        if (Array.isArray(value)) {
          this.setDataValue('images', JSON.stringify(value));
        } else {
          this.setDataValue('images', null);
        }
      }
    },
    special_needs: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    good_with_kids: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    good_with_pets: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    energy_level: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'medium'
    }
  }, {
    tableName: 'pets'
  });

  Pet.associate = function(models) {
    Pet.belongsTo(models.User, {
      foreignKey: 'uploaded_by',
      as: 'uploader'
    });
    
    Pet.hasMany(models.Adoption, {
      foreignKey: 'pet_id',
      as: 'adoptions'
    });
    
    Pet.hasMany(models.Document, {
      foreignKey: 'pet_id',
      as: 'documents'
    });
    
    Pet.hasMany(models.Donation, {
      foreignKey: 'pet_id',
      as: 'donations'
    });
    
    Pet.hasMany(models.Favorite, {
      foreignKey: 'pet_id',
      as: 'favorites'
    });
    
    Pet.belongsToMany(models.User, {
      through: models.Favorite,
      foreignKey: 'pet_id',
      otherKey: 'user_id',
      as: 'favoritedBy'
    });
  };

  return Pet;
};
