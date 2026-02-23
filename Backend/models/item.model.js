const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Item = sequelize.define('items', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        category: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        lengthCm: {
            type: DataTypes.DECIMAL,
            allowNull: false
        },
        widthCm: {
            type: DataTypes.DECIMAL,
            allowNull: false
        },
        heightCm: {
            type: DataTypes.DECIMAL,
            allowNull: false
        },
        weightKg: {
            type: DataTypes.DECIMAL,
            allowNull: false
        },
        imagePath: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        note: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
    }, {
        timestamps: true,
    });

    return Item;
};