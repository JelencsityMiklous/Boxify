const path = require('path');
const express = require('express');
const cors = require('cors');

require('dotenv').config();

const app = express();

// middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '2mb' }));

// Static uploads (item images, labels, etc.)
const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadDir));

// routes


app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/users', require('../routes/user.route'));
app.use('/api/auth', require('../routes/auth.route'));
app.use('/api/boxes', require('../routes/box.route'));
app.use('/api/items', require('../routes/item.route'));
app.use('/api/packing', require('../routes/packing.route'));
app.use('/api/search', require('../routes/search.route'));
app.use('/api/dashboard', require('../routes/dashboard.route'));

// --- 404
app.use((_req, res) => res.status(404).json({ error: 'NOT_FOUND' }));


app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.code || 'INTERNAL_ERROR',
    message: err.message || 'Unexpected error',
    details: err.details,
  });
});

module.exports = app;
