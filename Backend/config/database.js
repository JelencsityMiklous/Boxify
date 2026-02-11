require('dotenv').config();

module.exports = {
    host:process.env.DBHOST,
    user:process.env.DBUSER,
    password:process.env.DBPASS,
    database:process.env.DBNAME,
    dialect:'mysql',
    logging:console.log
}