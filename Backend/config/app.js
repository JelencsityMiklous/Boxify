require('dotenv').config();

const express = require('express');
const cors = require('cors');

const userRoutes = require('../routes/auth.route');
const mailRoutes = require('../routes/auth.route');
const boxRoutes = require('../routes/boxes.route');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/users', userRoutes);
app.use('/mail', mailRoutes);
app.use('/boxes', boxRoutes);

module.exports = app;
