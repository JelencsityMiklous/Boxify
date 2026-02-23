const { Box } = require('../models/index');
const router = require('express').Router();
const { authenticate } = require('../middlewares/auth.middleware');

router.get('/', authenticate, async (req, res) => {
    try {
        const boxes = await Box.findAll({ where: { userId: req.user.id } });
        res.status(200).json(boxes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', authenticate, async (req, res) => {
    try {
        const { code, labelType, lengthCm, widthCm, heightCm, maxWeightKg, location, note, status } = req.body;
        const box = await Box.create({
            userId: req.user.id,
            code,
            labelType,
            lengthCm,
            widthCm,
            heightCm,
            maxWeightKg,
            location,
            note,
            status: status || 'ACTIVE'
        });
        res.status(201).json(box);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', authenticate, async (req, res) => {
    try {
        const box = await Box.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (box) res.status(200).json(box);
        else res.status(404).json({ message: 'Box not found' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.patch('/:id', authenticate, async (req, res) => {
    try {
        const box = await Box.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (!box) return res.status(404).json({ message: 'Box not found' });

        const { code, labelType, lengthCm, widthCm, heightCm, maxWeightKg, location, note, status } = req.body;
        await box.update({ code, labelType, lengthCm, widthCm, heightCm, maxWeightKg, location, note, status });
        res.status(200).json(box);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', authenticate, async (req, res) => {
    try {
        const box = await Box.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (!box) return res.status(404).json({ message: 'Box not found' });

        await box.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/:id/empty', authenticate, async (req, res) => {
    try {
        const box = await Box.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (!box) return res.status(404).json({ message: 'Box not found' });

        box.location = null;
        box.note = null;
        box.status = 'ACTIVE';
        await box.save({ validate: false });

        res.status(200).json(box);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id/contents', authenticate, async (req, res) => {
    try {
        const box = await Box.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (!box) return res.status(404).json({ message: 'Box not found' });

        const items = await box.getItems();
        res.status(200).json({ items });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;