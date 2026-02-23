const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const { v4: uuid4 } = require('uuid');

module.exports = (sequelize) => {
    const User = sequelize.define('users', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        role: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'user'
        },
        secret: {
            type: DataTypes.UUID,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
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
        lastLoginAt: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        timestamps: true,
        hooks: {
            beforeCreate: async (user) => {
                user.password = await bcrypt.hash(user.password, 10);
            },
            beforeUpdate: async (user) => {
                if (user.changed('password')) {
                    user.password = await bcrypt.hash(user.password, 10);
                    user.secret = uuid4();
                }
            }
        },
        defaultScope: {
            attributes: { exclude: ['password', 'secret'] }
        },
        scopes: {
            withPassword: {
                attributes: { exclude: [] }  // minden mező visszajön, jelszóval együtt
            }
        }
    });

    User.prototype.comparePassword = async function (password) {
        return await bcrypt.compare(password, this.getDataValue('password'));
    };

    return User;
};