const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AuthToken = sequelize.define('AuthToken', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('VERIFY_EMAIL', 'RESET_PASSWORD'),
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    usedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'auth_tokens',
    timestamps: true,
  });

  return AuthToken;
};
