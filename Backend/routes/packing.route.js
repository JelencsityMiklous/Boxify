const router = require('express').Router();const { generateToken, authenticate } = require('../middlewares/auth.middleware');
const { Boxes, Items, BoxItems } = require('../models');


router.post('/put', async (req, res) => {
    try {
        const { boxId, itemId, quantity } = req.body;
        if (!boxId || !itemId || quantity == null) {
            return res.status(400).json({ status: 'hiba', message: 'Missing boxId, itemId or quantity' });
        }

        const qty = parseInt(quantity, 10);
        if (isNaN(qty) || qty <= 0) {
            return res.status(400).json({ status: 'hiba', message: 'Invalid quantity' });
        }

        const box = await Boxes.findByPk(boxId);
        if (!box) return res.status(404).json({ status: 'hiba', message: 'Box not found' });

        const item = await Items.findByPk(itemId);
        if (!item) return res.status(404).json({ status: 'hiba', message: 'Item not found' });

        const capacity = box.capacity ?? box.limit ?? box.max_capacity ?? box.maxCapacity;
        if (capacity == null) {
            return res.status(400).json({ status: 'hiba', message: 'Box capacity not defined' });
        }

        const currentQty = (await BoxItems.sum('quantity', { where: { boxId } })) || 0;
        const newTotal = currentQty + qty;

        if (newTotal > capacity) {
            return res.status(400).json({
                status: 'hiba',
                reason: 'limit',
                capacity,
                current: currentQty,
                wouldBe: newTotal
            });
        }

        const existing = await BoxItems.findOne({ where: { boxId, itemId } });
        if (existing) {
            existing.quantity += qty;
            await existing.save();
        } else {
            await BoxItems.create({ boxId, itemId, quantity: qty });
        }

        return res.status(200).json({
            status: 'ok',   
            capacity,
            current: newTotal
        });
    } catch (err) {
        return res.status(500).json({ status: 'hiba', message: err.message });
    }
});



router.post('/can-fit', async (req, res) => {
    try {
        const { boxId, itemId, quantity } = req.body;
        if (!boxId || !itemId || quantity == null) {
            return res.status(400).json({ canFit: false, reason: 'Missing boxId, itemId or quantity' });
        }

        const qty = parseInt(quantity, 10);
        if (isNaN(qty) || qty <= 0) {
            return res.status(400).json({ canFit: false, reason: 'Invalid quantity' });
        }

        const box = await Boxes.findByPk(boxId);
        if (!box) return res.status(404).json({ canFit: false, reason: 'Box not found' });

        const item = await Items.findByPk(itemId);
        if (!item) return res.status(404).json({ canFit: false, reason: 'Item not found' });

        const capacity = box.capacity ?? box.limit ?? box.max_capacity ?? box.maxCapacity;
        if (capacity == null) {
            return res.status(400).json({ canFit: false, reason: 'Box capacity not defined' });
        }

        const currentQty = (await BoxItems.sum('quantity', { where: { boxId } })) || 0;
        const newTotal = currentQty + qty;
        const fits = newTotal <= capacity;

        return res.status(200).json({
            canFit: fits,
            reason: fits ? 'Fits' : 'Exceeds capacity',
            capacity,
            current: currentQty,
            wouldBe: newTotal
        });
    } catch (err) {
        return res.status(500).json({ canFit: false, reason: err.message });
    }
});


module.exports = router;