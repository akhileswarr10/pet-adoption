const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
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
        len: [2, 100]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 255]
      }
    },
    role: {
      type: DataTypes.ENUM('user', 'shelter', 'admin'),
      allowNull: false,
      defaultValue: 'user'
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    profile_image: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'users',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      }
    }
  });

  User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    delete values.password;
    return values;
  };

  User.associate = function(models) {
    User.hasMany(models.Pet, {
      foreignKey: 'uploaded_by',
      as: 'pets'
    });
    
    User.hasMany(models.Adoption, {
      foreignKey: 'user_id',
      as: 'adoptions'
    });
    
    User.hasMany(models.Document, {
      foreignKey: 'user_id',
      as: 'documents'
    });
    
    User.hasMany(models.Donation, {
      foreignKey: 'shelter_id',
      as: 'donations'
    });
    
    User.hasMany(models.Favorite, {
      foreignKey: 'user_id',
      as: 'favorites'
    });
    
    User.belongsToMany(models.Pet, {
      through: models.Favorite,
      foreignKey: 'user_id',
      otherKey: 'pet_id',
      as: 'favoritePets'
    });
  };

  return User;
};
