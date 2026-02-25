const express = require('express');
const router = express.Router();
const { sequelize, Box, Item } = require('../models');

router.get('/overview', async (req, res) => {
  try {


    const totalBoxes = await Box.count(/* { where: { userId } } */);
    const totalItems = await Item.count(/* { where: { userId } } */);

    // kategóriák
    const [cats] = await sequelize.query(`
      SELECT COALESCE(category, 'Egyéb') AS name, COUNT(*) AS count
      FROM items
      /* WHERE userId = :userId */
      GROUP BY COALESCE(category, 'Egyéb')
      ORDER BY count DESC
    `/*, { replacements: { userId } } */);

    // dobozonként használt térfogat/súly + telítettség
    const [rows] = await sequelize.query(`
      SELECT
        b.id,
        b.code,
        (b.lengthCm * b.widthCm * b.heightCm) AS boxVolume,
        b.maxWeightKg AS boxMaxWeight,

        COALESCE(SUM(bi.quantity * i.lengthCm * i.widthCm * i.heightCm), 0) AS usedVolume,
        COALESCE(SUM(bi.quantity * i.weightKg), 0) AS usedWeight
      FROM boxes b
      LEFT JOIN box_items bi ON bi.boxId = b.id
      LEFT JOIN items i ON i.id = bi.itemId
      /* WHERE b.userId = :userId */
      GROUP BY b.id
    `/*, { replacements: { userId } } */);

    const topBoxes = rows
      .map(r => {
        const boxVolume = Number(r.boxVolume || 0);
        const usedVolume = Number(r.usedVolume || 0);

        const pct = boxVolume > 0 ? (usedVolume / boxVolume) * 100 : 0;
        const volumeFillPercent = Math.max(0, Math.min(100, Math.round(pct)));

        return {
          box: { name: r.code, code: r.code },
          fill: { volumeFillPercent }
        };
      })
      .sort((a, b) => b.fill.volumeFillPercent - a.fill.volumeFillPercent)
      .slice(0, 3);

    // összesített súly/statok
    const totalUsedWeight = rows.reduce((s, r) => s + Number(r.usedWeight || 0), 0);
    const totalMaxWeight  = rows.reduce((s, r) => s + Number(r.boxMaxWeight || 0), 0);

    const avgVolumeFill =
      rows.length > 0
        ? Math.round(rows.reduce((s, r) => {
            const bv = Number(r.boxVolume || 0);
            const uv = Number(r.usedVolume || 0);
            return s + (bv > 0 ? (uv / bv) * 100 : 0);
          }, 0) / rows.length)
        : 0;


    res.json({
      totalBoxes,
      totalItems,
      categories: cats.map(c => ({ name: c.name, count: Number(c.count) })),

      topBoxes,

      totalUsedWeight: Math.round(totalUsedWeight * 100) / 100,
      totalMaxWeight: Math.round(totalMaxWeight * 100) / 100,
      avgVolumeFill,

      // ha kell:
      emptyBoxes: 0,
      activeBoxes: totalBoxes,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
});

module.exports = router;