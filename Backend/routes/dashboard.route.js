const express = require('express');
const router = express.Router();
const { Box, Item, BoxItems } = require('../models');
const { Sequelize } = require('sequelize');

router.get('/overview', async (req, res) => {
  try {

    const totalBoxes = await Box.count();
    const totalItems = await Item.count();

    // Foglalt súly (összes item súly * quantity)
    const usedWeight = await BoxItems.findAll({
      attributes: [
        [Sequelize.fn('SUM', Sequelize.literal('quantity * items.weightKg')), 'totalWeight']
      ],
      include: [{ model: Item, attributes: [] }],
      raw: true
    });

    const totalWeight = usedWeight[0]?.totalWeight || 0;

    // Kategória bontás
    const categories = await Item.findAll({
      attributes: [
        'category',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['category'],
      raw: true
    });

    res.json({
      totalBoxes,
      totalItems,
      totalWeight,
      categories
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

module.exports = router;