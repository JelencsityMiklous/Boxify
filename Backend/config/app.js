require('dotenv').config();

const express = require('express');
const cors = require('cors');

const userRoutes = require('../routes/user.route');
const mailRoutes = require('../routes/mail.route');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/users', userRoutes);
app.use('/mail', mailRoutes);

module.exports = app;
