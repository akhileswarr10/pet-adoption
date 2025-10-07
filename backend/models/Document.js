module.exports = (sequelize, DataTypes) => {
  const Document = sequelize.define('Document', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    pet_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
    file_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    file_path: {
      type: DataTypes.STRING,
      allowNull: false
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    mime_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    document_type: {
      type: DataTypes.ENUM(
        'vaccination_record',
        'health_certificate',
        'medical_history',
        'adoption_contract',
        'identification',
        'other'
      ),
      allowNull: false,
      defaultValue: 'other'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verified_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    verified_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    verification_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'documents'
  });

  Document.associate = function(models) {
    Document.belongsTo(models.Pet, {
      foreignKey: 'pet_id',
      as: 'pet'
    });
    
    Document.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'uploader'
    });
    
    Document.belongsTo(models.User, {
      foreignKey: 'verified_by',
      as: 'verifier'
    });
  };

  return Document;
};
