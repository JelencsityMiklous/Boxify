const app = require('./config/app');
const {sequelize} = require('./models/index');

const PORT = process.env.PORT;

(async () =>{
try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    sequelize.sync({alter:true});

    app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

});
} catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
}

})();