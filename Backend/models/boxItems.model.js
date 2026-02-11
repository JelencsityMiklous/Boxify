const {DataTypes} = require('sequelize');
const bcrypt = require('bcrypt')
const {v4: uuid4} = require('uuid');

module.exports = (sequelize) => {
    const BoxItems = sequelize.define('box_items', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },

        boxId: {
            type: DataTypes.UUID,
            allowNull: false,
            foreignKey: true
        },
        itemId: {
            type: DataTypes.UUID,
            allowNull: false,
            foreignKey: true
        },

        quantity:{
            type: DataTypes.INTEGER,
            defaultValue: 1,
            allowNull: false,
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
    BoxItems.prototype.comparePassword = async function (password) {
        return await bcrypt.compare(password, this.getDataValue('password'));
    };

    return BoxItems;
};
