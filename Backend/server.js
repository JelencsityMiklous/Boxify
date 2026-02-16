require('dotenv').config();

const app = require('./config/app');
const { sequelize } = require('./models');

const PORT = Number(process.env.PORT || 3000);

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');


    await sequelize.sync({ alter: true });

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
})();
