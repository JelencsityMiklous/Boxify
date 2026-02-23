const router = require('express').Router();
const { authenticate } = require('../middlewares/auth.middleware');
const { Box, Item, BoxItem } = require('../models');
const packingService = require('../services/packing.service');

router.post('/can-fit', authenticate, async (req, res) => {
    try {
        const { boxId, itemId, quantity } = req.body;
        if (!boxId || !itemId || quantity == null) {
            return res.status(400).json({ canFit: false, reason: 'Missing boxId, itemId or quantity' });
        }
        const result = await packingService.canFit({ boxId, itemId, quantity });
        return res.status(200).json({ canFit: result.ok, ok: result.ok, reasons: result.reasons });
    } catch (err) {
        return res.status(500).json({ canFit: false, reason: err.message });
    }
});

router.post('/put', authenticate, async (req, res) => {
    try {
        const { boxId, itemId, quantity } = req.body;
        if (!boxId || !itemId || quantity == null) {
            return res.status(400).json({ status: 'hiba', message: 'Missing boxId, itemId or quantity' });
        }

        const qty = parseInt(quantity, 10);
        if (isNaN(qty) || qty <= 0) {
            return res.status(400).json({ status: 'hiba', message: 'Invalid quantity' });
        }

        const fitResult = await packingService.canFit({ boxId, itemId, quantity: qty });
        if (!fitResult.ok) {
            return res.status(400).json({ ok: false, status: 'hiba', reasons: fitResult.reasons });
        }

        const existing = await BoxItem.findOne({ where: { boxId, itemId } });
        if (existing) {
            existing.quantity += qty;
            await existing.save();
        } else {
            await BoxItem.create({ boxId, itemId, quantity: qty });
        }

        const stats = await packingService.computeBoxStats(boxId);
        return res.status(200).json({ ok: true, status: 'ok', fill: stats });
    } catch (err) {
        return res.status(500).json({ status: 'hiba', message: err.message });
    }
});

router.delete('/remove', authenticate, async (req, res) => {
    try {
        const { boxId, itemId } = req.body;
        if (!boxId || !itemId) {
            return res.status(400).json({ status: 'hiba', message: 'Missing boxId or itemId' });
        }

        const existing = await BoxItem.findOne({ where: { boxId, itemId } });
        if (!existing) return res.status(404).json({ status: 'hiba', message: 'Not found' });

        await existing.destroy();
        const stats = await packingService.computeBoxStats(boxId);
        return res.status(200).json({ ok: true, status: 'ok', fill: stats });
    } catch (err) {
        return res.status(500).json({ status: 'hiba', message: err.message });
    }
});

router.get('/recommend/:itemId', authenticate, async (req, res) => {
    try {
        const { itemId } = req.params;
        const quantity = parseInt(req.query.quantity || '1', 10);

        const item = await Item.findByPk(itemId);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        const boxes = await Box.findAll({ where: { userId: req.user.id, status: 'ACTIVE' } });
        const results = [];

        for (const box of boxes) {
            const result = await packingService.canFit({ boxId: box.id, itemId, quantity });
            if (result.ok) {
                results.push({ box, fill: result.statsAfter });
            }
        }

        return res.status(200).json(results);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

module.exports = router;