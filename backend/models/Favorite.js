module.exports = (sequelize, DataTypes) => {
  const Favorite = sequelize.define('Favorite', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    pet_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'pets',
        key: 'id'
      }
    }
  }, {
    tableName: 'favorites',
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'pet_id']
      }
    ]
  });

  Favorite.associate = function(models) {
    Favorite.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    
    Favorite.belongsTo(models.Pet, {
      foreignKey: 'pet_id',
      as: 'pet'
    });
  };

  return Favorite;
};
