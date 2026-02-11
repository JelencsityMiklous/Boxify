const {DataTypes} = require('sequelize');
const bcrypt = require('bcrypt')
const {v4: uuid4} = require('uuid');

module.exports = (sequelize) => {
    const Items = sequelize.define('items', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },

        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            foreignKey: true
        },

        name:{
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

        WeightKg: {
            type: DataTypes.DECIMAL,
            allowNull: false
        },
        imagePath: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        note: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },

        /*
        secret: {
            type: DataTypes.UUID,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4
        },*/

        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        

    },
    {
        timestamps: true,
        
        /*hooks: {

            beforeCreate: async (box, options) => {
                box.password = await bcrypt.hash(box.password, 10);
            },
            beforeUpdate: async (box) => {
                if (box.changed('password')) {
                    box.password = await bcrypt.hash(box.password, 10);
                    box.secret = uuid4();
                }
            }
        },
        
        defaultScope: {
            attributes: { exclude: ['password', 'secret'] }
        },
        scopes: {
            withPassword: {
                attributes: { include: ['password', 'secret'] }
            }
        }
            */

    });

    // add instance method after model initialization
    Items.prototype.comparePassword = async function (password) {
        return await bcrypt.compare(password, this.getDataValue('password'));
    };

    return Items;
};
