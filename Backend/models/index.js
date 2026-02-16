const sequelize = require('../config/database');

const User = require('./user.model')(sequelize);
const Box = require('./box.model')(sequelize);
const Item = require('./item.model')(sequelize);
const BoxItem = require('./boxItem.model')(sequelize);
const AuthToken = require('./authToken.model')(sequelize);

// asszociációk
User.hasMany(Box, { foreignKey: 'userId' });
Box.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Item, { foreignKey: 'userId' });
Item.belongsTo(User, { foreignKey: 'userId' });

Box.belongsToMany(Item, { through: BoxItem, foreignKey: 'boxId', otherKey: 'itemId' });
Item.belongsToMany(Box, { through: BoxItem, foreignKey: 'itemId', otherKey: 'boxId' });

Box.hasMany(BoxItem, { foreignKey: 'boxId' });
BoxItem.belongsTo(Box, { foreignKey: 'boxId' });

Item.hasMany(BoxItem, { foreignKey: 'itemId' });
BoxItem.belongsTo(Item, { foreignKey: 'itemId' });

User.hasMany(AuthToken, { foreignKey: 'userId' });
AuthToken.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Box,
  Item,
  BoxItem,
  AuthToken,
};
