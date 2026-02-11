const {Sequelize} = require('sequelize');
const {Op} = require('sequelize');
const dbConfig = require('../config/database');

const sequelize = new Sequelize(
    dbConfig.database, 
    dbConfig.user, 
    dbConfig.password, 
    
    {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    port: dbConfig.port,
    logging: dbConfig.logging
});

const User = require('./user.model')(sequelize);

/*const Box = require('./box.model')(sequelize);*/

        const operatorMap ={
            eq: Op.eq,
            lt: Op.lt,
            gt: Op.gt,
            lte: Op.lte,
            gte: Op.gte,
            lk: Op.like,
            not: Op.not
        }


module.exports = {
    sequelize,
    User,
    /*Box,*/
    operatorMap
};